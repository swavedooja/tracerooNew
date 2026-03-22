import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Stack, Chip, List, ListItem, ListItemIcon, ListItemText, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ArrowBack, QrCodeScanner, Archive, LocalShipping, Storage, Send, DoneAll } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const PackingSession = ({ onBack }) => {
    const [step, setStep] = useState('config'); // config, packing, event, summary
    const [sessionData, setSessionData] = useState({
        caseType: 'CASE_12_UNITS',
        targetCount: 12,
        scannedItems: [],
        lifecycleEvent: 'STAGING'
    });

    const handleStartPacking = () => setStep('packing');

    const handleAddSampleItem = () => {
        if (sessionData.scannedItems.length < sessionData.targetCount) {
            const newItem = `SN-FMCG-2026-${String(sessionData.scannedItems.length + 1).padStart(4, '0')}`;
            setSessionData(prev => ({
                ...prev,
                scannedItems: [...prev.scannedItems, newItem]
            }));
        }
    };

    const handleFinishPacking = () => setStep('event');

    const handleSelectEvent = (event) => {
        setSessionData(prev => ({ ...prev, lifecycleEvent: event }));
        setStep('summary');
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <IconButton onClick={onBack} size="small" sx={{ mr: 1 }}><ArrowBack /></IconButton>
                <Typography sx={{ fontWeight: 700 }}>Packing Session</Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                <AnimatePresence mode="wait">
                    {step === 'config' && (
                        <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>Session Configuration</Typography>
                            <Stack spacing={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Case Type</InputLabel>
                                    <Select label="Case Type" value={sessionData.caseType}>
                                        <MenuItem value="CASE_12_UNITS">Standard Case (12 Units)</MenuItem>
                                        <MenuItem value="CASE_24_UNITS">Bulk Case (24 Units)</MenuItem>
                                    </Select>
                                </FormControl>
                                <Paper sx={{ p: 2, bgcolor: '#f1f8e9', borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">Packing Progress</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 800 }}>0 / {sessionData.targetCount}</Typography>
                                </Paper>
                                <Button variant="contained" fullWidth onClick={handleStartPacking} sx={{ borderRadius: 2, py: 1.5 }}>
                                    Start Session
                                </Button>
                            </Stack>
                        </motion.div>
                    )}

                    {step === 'packing' && (
                        <motion.div key="packing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Box sx={{
                                    width: 80, height: 80, borderRadius: '50%', background: '#e3f2fd',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', mb: 2,
                                    border: '2px solid #1976D2'
                                }}>
                                    <QrCodeScanner color="primary" />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>{sessionData.scannedItems.length} / {sessionData.targetCount}</Typography>
                                <Typography variant="caption" color="text.secondary">Items in current case</Typography>
                            </Box>

                            <Stack spacing={1} sx={{ mb: 4, maxHeight: '300px', overflowY: 'auto' }}>
                                {sessionData.scannedItems.map((item, idx) => (
                                    <Paper key={idx} sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item}</Typography>
                                        <Chip label="Packed" size="small" color="success" sx={{ height: 20, fontSize: '0.6rem' }} />
                                    </Paper>
                                ))}
                            </Stack>

                            <Stack spacing={2}>
                                <Button variant="contained" onClick={handleAddSampleItem} disabled={sessionData.scannedItems.length >= sessionData.targetCount} fullWidth>
                                    Scan Next Item
                                </Button>
                                <Button variant="outlined" onClick={handleFinishPacking} disabled={sessionData.scannedItems.length === 0} fullWidth>
                                    Finish & Tag Case
                                </Button>
                            </Stack>
                        </motion.div>
                    )}

                    {step === 'event' && (
                        <motion.div key="event" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>Select Lifecycle Event</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                                Trigger the next state for this packed case
                            </Typography>

                            <Stack spacing={2}>
                                <EventButton title="Shipping" icon={<LocalShipping />} onClick={() => handleSelectEvent('SHIPPED')} />
                                <EventButton title="Storing" icon={<Storage />} onClick={() => handleSelectEvent('STORED')} />
                                <EventButton title="Dispatch" icon={<Send />} onClick={() => handleSelectEvent('DISPATCHED')} />
                                <EventButton title="Ready for QC" icon={<DoneAll />} onClick={() => handleSelectEvent('READY_FOR_QC')} />
                            </Stack>
                        </motion.div>
                    )}

                    {step === 'summary' && (
                        <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Box sx={{ textAlign: 'center', p: 4 }}>
                                <DoneAll sx={{ fontSize: 80, color: '#2E7D32', mb: 2 }} />
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Session Complete</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                    Case has been registered and tagged as {sessionData.lifecycleEvent}
                                </Typography>

                                <Paper sx={{ p: 2, textAlign: 'left', mb: 4 }}>
                                    <GridRow label="Case ID" value="CASE-2026-X832" />
                                    <GridRow label="Items" value={sessionData.scannedItems.length} />
                                    <GridRow label="Event" value={sessionData.lifecycleEvent} />
                                </Paper>

                                <Button variant="contained" fullWidth onClick={onBack} sx={{ borderRadius: 2 }}>
                                    Exit Session
                                </Button>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
        </Box>
    );
};

const EventButton = ({ title, icon, onClick }) => (
    <Button
        fullWidth
        variant="outlined"
        onClick={onClick}
        startIcon={icon}
        sx={{
            justifyContent: 'flex-start',
            p: 2,
            borderRadius: 3,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#333',
            borderColor: '#e0e0e0',
            '&:hover': { background: '#f5f5f5' }
        }}
    >
        {title}
    </Button>
);

const GridRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
    </Box>
);

export default PackingSession;
