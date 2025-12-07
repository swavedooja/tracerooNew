import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Paper, TextField, Typography, MenuItem, Tab, Tabs, FormControlLabel, Switch, IconButton, CircularProgress } from '@mui/material';
import { Save, Delete, AutoFixHigh } from '@mui/icons-material';
import { LocationAPI, MasterDefinitionsAPI } from '../../services/APIService';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function LocationForm({ code, onSuccess, onDelete }) {
    const [tab, setTab] = useState(0);
    const [form, setForm] = useState({
        code: '', name: '', type: '', category: '',
        addressLine1: '', city: '', state: '', country: '', zipCode: '',
        latitude: '', longitude: '',
        capacityVolume: '', capacityWeight: '', currentUtilization: '',
        gln: '', rfidReaderId: '', isQuarantine: false, parent: ''
    });
    const [loading, setLoading] = useState(false);
    const [types, setTypes] = useState([]);
    const [cats, setCats] = useState([]);
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        init();
    }, [code]);

    const init = async () => {
        setLoading(true);
        try {
            // Load masters and locations first
            const [defs, locs] = await Promise.all([
                MasterDefinitionsAPI.list(),
                LocationAPI.list()
            ]);

            setTypes(defs.filter(d => d.defType === 'LOCATION_TYPE'));
            setCats(defs.filter(d => d.defType === 'LOCATION_CAT'));
            setLocations(locs);

            // If editing, load location data and map parentId to parent code
            if (code && code !== 'new') {
                const data = await LocationAPI.get(code);
                // Find parent code from ID
                const parentLoc = locs.find(l => l.id === data.parentId);
                setForm({
                    ...data,
                    parent: parentLoc ? parentLoc.code : '',
                    // Ensure controlled inputs don't warn about null/undefined
                    type: data.type || '',
                    category: data.category || '',
                    addressLine1: data.address || '',
                    // ... other fields mapping if API naming differs slightly
                });
            } else {
                resetForm();
            }
        } catch (e) {
            console.error("Error initializing form:", e);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            code: '', name: '', type: '', category: '',
            addressLine1: '', city: '', state: '', country: '', zipCode: '',
            latitude: '', longitude: '',
            capacityVolume: '', capacityWeight: '', currentUtilization: '',
            gln: '', rfidReaderId: '', isQuarantine: false, parent: ''
        });
    };

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleAutoFill = () => {
        const unique = Math.floor(Math.random() * 1000);
        // Ensure we pick valid type/cat if available
        const randType = types.length > 0 ? types[0].defValue : 'WAREHOUSE';
        const randCat = cats.length > 0 ? cats[0].defValue : 'GENERAL';

        setForm(prev => ({
            ...prev,
            code: `LOC-${unique}`,
            name: `Test Location ${unique}`,
            type: randType,
            category: randCat,
            addressLine1: '123 Dummy St',
            city: 'Test City',
            country: 'Country',
            capacityVolume: 100,
            gln: `GLN${unique}`,
            parent: ''
        }));
    };

    const save = async () => {
        setLoading(true);
        try {
            // Find parent UUID from selected code
            const parentObj = locations.find(l => l.code === form.parent);
            const parentId = parentObj ? parentObj.id : null;

            const payload = {
                ...form,
                parentId: parentId,
                address: form.addressLine1
            };

            if (code && code !== 'new') {
                await LocationAPI.update(code, payload);
            } else {
                await LocationAPI.create(payload);
            }
            if (onSuccess) onSuccess();
        } catch (e) {
            console.error(e);
            alert('Error saving location: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!code || code === 'new') return;
        if (window.confirm('Are you sure you want to delete this location?')) {
            try {
                await LocationAPI.remove(code);
                if (onDelete) onDelete();
            } catch (e) { console.error(e); }
        }
    };

    if (loading && !form.code && code !== 'new') {
        return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
    }

    return (
        <Paper elevation={0} variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">{code === 'new' ? 'New Location' : `Editing: ${form.name}`}</Typography>
                <Box>
                    <IconButton onClick={handleAutoFill} title="Auto-fill Dummy Data" color="secondary"><AutoFixHigh /></IconButton>
                    <Button variant="contained" startIcon={<Save />} onClick={save} disabled={loading} sx={{ ml: 1 }}>Save</Button>
                    {code !== 'new' && (
                        <Button color="error" startIcon={<Delete />} onClick={handleDelete} sx={{ ml: 1 }}>Delete</Button>
                    )}
                </Box>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                    <Tab label="General" />
                    <Tab label="Physical & Address" />
                    <Tab label="Track & Trace" />
                </Tabs>
            </Box>

            <Box sx={{ overflow: 'auto', flex: 1 }}>
                <TabPanel value={tab} index={0}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField label="Code" name="code" value={form.code} onChange={handleChange} fullWidth required disabled={code !== 'new'} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth required />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField select label="Type" name="type" value={form.type} onChange={handleChange} fullWidth>
                                {types.map(t => <MenuItem key={t.id} value={t.defValue}>{t.description} ({t.defValue})</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField select label="Category" name="category" value={form.category} onChange={handleChange} fullWidth error={!cats.some(c => c.defValue === form.category) && form.category !== ''}>
                                {cats.map(c => <MenuItem key={c.id} value={c.defValue}>{c.description} ({c.defValue})</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField select label="Parent Location" name="parent" value={form.parent} onChange={handleChange} fullWidth helperText="Optional. Changing parent moves the location in the hierarchy.">
                                <MenuItem value=""><em>None (Root)</em></MenuItem>
                                {locations.filter(l => l.code !== code).map(l => (
                                    <MenuItem key={l.code} value={l.code}>{l.name} ({l.code})</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </TabPanel>

                <TabPanel value={tab} index={1}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}><TextField label="Address Line 1" name="addressLine1" value={form.addressLine1 || ''} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={4}><TextField label="City" name="city" value={form.city || ''} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={4}><TextField label="State" name="state" value={form.state || ''} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={4}><TextField label="Country" name="country" value={form.country || ''} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={6}><TextField label="Latitude" name="latitude" value={form.latitude || ''} onChange={handleChange} type="number" fullWidth /></Grid>
                        <Grid item xs={6}><TextField label="Longitude" name="longitude" value={form.longitude || ''} onChange={handleChange} type="number" fullWidth /></Grid>
                        <Grid item xs={6}><TextField label="Capacity (Vol)" name="capacityVolume" value={form.capacityVolume || ''} onChange={handleChange} type="number" fullWidth /></Grid>
                        <Grid item xs={6}><TextField label="Capacity (Kg)" name="capacityWeight" value={form.capacityWeight || ''} onChange={handleChange} type="number" fullWidth /></Grid>
                    </Grid>
                </TabPanel>

                <TabPanel value={tab} index={2}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}><TextField label="GLN" name="gln" value={form.gln || ''} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12}><TextField label="RFID Reader ID" name="rfidReaderId" value={form.rfidReaderId || ''} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12}>
                            <FormControlLabel control={<Switch checked={form.isQuarantine} onChange={handleChange} name="isQuarantine" />} label="Quarantine Location" />
                        </Grid>
                    </Grid>
                </TabPanel>
            </Box>
        </Paper>
    );
}
