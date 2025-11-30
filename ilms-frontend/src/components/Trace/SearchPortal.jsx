import React, { useState } from 'react';
import { Box, Button, Paper, TextField, Typography, InputAdornment, IconButton } from '@mui/material';
import { Search, History } from '@mui/icons-material';
import Timeline from './Timeline';
import { TraceAPI } from '../../services/APIService';

export default function SearchPortal() {
    const [query, setQuery] = useState('');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        setSearched(true);
        try {
            const data = await TraceAPI.getHistory(query);
            setEvents(data);
        } catch (e) {
            console.error(e);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" fontWeight="bold" align="center" sx={{ mb: 4 }}>
                Track & Trace
            </Typography>

            <Paper
                elevation={3}
                sx={{
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 4,
                    mb: 4
                }}
            >
                <TextField
                    fullWidth
                    placeholder="Enter Serial Number / Container ID"
                    variant="standard"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    InputProps={{
                        disableUnderline: true,
                        sx: { px: 2, fontSize: '1.1rem' },
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        )
                    }}
                />
                <Button
                    variant="contained"
                    sx={{ borderRadius: 4, px: 4, py: 1 }}
                    onClick={handleSearch}
                    disabled={loading}
                >
                    Track
                </Button>
            </Paper>

            {searched && (
                <Box>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <History /> History for: {query}
                    </Typography>
                    <Timeline events={events} />
                </Box>
            )}
        </Box>
    );
}
