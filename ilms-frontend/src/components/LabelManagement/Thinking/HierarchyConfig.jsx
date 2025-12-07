import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Paper, TextField, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import { Add, Delete, Edit, Link as LinkIcon, Print } from '@mui/icons-material';
import { PackagingAPI } from '../../../services/APIService';
import LabelDesigner from '../../LabelDesigner/LabelDesigner';
import { useNavigate } from 'react-router-dom';

export default function HierarchyConfig() {
    const navigate = useNavigate();
    const [hierarchies, setHierarchies] = useState([]);
    const [selectedHierarchy, setSelectedHierarchy] = useState(null);
    const [levels, setLevels] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newHierarchyName, setNewHierarchyName] = useState('');

    // Level editing
    const [openLevelDialog, setOpenLevelDialog] = useState(false);
    const [levelForm, setLevelForm] = useState({ name: '', order: 1 });

    // Designer Popup
    const [designerOpen, setDesignerOpen] = useState(false);
    const [editingLevel, setEditingLevel] = useState(null);

    useEffect(() => {
        loadHierarchies();
    }, []);

    useEffect(() => {
        if (selectedHierarchy) {
            loadLevels(selectedHierarchy.id);
        } else {
            setLevels([]);
        }
    }, [selectedHierarchy]);

    const loadHierarchies = async () => {
        try {
            const data = await PackagingAPI.getHierarchies();
            setHierarchies(data);
            if (data.length > 0 && !selectedHierarchy) setSelectedHierarchy(data[0]);
        } catch (e) { console.error(e); }
    };

    const loadLevels = async (hid) => {
        try {
            const data = await PackagingAPI.getLevels(hid);
            setLevels(data);
        } catch (e) { console.error(e); }
    };

    const createHierarchy = async () => {
        if (!newHierarchyName.trim()) return;
        try {
            const data = await PackagingAPI.createHierarchy({ name: newHierarchyName });
            setHierarchies([...hierarchies, data]);
            setSelectedHierarchy(data);
            setOpenDialog(false);
            setNewHierarchyName('');
        } catch (e) { console.error(e); }
    };

    const saveLevel = async () => {
        if (!selectedHierarchy) return;
        try {
            await PackagingAPI.createLevel({
                hierarchy_id: selectedHierarchy.id,
                level_name: levelForm.name,
                level_order: parseInt(levelForm.order)
            });
            loadLevels(selectedHierarchy.id);
            setOpenLevelDialog(false);
        } catch (e) { console.error(e); }
    };

    const deleteLevel = async (id) => {
        if (window.confirm('Delete this level?')) {
            await PackagingAPI.deleteLevel(id);
            loadLevels(selectedHierarchy.id);
        }
    };

    const handleLinkClick = (level) => {
        setEditingLevel(level);
        setDesignerOpen(true);
    };

    const handleDesignerSave = async (savedTemplate) => {
        // Link the saved template to the current level
        if (editingLevel) {
            try {
                // We need to update the packaging_level with label_template_id
                await PackagingAPI.updateLevel(editingLevel.id, { label_template_id: savedTemplate.id });
                // Refresh levels to show updated link
                loadLevels(selectedHierarchy.id);
                setDesignerOpen(false);
                setEditingLevel(null);
            } catch (e) {
                console.error("Failed to link template", e);
                alert("Template saved but failed to link to level.");
            }
        }
    };

    return (
        <Grid container spacing={2} sx={{ height: '100%' }}>
            {/* Sidebar: Hierarchies */}
            <Grid item xs={3}>
                <Paper variant="outlined" sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">Hierarchies</Typography>
                        <IconButton size="small" onClick={() => setOpenDialog(true)}><Add /></IconButton>
                    </Box>
                    <List sx={{ flex: 1, overflowY: 'auto' }}>
                        {hierarchies.map(h => (
                            <ListItem
                                key={h.id}
                                button
                                selected={selectedHierarchy?.id === h.id}
                                onClick={() => setSelectedHierarchy(h)}
                            >
                                <ListItemText primary={h.name} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Grid>

            {/* Main: Levels */}
            <Grid item xs={9}>
                <Paper variant="outlined" sx={{ height: '100%', p: 3, display: 'flex', flexDirection: 'column' }}>
                    {selectedHierarchy ? (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6">Levels for {selectedHierarchy.name}</Typography>
                                <Button variant="contained" startIcon={<Add />} onClick={() => {
                                    setLevelForm({ name: '', order: levels.length + 1 });
                                    setOpenLevelDialog(true);
                                }}>Add Level</Button>
                            </Box>

                            <List sx={{ flex: 1, overflowY: 'auto' }}>
                                {levels.length === 0 && <Typography color="text.secondary">No levels defined. Add levels like "Primary Box", "Carton", "Pallet".</Typography>}
                                {levels.map(l => (
                                    <ListItem key={l.id} sx={{ bgcolor: 'background.default', mb: 1, borderRadius: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', mr: 2, fontWeight: 'bold' }}>
                                                {l.level_order}
                                            </Box>
                                            <ListItemText
                                                primary={l.level_name}
                                                secondary={l.label_template ? `Template: ${l.label_template.name}` : 'No Label Template Linked'}
                                            />
                                            <ListItemSecondaryAction>
                                                <Tooltip title="Link Template / Design Label">
                                                    <IconButton onClick={() => handleLinkClick(l)} color="primary">
                                                        <LinkIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <IconButton edge="end" onClick={() => deleteLevel(l.id)}><Delete /></IconButton>
                                            </ListItemSecondaryAction>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>

                            {/* Print Button Area - Below Levels */}
                            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="large"
                                    startIcon={<Print />}
                                    onClick={() => navigate(`/print/${selectedHierarchy.id}`)}
                                // disabled={levels.every(l => !l.label_template)} 
                                >
                                    Print Labels
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Typography color="text.secondary">Select a Hierarchy to configure</Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>

            {/* New Hierarchy Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>New Hierarchy</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Name" fullWidth value={newHierarchyName} onChange={(e) => setNewHierarchyName(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={createHierarchy} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* New Level Dialog */}
            <Dialog open={openLevelDialog} onClose={() => setOpenLevelDialog(false)}>
                <DialogTitle>Add Level</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Level Name (e.g., Box)" fullWidth value={levelForm.name} onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })} sx={{ mb: 2 }} />
                    <TextField type="number" label="Order (1 = Inner, 10 = Outer)" fullWidth value={levelForm.order} onChange={(e) => setLevelForm({ ...levelForm, order: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLevelDialog(false)}>Cancel</Button>
                    <Button onClick={saveLevel} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>

            {/* Label Designer Popup */}
            <Dialog fullScreen open={designerOpen} onClose={() => setDesignerOpen(false)}>
                {designerOpen && (
                    <LabelDesigner
                        propTemplateId={editingLevel?.label_template_id}
                        onClose={() => setDesignerOpen(false)}
                        onSaveSuccess={handleDesignerSave}
                    />
                )}
            </Dialog>
        </Grid>
    );
}
