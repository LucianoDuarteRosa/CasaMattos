
import nodemailer from 'nodemailer';
import Setting from '../../domain/entities/Setting';
import { loggingService } from './LoggingService';
import { FileExportService } from './FileExportService';

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
        // Gerar o arquivo Excel
        const buffer = await FileExportService.exportarEnderecamentosExcel();
        const dataAtual = new Date();
        const dataFormatada = dataAtual.toLocaleDateString('pt-BR');
        const nomeArquivo = `Enderecamentos_${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, '0')}-${String(dataAtual.getDate()).padStart(2, '0')}.xlsx`;

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
            subject: `Geração automática de Endereçamento ${dataFormatada}`,
            text: `E-mail de backup de endereçamento do dia ${dataFormatada}`,
            attachments: [
                {
                    filename: nomeArquivo,
                    content: buffer,
                }
            ]
        };
        const info = await transporter.sendMail(mailOptions);
        await loggingService.logInfo(1, 'SMTP', 'E-mail automático enviado com sucesso', { mailOptions, info });
    } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        await loggingService.logError(0, 'SMTP', errorObj, 'Erro ao enviar e-mail automático');
    }
}
