import React, { useState, useEffect } from 'react';
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
    Stepper,
    Step,
    StepLabel,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    CircularProgress,
    LinearProgress
} from '@mui/material';
import {
    LocalShipping,
    Add,
    Delete,
    Search,
    CheckCircle,
    Schedule,
    Archive,
    Send,
    Inventory2,
    LocationOn,
    Person,
    DirectionsCar,
    Phone,
    QrCodeScanner,
    PlayArrow
} from '@mui/icons-material';
import { ShipmentAPI, ContainerAPI, LocationAPI } from '../../services/APIService';

const SHIPMENT_STATUSES = {
    CREATED: { color: 'default', label: 'Created' },
    LOADING: { color: 'info', label: 'Loading' },
    DISPATCHED: { color: 'warning', label: 'Dispatched' },
    IN_TRANSIT: { color: 'primary', label: 'In Transit' },
    DELIVERED: { color: 'success', label: 'Delivered' },
    CANCELLED: { color: 'error', label: 'Cancelled' }
};

// Demo shipments for demonstration
const DEMO_SHIPMENTS = [
    {
        id: 'demo-1',
        shipment_number: 'SHP-20241210-001',
        status: 'DELIVERED',
        origin_name: 'Mumbai Warehouse',
        destination_name: 'Delhi Distribution Center',
        carrier: 'BlueDart Express',
        item_count: 48,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        dispatched_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        delivered_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'demo-2',
        shipment_number: 'SHP-20241210-002',
        status: 'IN_TRANSIT',
        origin_name: 'Chennai Factory',
        destination_name: 'Bangalore Hub',
        carrier: 'DTDC',
        item_count: 120,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dispatched_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'demo-3',
        shipment_number: 'SHP-20241210-003',
        status: 'DISPATCHED',
        origin_name: 'Pune Warehouse',
        destination_name: 'Hyderabad DC',
        carrier: 'Delhivery',
        item_count: 36,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        dispatched_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'demo-4',
        shipment_number: 'SHP-20241210-004',
        status: 'CREATED',
        origin_name: 'Kolkata Hub',
        destination_name: 'Jaipur Warehouse',
        carrier: 'FedEx',
        item_count: 0,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'demo-5',
        shipment_number: 'SHP-20241210-005',
        status: 'LOADING',
        origin_name: 'Mumbai Warehouse',
        destination_name: 'Ahmedabad DC',
        carrier: 'Ecom Express',
        item_count: 24,
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    }
];

