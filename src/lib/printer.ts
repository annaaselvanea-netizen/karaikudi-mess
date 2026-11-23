import { Bill, RestaurantSettings } from '@/types';

/**
 * Generates raw ESC/POS binary command buffer for thermal receipt printers (58mm or 80mm).
 * Can be sent directly via Web Serial, Web Bluetooth, or downloaded for local ESC/POS spoolers.
 */
export function generateEscPosBuffer(bill: Bill, settings: RestaurantSettings): Uint8Array {
  const is58mm = settings.thermalPaperSize === '58mm';
  const charWidth = is58mm ? 32 : 48; // Max characters per line

  const ESC = 0x1b;
  const GS = 0x1d;

  const buffer: number[] = [];

  // Helper push functions
  const pushCmd = (...bytes: number[]) => buffer.push(...bytes);
  const pushText = (str: string) => {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      buffer.push(code < 128 ? code : 0x20); // Basic ASCII fallback for ESC/POS
    }
  };
  const pushLine = (str: string) => {
    pushText(str + '\n');
  };

  const centerText = (str: string) => {
    const pad = Math.max(0, Math.floor((charWidth - str.length) / 2));
    pushLine(' '.repeat(pad) + str);
  };

  const alignTwo = (left: string, right: string) => {
    const space = Math.max(1, charWidth - left.length - right.length);
    pushLine(left + ' '.repeat(space) + right);
  };

  // Initialize printer
  pushCmd(ESC, 0x40);

  // Center alignment
  pushCmd(ESC, 0x61, 1);

  // Bold on, Double height & width for Title
  pushCmd(ESC, 0x45, 1);
  pushCmd(GS, 0x21, 0x11);
  pushLine(settings.name.toUpperCase());
  pushCmd(GS, 0x21, 0x00);
  pushCmd(ESC, 0x45, 0);

  // Restaurant info
  centerText(settings.tagline);
  centerText(settings.address);
  centerText(`Phone: ${settings.phone}`);
  if (settings.gstin) {
    centerText(`GSTIN: ${settings.gstin}`);
  }
  if (settings.fssaiNumber) {
    centerText(`FSSAI Lic: ${settings.fssaiNumber}`);
  }

  // Divider line
  pushLine('-'.repeat(charWidth));

  // Bill metadata (Left aligned)
  pushCmd(ESC, 0x61, 0);
  alignTwo(`Bill: ${bill.billNumber}`, `Token: #${bill.tokenNumber}`);
  alignTwo(`Date: ${bill.date}`, `Time: ${bill.time}`);
  alignTwo(`Type: ${bill.orderType.toUpperCase()}`, bill.tableNumber ? `Table: ${bill.tableNumber}` : '');
  if (bill.customerName) {
    alignTwo(`Customer: ${bill.customerName}`, bill.customerPhone ? `Ph: ${bill.customerPhone}` : '');
  }

  // Divider
  pushLine('-'.repeat(charWidth));

  // Table header
  if (is58mm) {
    // 32 chars: Item (16) Qty (4) Total (12)
    alignTwo('Item', 'Qty   Amount');
  } else {
    // 48 chars: Item (22) Rate (8) Qty (6) Total (12)
    pushLine('Item                     Rate   Qty    Total');
  }
  pushLine('-'.repeat(charWidth));

  // Items list
  bill.items.forEach((item) => {
    const itemTotal = (item.price * item.quantity).toFixed(2);
    if (is58mm) {
      const name = item.name.substring(0, 16);
      alignTwo(name, `${item.quantity}x  ₹${itemTotal}`);
    } else {
      const name = item.name.padEnd(23, ' ').substring(0, 23);
      const rate = `₹${item.price.toFixed(0)}`.padStart(6, ' ');
      const qty = `${item.quantity}`.padStart(5, ' ');
      const total = `₹${itemTotal}`.padStart(10, ' ');
      pushLine(`${name} ${rate} ${qty} ${total}`);
    }
  });

  pushLine('-'.repeat(charWidth));

  // Totals
  alignTwo('Subtotal:', `Rs.${bill.subtotal.toFixed(2)}`);
  if (bill.discount > 0) {
    alignTwo('Discount:', `-Rs.${bill.discount.toFixed(2)}`);
  }
  if (bill.taxAmount > 0) {
    alignTwo(`GST (${bill.taxRate}%):`, `Rs.${bill.taxAmount.toFixed(2)}`);
  }

  pushLine('='.repeat(charWidth));

  // Grand Total in Bold & Double Height
  pushCmd(ESC, 0x45, 1);
  pushCmd(GS, 0x21, 0x01); // Double height
  alignTwo('GRAND TOTAL:', `Rs.${bill.finalAmount.toFixed(2)}`);
  pushCmd(GS, 0x21, 0x00);
  pushCmd(ESC, 0x45, 0);

  pushLine('='.repeat(charWidth));

  // Payment details
  alignTwo('Payment Mode:', bill.paymentMethod.toUpperCase());
  if (bill.amountReceived > 0) {
    alignTwo('Received:', `Rs.${bill.amountReceived.toFixed(2)}`);
  }
  if (bill.balanceAmount > 0) {
    alignTwo('Change Due:', `Rs.${bill.balanceAmount.toFixed(2)}`);
  }

  // Footer message
  pushCmd(ESC, 0x61, 1); // Center
  pushLine('');
  centerText(settings.receiptFooterMessage);
  centerText('Powered by Karaikudi Mess POS');
  pushLine('');
  pushLine('');

  // Cut paper if enabled
  if (settings.thermalCutPaper) {
    pushCmd(GS, 0x56, 0x41, 0x03); // Feed 3 lines and cut
  }

  return new Uint8Array(buffer);
}

/**
 * Triggers standard browser window print on dedicated thermal printable element.
 */
export function triggerBrowserThermalPrint(): void {
  window.print();
}

/**
 * Downloads raw ESC/POS binary file for spooler or local raw printing software.
 */
export function downloadEscPosFile(bill: Bill, settings: RestaurantSettings): void {
  const bytes = generateEscPosBuffer(bill, settings);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bill_${bill.billNumber}_thermal.bin`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
