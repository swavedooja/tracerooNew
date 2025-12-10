import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    TextField,
    Button,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Alert,
    Snackbar,
    Card,
    CardContent,
    IconButton,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    Stepper,
    Step,
    StepLabel,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import {
    QrCodeScanner,
    CheckCircle,
    Error,
    Search,
    Clear,
    Add,
    Remove,
    Inventory2,
    LocalShipping,
    Archive,
    Lock,
    Refresh,
    ArrowForward
} from '@mui/icons-material';
import { InventoryAPI, ContainerAPI, AggregationAPI, LocationAPI, PackagingAPI } from '../../services/APIService';

const CONTAINER_TYPES = [
    { value: 'BOX', label: 'Box / Carton', icon: <Archive /> },
    { value: 'PALLET', label: 'Pallet', icon: <Inventory2 /> },
    { value: 'SHIPPING_CONTAINER', label: 'Shipping Container', icon: <LocalShipping /> }
];

export default function AggregationStation() {
    const [locations, setLocations] = useState([]);
    const [packagingLevels, setPackagingLevels] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');

    // Container state
    const [activeContainer, setActiveContainer] = useState(null);
    const [containerContents, setContainerContents] = useState([]);

    // Scan state
    const [scanInput, setScanInput] = useState('');
    const [scanMode, setScanMode] = useState('ITEM'); // ITEM or CONTAINER
    const [loading, setLoading] = useState(false);

    // Create container dialog
    const [createDialog, setCreateDialog] = useState(false);
    const [newContainer, setNewContainer] = useState({
        type: 'BOX',
        capacity: 10,
        packagingLevelId: ''
    });

    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const inputRef = useRef(null);

    useEffect(() => {
        loadLocations();
        loadPackagingLevels();
    }, []);

    useEffect(() => {
        if (activeContainer) {
            loadContainerContents(activeContainer.id);
        }
    }, [activeContainer]);

    const loadLocations = async () => {
        try {
            const data = await LocationAPI.list();
            setLocations(data);
            if (data.length > 0) setSelectedLocation(data[0].id);
        } catch (e) {
            console.error('Failed to load locations', e);
        }
    };

    const loadPackagingLevels = async () => {
        try {
            const data = await PackagingAPI.listLevels();
            setPackagingLevels(data);
        } catch (e) {
            console.error('Failed to load packaging levels', e);
        }
    };

    const loadContainerContents = async (containerId) => {
        try {
            const contents = await ContainerAPI.getContents(containerId);
            setContainerContents(contents || []);
        } catch (e) {
            console.error('Failed to load container contents', e);
            setContainerContents([]);
        }
    };

    const handleCreateContainer = async () => {
        setLoading(true);
        try {
            const container = await ContainerAPI.create(newContainer.type, {
                capacity: newContainer.capacity,
                packagingLevelId: newContainer.packagingLevelId || null,
                locationId: selectedLocation,
                createdBy: 'Operator'
            });

            setActiveContainer(container);
            setCreateDialog(false);
            setToast({
                open: true,
                message: `Container ${container.serial_number} created`,
                severity: 'success'
            });
        } catch (e) {
            console.error('Failed to create container', e);
            setToast({ open: true, message: `Error: ${e.message}`, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleScanContainer = async () => {
        const serial = scanInput.trim();
        if (!serial) return;

        setLoading(true);
        try {
            const container = await ContainerAPI.getBySerial(serial);
            setActiveContainer(container);
            setScanInput('');
            setToast({
                open: true,
                message: `Container ${container.serial_number} loaded`,
                severity: 'success'
            });
        } catch (e) {
            setToast({ open: true, message: 'Container not found', severity: 'error' });
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleScanItem = async () => {
        const serial = scanInput.trim();
        if (!serial || !activeContainer) return;

        // Check if already in container
        if (containerContents.find(c => c.child_serial === serial)) {
            setToast({ open: true, message: 'Item already in this container', severity: 'warning' });
            setScanInput('');
            return;
        }

        setLoading(true);
        try {
            // Get inventory item by serial
            const item = await InventoryAPI.getBySerial(serial);

            if (!item) {
                setToast({ open: true, message: 'Item not found', severity: 'error' });
                return;
            }

            if (item.status === 'PACKED') {
                setToast({ open: true, message: 'Item is already packed in another container', severity: 'warning' });
                return;
            }

            // Pack the item
            const result = await AggregationAPI.pack(
                activeContainer.id,
                'INVENTORY',
                [item.id],
                'Operator'
            );

            if (result.success) {
                // Reload contents
                await loadContainerContents(activeContainer.id);
                // Refresh container info
                const updatedContainer = await ContainerAPI.get(activeContainer.id);
                setActiveContainer(updatedContainer);

                setToast({
                    open: true,
                    message: `✓ ${serial} packed successfully`,
                    severity: 'success'
                });
            } else {
                setToast({ open: true, message: result.error || 'Pack failed', severity: 'error' });
            }
        } catch (e) {
            console.error('Pack failed', e);
            setToast({ open: true, message: `Error: ${e.message}`, severity: 'error' });
        } finally {
            setLoading(false);
            setScanInput('');
            inputRef.current?.focus();
        }
    };

    const handleUnpackItem = async (childId) => {
        if (!activeContainer) return;

        setLoading(true);
        try {
            const result = await AggregationAPI.unpack(
                activeContainer.id,
                'INVENTORY',
                [childId],
                'Operator'
            );

            if (result.success) {
                await loadContainerContents(activeContainer.id);
                const updatedContainer = await ContainerAPI.get(activeContainer.id);
                setActiveContainer(updatedContainer);
                setToast({ open: true, message: 'Item unpacked', severity: 'success' });
            }
        } catch (e) {
            setToast({ open: true, message: `Error: ${e.message}`, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSealContainer = async () => {
        if (!activeContainer) return;

        setLoading(true);
        try {
            const sealed = await ContainerAPI.seal(activeContainer.id);
            setActiveContainer(sealed);
            setToast({
                open: true,
                message: `Container ${sealed.serial_number} sealed`,
                severity: 'success'
            });
        } catch (e) {
            setToast({ open: true, message: `Error: ${e.message}`, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (scanMode === 'CONTAINER') {
                handleScanContainer();
            } else {
                handleScanItem();
            }
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            EMPTY: 'default',
            PARTIAL: 'warning',
            FULL: 'info',
            SEALED: 'success',
            SHIPPED: 'primary'
        };
        return colors[status] || 'default';
    };

    const fillPercentage = activeContainer?.capacity
        ? Math.round((activeContainer.current_count / activeContainer.capacity) * 100)
        : 0;

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Archive color="primary" /> Aggregation / Packing Station
            </Typography>

            <Grid container spacing={3}>
                {/* Left: Active Container */}
                <Grid item xs={12} md={5}>
                    {/* Container Selection */}
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            mb: 2,
                            background: activeContainer
                                ? 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)'
                                : 'linear-gradient(135deg, #37474f 0%, #546e7a 100%)',
                            color: 'white'
                        }}
                    >
                        {!activeContainer ? (
                            <>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    No Active Container
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                                    Create a new container or scan an existing one to start packing
                                </Typography>

                                <TextField
                                    inputRef={inputRef}
                                    fullWidth
                                    value={scanInput}
                                    onChange={(e) => setScanInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    onFocus={() => setScanMode('CONTAINER')}
                                    placeholder="Scan container barcode..."
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: 'white',
                                            '& fieldset': { borderColor: 'transparent' }
                                        },
                                        '& .MuiInputLabel-root': { display: 'none' }
                                    }}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
                                    }}
                                />

                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                            onClick={handleScanContainer}
                                            disabled={!scanInput}
                                        >
                                            Load Container
                                        </Button>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            fullWidth
                                            startIcon={<Add />}
                                            onClick={() => setCreateDialog(true)}
                                        >
                                            New Container
                                        </Button>
                                    </Grid>
                                </Grid>
                            </>
                        ) : (
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">
                                        Active Container
                                    </Typography>
                                    <IconButton
                                        color="inherit"
                                        onClick={() => { setActiveContainer(null); setContainerContents([]); }}
                                    >
                                        <Clear />
                                    </IconButton>
                                </Box>

                                <Typography variant="h4" fontFamily="monospace" sx={{ mb: 1 }}>
                                    {activeContainer.serial_number}
                                </Typography>

                                <Grid container spacing={2} sx={{ mb: 2 }}>
                                    <Grid item xs={6}>
                                        <Chip
                                            label={activeContainer.container_type}
                                            size="small"
                                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Chip
                                            label={activeContainer.status}
                                            size="small"
                                            color={getStatusColor(activeContainer.status)}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Fill Progress */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                        Capacity: {activeContainer.current_count} / {activeContainer.capacity || '∞'}
                                    </Typography>
                                    {activeContainer.capacity && (
                                        <LinearProgress
                                            variant="determinate"
                                            value={fillPercentage}
                                            sx={{
                                                height: 10,
                                                borderRadius: 5,
                                                bgcolor: 'rgba(255,255,255,0.3)',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: fillPercentage >= 100 ? '#f44336' : '#4caf50'
                                                }
                                            }}
                                        />
                                    )}
                                </Box>

                                {activeContainer.status !== 'SEALED' && (
                                    <Button
                                        variant="contained"
                                        color="warning"
                                        fullWidth
                                        startIcon={<Lock />}
                                        onClick={handleSealContainer}
                                        disabled={containerContents.length === 0}
                                    >
                                        Seal Container
                                    </Button>
                                )}
                            </>
                        )}
                    </Paper>

                    {/* Scan Items */}
                    {activeContainer && activeContainer.status !== 'SEALED' && (
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                                Scan Items to Pack
                            </Typography>

                            <TextField
                                inputRef={inputRef}
                                fullWidth
                                value={scanInput}
                                onChange={(e) => setScanInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                onFocus={() => setScanMode('ITEM')}
                                autoFocus
                                placeholder="Scan item barcode..."
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: 'rgba(0,0,0,0.23)' }
                                    },
                                    '& .MuiInputLabel-root': { display: 'none' }
                                }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><QrCodeScanner /></InputAdornment>,
                                    endAdornment: scanInput && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setScanInput('')}>
                                                <Clear />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />

                            {loading && <LinearProgress sx={{ mb: 2 }} />}

                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<Add />}
                                onClick={handleScanItem}
                                disabled={loading || !scanInput}
                            >
                                Pack Item
                            </Button>
                        </Paper>
                    )}
                </Grid>

                {/* Right: Container Contents */}
                <Grid item xs={12} md={7}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Container Contents ({containerContents.length})
                            </Typography>
                            {activeContainer && (
                                <Button
                                    size="small"
                                    startIcon={<Refresh />}
                                    onClick={() => loadContainerContents(activeContainer.id)}
                                >
                                    Refresh
                                </Button>
                            )}
                        </Box>

                        {!activeContainer ? (
                            <Alert severity="info">
                                Select or create a container to view its contents.
                            </Alert>
                        ) : containerContents.length === 0 ? (
                            <Alert severity="warning">
                                Container is empty. Scan items to pack them.
                            </Alert>
                        ) : (
                            <TableContainer sx={{ maxHeight: 400 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>Serial</TableCell>
                                            <TableCell>Type/Name</TableCell>
                                            <TableCell>Packed At</TableCell>
                                            <TableCell width={60}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {containerContents.map((item, index) => (
                                            <TableRow key={item.aggregation_id} hover>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontFamily="monospace">
                                                        {item.child_serial}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{item.child_name}</TableCell>
                                                <TableCell>
                                                    {new Date(item.aggregated_at).toLocaleTimeString()}
                                                </TableCell>
                                                <TableCell>
                                                    {activeContainer.status !== 'SEALED' && (
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleUnpackItem(item.child_id)}
                                                        >
                                                            <Remove />
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>

                    {/* Instructions */}
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            <strong>Workflow:</strong> Create/Scan container → Scan items to pack → Seal when done
                        </Typography>
                    </Alert>
                </Grid>
            </Grid>

            {/* Create Container Dialog */}
            <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Container</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Container Type"
                                fullWidth
                                value={newContainer.type}
                                onChange={(e) => setNewContainer({ ...newContainer, type: e.target.value })}
                            >
                                {CONTAINER_TYPES.map((t) => (
                                    <MenuItem key={t.value} value={t.value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {t.icon} {t.label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                type="number"
                                label="Capacity (max items)"
                                fullWidth
                                value={newContainer.capacity}
                                onChange={(e) => setNewContainer({ ...newContainer, capacity: parseInt(e.target.value) || 10 })}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Packaging Level (optional)"
                                fullWidth
                                value={newContainer.packagingLevelId}
                                onChange={(e) => setNewContainer({ ...newContainer, packagingLevelId: e.target.value })}
                            >
                                <MenuItem value="">None</MenuItem>
                                {packagingLevels.map((l) => (
                                    <MenuItem key={l.id} value={l.id}>
                                        {l.level_name} ({l.level_code})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Location"
                                fullWidth
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                {locations.map((l) => (
                                    <MenuItem key={l.id} value={l.id}>
                                        {l.name} ({l.code})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateContainer}
                        disabled={loading}
                    >
                        Create Container
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast({ ...toast, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity={toast.severity}
                    onClose={() => setToast({ ...toast, open: false })}
                    variant="filled"
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
