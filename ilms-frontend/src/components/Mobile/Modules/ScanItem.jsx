import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Stack, Chip, Divider, Paper } from '@mui/material';
import { QrCodeScanner, ArrowBack, Info, History, LocationOn } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { loadDemoData } from '../../Trace/demoData';

const ScanItem = ({ onBack }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [scannedItem, setScannedItem] = useState(null);
    const demoData = loadDemoData();

    const handleScan = () => {
        setIsScanning(true);
        // Simulate scanning delay
        setTimeout(() => {
            // Pick a random item from demo data
            const containers = demoData.containers;
            const randomItem = containers[0].pallets[0].cases[0].items[0];
            setScannedItem(randomItem);
            setIsScanning(false);
        }, 1500);
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <IconButton onClick={onBack} size="small" sx={{ mr: 1 }}><ArrowBack /></IconButton>
                <Typography sx={{ fontWeight: 700 }}>Scan Item</Typography>
            </Box>

            <AnimatePresence mode="wait">
                {!scannedItem ? (
                    <Box key="scanner" sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                        <Box sx={{
                            width: 280,
                            height: 280,
                            border: '2px dashed #1976D2',
                            borderRadius: 4,
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isScanning ? 'rgba(25, 118, 210, 0.05)' : 'white'
                        }}>
                            <QrCodeScanner sx={{ fontSize: 120, color: isScanning ? '#1976D2' : '#bdbdbd' }} />
                            {isScanning && (
                                <motion.div
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        height: '2px',
                                        background: '#1976D2',
                                        boxShadow: '0 0 10px #1976D2'
                                    }}
                                />
                            )}
                        </Box>
                        <Typography sx={{ mt: 4, color: 'text.secondary', textAlign: 'center' }}>
                            {isScanning ? 'Decoding GS1 barcode...' : 'Align barcode within the frame'}
                        </Typography>
                        <Button
                            variant="contained"
                            disabled={isScanning}
                            onClick={handleScan}
                            sx={{ mt: 2, borderRadius: 20, px: 4 }}
                        >
                            {isScanning ? 'Scanning...' : 'Start Scanner'}
                        </Button>
                    </Box>
                ) : (
                    <Box key="info" sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                        <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                <Box sx={{ width: 60, height: 60, borderRadius: 2, background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <QrCodeScanner color="primary" />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Serial Number</Typography>
                                    <Typography sx={{ fontWeight: 800 }}>{scannedItem.serial}</Typography>
                                </Box>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            <GridRow label="Product" value={scannedItem.material?.name || 'Herbal Shampoo Bottle'} />
                            <GridRow label="GTIN" value={scannedItem.gtin} />
                            <GridRow label="Batch" value={scannedItem.batchId} />
                            <GridRow label="Status" value={<Chip size="small" label={scannedItem.status} color="success" sx={{ height: 20, fontSize: '0.7rem' }} />} />
                        </Paper>

                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, ml: 1 }}>Lifecycle Events</Typography>
                        <Stack spacing={1}>
                            {scannedItem.events?.map((evt, idx) => (
                                <Box key={idx} sx={{ display: 'flex', gap: 2, p: 1.5, position: 'relative' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#1976D2', mt: 0.5 }} />
                                        {idx !== scannedItem.events.length - 1 && <Box sx={{ width: 2, flex: 1, background: '#e0e0e0', my: 0.5 }} />}
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{evt.eventType}</Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {new Date(evt.timestamp).toLocaleString()}
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                            <Chip icon={<LocationOn sx={{ fontSize: '0.8rem !important' }} />} label={evt.location} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                        </Stack>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>

                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setScannedItem(null)}
                            sx={{ mt: 4, borderRadius: 2 }}
                        >
                            Scan Another Item
                        </Button>
                    </Box>
                )}
            </AnimatePresence>
        </Box>
    );
};

const GridRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
    </Box>
);

export default ScanItem;
