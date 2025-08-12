import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
} from '@mui/material';
import {
    Inventory,
    Business,
    LocationOn,
    Assignment,
} from '@mui/icons-material';

const DashboardPage: React.FC = () => {
    const stats = [
        {
            title: 'Produtos',
            value: '1,234',
            icon: <Inventory fontSize="large" />,
            color: '#1976d2',
        },
        {
            title: 'Fornecedores',
            value: '45',
            icon: <Business fontSize="large" />,
            color: '#388e3c',
        },
        {
            title: 'Endereçamentos',
            value: '2,567',
            icon: <LocationOn fontSize="large" />,
            color: '#f57c00',
        },
        {
            title: 'Listas Ativas',
            value: '12',
            icon: <Assignment fontSize="large" />,
            color: '#d32f2f',
        },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography color="textSecondary" variant="subtitle2">
                                            {stat.title}
                                        </Typography>
                                        <Typography variant="h4">
                                            {stat.value}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ color: stat.color }}>
                                        {stat.icon}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 300 }}>
                        <Typography variant="h6" gutterBottom>
                            Atividades Recentes
                        </Typography>
                        <Typography color="textSecondary">
                            Em desenvolvimento...
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 300 }}>
                        <Typography variant="h6" gutterBottom>
                            Produtos com Estoque Baixo
                        </Typography>
                        <Typography color="textSecondary">
                            Em desenvolvimento...
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
