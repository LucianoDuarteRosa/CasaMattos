import React from 'react';
import { Box, Typography } from '@mui/material';

const RuasPage: React.FC = () => {
    return (
        <Box sx={{
            width: '100%',
            overflow: 'hidden',
            // Compensar o padding do Layout
            m: -1.5,
            p: { xs: 1, sm: 2 },
            maxWidth: '100vw',
            boxSizing: 'border-box'
        }}>
            <Typography variant="h4" gutterBottom>
                Ruas
            </Typography>
            <Typography>
                Página em desenvolvimento...
            </Typography>
        </Box>
    );
};

export default RuasPage;
