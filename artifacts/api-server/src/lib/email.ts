import nodemailer from "nodemailer";

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

export async function sendAdminReplyEmail(opts: {
  toName: string;
  toEmail: string;
  subject: string;
  originalMessage: string;
  adminReply: string;
}): Promise<{ sent: boolean; error?: string }> {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn("[email] SMTP not configured — skipping email send");
    return { sent: false, error: "SMTP not configured" };
  }

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "contact@avismaker.com";

  const htmlBody = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FA;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
        <!-- Header -->
        <tr><td style="background:#0D1117;padding:24px 32px;">
          <span style="font-size:20px;font-weight:700;color:#F59E0B;">⭐ AvisMaker</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0D1117;">
            Réponse à votre demande de support
          </h2>
          <p style="margin:0 0 24px;font-size:14px;color:#6B7280;">
            Bonjour ${opts.toName}, notre équipe a répondu à votre message.
          </p>

          <!-- Original message -->
          <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin-bottom:20px;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;">
              Votre message
            </p>
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;white-space:pre-wrap;">${escapeHtml(opts.originalMessage)}</p>
          </div>

          <!-- Admin reply -->
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:16px;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:0.05em;">
              Notre réponse
            </p>
            <p style="margin:0;font-size:14px;color:#065F46;line-height:1.6;white-space:pre-wrap;">${escapeHtml(opts.adminReply)}</p>
          </div>

          <p style="margin:24px 0 0;font-size:13px;color:#9CA3AF;">
            Si vous avez d'autres questions, vous pouvez répondre directement à cet email ou nous contacter à
            <a href="mailto:contact@avismaker.com" style="color:#F59E0B;">contact@avismaker.com</a>.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#F9FAFB;border-top:1px solid #E5E7EB;padding:20px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9CA3AF;">
            © ${new Date().getFullYear()} AvisMaker · 
            <a href="mailto:contact@avismaker.com" style="color:#9CA3AF;">contact@avismaker.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const textBody = `Bonjour ${opts.toName},

Notre équipe a répondu à votre message.

--- Votre message ---
${opts.originalMessage}

--- Notre réponse ---
${opts.adminReply}

Pour toute question supplémentaire : contact@avismaker.com

L'équipe AvisMaker`;

  try {
    await transporter.sendMail({
      from: `"AvisMaker Support" <${from}>`,
      to: `"${opts.toName}" <${opts.toEmail}>`,
      replyTo: from,
      subject: `Re: ${opts.subject || "Votre demande de support"} — AvisMaker`,
      text: textBody,
      html: htmlBody,
    });
    console.log(`[email] Reply sent to ${opts.toEmail}`);
    return { sent: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[email] Failed to send reply:", msg);
    return { sent: false, error: msg };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
