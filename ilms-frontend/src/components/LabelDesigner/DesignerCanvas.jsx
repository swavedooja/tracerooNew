import React, { useState, useRef } from 'react';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css'; // Mandatory CSS

export default function DesignerCanvas({ width, height, elements, setElements, selectedId, setSelectedId }) {
    const canvasRef = useRef(null);

    const handleDrag = (id, e, data) => {
        const newElements = elements.map(el =>
            el.id === id ? { ...el, x: data.x, y: data.y } : el
        );
        setElements(newElements);
    };

    const handleResize = (id, e, { size }) => {
        const newElements = elements.map(el =>
            el.id === id ? { ...el, width: size.width, height: size.height } : el
        );
        setElements(newElements);
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        setElements(elements.filter(el => el.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const renderContent = (el) => {
        let content = el.formatString || '';
        content = content.replace(/\{([^}]+)\}/g, '[$1]'); // Placeholder preview
        return content;
    };

    // Helper to get element style
    const getElementStyle = (el) => ({
        fontWeight: el.fontWeight || 'normal',
        fontStyle: el.fontStyle || 'normal',
        textDecoration: el.textDecoration || 'none',
        fontSize: el.fontSize || 14,
        textAlign: 'center',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    });

    return (
        <Paper
            variant="outlined"
            onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
            sx={{
                width: width + 60,
                height: height + 60,
                p: 4,
                bgcolor: '#f0f2f5',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'default'
            }}
        >
            <Box
                ref={canvasRef}
                sx={{
                    width,
                    height,
                    bgcolor: 'white',
                    position: 'relative',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0',
                    backgroundImage: 'radial-gradient(#e0e0e0 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            >
                {elements.map(el => (
                    <Draggable
                        key={el.id}
                        bounds="parent"
                        position={{ x: el.x, y: el.y }}
                        onStop={(e, data) => handleDrag(el.id, e, data)}
                        onStart={(e) => {
                            e.stopPropagation();
                            setSelectedId(el.id);
                        }}
                    >
                        {/* We use a div container for draggable to capture the ref properly */}
                        <div style={{ position: 'absolute' }}>
                            <ResizableBox
                                width={el.width || (el.type === 'text' ? 150 : 100)}
                                height={el.height || (el.type === 'text' ? 40 : 100)}
                                axis="both"
                                minConstraints={[20, 20]}
                                maxConstraints={[width - el.x, height - el.y]}
                                onResize={(e, data) => handleResize(el.id, e, data)}
                                onResizeStart={(e) => {
                                    e.stopPropagation();
                                    setSelectedId(el.id);
                                }}
                                draggableOpts={{ enableUserSelectHack: false }}
                                handle={selectedId === el.id ? <span className="react-resizable-handle react-resizable-handle-se" /> : <span />}
                            >
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        border: selectedId === el.id ? '2px solid #1976d2' : '1px dashed transparent',
                                        '&:hover': { border: '1px dashed #999' },
                                        bgcolor: el.type === 'barcode' || el.type === 'qr' ? 'rgba(0,0,0,0.05)' : 'transparent',
                                        position: 'relative',
                                        display: 'flex'
                                    }}
                                    onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                                >
                                    {el.type === 'text' && (
                                        <Typography sx={getElementStyle(el)}>
                                            {renderContent(el)}
                                        </Typography>
                                    )}
                                    {el.type === 'barcode' && (
                                        <Box sx={getElementStyle(el)}>
                                            {/* Placeholder for barcode */}
                                            <div style={{ width: '90%', height: '80%', background: 'repeating-linear-gradient(90deg, #000 0, #000 2px, transparent 2px, transparent 4px)' }}></div>
                                            <Typography variant="caption" sx={{ position: 'absolute', bottom: 0, fontSize: 10 }}>{renderContent(el)}</Typography>
                                        </Box>
                                    )}
                                    {el.type === 'qr' && (
                                        <Box sx={getElementStyle(el)}>
                                            {/* Placeholder for QR */}
                                            <div style={{ width: '80%', height: '80%', border: '4px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div style={{ width: '50%', height: '50%', background: 'black' }}></div>
                                            </div>
                                        </Box>
                                    )}
                                    {el.type === 'image' && (
                                        <img
                                            src={el.src || 'https://via.placeholder.com/150'}
                                            alt="img"
                                            style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                                        />
                                    )}

                                    {selectedId === el.id && (
                                        <IconButton
                                            size="small"
                                            color="error"
                                            sx={{ position: 'absolute', top: -15, right: -15, bgcolor: 'white', boxShadow: 2, zIndex: 99, '&:hover': { bgcolor: '#ffebee' } }}
                                            onClick={(e) => handleDelete(el.id, e)}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                            </ResizableBox>
                        </div>
                    </Draggable>
                ))}
            </Box>
        </Paper>
    );
}

