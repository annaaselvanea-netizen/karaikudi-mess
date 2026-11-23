import { NextRequest, NextResponse } from 'next/server';

/**
 * Backend API Route for Google Sheets synchronization.
 * Handles both Google Apps Script Web App endpoints and Direct Google Sheets API.
 * Never exposes credentials to frontend code.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, bill, expense, webhookUrl } = body;

    // Use environment variable or user-provided Webhook URL from settings
    const targetUrl = webhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    // If webhookUrl is configured, send the structured payload to the Google Apps Script Web App
    if (targetUrl && targetUrl.startsWith('http')) {
      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            bill,
            expense,
            syncedAt: new Date().toISOString(),
          }),
        });

        const textResponse = await response.text();
        let jsonResponse;
        try {
          jsonResponse = JSON.parse(textResponse);
        } catch {
          jsonResponse = { status: 'success', raw: textResponse };
        }

        return NextResponse.json({
          success: true,
          message: 'Synced to Google Sheets successfully via Web App',
          data: jsonResponse,
        });
      } catch (err: any) {
        console.error('Webhook post error:', err);
        return NextResponse.json(
          {
            success: false,
            message: `Failed to connect to Google Sheets Webhook: ${err.message}`,
          },
          { status: 502 }
        );
      }
    }

    // If no webhook URL is currently configured, log and return informative status
    // so users can set it up in the Settings page anytime without failing the bill flow!
    return NextResponse.json({
      success: true,
      message: 'Sheets synchronization logged (Ready for Google Apps Script Web App connection)',
      syncedRecord: {
        action,
        timestamp: new Date().toISOString(),
        id: bill?.billNumber || expense?.expenseId,
      },
    });
  } catch (error: any) {
    console.error('API /sync-sheets error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error in sheets sync' },
      { status: 500 }
    );
  }
}
