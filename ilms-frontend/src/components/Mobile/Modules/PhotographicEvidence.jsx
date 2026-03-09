import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Stack, Paper, ImageList, ImageListItem } from '@mui/material';
import { ArrowBack, Camera, AddAPhoto, Done, Delete, CloudUpload } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const PhotographicEvidence = ({ onBack }) => {
    const [photos, setPhotos] = useState([]);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const handleCapture = () => {
        // Simulate photo capture with a placeholder
        const newPhoto = {
            id: Date.now(),
            url: `https://picsum.photos/seed/${Math.random()}/300/400`,
            timestamp: new Date().toISOString()
        };
        setPhotos([newPhoto, ...photos]);
        setIsCameraOpen(false);
    };

    const handleDelete = (id) => {
        setPhotos(photos.filter(p => p.id !== id));
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <IconButton onClick={onBack} size="small" sx={{ mr: 1 }}><ArrowBack /></IconButton>
                <Typography sx={{ fontWeight: 700 }}>Evidence Capture</Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                <AnimatePresence mode="wait">
                    {!isCameraOpen ? (
                        <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Box sx={{
                                p: 3, mb: 3, borderRadius: 3, bgcolor: '#f5f5f5',
                                border: '2px dashed #e0e0e0', textAlign: 'center'
                            }} onClick={() => setIsCameraOpen(true)}>
                                <AddAPhoto sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>Start Camera</Typography>
                                <Typography variant="caption" color="text.secondary">Capture real-time site evidence</Typography>
                            </Box>

                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Captured Photos ({photos.length})</Typography>

                            {photos.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <Camera sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
                                    <Typography variant="body2" color="text.secondary">No photos captured yet</Typography>
                                </Box>
                            ) : (
                                <ImageList cols={2} gap={8}>
                                    {photos.map((photo) => (
                                        <ImageListItem key={photo.id} sx={{ borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                                            <img src={photo.url} alt="Evidence" loading="lazy" style={{ height: 180, objectFit: 'cover' }} />
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(photo.id)}
                                                sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'red' } }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </ImageListItem>
                                    ))}
                                </ImageList>
                            )}

                            {photos.length > 0 && (
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<CloudUpload />}
                                    sx={{ mt: 4, borderRadius: 2, py: 1.5, background: '#1a1a1a' }}
                                >
                                    Upload Evidence
                                </Button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="camera" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                            <Box sx={{
                                height: '500px', width: '100%', bgcolor: 'black', borderRadius: 4,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                <Box sx={{ width: '100%', height: '100%', opacity: 0.3, background: 'radial-gradient(circle, #333, #000)' }} />
                                <Box sx={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.2)', m: 4, pointerEvents: 'none' }} />

                                <Box sx={{ position: 'absolute', bottom: 40, width: '100%', display: 'flex', justifyContent: 'center', gap: 4 }}>
                                    <IconButton onClick={() => setIsCameraOpen(false)} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                        <ArrowBack />
                                    </IconButton>
                                    <IconButton
                                        onClick={handleCapture}
                                        sx={{
                                            width: 72, height: 72, bgcolor: 'white',
                                            '&:hover': { bgcolor: '#f5f5f5' },
                                            boxShadow: '0 0 0 4px rgba(255,255,255,0.3)'
                                        }}
                                    />
                                    <Box sx={{ width: 44 }} /> {/* Spacer */}
                                </Box>

                                <Typography sx={{ position: 'absolute', top: 20, color: 'white', opacity: 0.6 }} variant="caption">
                                    Simulated Camera Terminal
                                </Typography>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
        </Box>
    );
};

export default PhotographicEvidence;
