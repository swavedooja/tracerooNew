import React, { useState, useRef } from 'react';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import { Delete, DragIndicator } from '@mui/icons-material';
import Draggable from 'react-draggable';

export default function DesignerCanvas({ width, height, elements, setElements, selectedId, setSelectedId }) {
    const canvasRef = useRef(null);

    const handleDrag = (id, e, data) => {
        const newElements = elements.map(el =>
            el.id === id ? { ...el, x: data.x, y: data.y } : el
        );
        setElements(newElements);
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        setElements(elements.filter(el => el.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                width: width + 40,
                height: height + 40,
                p: 2,
                bgcolor: '#f5f5f5',
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Box
                ref={canvasRef}
                sx={{
                    width: width,
                    height: height,
                    bgcolor: 'white',
                    position: 'relative',
                    boxShadow: 3,
                    border: '1px solid #ddd'
                }}
                onClick={() => setSelectedId(null)}
            >
                {elements.map(el => (
                    <Draggable
                        key={el.id}
                        bounds="parent"
                        position={{ x: el.x, y: el.y }}
                        onStop={(e, data) => handleDrag(el.id, e, data)}
                        onStart={() => setSelectedId(el.id)}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                cursor: 'move',
                                border: selectedId === el.id ? '2px solid #1976d2' : '1px dashed transparent',
                                '&:hover': { border: '1px dashed #999' },
                                p: 0.5,
                                bgcolor: el.type === 'barcode' ? '#fff' : 'transparent'
                            }}
                            onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                        >
                            {el.type === 'text' && (
                                <Typography sx={{ fontSize: el.fontSize, fontWeight: el.fontWeight }}>
                                    {el.content}
                                </Typography>
                            )}
                            {el.type === 'barcode' && (
                                <Box sx={{ width: 100, height: 40, bgcolor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                                    BARCODE
                                </Box>
                            )}
                            {el.type === 'qr' && (
                                <Box sx={{ width: 50, height: 50, bgcolor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>
                                    QR
                                </Box>
                            )}

                            {selectedId === el.id && (
                                <IconButton
                                    size="small"
                                    color="error"
                                    sx={{ position: 'absolute', top: -15, right: -15, bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#ffebee' } }}
                                    onClick={(e) => handleDelete(el.id, e)}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            )}
                        </Box>
                    </Draggable>
                ))}
            </Box>
        </Paper>
    );
}
