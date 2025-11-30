import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Paper, TextField, Typography, List, ListItem, ListItemText, IconButton, Snackbar, Alert } from '@mui/material';
import { Add, Delete, Save } from '@mui/icons-material';
import { InventoryAPI } from '../../services/APIService';

export default function PackingStation() {
    const [boxSerial, setBoxSerial] = useState('');
    const [scanInput, setScanInput] = useState('');
    const [scannedItems, setScannedItems] = useState([]); // List of inventory IDs or objects
    const [inventoryList, setInventoryList] = useState([]); // Available inventory
    const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' });

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            const data = await InventoryAPI.list();
            setInventoryList(data.filter(i => i.status === 'REGISTERED'));
        } catch (e) {
            console.error(e);
        }
    };

    const handleScan = () => {
        // Simulate scanning by finding item in list
        const item = inventoryList.find(i => i.serialNumber === scanInput || i.id.toString() === scanInput);
        if (item) {
            if (!scannedItems.find(i => i.id === item.id)) {
                setScannedItems([...scannedItems, item]);
                setScanInput('');
            } else {
                setToast({ open: true, msg: 'Item already scanned', sev: 'warning' });
            }
        } else {
            setToast({ open: true, msg: 'Item not found or not available', sev: 'error' });
        }
    };

    const handlePack = async () => {
        if (!boxSerial) {
            setToast({ open: true, msg: 'Enter Box Serial', sev: 'warning' });
            return;
        }
        try {
            await InventoryAPI.packBox({
                boxSerial,
                inventoryIds: scannedItems.map(i => i.id)
            });
            setToast({ open: true, msg: 'Box Packed Successfully', sev: 'success' });
            setScannedItems([]);
            setBoxSerial('');
            loadInventory();
        } catch (e) {
            setToast({ open: true, msg: 'Packing Failed', sev: 'error' });
        }
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Packing Station</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Scan Items</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                                label="Scan Item Serial / ID"
                                fullWidth
                                value={scanInput}
                                onChange={(e) => setScanInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                            />
                            <Button variant="contained" onClick={handleScan}>Scan</Button>
                        </Box>

                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Scanned Items ({scannedItems.length})</Typography>
                        <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                            <List dense>
                                {scannedItems.map((item, idx) => (
                                    <ListItem key={item.id} secondaryAction={
                                        <IconButton edge="end" onClick={() => setScannedItems(scannedItems.filter(i => i.id !== item.id))}>
                                            <Delete />
                                        </IconButton>
                                    }>
                                        <ListItemText
                                            primary={`${item.material.materialName} (${item.serialNumber})`}
                                            secondary={`Batch: ${item.batchNumber}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Box Details</Typography>
                        <TextField
                            label="Box Serial Number"
                            fullWidth
                            value={boxSerial}
                            onChange={(e) => setBoxSerial(e.target.value)}
                            sx={{ mb: 3 }}
                        />
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<Save />}
                            fullWidth
                            onClick={handlePack}
                            disabled={scannedItems.length === 0}
                        >
                            Pack Box
                        </Button>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>Available Inventory</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Use these IDs to simulate scanning:
                        </Typography>
                        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                            {inventoryList.map(i => (
                                <Typography key={i.id} variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {i.id} - {i.material.materialName} - {i.serialNumber}
                                </Typography>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
                <Alert severity={toast.sev}>{toast.msg}</Alert>
            </Snackbar>
        </Box>
    );
}
