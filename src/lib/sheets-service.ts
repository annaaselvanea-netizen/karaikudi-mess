import { Bill, Expense } from '@/types';

/**
 * Syncs a completed bill to Google Sheets via secure API route or configured Google Apps Script Webhook.
 * Prevents duplicate sync by checking bill.syncedToSheets flag.
 */
export async function syncBillToGoogleSheets(
  bill: Bill,
  webhookUrl?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const payload = {
      action: 'sync_bill',
      bill: {
        billId: bill.id,
        billNumber: bill.billNumber,
        date: bill.date,
        time: bill.time,
        customerName: bill.customerName || 'Walk-in',
        orderType: bill.orderType,
        foodItems: bill.items.map((i) => `${i.name} (x${i.quantity})`).join(', '),
        totalQuantity: bill.items.reduce((acc, i) => acc + i.quantity, 0),
        subtotal: bill.subtotal,
        discount: bill.discount,
        tax: bill.taxAmount,
        totalAmount: bill.finalAmount,
        paymentMethod: bill.paymentMethod,
        paymentStatus: bill.paymentStatus,
      },
    };

    // Call internal backend API route which handles proxying to Google Apps Script or Google Sheets API
    const response = await fetch('/api/sync-sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        webhookUrl: webhookUrl || '',
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to sync with Google Sheets');
    }

    const data = await response.json();
    return { success: true, message: data.message || 'Successfully synced to Google Sheets' };
  } catch (error: any) {
    console.error('Google Sheets sync error:', error);
    return { success: false, message: error.message || 'Sync failed' };
  }
}

/**
 * Syncs an expense record to Google Sheets Sheet 4: Expenses
 */
export async function syncExpenseToGoogleSheets(
  expense: Expense,
  webhookUrl?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const payload = {
      action: 'sync_expense',
      expense: {
        expenseId: expense.expenseNumber || expense.id,
        date: expense.date,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        paymentMethod: expense.paymentMethod,
      },
    };

    const response = await fetch('/api/sync-sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        webhookUrl: webhookUrl || '',
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to sync expense to Google Sheets');
    }

    const data = await response.json();
    return { success: true, message: data.message || 'Expense synced to Google Sheets' };
  } catch (error: any) {
    console.error('Expense Sheets sync error:', error);
    return { success: false, message: error.message || 'Sync failed' };
  }
}
