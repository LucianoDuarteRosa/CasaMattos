import nodemailer from 'nodemailer';
import Setting from '../../domain/entities/Setting';
import { loggingService } from './LoggingService';

export async function sendScheduledEmail() {
    console.log('Iniciando envio de e-mail automático...');
    // Busca configuração SMTP ativa
    const smtpConfig = await Setting.findOne({ where: { type: 'smtp', active: true } });
    if (!smtpConfig) {
        return;
    }

    let config;
    try {
        config = JSON.parse(smtpConfig.value);
    } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        await loggingService.logError(0, 'SMTP', errorObj, 'Erro ao fazer parse do JSON de configuração SMTP');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure || false,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        });

        const mailOptions = {
            from: config.from,
            to: config.to || config.from,
            subject: 'Envio automático diário',
            text: 'Este é um e-mail enviado automaticamente às 20h.',
        };
        const info = await transporter.sendMail(mailOptions);
        await loggingService.logInfo(1, 'SMTP', 'E-mail automático enviado com sucesso', { mailOptions, info });
    } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        await loggingService.logError(0, 'SMTP', errorObj, 'Erro ao enviar e-mail automático');
    }
}
