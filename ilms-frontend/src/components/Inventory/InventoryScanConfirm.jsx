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
    LinearProgress
} from '@mui/material';
import {
    QrCodeScanner,
    CheckCircle,
    Error,
    Search,
    Clear,
    Refresh,
    LocationOn,
    Inventory2,
    CameraAlt,
    Close
} from '@mui/icons-material';
import { InventoryAPI, LocationAPI, SerialPoolAPI } from '../../services/APIService';

export default function InventoryScanConfirm() {
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [scanInput, setScanInput] = useState('');
    const [scanHistory, setScanHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, confirmed: 0, failed: 0 });
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const [detailDialog, setDetailDialog] = useState({ open: false, item: null });
    const [cameraOpen, setCameraOpen] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const inputRef = useRef(null);

    useEffect(() => {
        loadLocations();
        loadStats();
        // Focus on input for scanning
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const loadLocations = async () => {
        try {
            const data = await LocationAPI.list();
            setLocations(data);
            // Auto-select first location if available
            if (data.length > 0 && !selectedLocation) {
                setSelectedLocation(data[0].id);
            }
        } catch (e) {
            console.error('Failed to load locations', e);
        }
    };

    const loadStats = async () => {
        try {
            const inventoryStats = await InventoryAPI.getCountsByStatus();
            setStats({
                total: Object.values(inventoryStats).reduce((a, b) => a + b, 0),
                preInventory: inventoryStats['PRE_INVENTORY'] || 0,
                active: inventoryStats['ACTIVE'] || 0
            });
        } catch (e) {
            console.error('Failed to load stats', e);
        }
    };

    const handleScan = async () => {
        const serialNumber = scanInput.trim();
        if (!serialNumber) return;

        // Check if already scanned in this session
        if (scanHistory.find(s => s.serialNumber === serialNumber)) {
            setToast({ open: true, message: 'Item already scanned in this session', severity: 'warning' });
            setScanInput('');
            return;
        }

        if (!selectedLocation) {
            setToast({ open: true, message: 'Please select a location first', severity: 'error' });
            return;
        }

        setLoading(true);
        try {
            // Confirm the scan
            const result = await InventoryAPI.confirmScan(
                serialNumber,
                selectedLocation,
                'Operator' // TODO: Replace with actual user
            );

            // Add to history with success
            setScanHistory(prev => [{
                serialNumber,
                status: 'SUCCESS',
                message: 'Confirmed successfully',
                timestamp: new Date(),
                itemData: result
            }, ...prev]);

            setToast({ open: true, message: `✓ ${serialNumber} confirmed`, severity: 'success' });
            loadStats();
        } catch (e) {
            console.error('Scan confirmation failed', e);

            // Try to get more info about the serial
            let errorMessage = 'Item not found or already confirmed';
            try {
                const serialInfo = await SerialPoolAPI.getBySerial(serialNumber);
                if (serialInfo) {
                    if (serialInfo.status === 'CONSUMED') {
                        errorMessage = 'This serial has already been confirmed';
                    } else if (serialInfo.status === 'VOIDED') {
                        errorMessage = 'This serial has been voided';
                    }
                }
            } catch (e2) {
                // Serial doesn't exist
                errorMessage = 'Serial number not found in system';
            }

            // Add to history with failure
            setScanHistory(prev => [{
                serialNumber,
                status: 'FAILED',
                message: errorMessage,
                timestamp: new Date()
            }, ...prev]);

            setToast({ open: true, message: `✗ ${serialNumber}: ${errorMessage}`, severity: 'error' });
        } finally {
            setLoading(false);
            setScanInput('');
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleScan();
        }
    };

    const handleClearHistory = () => {
        setScanHistory([]);
    };

    const getStatusIcon = (status) => {
        return status === 'SUCCESS'
            ? <CheckCircle color="success" />
            : <Error color="error" />;
    };

    // Camera scanning functions
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraOpen(true);
        } catch (err) {
            console.error('Camera access denied:', err);
            setToast({ open: true, message: 'Camera access denied. Please allow camera permissions.', severity: 'error' });
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraOpen(false);
    };

    const handleCameraCapture = () => {
        // For demo: close camera and prompt manual entry
        // In production, integrate with BarcodeDetector API or a library like @zxing/library
        stopCamera();
        setToast({ open: true, message: 'Camera scan captured. Enter the code manually if not auto-detected.', severity: 'info' });
        inputRef.current?.focus();
    };

    const successCount = scanHistory.filter(s => s.status === 'SUCCESS').length;
    const failCount = scanHistory.filter(s => s.status === 'FAILED').length;

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <QrCodeScanner color="primary" /> Inventory Scan Confirmation
            </Typography>

            <Grid container spacing={3}>
                {/* Left: Scanner Input */}
                <Grid item xs={12} md={5}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
                            color: 'white'
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Scan Barcode
                        </Typography>

                        {/* Location Selector */}
                        <TextField
                            select
                            fullWidth
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            placeholder="Select Location"
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'white',
                                    '& fieldset': { borderColor: 'transparent' }
                                },
                                '& .MuiInputLabel-root': { display: 'none' }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LocationOn />
                                    </InputAdornment>
                                )
                            }}
                        >
                            {locations.map((l) => (
                                <MenuItem key={l.id} value={l.id}>
                                    {l.name} ({l.code})
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Scan Input */}
                        <TextField
                            inputRef={inputRef}
                            fullWidth
                            value={scanInput}
                            onChange={(e) => setScanInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Scan or enter serial number..."
                            autoFocus
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'white',
                                    fontSize: '1.2rem',
                                    '& fieldset': { borderColor: 'transparent' }
                                },
                                '& .MuiInputLabel-root': { display: 'none' }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {scanInput && (
                                            <IconButton size="small" onClick={() => setScanInput('')}>
                                                <Clear />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={startCamera}
                                            sx={{ color: 'primary.main', ml: 0.5 }}
                                            title="Scan with camera"
                                        >
                                            <CameraAlt />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        {loading && <LinearProgress sx={{ mb: 2 }} />}

                        <Button
                            variant="contained"
                            color="success"
                            fullWidth
                            size="large"
                            onClick={handleScan}
                            disabled={loading || !scanInput}
                            startIcon={<CheckCircle />}
                            sx={{ py: 1.5 }}
                        >
                            Confirm Scan
                        </Button>

                        {/* Session Stats */}
                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Card sx={{ flex: 1, bgcolor: 'success.dark' }}>
                                <CardContent sx={{ py: 1, textAlign: 'center' }}>
                                    <Typography variant="h4" color="white">{successCount}</Typography>
                                    <Typography variant="caption" color="white">Confirmed</Typography>
                                </CardContent>
                            </Card>
                            <Card sx={{ flex: 1, bgcolor: 'error.dark' }}>
                                <CardContent sx={{ py: 1, textAlign: 'center' }}>
                                    <Typography variant="h4" color="white">{failCount}</Typography>
                                    <Typography variant="caption" color="white">Failed</Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    </Paper>

                    {/* System Stats */}
                    <Card sx={{ mt: 2 }} variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                <Inventory2 fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Inventory Status
                            </Typography>
                            <Grid container spacing={1} sx={{ mt: 1 }}>
                                <Grid item xs={6}>
                                    <Chip
                                        label={`Pending: ${stats.preInventory || 0}`}
                                        color="warning"
                                        size="small"
                                        sx={{ width: '100%' }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Chip
                                        label={`Active: ${stats.active || 0}`}
                                        color="success"
                                        size="small"
                                        sx={{ width: '100%' }}
                                    />
                                </Grid>
                            </Grid>
                            <Button
                                size="small"
                                startIcon={<Refresh />}
                                onClick={loadStats}
                                sx={{ mt: 1 }}
                            >
                                Refresh
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right: Scan History */}
                <Grid item xs={12} md={7}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Scan History ({scanHistory.length})
                            </Typography>
                            {scanHistory.length > 0 && (
                                <Button
                                    size="small"
                                    color="error"
                                    startIcon={<Clear />}
                                    onClick={handleClearHistory}
                                >
                                    Clear History
                                </Button>
                            )}
                        </Box>

                        {scanHistory.length === 0 ? (
                            <Alert severity="info">
                                No scans in this session. Position cursor in the input field and scan a barcode to confirm inventory.
                            </Alert>
                        ) : (
                            <TableContainer sx={{ maxHeight: 500 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell width={40}>Status</TableCell>
                                            <TableCell>Serial Number</TableCell>
                                            <TableCell>Message</TableCell>
                                            <TableCell>Time</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {scanHistory.map((scan, index) => (
                                            <TableRow
                                                key={index}
                                                hover
                                                sx={{
                                                    bgcolor: scan.status === 'SUCCESS'
                                                        ? 'success.light'
                                                        : 'error.light',
                                                    '&:hover': {
                                                        bgcolor: scan.status === 'SUCCESS'
                                                            ? 'success.main'
                                                            : 'error.main',
                                                        color: 'white'
                                                    }
                                                }}
                                                onClick={() => scan.itemData && setDetailDialog({ open: true, item: scan.itemData })}
                                                style={{ cursor: scan.itemData ? 'pointer' : 'default' }}
                                            >
                                                <TableCell>{getStatusIcon(scan.status)}</TableCell>
                                                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    <Typography variant="body2" fontFamily="monospace" fontWeight="bold" noWrap>
                                                        {scan.serialNumber}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    <Typography variant="body2" noWrap>{scan.message}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                                    {scan.timestamp.toLocaleTimeString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>

                    {/* Instructions */}
                    <Alert severity="info" icon={<QrCodeScanner />} sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            <strong>Instructions:</strong> Select a location, then scan or type the serial number.
                            Items in PRE_INVENTORY status will be confirmed to ACTIVE status.
                        </Typography>
                    </Alert>
                </Grid>
            </Grid>

            {/* Detail Dialog */}
            <Dialog open={detailDialog.open} onClose={() => setDetailDialog({ open: false, item: null })}>
                <DialogTitle>Item Details</DialogTitle>
                <DialogContent>
                    {detailDialog.item && (
                        <Box sx={{ minWidth: 300 }}>
                            <Typography variant="body2"><strong>Serial:</strong> {detailDialog.item.serial_number}</Typography>
                            <Typography variant="body2"><strong>Status:</strong> {detailDialog.item.status}</Typography>
                            <Typography variant="body2"><strong>Confirmed At:</strong> {detailDialog.item.confirmed_at}</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialog({ open: false, item: null })}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Camera Dialog */}
            <Dialog open={cameraOpen} onClose={stopCamera} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Scan Barcode
                    <IconButton onClick={stopCamera}><Close /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ position: 'relative', width: '100%', bgcolor: 'black', borderRadius: 1, overflow: 'hidden' }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{ width: '100%', maxHeight: 400 }}
                        />
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            border: '2px solid #4caf50',
                            width: '70%',
                            height: '40%',
                            borderRadius: 1
                        }} />
                    </Box>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Position the barcode within the green frame. Tap "Capture" when ready.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={stopCamera}>Cancel</Button>
                    <Button variant="contained" onClick={handleCameraCapture} startIcon={<CameraAlt />}>
                        Capture
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
