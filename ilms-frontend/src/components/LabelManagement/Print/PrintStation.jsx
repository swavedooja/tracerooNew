import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Typography, Stepper, Step, StepLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Alert } from '@mui/material';
import { CloudDownload, CloudUpload, Print, ArrowBack } from '@mui/icons-material';
import { PackagingAPI, LabelTemplateAPI } from '../../../services/APIService';

export default function PrintStation() {
    const { hierarchyId } = useParams();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [hierarchy, setHierarchy] = useState(null);
    const [levels, setLevels] = useState([]);
    const [csvData, setCsvData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [headers, setHeaders] = useState([]);

    useEffect(() => {
        if (hierarchyId) loadData();
    }, [hierarchyId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // we don't have getHierarchy API yet that returns single, but we can reuse list or add one.
            // For now assuming we can fetch levels which contain template info
            const lvls = await PackagingAPI.getLevels(hierarchyId);
            setLevels(lvls);
            // Derive hierarchy name or fetch it (optional, for display)
            // Ideally we should have PackagingAPI.getHierarchy(id)
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const generateCSVTemplate = () => {
        // Collect all unique fields from all templates
        const uniqueFields = new Set(['Material Code', 'Batch No', 'Qty']);

        levels.forEach(l => {
            if (l.label_template && l.label_template.canvas_design) {
                const design = typeof l.label_template.canvas_design === 'string'
                    ? JSON.parse(l.label_template.canvas_design)
                    : l.label_template.canvas_design;

                design.forEach(el => {
                    const matches = el.formatString?.match(/\{([^}]+)\}/g);
                    if (matches) {
                        matches.forEach(m => uniqueFields.add(m.replace(/[{}]/g, '')));
                    }
                });
            }
        });

        // Add standard columns
        const csvHeaders = ['Level', 'Template Name', 'Copies', ...Array.from(uniqueFields)];
        const csvRow = csvHeaders.join(',');

        // Create dummy rows for each level
        const rows = levels.map(l => {
            const tplName = l.label_template ? l.label_template.name : 'N/A';
            return `${l.level_name},${tplName},1,`; // Empty values for fields
        });

        const csvContent = "data:text/csv;charset=utf-8," + [csvRow, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `print_template_${hierarchyId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setActiveStep(1);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target.result;
            const lines = text.split('\n').filter(l => l.trim());
            if (lines.length > 0) {
                const hdrs = lines[0].split(',').map(h => h.trim());
                setHeaders(hdrs);
                const data = lines.slice(1).map((line, i) => {
                    const values = line.split(',');
                    const row = {};
                    hdrs.forEach((h, index) => row[h] = values[index]?.trim() || '');
                    return { id: i, ...row };
                });
                setCsvData(data);
                setActiveStep(2);
            }
        };
        reader.readAsText(file);
    };

    // Placeholder for PDF generation
    const handleGeneratePDF = async () => {
        alert("PDF Generation Logic Coming Here!");
        // Logic: Import jsPDF, use hierarchy templates, Loop csvData, fill placeholders, addPage, save.
    };

    const steps = ['Download Template', 'Upload Data', 'Generate PDF'];

    return (
        <Box sx={{ p: 3 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/labels')} sx={{ mb: 2 }}>Back</Button>
            <Typography variant="h5" gutterBottom>Bulk Label Printing</Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                ))}
            </Stepper>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            <Paper sx={{ p: 4, minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {activeStep === 0 && (
                    <Box sx={{ textAlign: 'center' }}>
                        <CloudDownload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6">Step 1: Download Data Template</Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            Download a CSV file containing all required fields for the labels in this hierarchy.
                        </Typography>
                        <Button variant="contained" size="large" onClick={generateCSVTemplate}>Download CSV</Button>
                    </Box>
                )}

                {activeStep === 1 && (
                    <Box sx={{ textAlign: 'center' }}>
                        <CloudUpload sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                        <Typography variant="h6">Step 2: Upload Filled Data</Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            Upload the filled CSV file to generate print preview.
                        </Typography>
                        <Button variant="contained" component="label" size="large">
                            Upload CSV
                            <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
                        </Button>
                        <Button sx={{ mt: 2 }} onClick={generateCSVTemplate}>Download Again</Button>
                    </Box>
                )}

                {activeStep === 2 && (
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Step 3: Verify & Print</Typography>
                            <Box>
                                <Button onClick={() => setActiveStep(1)} sx={{ mr: 1 }}>Re-Upload</Button>
                                <Button variant="contained" startIcon={<Print />} onClick={handleGeneratePDF}>Generate PDF</Button>
                            </Box>
                        </Box>

                        <TableContainer sx={{ maxHeight: 400, border: '1px solid #eee' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        {headers.map((h, i) => <TableCell key={i}>{h}</TableCell>)}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {csvData.map((row) => (
                                        <TableRow key={row.id}>
                                            {headers.map((h, i) => <TableCell key={i}>{row[h]}</TableCell>)}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}
