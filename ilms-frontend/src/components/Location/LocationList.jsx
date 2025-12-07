import React, { useState } from 'react';
import { Box, Button, Paper, Typography, Grid } from '@mui/material';
import { Add } from '@mui/icons-material';
import LocationTreeView from './LocationTreeView';
import LocationForm from './LocationForm';

export default function LocationList() {
    const [selectedCode, setSelectedCode] = useState(null);
    const [refreshTree, setRefreshTree] = useState(0);

    const handleSuccess = () => {
        setRefreshTree(prev => prev + 1);
        if (selectedCode === 'new') setSelectedCode(null);
    };

    const handleDelete = () => {
        setRefreshTree(prev => prev + 1);
        setSelectedCode(null);
    };

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">Location Master Data</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setSelectedCode('new')}>
                    New Root Location
                </Button>
            </Box>

            <Grid container spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
                <Grid item xs={12} md={4} lg={3} sx={{ height: '100%' }}>
                    <Paper variant="outlined" sx={{ height: '100%', overflow: 'auto', p: 1 }}>
                        <LocationTreeView
                            key={refreshTree}
                            onSelect={setSelectedCode}
                            selectedCode={selectedCode}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={8} lg={9} sx={{ height: '100%' }}>
                    {selectedCode ? (
                        <LocationForm
                            key={selectedCode}
                            code={selectedCode}
                            onSuccess={handleSuccess}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <Paper variant="outlined" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography color="text.secondary">Select a location from the tree or create a new one.</Typography>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}
