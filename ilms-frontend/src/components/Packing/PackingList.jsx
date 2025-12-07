import React from 'react';
import {
    List,
    ListItem,
    ListItemText,
    IconButton,
    Paper,
    Typography,
    Box,
    Chip
} from '@mui/material';
import { Delete, CheckCircle } from '@mui/icons-material';

const PackingList = ({ items, onDelete, levelName, capacity }) => {
    return (
        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6">{levelName} Contents</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2">{items.length} / {capacity || '∞'} Items</Typography>
                    <Typography variant="caption">Scan to add</Typography>
                </Box>
                {/* Progress Bar could go here */}
            </Box>
            <List sx={{ flex: 1, overflowY: 'auto', bgcolor: '#f5f5f5' }}>
                {items.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                        <Typography>No items scanned yet.</Typography>
                    </Box>
                ) : (
                    items.map((item, index) => (
                        <ListItem
                            key={index} // Use unique ID in production
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => onDelete(index)}>
                                    <Delete color="error" />
                                </IconButton>
                            }
                            sx={{ bgcolor: 'white', mb: 1, borderRadius: 1, boxShadow: 1, mx: 1, width: 'auto' }}
                        >
                            <CheckCircle color="success" sx={{ mr: 2 }} />
                            <ListItemText
                                primary={item.barcode}
                                secondary={`Scanned: ${new Date().toLocaleTimeString()}`}
                            />
                        </ListItem>
                    ))
                )}
            </List>
        </Paper>
    );
};

export default PackingList;
