import nodemailer from 'nodemailer';
import Setting from '../../domain/entities/Setting';

export async function sendScheduledEmail() {
    // Busca configuração SMTP ativa
    const smtpConfig = await Setting.findOne({ where: { type: 'smtp', active: true } });
    if (!smtpConfig) return;

    let config;
    try {
        config = JSON.parse(smtpConfig.value);
    } catch {
        return;
    }

    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure || false,
        auth: {
            user: config.user,
            pass: config.pass,
        },
    });

    await transporter.sendMail({
        from: config.from,
        to: config.to || config.from,
        subject: 'Envio automático diário',
        text: 'Este é um e-mail enviado automaticamente às 20h.',
    });
}
