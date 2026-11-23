/**
 * Google Apps Script Web App for Karaikudi Mess POS Synchronization
 * 
 * Instructions:
 * 1. Open Google Sheets (create a new blank spreadsheet or use an existing one).
 * 2. Name the spreadsheet: "Karaikudi Mess - Billing & Operations"
 * 3. In the top menu, go to Extensions -> Apps Script.
 * 4. Replace the entire code in Code.gs with this script.
 * 5. Click "Deploy" -> "New deployment".
 * 6. Select type: "Web app".
 * 7. Set:
 *    - Description: "Karaikudi Mess POS Sync"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 8. Click "Deploy" and copy the Web App URL (starts with https://script.google.com/macros/s/...).
 * 9. Paste this URL into the Karaikudi Mess POS Settings -> Google Sheets Webhook URL.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Sheet 1: Sales Records
    var salesSheet = getOrCreateSheet(ss, "Sales Records", [
      "Bill ID", "Date", "Time", "Customer Name", "Order Type", 
      "Food Items", "Quantity", "Subtotal", "Discount", "Tax", 
      "Total Amount", "Payment Method", "Payment Status"
    ]);

    // 2. Sheet 2: Daily Sales
    var dailySheet = getOrCreateSheet(ss, "Daily Sales", [
      "Date", "Total Orders", "Cash Sales", "UPI Sales", "Card Sales", "Total Revenue"
    ]);

    // 3. Sheet 3: Food Sales Report
    var foodSheet = getOrCreateSheet(ss, "Food Sales Report", [
      "Food Name", "Category", "Total Quantity Sold", "Total Sales Amount"
    ]);

    // 4. Sheet 4: Expenses
    var expenseSheet = getOrCreateSheet(ss, "Expenses", [
      "Expense ID", "Date", "Expense Category", "Description", "Amount", "Payment Method"
    ]);

    if (data.action === "sync_bill" && data.bill) {
      var b = data.bill;
      
      // Append to Sheet 1: Sales Records
      salesSheet.appendRow([
        b.billNumber || b.billId,
        b.date,
        b.time,
        b.customerName,
        b.orderType,
        b.foodItems,
        b.totalQuantity,
        b.subtotal,
        b.discount,
        b.tax,
        b.totalAmount,
        b.paymentMethod,
        b.paymentStatus
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Bill synced successfully to Sheet 1"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === "sync_expense" && data.expense) {
      var exp = data.expense;

      // Append to Sheet 4: Expenses
      expenseSheet.appendRow([
        exp.expenseId,
        exp.date,
        exp.category,
        exp.description,
        exp.amount,
        exp.paymentMethod
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Expense synced successfully to Sheet 4"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "received",
      message: "Sync request processed"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(spreadsheet, sheetName, headers) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#441a0e").setFontColor("#ffffff");
  }
  return sheet;
}
