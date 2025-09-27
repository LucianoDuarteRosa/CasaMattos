import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <Box
            sx={{
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                gap: 3,
                px: 2,
            }}
        >
            <Typography variant="h3" component="h1" fontWeight={600}>
                Página não encontrada
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={480}>
                O endereço que você tentou acessar não existe ou foi movido. Verifique o link e tente novamente.
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={handleGoHome}
                sx={{ minWidth: 200, height: 56 }}
            >
                Voltar para o início
            </Button>
        </Box>
    );
};

export default NotFoundPage;
