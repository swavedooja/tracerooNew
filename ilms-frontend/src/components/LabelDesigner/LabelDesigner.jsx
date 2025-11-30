import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Divider, List, ListItem, ListItemText, ListItemIcon, IconButton } from '@mui/material';
import { Save, TextFields, QrCode, ViewWeek, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import DesignerCanvas from './DesignerCanvas';
import { LabelTemplateAPI } from '../../services/APIService';

export default function LabelDesigner() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [template, setTemplate] = useState({
        name: 'New Template',
        levelName: 'ITEM',
        widthMm: 100,
        heightMm: 150,
        status: 'DRAFT'
    });
    const [elements, setElements] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        if (id) load();
    }, [id]);

    const load = async () => {
        try {
            const data = await LabelTemplateAPI.get(id);
            setTemplate(data);
            if (data.layoutJson) {
                setElements(JSON.parse(data.layoutJson));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const addElement = (type) => {
        const newEl = {
            id: Date.now(),
            type,
            x: 10,
            y: 10,
            content: type === 'text' ? 'Sample Text' : '',
            fontSize: 14,
            fontWeight: 'normal'
        };
        setElements([...elements, newEl]);
        setSelectedId(newEl.id);
    };

    const updateSelected = (field, value) => {
        setElements(elements.map(el => el.id === selectedId ? { ...el, [field]: value } : el));
    };

    const save = async () => {
        const payload = { ...template, layoutJson: JSON.stringify(elements) };
        try {
            if (id) {
                await LabelTemplateAPI.update(id, payload);
            } else {
                await LabelTemplateAPI.create(payload);
            }
            navigate('/label-templates');
        } catch (e) {
            console.error(e);
            alert('Save failed');
        }
    };

    const selectedElement = elements.find(el => el.id === selectedId);

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <IconButton onClick={() => navigate('/label-templates')}><ArrowBack /></IconButton>
                <Typography variant="h5" fontWeight="bold">{id ? 'Edit Template' : 'New Label Template'}</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="contained" startIcon={<Save />} onClick={save}>Save</Button>
            </Box>

            <Grid container spacing={2}>
                {/* Tools Panel */}
                <Grid item xs={12} md={3}>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                        <Typography variant="subtitle2" sx={{ mb: 2 }}>Properties</Typography>
                        <TextField fullWidth size="small" label="Name" value={template.name} onChange={e => setTemplate({ ...template, name: e.target.value })} sx={{ mb: 2 }} />
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                            <InputLabel>Level</InputLabel>
                            <Select value={template.levelName} label="Level" onChange={e => setTemplate({ ...template, levelName: e.target.value })}>
                                <MenuItem value="ITEM">ITEM</MenuItem>
                                <MenuItem value="BOX">BOX</MenuItem>
                                <MenuItem value="PALLET">PALLET</MenuItem>
                                <MenuItem value="CONTAINER">CONTAINER</MenuItem>
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField size="small" label="W (mm)" type="number" value={template.widthMm} onChange={e => setTemplate({ ...template, widthMm: Number(e.target.value) })} />
                            <TextField size="small" label="H (mm)" type="number" value={template.heightMm} onChange={e => setTemplate({ ...template, heightMm: Number(e.target.value) })} />
                        </Box>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Add Element</Typography>
                        <List>
                            <ListItem button onClick={() => addElement('text')}>
                                <ListItemIcon><TextFields /></ListItemIcon>
                                <ListItemText primary="Text" />
                            </ListItem>
                            <ListItem button onClick={() => addElement('barcode')}>
                                <ListItemIcon><ViewWeek /></ListItemIcon>
                                <ListItemText primary="Barcode" />
                            </ListItem>
                            <ListItem button onClick={() => addElement('qr')}>
                                <ListItemIcon><QrCode /></ListItemIcon>
                                <ListItemText primary="QR Code" />
                            </ListItem>
                        </List>

                        {selectedElement && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Selected Element</Typography>
                                {selectedElement.type === 'text' && (
                                    <>
                                        <TextField fullWidth size="small" label="Content" value={selectedElement.content} onChange={e => updateSelected('content', e.target.value)} sx={{ mb: 1 }} />
                                        <TextField fullWidth size="small" label="Font Size" type="number" value={selectedElement.fontSize} onChange={e => updateSelected('fontSize', Number(e.target.value))} sx={{ mb: 1 }} />
                                    </>
                                )}
                            </>
                        )}
                    </Paper>
                </Grid>

                {/* Canvas Area */}
                <Grid item xs={12} md={9}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: '#eee', p: 4, borderRadius: 2, overflow: 'auto' }}>
                        <DesignerCanvas
                            width={template.widthMm * 3.78} // approx px conversion
                            height={template.heightMm * 3.78}
                            elements={elements}
                            setElements={setElements}
                            selectedId={selectedId}
                            setSelectedId={setSelectedId}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
