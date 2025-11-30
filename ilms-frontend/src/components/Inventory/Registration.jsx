import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Paper, TextField, Typography, MenuItem, Snackbar, Alert } from '@mui/material';
import { Save } from '@mui/icons-material';
import { MaterialsAPI, InventoryAPI } from '../../services/APIService';

export default function Registration() {
    const [materials, setMaterials] = useState([]);
    const [form, setForm] = useState({
        materialCode: '',
        batchNumber: '',
        quantity: 1
    });
    const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' });

    useEffect(() => {
        loadMaterials();
    }, []);

    const loadMaterials = async () => {
        try {
            const data = await MaterialsAPI.list({ page: 0, size: 100 });
            setMaterials(data.content || []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async () => {
        try {
            await InventoryAPI.registerBatch(form);
            setToast({ open: true, msg: 'Batch Registered Successfully', sev: 'success' });
            setForm({ ...form, batchNumber: '', quantity: 1 });
        } catch (e) {
            setToast({ open: true, msg: 'Registration Failed', sev: 'error' });
        }
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Inventory Registration</Typography>
            <Paper variant="outlined" sx={{ p: 3, maxWidth: 600 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            select
                            label="Material"
                            fullWidth
                            value={form.materialCode}
                            onChange={(e) => setForm({ ...form, materialCode: e.target.value })}
                        >
                            {materials.map((m) => (
                                <MenuItem key={m.materialCode} value={m.materialCode}>
                                    {m.materialName} ({m.materialCode})
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Batch Number"
                            fullWidth
                            value={form.batchNumber}
                            onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Quantity"
                            type="number"
                            fullWidth
                            value={form.quantity}
                            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" startIcon={<Save />} onClick={handleSubmit} fullWidth>
                            Register Batch
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
                <Alert severity={toast.sev}>{toast.msg}</Alert>
            </Snackbar>
        </Box>
    );
}
