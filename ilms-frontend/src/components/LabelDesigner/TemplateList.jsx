import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, IconButton, Chip } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { LabelTemplateAPI } from '../../services/APIService';

export default function TemplateList() {
    const [templates, setTemplates] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            const data = await LabelTemplateAPI.list();
            setTemplates(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            await LabelTemplateAPI.remove(id);
            load();
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Label Templates</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/label-templates/new')}>
                    New Template
                </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Level</TableCell>
                            <TableCell>Dimensions (mm)</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {templates.map((t) => (
                            <TableRow key={t.id}>
                                <TableCell>{t.name}</TableCell>
                                <TableCell><Chip label={t.levelName} size="small" /></TableCell>
                                <TableCell>{t.widthMm} x {t.heightMm}</TableCell>
                                <TableCell>{t.status}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => navigate(`/label-templates/${t.id}`)}>
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(t.id)}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {templates.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No templates found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
