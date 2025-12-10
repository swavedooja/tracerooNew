import React, { useState } from 'react';
import { Box, Button, Paper, TextField, Typography, InputAdornment, Alert, Chip } from '@mui/material';
import { Search, History, PlayArrow } from '@mui/icons-material';
import Timeline from './Timeline';
import { TraceAPI } from '../../services/APIService';

// Demo timeline events for demonstration
const DEMO_EVENTS = [
    {
        id: 1,
        eventType: 'ITEM_CREATED',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Mumbai Warehouse',
        user: 'System',
        notes: 'Item registered in inventory system'
    },
    {
        id: 2,
        eventType: 'QUALITY_CHECK_PASSED',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'QC Station A',
        user: 'Inspector Raj',
        notes: 'Quality check completed - all parameters within spec'
    },
    {
        id: 3,
        eventType: 'SCAN_CONFIRMED',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Production Floor',
        user: 'Operator Suresh',
        notes: 'Item confirmed and activated in inventory'
    },
    {
        id: 4,
        eventType: 'PACKED_INTO_BOX',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Packing Station 2',
        user: 'Packer Amit',
        notes: 'Packed into BOX-10122024-00015'
    },
    {
        id: 5,
        eventType: 'BOX_SEALED',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Packing Station 2',
        user: 'Packer Amit',
        notes: 'Box sealed with 48 items'
    },
    {
        id: 6,
        eventType: 'SHIPMENT_DISPATCHED',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Mumbai Warehouse',
        user: 'Logistics Manager',
        notes: 'Dispatched via BlueDart - AWB: BD123456789'
    },
    {
        id: 7,
        eventType: 'IN_TRANSIT',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Pune Hub',
        user: 'System',
        notes: 'Arrived at intermediate hub'
    },
    {
        id: 8,
        eventType: 'DELIVERED',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        location: 'Delhi Distribution Center',
        user: 'Receiver Priya',
        notes: 'Shipment received and verified'
    }
];

export default function SearchPortal() {
    const [query, setQuery] = useState('');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [isDemo, setIsDemo] = useState(false);

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        setSearched(true);
        setIsDemo(false);
        try {
            const data = await TraceAPI.getHistory(query);
            setEvents(data?.events || []);
        } catch (e) {
            console.error(e);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const loadDemoData = () => {
        setQuery('SN-10122024-00001');
        setEvents(DEMO_EVENTS);
        setSearched(true);
        setIsDemo(true);
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
                    mb: 2
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

            {/* Demo Button */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Button
                    variant="outlined"
                    startIcon={<PlayArrow />}
                    onClick={loadDemoData}
                    size="small"
                >
                    Load Demo Data
                </Button>
            </Box>

            {searched && (
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <History /> History for: {query}
                        </Typography>
                        {isDemo && <Chip label="Demo Data" color="info" size="small" />}
                    </Box>
                    {events.length === 0 && !isDemo ? (
                        <Alert severity="info">
                            No trace history found for this item. Try searching for a different serial number or load demo data.
                        </Alert>
                    ) : (
                        <Timeline events={events} />
                    )}
                </Box>
            )}
        </Box>
    );
}
