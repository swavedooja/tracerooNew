import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Stack, TextField, Paper, MenuItem, Select, FormControl, InputLabel, Slider, Divider, Chip } from '@mui/material';
import { ArrowBack, FactCheck, Done, Error, Science, Scale, Thermostat } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const QualityCheck = ({ onBack }) => {
    const [itemType, setItemType] = useState('METAL'); // METAL, LIQUID, GENERAL
    const [step, setStep] = useState('select'); // select, test, results
    const [results, setResults] = useState(null);

    const [testData, setTestData] = useState({
        purity: 99.5,
        density: 1.05,
        weight: 50.2,
        temperature: 24
    });

    const handleStartTest = (type) => {
        setItemType(type);
        setStep('test');
    };

    const handleRunTest = () => {
        let isPass = true;
        if (itemType === 'METAL') isPass = testData.purity >= 99.0;
        if (itemType === 'LIQUID') isPass = testData.density >= 1.0 && testData.density <= 1.2;

        setResults({ isPass, timestamp: new Date().toISOString() });
        setStep('results');
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <IconButton onClick={onBack} size="small" sx={{ mr: 1 }}><ArrowBack /></IconButton>
                <Typography sx={{ fontWeight: 700 }}>Quality Check</Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                <AnimatePresence mode="wait">
                    {step === 'select' && (
                        <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>Select Item Category</Typography>
                            <Stack spacing={2}>
                                <CategoryButton title="Metal / Alloys" icon={<Scale />} onClick={() => handleStartTest('METAL')} />
                                <CategoryButton title="Liquids / Chemicals" icon={<Science />} onClick={() => handleStartTest('LIQUID')} />
                                <CategoryButton title="General Products" icon={<FactCheck />} onClick={() => handleStartTest('GENERAL')} />
                            </Stack>
                        </motion.div>
                    )}

                    {step === 'test' && (
                        <motion.div key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 700 }}>
                                Testing: {itemType === 'METAL' ? 'Metal Purity' : 'Liquid Density'}
                            </Typography>

                            <Stack spacing={4}>
                                {itemType === 'METAL' && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" gutterBottom>
                                            Purity Level (%) - Threshold: 99.0%
                                        </Typography>
                                        <Slider
                                            value={testData.purity}
                                            onChange={(e, val) => setTestData({ ...testData, purity: val })}
                                            min={90}
                                            max={100}
                                            step={0.1}
                                            valueLabelDisplay="on"
                                            sx={{ mt: 4 }}
                                        />
                                    </Box>
                                )}

                                {itemType === 'LIQUID' && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" gutterBottom>
                                            Density (g/cm³) - Target Range: 1.0-1.2
                                        </Typography>
                                        <Slider
                                            value={testData.density}
                                            onChange={(e, val) => setTestData({ ...testData, density: val })}
                                            min={0.8}
                                            max={1.5}
                                            step={0.01}
                                            valueLabelDisplay="on"
                                            sx={{ mt: 4, color: '#00BCD4' }}
                                        />
                                    </Box>
                                )}

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Paper sx={{ p: 2, flex: 1, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                                        <Scale sx={{ color: 'text.secondary', mb: 1 }} />
                                        <Typography variant="caption" display="block">Weight</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>50.2 kg</Typography>
                                    </Paper>
                                    <Paper sx={{ p: 2, flex: 1, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                                        <Thermostat sx={{ color: 'text.secondary', mb: 1 }} />
                                        <Typography variant="caption" display="block">Temp</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>24.1 °C</Typography>
                                    </Paper>
                                </Box>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleRunTest}
                                    sx={{ borderRadius: 2, py: 1.5, background: '#1a1a1a' }}
                                >
                                    Validate Standard
                                </Button>
                            </Stack>
                        </motion.div>
                    )}

                    {step === 'results' && (
                        <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                {results.isPass ? (
                                    <Done sx={{ fontSize: 80, color: '#2E7D32', mb: 2 }} />
                                ) : (
                                    <Error sx={{ fontSize: 80, color: '#D32F2F', mb: 2 }} />
                                )}
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                                    {results.isPass ? 'QC PASSED' : 'QC FAILED'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                    Standard validation completed at {new Date(results.timestamp).toLocaleTimeString()}
                                </Typography>

                                <Paper sx={{ p: 2, textAlign: 'left', mb: 4, border: `2px solid ${results.isPass ? '#2E7D32' : '#D32F2F'}` }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>TEST REPORT</Typography>
                                    <GridRow label="Report ID" value="QC-7729-2026" />
                                    <GridRow label="Type" value={itemType} />
                                    <GridRow label="Value" value={itemType === 'METAL' ? `${testData.purity}%` : `${testData.density} g/cm³`} />
                                    <Divider sx={{ my: 1 }} />
                                    <GridRow label="Verdict" value={results.isPass ? 'COMPLIANT' : 'NON-COMPLIANT'} />
                                </Paper>

                                <Button variant="contained" fullWidth onClick={() => setStep('select')} sx={{ borderRadius: 2, mb: 2 }}>
                                    New Quality Check
                                </Button>
                                <Button variant="text" fullWidth onClick={onBack}>
                                    Back to Menu
                                </Button>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
        </Box>
    );
};

const CategoryButton = ({ title, icon, onClick }) => (
    <Button
        fullWidth
        variant="outlined"
        onClick={onClick}
        startIcon={icon}
        sx={{
            justifyContent: 'flex-start',
            p: 2.5,
            borderRadius: 3,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#333',
            borderColor: '#e0e0e0',
            '&:hover': { background: '#f5f5f5', borderColor: '#bdbdbd' }
        }}
    >
        {title}
    </Button>
);

const GridRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
    </Box>
);

export default QualityCheck;
