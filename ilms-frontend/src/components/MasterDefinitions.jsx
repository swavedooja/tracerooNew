import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, TextField, Typography, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { MasterDefinitionsAPI } from '../services/APIService';

export default function MasterDefinitions() {
    const [data, setData] = useState([]);
    const [newDef, setNewDef] = useState({ defType: 'MATERIAL_TYPE', defValue: '', description: '' });

    const load = async () => {
        try {
            const res = await MasterDefinitionsAPI.list();
            setData(res);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async () => {
        if (!newDef.defValue) return;
        try {
            await MasterDefinitionsAPI.create(newDef);
            setNewDef({ ...newDef, defValue: '', description: '' });
            load();
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete definition?')) {
            await MasterDefinitionsAPI.delete(id);
            load();
        }
    };

    // Group by Type
    const grouped = data.reduce((acc, curr) => {
        acc[curr.defType] = acc[curr.defType] || [];
        acc[curr.defType].push(curr);
        return acc;
    }, {});

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>Master Data Definitions</Typography>

            <Paper sx={{ p: 2, mb: 3 }} elevation={0} variant="outlined">
                <Typography variant="h6" mb={2}>Add New Definition</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Type</InputLabel>
                        <Select value={newDef.defType} label="Type" onChange={(e) => setNewDef({ ...newDef, defType: e.target.value })}>
                            <MenuItem value="MATERIAL_TYPE">Material Type</MenuItem>
                            <MenuItem value="MATERIAL_CAT">Material Category</MenuItem>
                            <MenuItem value="MATERIAL_CLASS">Material Class</MenuItem>
                            <MenuItem value="LOCATION_TYPE">Location Type</MenuItem>
                            <MenuItem value="LOCATION_CAT">Location Category</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField size="small" label="Value (Code)" value={newDef.defValue} onChange={(e) => setNewDef({ ...newDef, defValue: e.target.value })} />
                    <TextField size="small" label="Description" value={newDef.description} onChange={(e) => setNewDef({ ...newDef, description: e.target.value })} sx={{ flexGrow: 1 }} />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>Add</Button>
                </Box>
            </Paper>

            {Object.entries(grouped).map(([type, items]) => (
                <Paper key={type} sx={{ mb: 3, p: 2 }} elevation={0} variant="outlined">
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main', mb: 1 }}>{type}</Typography>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Value</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.defValue}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}><DeleteIcon fontSize="small" /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            ))}
        </Box>
    );
}
