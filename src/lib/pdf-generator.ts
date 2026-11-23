import { jsPDF } from 'jspdf';
import { Bill, RestaurantSettings } from '@/types';
import { formatCurrency, formatDateOnly } from './utils';

export function generateA4InvoicePdf(bill: Bill, settings: RestaurantSettings): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Background / Header Accent (Warm Chettinad Brown)
  doc.setFillColor(68, 26, 14); // #441a0e
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(settings.name.toUpperCase(), margin, 18);

  // Subheader
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.tagline, margin, 24);

  // TAX INVOICE label on right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TAX INVOICE', pageWidth - margin, 18, { align: 'right' });

  // Restaurant details below banner
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  let y = 36;
  doc.text(settings.address, margin, y);
  y += 5;
  doc.text(`Phone: ${settings.phone}  |  Email: ${settings.email}`, margin, y);
  y += 5;
  if (settings.gstin) {
    doc.text(`GSTIN: ${settings.gstin}  |  FSSAI Lic: ${settings.fssaiNumber || '12419008000456'}`, margin, y);
    y += 5;
  }

  // Divider
  doc.setDrawColor(211, 116, 73); // Terracotta line
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Invoice & Customer Info Box
  const infoBoxY = y;
  doc.setFillColor(253, 248, 245); // Warm cream brand-50
  doc.roundedRect(margin, infoBoxY, contentWidth, 26, 2, 2, 'F');
  doc.setDrawColor(236, 194, 171); // border
  doc.roundedRect(margin, infoBoxY, contentWidth, 26, 2, 2, 'S');

  // Left side - Invoice meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Invoice Details:', margin + 4, infoBoxY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${bill.billNumber}`, margin + 4, infoBoxY + 12);
  doc.text(`Date & Time: ${formatDateOnly(bill.date)} ${bill.time}`, margin + 4, infoBoxY + 17);
  doc.text(`Token No: #${bill.tokenNumber}  |  Order No: ${bill.orderNumber}`, margin + 4, infoBoxY + 22);

  // Right side - Customer & Order type
  const midX = margin + contentWidth / 2 + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Billed To / Order Details:', midX, infoBoxY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Customer: ${bill.customerName || 'Walk-in Guest'}`, midX, infoBoxY + 12);
  doc.text(`Contact: ${bill.customerPhone || 'N/A'}`, midX, infoBoxY + 17);
  doc.text(`Order Type: ${bill.orderType.toUpperCase()} ${bill.tableNumber ? `(Table: ${bill.tableNumber})` : ''}`, midX, infoBoxY + 22);

  y = infoBoxY + 34;

  // Table Header
  doc.setFillColor(68, 26, 14);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  const colSNo = margin + 3;
  const colItem = margin + 15;
  const colCat = margin + 85;
  const colRate = margin + 120;
  const colQty = margin + 145;
  const colTotal = margin + contentWidth - 4;

  doc.text('#', colSNo, y + 5.5);
  doc.text('Item Description', colItem, y + 5.5);
  doc.text('Category', colCat, y + 5.5);
  doc.text('Rate (₹)', colRate, y + 5.5);
  doc.text('Qty', colQty, y + 5.5);
  doc.text('Total (₹)', colTotal, y + 5.5, { align: 'right' });

  y += 8;
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');

  // Items rows
  bill.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(254, 252, 246);
      doc.rect(margin, y, contentWidth, 7, 'F');
    }
    doc.text(String(index + 1), colSNo, y + 5);
    doc.text(item.name.substring(0, 38), colItem, y + 5);
    doc.text(item.category.substring(0, 18), colCat, y + 5);
    doc.text(item.price.toFixed(2), colRate, y + 5);
    doc.text(String(item.quantity), colQty, y + 5);
    const itemTotal = (item.price * item.quantity).toFixed(2);
    doc.text(itemTotal, colTotal, y + 5, { align: 'right' });
    y += 7;
  });

  // Table bottom border
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // Calculation section
  const calcBoxX = margin + contentWidth * 0.55;
  const calcBoxWidth = contentWidth * 0.45;
  const rightAlignX = margin + contentWidth - 4;

  doc.setFontSize(9);
  doc.text('Subtotal:', calcBoxX, y + 4);
  doc.text(formatCurrency(bill.subtotal), rightAlignX, y + 4, { align: 'right' });
  y += 6;

  if (bill.discount > 0) {
    doc.setTextColor(180, 50, 50);
    doc.text('Discount:', calcBoxX, y + 4);
    doc.text(`-${formatCurrency(bill.discount)}`, rightAlignX, y + 4, { align: 'right' });
    doc.setTextColor(40, 40, 40);
    y += 6;
  }

  if (bill.taxAmount > 0) {
    const halfTax = (bill.taxAmount / 2).toFixed(2);
    doc.text(`CGST (${(bill.taxRate / 2).toFixed(1)}%):`, calcBoxX, y + 4);
    doc.text(`₹${halfTax}`, rightAlignX, y + 4, { align: 'right' });
    y += 5;
    doc.text(`SGST (${(bill.taxRate / 2).toFixed(1)}%):`, calcBoxX, y + 4);
    doc.text(`₹${halfTax}`, rightAlignX, y + 4, { align: 'right' });
    y += 6;
  }

  // Grand Total banner
  doc.setFillColor(68, 26, 14);
  doc.rect(calcBoxX - 2, y, calcBoxWidth + 2, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GRAND TOTAL:', calcBoxX + 2, y + 6);
  doc.text(formatCurrency(bill.finalAmount), rightAlignX, y + 6, { align: 'right' });
  y += 16;

  // Payment details note
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Status: ${bill.paymentStatus.toUpperCase()} via ${bill.paymentMethod.toUpperCase()}`, margin, y);
  if (bill.amountReceived > 0) {
    doc.text(`Amount Received: ${formatCurrency(bill.amountReceived)}  |  Change Returned: ${formatCurrency(bill.balanceAmount)}`, margin, y + 5);
  }

  // Terms & Authorized Signatory
  y = pageHeight - 38;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Terms & Conditions:', margin, y);
  doc.text('1. Goods once sold will not be taken back.', margin, y + 4);
  doc.text('2. This is a computer generated invoice and requires no physical stamp.', margin, y + 8);
  doc.text(settings.receiptFooterMessage, margin, y + 12);

  // Signatory box
  const signX = pageWidth - margin - 50;
  doc.text('For KARAIKUDI MESS', signX, y);
  doc.text('Authorized Signatory', signX, y + 16);

  return doc;
}

export function downloadA4InvoicePdf(bill: Bill, settings: RestaurantSettings): void {
  const doc = generateA4InvoicePdf(bill, settings);
  doc.save(`Invoice_${bill.billNumber}.pdf`);
}
