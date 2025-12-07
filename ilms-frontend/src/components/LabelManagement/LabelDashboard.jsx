import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab, Typography } from '@mui/material';
import { Settings, Brush, Print } from '@mui/icons-material';
import HierarchyConfig from './Thinking/HierarchyConfig';
import LabelDesigner from '../LabelDesigner/LabelDesigner';
// import PrintStation from './Print/PrintStation';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index} role="tabpanel" style={{ height: '100%' }}>
            {value === index && <Box sx={{ p: 2, height: '100%' }}>{children}</Box>}
        </div>
    );
}

export default function LabelDashboard() {
    return (
        <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', p: 2 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>Label Management</Typography>
            <Paper elevation={1} sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
                <HierarchyConfig />
            </Paper>
        </Box>
    );
}
