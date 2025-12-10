import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Button, Paper, Typography, Stepper, Step, StepLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Chip, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
    Alert, LinearProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { ArrowBack, CloudUpload, Print, Calculate, CheckCircle, Error as ErrorIcon, Preview, Download } from '@mui/icons-material';
import { PackagingAPI } from '../../../services/APIService';
import LabelPreview from '../../LabelPreview';

// Dummy data for preview
const DUMMY_DATA = {
    materialCode: 'MAT-12345678',
    materialName: 'Premium Shampoo 500ml',
    batchNumber: 'B-2023-10-001',
    serialNumber: 'SN-9988776655',
    expiryDate: '2025-12-31',
    mfgDate: '2023-10-01',
    netWeight: '500g',
};

export default function PrintStation() {
    const { hierarchyId } = useParams();
    const navigate = useNavigate();

    // Stepper
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Plan Quantities', 'Upload Data', 'Preview & Print'];

    // Data
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(false);

    // Step 1: Quantity
    const [totalItems, setTotalItems] = useState('');
    const [calculatedCounts, setCalculatedCounts] = useState({}); // { levelId: count }

    // Step 2: Uploads
    const [uploadedData, setUploadedData] = useState({}); // { levelId: { headers: [], rows: [] } }

    // Step 3: Preview
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewLevel, setPreviewLevel] = useState(null);
    const [paperSize, setPaperSize] = useState('A4');

    useEffect(() => {
        if (hierarchyId) loadLevels();
    }, [hierarchyId]);

    const loadLevels = async () => {
        setLoading(true);
        try {
            const data = await PackagingAPI.getLevels(hierarchyId);
            // Sort by level_order ascending (lowest = innermost = items)
            const sorted = data.sort((a, b) => a.level_order - b.level_order);
            setLevels(sorted);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    // Step 1: Calculate counts based on capacity
    const handleCalculate = () => {
        if (!totalItems || isNaN(parseInt(totalItems))) return;

        const counts = {};
        let currentCount = parseInt(totalItems);

        levels.forEach((level, index) => {
            counts[level.id] = currentCount;
            // For next level, divide by current level's capacity
            const capacity = level.capacity || 10; // Default 10 if not set
            if (index < levels.length - 1) {
                currentCount = Math.ceil(currentCount / capacity);
            }
        });

        setCalculatedCounts(counts);
        setActiveStep(1);
    };

    // Step 2: Handle CSV Upload for a specific level
    const handleFileUpload = (levelId, event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target.result;
            const lines = text.split('\n').filter(l => l.trim());
            if (lines.length > 0) {
                const headers = lines[0].split(',').map(h => h.trim());
                const rows = lines.slice(1).map((line, i) => {
                    const values = line.split(',');
                    const row = { _id: i };
                    headers.forEach((h, idx) => row[h] = values[idx]?.trim() || '');
                    return row;
                });
                setUploadedData(prev => ({
                    ...prev,
                    [levelId]: { headers, rows }
                }));
            }
        };
        reader.readAsText(file);
    };

    // Check if all levels have data
    const allLevelsUploaded = levels.every(l => uploadedData[l.id]?.rows?.length > 0);

    // Check if row count matches expected
    const getUploadStatus = (levelId) => {
        const expected = calculatedCounts[levelId] || 0;
        const actual = uploadedData[levelId]?.rows?.length || 0;
        if (actual === 0) return { status: 'missing', color: 'default', text: 'Not Uploaded' };
        if (actual !== expected) return { status: 'mismatch', color: 'error', text: `Mismatch: ${actual}/${expected}` };
        return { status: 'ok', color: 'success', text: `Uploaded (${actual})` };
    };

    // Generate sample CSV with dummy data for a level
    const generateSampleCSV = (levelId) => {
        const level = levels.find(l => l.id === levelId);
        const count = calculatedCounts[levelId] || 10;

        // Common fields that might be used in labels
        const headers = ['serialNumber', 'batchNumber', 'materialCode', 'materialName', 'expiryDate', 'mfgDate', 'netWeight'];

        // Generate dummy rows
        const rows = [];
        const today = new Date();
        const expiryDate = new Date(today);
        expiryDate.setFullYear(today.getFullYear() + 2);

        for (let i = 1; i <= count; i++) {
            rows.push([
                `SN-${today.toLocaleDateString('en-GB').replace(/\//g, '')}-${String(i).padStart(5, '0')}`,
                `BATCH-${today.getFullYear()}-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
                `MAT-${String(1000 + i).padStart(8, '0')}`,
                `Sample Product ${level?.level_name || 'Item'} #${i}`,
                expiryDate.toISOString().split('T')[0],
                today.toISOString().split('T')[0],
                `${(Math.random() * 500 + 100).toFixed(0)}g`
            ]);
        }

        // Create CSV content
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `sample_${level?.level_name || 'data'}_${count}_rows.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Step 3: Render Imposition Preview for a level
    const renderImposition = (levelId) => {
        const level = levels.find(l => l.id === levelId);
        if (!level || !level.label_template) return <Typography>No template linked to this level.</Typography>;

        const template = level.label_template;
        const elements = typeof template.canvas_design === 'string'
            ? JSON.parse(template.canvas_design)
            : template.canvas_design || [];

        const data = uploadedData[levelId]?.rows || [];
        if (data.length === 0) return <Typography>No data uploaded for this level.</Typography>;

        const paperDims = paperSize === 'A4' ? { w: 210, h: 297 } : { w: 215.9, h: 279.4 };
        const pxPerMm = 3.78;
        const labelW = (template.width || 100) * pxPerMm;
        const labelH = (template.height || 150) * pxPerMm;
        const cols = Math.floor(paperDims.w / (template.width || 100));
        const rows = Math.floor(paperDims.h / (template.height || 150));
        const labelsPerSheet = cols * rows;
        const totalLabels = data.length;
        const totalSheets = Math.ceil(totalLabels / labelsPerSheet);

        return (
            <Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    <b>{totalLabels}</b> labels → <b>{totalSheets}</b> sheet(s) ({labelsPerSheet} per sheet on {paperSize})
                </Typography>
                {/* Render first sheet as preview */}
                <Paper
                    id="print-area"
                    sx={{
                        width: paperDims.w * pxPerMm,
                        height: paperDims.h * pxPerMm,
                        display: 'grid',
                        gridTemplateColumns: `repeat(${cols}, ${labelW}px)`,
                        gridTemplateRows: `repeat(${rows}, ${labelH}px)`,
                        border: '1px solid #ccc',
                        bgcolor: 'white',
                        boxShadow: 2,
                        mx: 'auto'
                    }}
                >
                    {data.slice(0, labelsPerSheet).map((rowData, i) => (
                        <Box key={i} sx={{ border: '1px dashed #eee', overflow: 'hidden' }}>
                            <LabelPreview
                                width={labelW}
                                height={labelH}
                                elements={elements}
                                data={{ ...DUMMY_DATA, ...rowData }}
                            />
                        </Box>
                    ))}
                </Paper>
            </Box>
        );
    };

    return (
        <Box sx={{ p: 3 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/labels')} sx={{ mb: 2 }}>Back</Button>
            <Typography variant="h5" fontWeight="bold" gutterBottom>Bulk Label Printing</Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                ))}
            </Stepper>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Step 1: Plan Quantities */}
            {activeStep === 0 && (
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom>How many items do you want to print?</Typography>
                    <TextField
                        label="Total Items (Lowest Level)"
                        type="number"
                        value={totalItems}
                        onChange={(e) => setTotalItems(e.target.value)}
                        sx={{ mb: 3, width: 300 }}
                    />
                    <Box>
                        <Button
                            variant="contained"
                            startIcon={<Calculate />}
                            onClick={handleCalculate}
                            disabled={!totalItems}
                        >
                            Calculate Quantities
                        </Button>
                    </Box>

                    {Object.keys(calculatedCounts).length > 0 && (
                        <TableContainer component={Paper} variant="outlined" sx={{ mt: 3 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Level</TableCell>
                                        <TableCell>Capacity</TableCell>
                                        <TableCell>Required Labels</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {levels.map(l => (
                                        <TableRow key={l.id}>
                                            <TableCell>{l.level_name}</TableCell>
                                            <TableCell>{l.capacity || 10}</TableCell>
                                            <TableCell><b>{calculatedCounts[l.id]}</b></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            )}

            {/* Step 2: Upload Data */}
            {activeStep === 1 && (
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom>Upload CSV Data for Each Level</Typography>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Upload a separate CSV file for each packaging level. Ensure the row count matches the required quantity.
                    </Alert>

                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Level</TableCell>
                                    <TableCell>Required</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {levels.map(l => {
                                    const status = getUploadStatus(l.id);
                                    return (
                                        <TableRow key={l.id}>
                                            <TableCell><b>{l.level_name}</b></TableCell>
                                            <TableCell>{calculatedCounts[l.id]}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={status.text}
                                                    color={status.color}
                                                    icon={status.status === 'ok' ? <CheckCircle /> : status.status === 'mismatch' ? <ErrorIcon /> : null}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button component="label" variant="outlined" size="small" startIcon={<CloudUpload />}>
                                                    Upload CSV
                                                    <input type="file" hidden accept=".csv" onChange={(e) => handleFileUpload(l.id, e)} />
                                                </Button>
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    startIcon={<Download />}
                                                    onClick={() => generateSampleCSV(l.id)}
                                                    sx={{ ml: 1 }}
                                                    title="Download sample CSV with dummy data"
                                                >
                                                    Sample
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <Button onClick={() => setActiveStep(0)}>Back</Button>
                        <Button
                            variant="contained"
                            onClick={() => setActiveStep(2)}
                            disabled={!allLevelsUploaded}
                        >
                            Continue to Preview
                        </Button>
                    </Box>
                </Paper>
            )}

            {/* Step 3: Preview & Print */}
            {activeStep === 2 && (
                <Paper sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">Preview & Print</Typography>
                        <FormControl size="small" sx={{ width: 200 }}>
                            <InputLabel>Paper Size</InputLabel>
                            <Select value={paperSize} label="Paper Size" onChange={(e) => setPaperSize(e.target.value)}>
                                <MenuItem value="A4">A4 (210 x 297 mm)</MenuItem>
                                <MenuItem value="Letter">Letter (215.9 x 279.4 mm)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Tabs
                        value={previewLevel || levels[0]?.id}
                        onChange={(_, val) => setPreviewLevel(val)}
                        sx={{ mb: 3 }}
                    >
                        {levels.map(l => (
                            <Tab key={l.id} label={l.level_name} value={l.id} />
                        ))}
                    </Tabs>

                    <Box sx={{ overflow: 'auto', maxHeight: '60vh', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                        {renderImposition(previewLevel || levels[0]?.id)}
                    </Box>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <Button onClick={() => setActiveStep(1)}>Back</Button>
                        <Button
                            variant="contained"
                            startIcon={<Print />}
                            onClick={() => window.print()}
                        >
                            Print Labels
                        </Button>
                    </Box>
                </Paper>
            )}
        </Box>
    );
}
