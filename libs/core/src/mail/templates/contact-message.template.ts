function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export interface ContactMessageTemplateInput {
  name: string;
  email: string;
  message: string;
  /** Language of the public site the visitor used (`fr` | `en`). */
  locale: string;
  /** Page the form was sent from, for context. */
  page?: string;
}

/** Internal notification: a visitor wrote through the public contact form. */
export function contactMessageTemplate(input: ContactMessageTemplateInput): string {
  const paragraphs = input.message
    .split(/\n{2,}/)
    .map((p) => `<p style="color:#1e293b;line-height:1.6;margin:0 0 12px;white-space:pre-line;">${escapeHtml(p.trim())}</p>`)
    .join('');
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau message - Simex pro</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <tr>
      <td style="background:#0f1a2e;padding:28px 32px;">
        <h1 style="color:#fff;margin:0;font-size:20px;">Nouveau message du site</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;font-size:14px;color:#475569;">
          <tr><td style="padding:2px 12px 2px 0;"><strong>De</strong></td><td>${escapeHtml(input.name)} &lt;${escapeHtml(input.email)}&gt;</td></tr>
          <tr><td style="padding:2px 12px 2px 0;"><strong>Langue</strong></td><td>${escapeHtml(input.locale)}</td></tr>
          ${input.page ? `<tr><td style="padding:2px 12px 2px 0;"><strong>Page</strong></td><td>${escapeHtml(input.page)}</td></tr>` : ''}
        </table>
        ${paragraphs}
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#f8fafc;color:#94a3b8;font-size:12px;">
        Répondre à ce courriel écrit directement à ${escapeHtml(input.email)}.
      </td>
    </tr>
  </table>
</body>
</html>`;
}
