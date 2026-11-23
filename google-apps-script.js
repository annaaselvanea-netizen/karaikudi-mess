/**
 * Google Apps Script Web App for Karaikudi Mess POS Synchronization
 * Includes Comprehensive Real-time Execution Logging
 * 
 * Instructions:
 * 1. Open Google Sheets (create a new blank spreadsheet or use an existing one).
 * 2. Name the spreadsheet: "Karaikudi Mess - Billing & Operations"
 * 3. In the top menu, go to Extensions -> Apps Script.
 * 4. Replace the entire code in Code.gs with this script.
 * 5. Click "Deploy" -> "New deployment".
 * 6. Select type: "Web app".
 * 7. Set:
 *    - Description: "Karaikudi Mess POS Sync & Execution Logs"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 8. Click "Deploy" and copy the Web App URL (starts with https://script.google.com/macros/s/...).
 * 9. Paste this URL into the Karaikudi Mess POS Settings -> Google Sheets Webhook URL.
 * 10. To view execution logs:
 *     - Inside Google Sheets: Check the "Execution Logs" sheet tab.
 *     - Inside Apps Script Editor: Click "Executions" on the left navigation bar.
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var logSheet = ss.getSheetByName("Execution Logs");
  var recentLogs = [];
  
  if (logSheet && logSheet.getLastRow() > 1) {
    var range = logSheet.getRange(Math.max(2, logSheet.getLastRow() - 9), 1, Math.min(10, logSheet.getLastRow() - 1), 6);
    recentLogs = range.getValues();
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    system: "Karaikudi Mess POS Webhook & Apps Script Service",
    timestamp: new Date().toISOString(),
    spreadsheetName: ss.getName(),
    sheets: ss.getSheets().map(function(s) { return s.getName(); }),
    recentExecutionLogs: recentLogs
  }, null, 2)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var startTime = new Date().getTime();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = "unknown";
  var recordId = "-";
  
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No post data received in request.");
    }

    var data = JSON.parse(e.postData.contents);
    action = data.action || "unknown";

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

    // 5. Sheet 5: Execution Logs
    var logSheet = getOrCreateSheet(ss, "Execution Logs", [
      "Timestamp", "Action", "Record Identifier", "Status", "Execution Time (ms)", "Message / Payload Summary"
    ]);

    // --- Action: Sync Bill ---
    if (action === "sync_bill" && data.bill) {
      var b = data.bill;
      recordId = b.billNumber || b.billId || "BILL-UNKNOWN";

      // Append to Sheet 1: Sales Records
      salesSheet.appendRow([
        recordId,
        b.date || new Date().toLocaleDateString(),
        b.time || new Date().toLocaleTimeString(),
        b.customerName || "Walk-in Guest",
        b.orderType || "Dine-in",
        b.foodItems || "",
        b.totalQuantity || 1,
        b.subtotal || 0,
        b.discount || 0,
        b.tax || 0,
        b.totalAmount || 0,
        b.paymentMethod || "cash",
        b.paymentStatus || "paid"
      ]);

      var executionTime = new Date().getTime() - startTime;
      console.log("[Execution Success] Bill " + recordId + " synced in " + executionTime + "ms");

      // Write to Execution Logs tab
      logExecution(logSheet, action, recordId, "SUCCESS", executionTime, "Synced bill with " + (b.totalQuantity || 1) + " items, Total: ₹" + (b.totalAmount || 0));

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: action,
        billId: recordId,
        executionTimeMs: executionTime,
        message: "Bill synced successfully to Sheet 1: Sales Records"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- Action: Sync Expense ---
    if (action === "sync_expense" && data.expense) {
      var exp = data.expense;
      recordId = exp.expenseId || "EXP-" + new Date().getTime();

      // Append to Sheet 4: Expenses
      expenseSheet.appendRow([
        recordId,
        exp.date || new Date().toLocaleDateString(),
        exp.category || "General",
        exp.description || "",
        exp.amount || 0,
        exp.paymentMethod || "cash"
      ]);

      var executionTime = new Date().getTime() - startTime;
      console.log("[Execution Success] Expense " + recordId + " synced in " + executionTime + "ms");

      // Write to Execution Logs tab
      logExecution(logSheet, action, recordId, "SUCCESS", executionTime, "Category: " + exp.category + ", Amount: ₹" + exp.amount);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: action,
        expenseId: recordId,
        executionTimeMs: executionTime,
        message: "Expense synced successfully to Sheet 4: Expenses"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Unrecognized action fallback
    var executionTime = new Date().getTime() - startTime;
    logExecution(logSheet, action, recordId, "PROCESSED", executionTime, "Sync ping received without specific entity payload");

    return ContentService.createTextOutput(JSON.stringify({
      status: "received",
      action: action,
      executionTimeMs: executionTime,
      message: "Sync request processed"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    var executionTime = new Date().getTime() - startTime;
    console.error("[Execution Error] " + error.toString());

    try {
      var logSheet = getOrCreateSheet(ss, "Execution Logs", [
        "Timestamp", "Action", "Record Identifier", "Status", "Execution Time (ms)", "Message / Payload Summary"
      ]);
      logExecution(logSheet, action, recordId, "FAILED", executionTime, error.toString());
    } catch (e2) {
      console.error("[Logging Failed] " + e2.toString());
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      action: action,
      executionTimeMs: executionTime,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function logExecution(logSheet, action, recordId, status, durationMs, message) {
  var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
  logSheet.appendRow([
    timestamp,
    action,
    recordId,
    status,
    durationMs + " ms",
    message
  ]);

  // Color code recent row
  var lastRow = logSheet.getLastRow();
  if (lastRow > 1) {
    var statusCell = logSheet.getRange(lastRow, 4);
    if (status === "SUCCESS") {
      statusCell.setFontColor("#15803d").setFontWeight("bold");
    } else if (status === "FAILED") {
      statusCell.setFontColor("#b91c1c").setFontWeight("bold");
    }
  }
}

function getOrCreateSheet(spreadsheet, sheetName, headers) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#441a0e")
      .setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}
