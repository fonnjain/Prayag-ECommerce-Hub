import { logger } from "./logger";

async function getGmailConnection(): Promise<{ accessToken: string; fromEmail: string } | null> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname || !xReplitToken) return null;

  try {
    const res = await fetch(
      `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=google-mail`,
      { headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const item = data.items?.[0];
    if (!item) return null;
    const accessToken =
      item.settings?.access_token || item.settings?.oauth?.credentials?.access_token;
    const fromEmail =
      item.settings?.oauth?.credentials?.raw?.email || item.settings?.email || "me";
    if (!accessToken) return null;
    return { accessToken, fromEmail };
  } catch (err) {
    logger.warn({ err }, "Failed to fetch Gmail connection");
    return null;
  }
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  code: string;
}): Promise<boolean> {
  const conn = await getGmailConnection();
  if (!conn) {
    logger.warn({ to: opts.to }, "Gmail not connected — skipping password reset email");
    return false;
  }

  const subject = "PRAYAG — Your Password Reset Code";
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
      <div style="background:#2b2622;padding:24px;text-align:center">
        <h1 style="color:#c9a45c;margin:0;font-size:24px;letter-spacing:2px">PRAYAG</h1>
        <p style="color:#fff;margin:4px 0 0;font-size:11px">STRONG · BEAUTIFUL · PRAYAG</p>
      </div>
      <div style="padding:24px">
        <h2 style="color:#2b2622;margin:0 0 8px">Password Reset Request</h2>
        <p style="color:#555;font-size:14px">Hi ${opts.name},</p>
        <p style="color:#555;font-size:14px">Use the code below to reset your PRAYAG account password. This code is valid for <b>15 minutes</b>.</p>
        <div style="background:#f8f6f2;border-radius:8px;padding:20px;margin:16px 0;text-align:center">
          <span style="font-size:28px;letter-spacing:8px;font-weight:bold;color:#2b2622">${opts.code}</span>
        </div>
        <p style="color:#555;font-size:13px">If you didn't request this, you can safely ignore this email — your password will not change.</p>
        <p style="color:#999;font-size:12px;margin-top:24px">— Team PRAYAG | Customer Care: 1800 123 4567</p>
      </div>
    </div>`;

  const mime = [
    `From: ${conn.fromEmail}`,
    `To: ${opts.to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html,
  ].join("\r\n");

  try {
    const res = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: base64url(mime) }),
      },
    );
    if (!res.ok) {
      const body = await res.text();
      logger.error({ status: res.status, body }, "Password reset email send failed");
      return false;
    }
    logger.info({ to: opts.to }, "Password reset email sent");
    return true;
  } catch (err) {
    logger.error({ err }, "Password reset email send error");
    return false;
  }
}

export async function sendInvoiceEmail(opts: {
  to: string;
  customerName: string;
  orderNumber: string;
  total: number;
  pdf: Buffer;
}): Promise<boolean> {
  const conn = await getGmailConnection();
  if (!conn) {
    logger.warn(
      { orderNumber: opts.orderNumber },
      "Gmail not connected — skipping invoice email",
    );
    return false;
  }

  const boundary = "prayag_invoice_boundary";
  const subject = `Your PRAYAG Invoice — Order ${opts.orderNumber}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
      <div style="background:#2b2622;padding:24px;text-align:center">
        <h1 style="color:#c9a45c;margin:0;font-size:24px;letter-spacing:2px">PRAYAG</h1>
        <p style="color:#fff;margin:4px 0 0;font-size:11px">STRONG · BEAUTIFUL · PRAYAG</p>
      </div>
      <div style="padding:24px">
        <h2 style="color:#2b2622;margin:0 0 8px">Order Confirmed! 🎉</h2>
        <p style="color:#555;font-size:14px">Hi ${opts.customerName},</p>
        <p style="color:#555;font-size:14px">Thank you for your order <b>${opts.orderNumber}</b>. Your order has been confirmed and tracking has started. Your invoice is attached to this email.</p>
        <div style="background:#f8f6f2;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0;color:#2b2622;font-size:14px">Order Total: <b>₹${opts.total.toLocaleString("en-IN")}</b></p>
        </div>
        <p style="color:#555;font-size:14px">You can track your order anytime from the <b>My Orders</b> section of your account.</p>
        <p style="color:#999;font-size:12px;margin-top:24px">— Team PRAYAG | Customer Care: 1800 123 4567</p>
      </div>
    </div>`;

  const mime = [
    `From: ${conn.fromEmail}`,
    `To: ${opts.to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html,
    "",
    `--${boundary}`,
    "Content-Type: application/pdf",
    "Content-Transfer-Encoding: base64",
    `Content-Disposition: attachment; filename="Invoice-${opts.orderNumber}.pdf"`,
    "",
    opts.pdf.toString("base64"),
    "",
    `--${boundary}--`,
  ].join("\r\n");

  try {
    const res = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: base64url(mime) }),
      },
    );
    if (!res.ok) {
      const body = await res.text();
      logger.error({ status: res.status, body }, "Gmail send failed");
      return false;
    }
    logger.info({ orderNumber: opts.orderNumber, to: opts.to }, "Invoice email sent");
    return true;
  } catch (err) {
    logger.error({ err }, "Gmail send error");
    return false;
  }
}
