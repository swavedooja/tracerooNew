import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Grid, Paper, TextField, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Save, ArrowBack, Add, Delete } from '@mui/icons-material';
import { WarehouseAPI } from '../../services/APIService';

export default function WarehouseForm() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        warehouseCode: '',
        warehouseName: '',
        location: '',
        type: '',
        storageLocations: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (code) {
            load();
        }
    }, [code]);

    const load = async () => {
        try {
            const data = await WarehouseAPI.get(code);
            setForm(data);
        } catch (e) {
            console.error(e);
            alert('Failed to load warehouse');
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLocationChange = (index, field, value) => {
        const newLocs = [...(form.storageLocations || [])];
        newLocs[index] = { ...newLocs[index], [field]: value };
        setForm({ ...form, storageLocations: newLocs });
    };

    const addLocation = () => {
        setForm({
            ...form,
            storageLocations: [...(form.storageLocations || []), { locationCode: '', description: '', type: 'Rack' }]
        });
    };

    const removeLocation = (index) => {
        const newLocs = [...(form.storageLocations || [])];
        newLocs.splice(index, 1);
        setForm({ ...form, storageLocations: newLocs });
    };

    const save = async () => {
        setLoading(true);
        try {
            if (code) {
                await WarehouseAPI.update(code, form);
            } else {
                await WarehouseAPI.create(form);
            }
            navigate('/warehouses');
        } catch (e) {
            console.error(e);
            alert('Failed to save');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <IconButton onClick={() => navigate('/warehouses')}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h5" fontWeight="bold">
                    {code ? 'Edit Warehouse' : 'New Warehouse'}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="contained" startIcon={<Save />} onClick={save} disabled={loading}>
                    Save
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>General Info</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Warehouse Code"
                                    name="warehouseCode"
                                    fullWidth
                                    value={form.warehouseCode}
                                    onChange={handleChange}
                                    disabled={!!code}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Name"
                                    name="warehouseName"
                                    fullWidth
                                    value={form.warehouseName}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Location / Address"
                                    name="location"
                                    fullWidth
                                    value={form.location}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Type"
                                    name="type"
                                    fullWidth
                                    value={form.type}
                                    onChange={handleChange}
                                    placeholder="e.g. Distribution Center"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Storage Locations</Typography>
                            <Button size="small" startIcon={<Add />} onClick={addLocation}>
                                Add Location
                            </Button>
                        </Box>

                        <TableContainer sx={{ maxHeight: 400 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Code</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Desc</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(form.storageLocations || []).map((loc, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    value={loc.locationCode}
                                                    onChange={(e) => handleLocationChange(idx, 'locationCode', e.target.value)}
                                                    placeholder="A-01"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    value={loc.type}
                                                    onChange={(e) => handleLocationChange(idx, 'type', e.target.value)}
                                                    placeholder="Rack"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    value={loc.description}
                                                    onChange={(e) => handleLocationChange(idx, 'description', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="error" onClick={() => removeLocation(idx)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(form.storageLocations || []).length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                                                No locations added
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
