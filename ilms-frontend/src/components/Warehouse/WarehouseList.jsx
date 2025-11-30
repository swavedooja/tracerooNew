import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, IconButton } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { WarehouseAPI } from '../../services/APIService';

export default function WarehouseList() {
    const [warehouses, setWarehouses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            const data = await WarehouseAPI.list();
            setWarehouses(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (code) => {
        if (window.confirm('Are you sure?')) {
            await WarehouseAPI.remove(code);
            load();
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Warehouses</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/warehouses/new')}>
                    New Warehouse
                </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Code</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {warehouses.map((w) => (
                            <TableRow key={w.warehouseCode}>
                                <TableCell>{w.warehouseCode}</TableCell>
                                <TableCell>{w.warehouseName}</TableCell>
                                <TableCell>{w.location}</TableCell>
                                <TableCell>{w.type}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => navigate(`/warehouses/${w.warehouseCode}`)}>
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(w.warehouseCode)}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {warehouses.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No warehouses found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
