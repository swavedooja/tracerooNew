import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Alert,
    Snackbar
} from '@mui/material';
import Scanner from './Scanner';
import PackingList from './PackingList';
import PackagingAPI from '../../services/APIService'; // Assuming this exists or using generic API

const PackingDashboard = () => {
    const [hierarchies, setHierarchies] = useState([]);
    const [selectedHierarchy, setSelectedHierarchy] = useState('');
    const [levels, setLevels] = useState([]);
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

    const [isScanning, setIsScanning] = useState(false);
    const [scannedItems, setScannedItems] = useState([]);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Mock Data for now - waiting for backend
    useEffect(() => {
        // Fetch hierarchies
        // PackagingAPI.getHierarchies().then(...)
        setHierarchies([{ id: '1', name: 'Standard Box -> Pallet' }]);
    }, []);

    const handleHierarchyChange = (e) => {
        const hId = e.target.value;
        setSelectedHierarchy(hId);
        // Mock Levels
        setLevels([
            { id: 'l1', level_name: 'Box', level_order: 1, capacity: 10, templatePattern: '^ITEM-.*' },
            { id: 'l2', level_name: 'Pallet', level_order: 2, capacity: 5, templatePattern: '^BOX-.*' }
        ]);
        setCurrentLevelIndex(0);
        setScannedItems([]);
    };

    const handleScan = (decodedText) => {
        // 1. Validation Logic
        const currentLevel = levels[currentLevelIndex];

        // Check Status: Already in list?
        if (scannedItems.find(i => i.barcode === decodedText)) {
            setError("Item already scanned!");
            return;
        }

        // Check Format (Regex) logic here if needed
        // if (!new RegExp(currentLevel.templatePattern).test(decodedText)) ...

        // 2. Add to List
        const newItem = { barcode: decodedText, timestamp: new Date() };
        const newList = [...scannedItems, newItem];
        setScannedItems(newList);
        setSuccessMsg(`Scanned: ${decodedText}`);

        // 3. Hierarchy Logic (Auto-Advance)
        if (currentLevel.capacity && newList.length >= currentLevel.capacity) {
            setIsScanning(false); // Stop scanning
            setSuccessMsg(`${currentLevel.level_name} Full! Please scan parent label.`);
            // Logic to transition to next level or close box would go here
        }
    };

    const handleDelete = (index) => {
        const newList = [...scannedItems];
        newList.splice(index, 1);
        setScannedItems(newList);
    };

    return (
        <Box sx={{ flexGrow: 1, height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
            <Typography variant="h4" gutterBottom>Packing Station</Typography>

            {/* Control Bar */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Select Packaging Hierarchy</InputLabel>
                            <Select value={selectedHierarchy} label="Select Packaging Hierarchy" onChange={handleHierarchyChange}>
                                {hierarchies.map(h => (
                                    <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <FormControl fullWidth size="small" disabled={!selectedHierarchy}>
                            <InputLabel>Select Packaging Level</InputLabel>
                            <Select
                                value={currentLevelIndex}
                                label="Select Packaging Level"
                                onChange={(e) => {
                                    setCurrentLevelIndex(e.target.value);
                                    setScannedItems([]); // Reset list on level change? Or keep? Reset seems safer for now.
                                }}
                            >
                                {levels.map((lvl, index) => (
                                    <MenuItem key={lvl.id} value={index}>{lvl.level_name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        {levels[currentLevelIndex] && (
                            <Typography variant="body2" color="textSecondary" align="center">
                                Capacity: {levels[currentLevelIndex].capacity || 'Unlimited'}
                            </Typography>
                        )}
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={2} sx={{ height: '100%' }}>
                {/* Left: Scanner */}
                <Grid item xs={12} md={6} sx={{ height: '100%' }}>
                    <Paper sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', bgcolor: '#000' }}>
                        <Scanner
                            isScanning={isScanning}
                            onStartScan={() => setIsScanning(true)}
                            onStopScan={() => setIsScanning(false)}
                            onScan={handleScan}
                            onError={(err) => setError(err)}
                        />
                    </Paper>
                </Grid>

                {/* Right: List */}
                <Grid item xs={12} md={6} sx={{ height: '100%' }}>
                    <PackingList
                        items={scannedItems}
                        onDelete={handleDelete}
                        levelName={levels[currentLevelIndex]?.level_name || 'Items'}
                        capacity={levels[currentLevelIndex]?.capacity}
                    />
                </Grid>
            </Grid>

            {/* Feedback */}
            <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError(null)}>
                <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
            </Snackbar>
            <Snackbar open={!!successMsg} autoHideDuration={2000} onClose={() => setSuccessMsg(null)}>
                <Alert severity="success" onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>
            </Snackbar>
        </Box>
    );
};

export default PackingDashboard;
