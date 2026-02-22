export function verificationEmailTemplate(firstName: string, verificationUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérifiez votre email - Sim360</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <tr>
      <td style="background:#1B84FF;padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">Sim360</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:40px 32px;">
        <h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;">Bonjour ${firstName},</h2>
        <p style="color:#475569;line-height:1.6;margin:0 0 24px;">
          Merci de vous être inscrit sur Sim360 ! Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align:center;padding:16px 0;">
              <a href="${verificationUrl}" style="display:inline-block;background:#1B84FF;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:600;font-size:16px;">
                Vérifier mon email
              </a>
            </td>
          </tr>
        </table>
        <p style="color:#94a3b8;font-size:13px;line-height:1.5;margin:24px 0 0;">
          Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez simplement cet email.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background:#f8fafc;padding:20px 32px;text-align:center;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} Sim360. Tous droits réservés.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
