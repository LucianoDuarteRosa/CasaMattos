// Página de configurações genérica (inicialmente para SMTP)
import React, { useEffect, useState, useContext } from 'react';
import { SnackbarContext } from '../components/SnackbarProvider';
import { api } from '../services/api';
import { TextField, Button, Switch, FormControlLabel, Typography, Paper, Box } from '@mui/material';

interface SmtpConfig {
    id?: number;
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    to?: string;
    secure?: boolean;
    active: boolean;
}

export default function SettingsPage() {
    const snackbar = useContext(SnackbarContext);
    const [smtp, setSmtp] = useState<SmtpConfig>({
        host: '', port: 587, user: '', pass: '', from: '', to: '', secure: false, active: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/settings?type=smtp').then(res => {
            if (res.data.length > 0 && res.data[0].value) {
                try {
                    const conf = JSON.parse(res.data[0].value);
                    setSmtp({ ...conf, id: res.data[0].id, active: res.data[0].active });
                } catch (e) {
                    setSmtp({
                        host: '', port: 587, user: '', pass: '', from: '', to: '', secure: false, active: false
                    });
                }
            } else {
                setSmtp({
                    host: '', port: 587, user: '', pass: '', from: '', to: '', secure: false, active: false
                });
            }
        }).catch(() => {
            setSmtp({
                host: '', port: 587, user: '', pass: '', from: '', to: '', secure: false, active: false
            });
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSmtp({ ...smtp, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        const payload = {
            key: 'smtp',
            value: JSON.stringify({ ...smtp, id: undefined, active: undefined }),
            type: 'smtp',
            active: smtp.active,
        };
        try {
            if (smtp.id) {
                await api.put(`/settings/${smtp.id}`, payload);
            } else {
                await api.post('/settings', payload);
            }
            snackbar?.showSnackbar('Configuração salva com sucesso!', 'success');
        } catch (e) {
            snackbar?.showSnackbar('Erro ao salvar configuração.', 'error');
        }
        setLoading(false);
    };

    return (
        <Box minHeight="85vh" display="flex" alignItems="center" justifyContent="center">
            <Paper sx={{ p: 3, maxWidth: 500, width: '100%' }}>
                <Typography variant="h5" gutterBottom>Configurações SMTP</Typography>
                <TextField label="Host" name="host" value={smtp.host} onChange={handleChange} fullWidth margin="normal" />
                <TextField label="Porta" name="port" type="number" value={smtp.port} onChange={handleChange} fullWidth margin="normal" />
                <TextField label="Usuário" name="user" value={smtp.user} onChange={handleChange} fullWidth margin="normal" />
                <TextField label="Senha" name="pass" value={smtp.pass} onChange={handleChange} fullWidth margin="normal" type="password" />
                <TextField label="Remetente (from)" name="from" value={smtp.from} onChange={handleChange} fullWidth margin="normal" />
                <TextField label="Destinatário (to)" name="to" value={smtp.to} onChange={handleChange} fullWidth margin="normal" />
                <FormControlLabel control={<Switch checked={smtp.secure} name="secure" onChange={handleChange} />} label="Conexão segura (SSL/TLS)" />
                <FormControlLabel control={<Switch checked={smtp.active} name="active" onChange={handleChange} />} label="Ativo" />
                <Button variant="contained" color="primary" onClick={handleSave} disabled={loading} fullWidth sx={{ mt: 2 }}>
                    Salvar
                </Button>
            </Paper>
        </Box>
    );
}