export default function ShipmentCreate() {
    const [locations, setLocations] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    // Create shipment form
    const [form, setForm] = useState({
        originLocationId: '',
        destinationLocationId: '',
        carrier: '',
        expectedDeliveryDate: '',
        notes: ''
    });

    // Active shipment for loading
    const [activeShipment, setActiveShipment] = useState(null);
    const [shipmentItems, setShipmentItems] = useState([]);
    const [scanInput, setScanInput] = useState('');

    // Dispatch dialog
    const [dispatchDialog, setDispatchDialog] = useState(false);
    const [dispatchForm, setDispatchForm] = useState({
        vehicleNumber: '',
        driverName: '',
        driverContact: ''
    });

    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        loadLocations();
        loadShipments();
    }, []);

    useEffect(() => {
        if (activeShipment) {
            loadShipmentItems(activeShipment.id);
        }
    }, [activeShipment]);

    const loadLocations = async () => {
        try {
            const data = await LocationAPI.list();
            setLocations(data);
        } catch (e) {
            console.error('Failed to load locations', e);
        }
    };

    const loadShipments = async () => {
        setLoading(true);
        try {
            const data = await ShipmentAPI.list();
            setShipments(data);
        } catch (e) {
            console.error('Failed to load shipments', e);
        } finally {
            setLoading(false);
        }
    };

    const [isDemo, setIsDemo] = useState(false);

    const loadDemoData = () => {
        setShipments(DEMO_SHIPMENTS);
        setIsDemo(true);
        setToast({ open: true, message: 'Demo shipments loaded successfully!', severity: 'success' });
    };

    const loadShipmentItems = async (shipmentId) => {
        try {
            const items = await ShipmentAPI.getItems(shipmentId);
            setShipmentItems(items || []);
        } catch (e) {
            console.error('Failed to load shipment items', e);
            setShipmentItems([]);
        }
    };

    const handleCreateShipment = async () => {
        if (!form.originLocationId || !form.destinationLocationId) {
            setToast({ open: true, message: 'Please select origin and destination', severity: 'error' });
            return;
        }

        setLoading(true);
        try {
            const shipment = await ShipmentAPI.create(
                form.originLocationId,
                form.destinationLocationId,
                {
                    carrier: form.carrier,
                    expectedDeliveryDate: form.expectedDeliveryDate || null,
                    notes: form.notes,
                    createdBy: 'Operator'
                }
            );

            setActiveShipment(shipment);
            setActiveStep(1);
            loadShipments();
            setToast({ open: true, message: `Shipment ${shipment.shipment_number} created`, severity: 'success' });
        } catch (e) {
            console.error('Failed to create shipment', e);
            setToast({ open: true, message: `Error: ${e.message}`, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleScanItem = async () => {
        const serial = scanInput.trim();
        if (!serial || !activeShipment) return;

        setLoading(true);
        try {
            // Try to find container by serial
            const container = await ContainerAPI.getBySerial(serial);

            if (!container) {
                setToast({ open: true, message: 'Container not found', severity: 'error' });
                return;
            }

            if (container.status !== 'SEALED') {
                setToast({ open: true, message: 'Container must be sealed before shipping', severity: 'warning' });
                return;
            }

            // Add to shipment
            const result = await ShipmentAPI.addItems(
                activeShipment.id,
                container.container_type,
                [container.id]
            );

            if (result.success) {
                loadShipmentItems(activeShipment.id);
                setToast({ open: true, message: `✓ ${serial} added to shipment`, severity: 'success' });
            } else {
                setToast({ open: true, message: result.errors?.[0]?.error || 'Failed to add', severity: 'error' });
            }
        } catch (e) {
            console.error('Failed to add item', e);
            setToast({ open: true, message: `Error: ${e.message}`, severity: 'error' });
        } finally {
            setLoading(false);
            setScanInput('');
        }
    };

    const handleRemoveItem = async (itemType, itemId) => {
        if (!activeShipment) return;

        try {
            await ShipmentAPI.removeItem(activeShipment.id, itemType, itemId);
            loadShipmentItems(activeShipment.id);
            setToast({ open: true, message: 'Item removed', severity: 'info' });
        } catch (e) {
            console.error('Failed to remove item', e);
        }
    };

    const handleDispatch = async () => {
        if (!activeShipment) return;

        setLoading(true);
        try {
            const dispatched = await ShipmentAPI.dispatch(activeShipment.id, {
                vehicleNumber: dispatchForm.vehicleNumber,
                driverName: dispatchForm.driverName,
                driverContact: dispatchForm.driverContact
            });

            setActiveShipment(dispatched);
            setDispatchDialog(false);
            setActiveStep(2);
            loadShipments();
            setToast({ open: true, message: `Shipment dispatched!`, severity: 'success' });
        } catch (e) {
            console.error('Failed to dispatch', e);
            setToast({ open: true, message: `Error: ${e.message}`, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleReceive = async (shipmentId) => {
        setLoading(true);
        try {
            await ShipmentAPI.receive(shipmentId, 'Operator');
            loadShipments();
            setToast({ open: true, message: 'Shipment marked as delivered', severity: 'success' });
        } catch (e) {
            console.error('Failed to receive', e);
            setToast({ open: true, message: `Error: ${e.message}`, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectShipment = (shipment) => {
        setActiveShipment(shipment);
        if (shipment.status === 'CREATED' || shipment.status === 'LOADING') {
            setActiveStep(1);
        } else {
            setActiveStep(2);
        }
    };

    const steps = ['Create Shipment', 'Load Items', 'Dispatch'];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShipping color="primary" /> Shipment Management
                    {isDemo && <Chip label="Demo Data" color="info" size="small" sx={{ ml: 1 }} />}
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<PlayArrow />}
                    onClick={loadDemoData}
                    size="small"
                >
                    Load Demo Data
                </Button>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Grid container spacing={3}>
                {/* Left Panel */}
                <Grid item xs={12} md={activeStep === 0 ? 8 : 5}>
                    {activeStep === 0 && (
                        <Paper variant="outlined" sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Create New Shipment</Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        label="Origin Location *"
                                        fullWidth
                                        value={form.originLocationId}
                                        onChange={(e) => setForm({ ...form, originLocationId: e.target.value })}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>
                                        }}
                                    >
                                        {locations.map((l) => (
                                            <MenuItem key={l.id} value={l.id}>
                                                {l.name} ({l.code})
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        label="Destination Location *"
                                        fullWidth
                                        value={form.destinationLocationId}
                                        onChange={(e) => setForm({ ...form, destinationLocationId: e.target.value })}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>
                                        }}
                                    >
                                        {locations.map((l) => (
                                            <MenuItem key={l.id} value={l.id}>
                                                {l.name} ({l.code})
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Carrier"
                                        fullWidth
                                        value={form.carrier}
                                        onChange={(e) => setForm({ ...form, carrier: e.target.value })}
                                        placeholder="e.g., FedEx, DHL"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        type="date"
                                        label="Expected Delivery Date"
                                        fullWidth
                                        value={form.expectedDeliveryDate}
                                        onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Notes"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        value={form.notes}
                                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        startIcon={<Add />}
                                        onClick={handleCreateShipment}
                                        disabled={loading}
                                    >
                                        Create Shipment
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    )}

                    {activeStep >= 1 && activeShipment && (
                        <Paper variant="outlined" sx={{ p: 3 }}>
                            {/* Shipment Info */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box>
                                    <Typography variant="h6" fontFamily="monospace">
                                        {activeShipment.shipment_number}
                                    </Typography>
                                    <Chip
                                        label={SHIPMENT_STATUSES[activeShipment.status]?.label || activeShipment.status}
                                        color={SHIPMENT_STATUSES[activeShipment.status]?.color || 'default'}
                                        size="small"
                                    />
                                </Box>
                                <Button
                                    variant="text"
                                    onClick={() => { setActiveShipment(null); setActiveStep(0); }}
                                >
                                    New Shipment
                                </Button>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Scan to add items */}
                            {(activeShipment.status === 'CREATED' || activeShipment.status === 'LOADING') && (
                                <>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        Scan Container to Add
                                    </Typography>
                                    <TextField
                                        label="Scan Container Barcode"
                                        fullWidth
                                        value={scanInput}
                                        onChange={(e) => setScanInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleScanItem()}
                                        sx={{ mb: 2 }}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><QrCodeScanner /></InputAdornment>
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<Add />}
                                        onClick={handleScanItem}
                                        disabled={loading || !scanInput}
                                        sx={{ mb: 2 }}
                                    >
                                        Add to Shipment
                                    </Button>
                                </>
                            )}

                            {/* Items list */}
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Shipment Items ({shipmentItems.length})
                            </Typography>
                            {shipmentItems.length === 0 ? (
                                <Alert severity="info">No items added yet</Alert>
                            ) : (
                                <TableContainer sx={{ maxHeight: 250 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Serial</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell width={40}></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {shipmentItems.map((item, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>
                                                        <Typography variant="body2" fontFamily="monospace">
                                                            {item.serial_number}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>{item.item_type}</TableCell>
                                                    <TableCell>
                                                        <Chip label={item.status} size="small" />
                                                    </TableCell>
                                                    <TableCell>
                                                        {(activeShipment.status === 'CREATED' || activeShipment.status === 'LOADING') && (
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleRemoveItem(item.item_type, item.item_id)}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}

                            {/* Dispatch button */}
                            {(activeShipment.status === 'CREATED' || activeShipment.status === 'LOADING') && shipmentItems.length > 0 && (
                                <Button
                                    variant="contained"
                                    color="warning"
                                    fullWidth
                                    startIcon={<Send />}
                                    onClick={() => setDispatchDialog(true)}
                                    sx={{ mt: 2 }}
                                >
                                    Dispatch Shipment
                                </Button>
                            )}
                        </Paper>
                    )}
                </Grid>

                {/* Right Panel - Shipment List */}
                <Grid item xs={12} md={activeStep === 0 ? 4 : 7}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                            Recent Shipments
                        </Typography>

                        {loading && <LinearProgress sx={{ mb: 2 }} />}

                        <TableContainer sx={{ maxHeight: 500 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Number</TableCell>
                                        <TableCell>Route</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Items</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {shipments.map((s) => (
                                        <TableRow
                                            key={s.id}
                                            hover
                                            selected={activeShipment?.id === s.id}
                                            onClick={() => handleSelectShipment(s)}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
                                                    {s.shipment_number}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption">
                                                    {s.origin_code} → {s.destination_code}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={SHIPMENT_STATUSES[s.status]?.label || s.status}
                                                    color={SHIPMENT_STATUSES[s.status]?.color || 'default'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{s.item_count}</TableCell>
                                            <TableCell>
                                                {s.status === 'DISPATCHED' && (
                                                    <Button
                                                        size="small"
                                                        color="success"
                                                        onClick={(e) => { e.stopPropagation(); handleReceive(s.id); }}
                                                    >
                                                        Receive
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Dispatch Dialog */}
            <Dialog open={dispatchDialog} onClose={() => setDispatchDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Dispatch Shipment</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Vehicle Number"
                                fullWidth
                                value={dispatchForm.vehicleNumber}
                                onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleNumber: e.target.value })}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><DirectionsCar /></InputAdornment>
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Driver Name"
                                fullWidth
                                value={dispatchForm.driverName}
                                onChange={(e) => setDispatchForm({ ...dispatchForm, driverName: e.target.value })}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Person /></InputAdornment>
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Driver Contact"
                                fullWidth
                                value={dispatchForm.driverContact}
                                onChange={(e) => setDispatchForm({ ...dispatchForm, driverContact: e.target.value })}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDispatchDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={handleDispatch}
                        disabled={loading}
                        startIcon={<Send />}
                    >
                        Dispatch Now
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
