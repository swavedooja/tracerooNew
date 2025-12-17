import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Paper,
    Typography,
    Grid,
    InputBase,
    Button,
    Chip,
    IconButton,
    Avatar,
    LinearProgress,
    Card,
    CardContent,
    Breadcrumbs,
    Link,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    Search,
    Notifications,
    AccountCircle,
    LocalShipping,
    Inventory2,
    LocationOn,
    FilterList,
    MoreVert,
    ChevronRight,
    ArrowBack,
    Map,
    CheckCircle,
    AccessTime,
    Warning,
    KeyboardArrowDown,
    KeyboardArrowRight,
    Print,
    Flag
} from '@mui/icons-material';

// --- THEME CONSTANTS ---
const THEME = {
    bg: '#0B1120',      // Deep Navy/Black
    card: '#1F2937',    // Dark Slate
    text: {
        primary: '#F9FAFB',
        secondary: '#9CA3AF',
        accent: '#38BDF8' // Light Blue
    },
    status: {
        inTransit: { bg: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8' },
        delivered: { bg: 'rgba(52, 211, 153, 0.2)', color: '#34D399' },
        pending: { bg: 'rgba(156, 163, 175, 0.2)', color: '#9CA3AF' },
        warning: { bg: 'rgba(251, 191, 36, 0.2)', color: '#FBBF24' }
    }
};

// --- MOCK DATA FOR UI REPLICATION ---
const MOCK_SHIPMENTS = [
    {
        id: 'SHP-001',
        product: 'Premium Avocados (Hass)',
        batch: 'BTC-2023-X9',
        sscc: '(01) 0012345678905',
        mfgDate: 'Oct 01',
        expDate: 'Nov 20',
        status: 'In Transit',
        completion: 65,
        pallets: [
            { id: 'PLT-402', sscc: '(00) 123456789012345678', status: 'Logged' },
            {
                id: 'PLT-403', sscc: '(00) 123456789012345679', status: 'Scanning',
                cases: [
                    { id: 'Case #22-A', sscc: '(01) 98765432109876', status: 'OK' },
                    { id: 'Case #22-B', sscc: '(01) 98765432109888', status: 'OK' }
                ]
            }
        ]
    },
    {
        id: 'SHP-002',
        product: 'Organic Apples (Fuji)',
        batch: 'BTC-2023-F4',
        sscc: '(01) 0019283746501',
        mfgDate: 'Sep 28',
        expDate: 'Nov 15',
        status: 'In Warehouse',
        completion: 100,
        pallets: []
    }
];

const PALLET_DETAIL = {
    id: 'PLT-402',
    sscc_raw: '00 1 23456 78901 23456 7',
    sscc_fmt: 'SSCC-18',
    status: 'In Transit',
    scanner: 'Scanner #402',
    lastUpdated: '2 mins ago',
    nextStop: 'Dist. Center Alpha',
    totalCases: '48 / 48',
    totalWeight: '450 kg',
    lifecycle: [
        { label: 'Manufactured', time: 'Oct 15, 08:30 AM', status: 'completed', icon: Inventory2 },
        { label: 'QC Passed', time: 'Oct 16, 10:15 AM', status: 'completed', icon: CheckCircle },
        { label: 'In Transit', time: 'Oct 17, 02:45 PM', status: 'active', icon: LocalShipping },
        { label: 'Dist. Center', time: 'Pending', status: 'pending', icon: LocationOn },
        { label: 'Retail Delivery', time: 'Pending', status: 'pending', icon: AccessTime }
    ],
    info: {
        batch: 'B-9981-XC',
        gtin: '10852392001928',
        mfgDate: '2023-10-15',
        expDate: '2024-12-01',
        origin: 'Factory Plant 04 (MX)',
        carrier: 'Logistics Express'
    },
    inventory: [
        { gtin: '00850012345001', serial: 'SN-00998811-A', desc: 'Organic Matcha Tea 500g', status: 'OK' },
        { gtin: '00850012345001', serial: 'SN-00998811-B', desc: 'Organic Matcha Tea 500g', status: 'OK' },
        { gtin: '00850012345001', serial: 'SN-00998811-C', desc: 'Organic Matcha Tea 500g', status: 'Flagged' },
        { gtin: '00850012345001', serial: 'SN-00998811-D', desc: 'Organic Matcha Tea 500g', status: 'OK' },
        { gtin: '00850012345001', serial: 'SN-00998811-E', desc: 'Organic Matcha Tea 500g', status: 'OK' },
    ]
};

// --- COMPONENTS ---

// 1. Live Tracking Hero (Overview)
const LiveTrackingHero = ({ shipment }) => (
    <Paper sx={{ bgcolor: THEME.card, p: 3, borderRadius: 3, mb: 4, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: THEME.text.accent }} />

        <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
                <Typography variant="overline" color={THEME.text.accent} fontWeight="bold">● LIVE TRACKING</Typography>
                <Typography variant="h4" color={THEME.text.primary} fontWeight="bold" sx={{ mt: 1 }}>{shipment.product}</Typography>
                <Typography variant="body2" color={THEME.text.secondary} sx={{ mb: 3 }}>GTIN: {shipment.sscc}</Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                        <Typography variant="caption" color={THEME.text.secondary}>BATCH ID</Typography>
                        <Typography variant="subtitle1" color={THEME.text.primary} fontWeight="bold">{shipment.batch}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color={THEME.text.secondary}>EXPIRY</Typography>
                        <Typography variant="subtitle1" color={THEME.text.primary} fontWeight="bold">{shipment.expDate}</Typography>
                    </Grid>
                </Grid>

                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color={THEME.text.secondary}>Completion</Typography>
                        <Typography variant="body2" color={THEME.text.primary}>{shipment.completion}%</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={shipment.completion}
                        sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: THEME.text.accent } }}
                    />
                </Box>
            </Grid>

            <Grid item xs={12} md={8} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {/* Visual Timeline SVG / Component Placeholder */}
                <Box sx={{ width: '100%', position: 'relative', px: 4 }}>
                    <Box sx={{ height: 2, bgcolor: 'rgba(255,255,255,0.1)', position: 'absolute', top: '50%', left: 0, right: 0 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                        {[Inventory2, LocationOn, LocalShipping, AccessTime].map((Icon, idx) => {
                            const active = idx === 2; // Hardcoded specific active step
                            return (
                                <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{
                                        bgcolor: active ? THEME.text.accent : 'rgba(255,255,255,0.05)',
                                        color: active ? '#000' : THEME.text.secondary,
                                        width: 48, height: 48,
                                        boxShadow: active ? `0 0 20px ${THEME.text.accent}40` : 'none'
                                    }}>
                                        <Icon />
                                    </Avatar>
                                    {active && (
                                        <Paper sx={{ position: 'absolute', top: 60, bgcolor: '#2D3748', p: 1.5, zIndex: 10, minWidth: 150 }}>
                                            <Typography variant="caption" color={THEME.text.accent} display="block">WHERE</Typography>
                                            <Typography variant="body2" color="white" gutterBottom>I-5 Southbound, Mile 45</Typography>
                                            <Typography variant="caption" color={THEME.text.accent} display="block">WHEN</Typography>
                                            <Typography variant="body2" color="white">Today, 10:42 AM</Typography>
                                        </Paper>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Grid>
        </Grid>
    </Paper>
);

// 2. Hierarchy Table (Overview)
const HierarchyRow = ({ item, level = 0, onViewDetail }) => {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = item.pallets?.length > 0 || item.cases?.length > 0;

    return (
        <>
            <TableRow hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: THEME.text.secondary } }}>
                <TableCell sx={{ pl: level * 4 + 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {hasChildren && (
                            <IconButton size="small" onClick={() => setExpanded(!expanded)} sx={{ color: THEME.text.secondary }}>
                                {expanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                            </IconButton>
                        )}
                        {!hasChildren && <Box sx={{ width: 34 }} />}
                        <Avatar sx={{ width: 24, height: 24, bgcolor: level === 0 ? THEME.text.accent : 'rgba(255,255,255,0.1)' }}>
                            {level === 0 ? <Inventory2 sx={{ fontSize: 14 }} /> : <LocalShipping sx={{ fontSize: 14 }} />}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" color={THEME.text.primary} fontWeight={level === 0 ? 'bold' : 'normal'}>
                                {level === 0 ? item.product : item.id}
                            </Typography>
                            {level === 0 && <Typography variant="caption" color={THEME.text.accent}>Batch: {item.batch}</Typography>}
                        </Box>
                    </Box>
                </TableCell>
                <TableCell><Typography variant="body2" fontFamily="monospace">{item.sscc}</Typography></TableCell>
                <TableCell>
                    {item.mfgDate && (
                        <Box>
                            <Typography variant="caption" display="block">Mfg: {item.mfgDate}</Typography>
                            <Typography variant="caption" display="block">Exp: {item.expDate}</Typography>
                        </Box>
                    )}
                </TableCell>
                <TableCell>
                    <Chip
                        label={item.status}
                        size="small"
                        sx={{
                            bgcolor: item.status === 'In Transit' ? THEME.status.inTransit.bg : THEME.status.pending.bg,
                            color: item.status === 'In Transit' ? THEME.status.inTransit.color : THEME.status.pending.color
                        }}
                    />
                </TableCell>
                <TableCell align="right">
                    {level > 0 && (
                        <Button
                            variant="text"
                            size="small"
                            sx={{ color: THEME.text.accent }}
                            onClick={() => onViewDetail(item)}
                        >
                            View
                        </Button>
                    )}
                    <IconButton size="small" sx={{ color: THEME.text.secondary }}><MoreVert /></IconButton>
                </TableCell>
            </TableRow>
            {expanded && (item.pallets || item.cases)?.map(child => (
                <HierarchyRow key={child.id} item={child} level={level + 1} onViewDetail={onViewDetail} />
            ))}
        </>
    );
};

// 3. Detail View Components
const StatBox = ({ label, value, icon: Icon, subLabel }) => (
    <Paper sx={{ bgcolor: THEME.card, p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
            <Typography variant="caption" color={THEME.text.secondary} fontWeight="bold">{label}</Typography>
            <Typography variant="h6" color={THEME.text.primary} sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                {Icon && label === 'CURRENT STATUS' && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#38BDF8' }} />}
                {value}
            </Typography>
            {subLabel && <Typography variant="caption" color={THEME.text.secondary}>{subLabel}</Typography>}
        </Box>
        {Icon && <Icon sx={{ color: '#374151', fontSize: 32 }} />}
    </Paper>
);

const JourneyTimeline = ({ steps }) => (
    <Box sx={{ mt: 4, mb: 4, px: 2 }}>
        <Typography variant="h6" color={THEME.text.primary} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <AccessTime fontSize="small" /> Journey Lifecycle
        </Typography>
        <Box sx={{ display: 'flex', position: 'relative', alignItems: 'flex-start' }}>
            {/* Connecting Line */}
            <Box sx={{ position: 'absolute', top: 24, left: 40, right: 40, height: 2, bgcolor: '#374151' }} />
            <Box sx={{ position: 'absolute', top: 24, left: 40, width: '50%', height: 2, bgcolor: THEME.text.accent, boxShadow: `0 0 10px ${THEME.text.accent}` }} />

            {steps.map((step, idx) => {
                const isActive = step.status === 'active';
                const isCompleted = step.status === 'completed';
                return (
                    <Box key={idx} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                        <Avatar sx={{
                            bgcolor: isActive || isCompleted ? (isActive ? THEME.text.accent : '#1F2937') : '#111827',
                            border: `2px solid ${isActive || isCompleted ? THEME.text.accent : '#374151'}`,
                            color: isActive ? '#000' : (isCompleted ? THEME.text.accent : '#6B7280'),
                            width: 48, height: 48, mb: 2
                        }}>
                            <step.icon fontSize="small" />
                        </Avatar>
                        <Typography variant="subtitle2" color={isActive || isCompleted ? 'white' : 'text.secondary'} fontWeight="bold">
                            {step.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {step.time}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    </Box>
);

// MAIN DASHBOARD COMPONENT
export default function ChainTrackDashboard() {
    const [view, setView] = useState('OVERVIEW'); // 'OVERVIEW' | 'DETAIL'
    const [selectedId, setSelectedId] = useState(null);

    const handleViewDetail = (item) => {
        setSelectedId(item.id);
        setView('DETAIL');
    };

    return (
        <Box sx={{ bgcolor: THEME.bg, minHeight: '100vh', color: THEME.text.primary, p: 3 }}>
            {/* Top Navigation Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 250, bgcolor: '#1F2937', color: 'white' }}>
                        <InputBase sx={{ ml: 1, flex: 1, color: 'inherit', fontSize: 14 }} placeholder="Search SSCC / GTIN" />
                        <IconButton sx={{ p: '10px', color: 'gray' }}><Search /></IconButton>
                    </Paper>
                    <IconButton sx={{ color: 'white' }}><Notifications /></IconButton>
                    <Avatar sx={{ width: 32, height: 32 }} />
                </Box>
            </Box>

            {/* CONTENT AREA */}
            <AnimatePresence mode="wait">
                {view === 'OVERVIEW' ? (
                    <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" fontWeight="bold">Product Lifecycle Tracker</Typography>
                            <Typography color={THEME.text.secondary}>Monitor GS1 standard details and visualize real-time logistics from manufacturing to delivery.</Typography>
                        </Box>

                        <LiveTrackingHero shipment={MOCK_SHIPMENTS[0]} />

                        {/* Search & Filters */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Paper sx={{ p: 1.5, flex: 1, display: 'flex', alignItems: 'center', bgcolor: THEME.card, borderRadius: 2 }}>
                                <Search sx={{ color: THEME.text.secondary, mr: 1 }} />
                                <InputBase fullWidth placeholder="Search by GS1 Serial, SKU, Batch ID, or Location..." sx={{ color: 'white' }} />
                            </Paper>
                            {['Date: Last 30 Days', 'Loc: All Warehouses', 'Status: Active'].map(label => (
                                <Paper key={label} sx={{ px: 2, display: 'flex', alignItems: 'center', bgcolor: THEME.card, borderRadius: 2, cursor: 'pointer' }}>
                                    <Typography variant="body2" color={THEME.text.secondary}>{label}</Typography>
                                    <KeyboardArrowDown sx={{ ml: 1, fontSize: 16, color: THEME.text.secondary }} />
                                </Paper>
                            ))}
                        </Box>

                        {/* Data Table */}
                        <TableContainer component={Paper} sx={{ bgcolor: THEME.card, borderRadius: 2 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: THEME.text.secondary, textTransform: 'uppercase', fontSize: 12 }}>Product / Hierarchy</TableCell>
                                        <TableCell sx={{ color: THEME.text.secondary, textTransform: 'uppercase', fontSize: 12 }}>GS1 Serial (SSCC)</TableCell>
                                        <TableCell sx={{ color: THEME.text.secondary, textTransform: 'uppercase', fontSize: 12 }}>Dates</TableCell>
                                        <TableCell sx={{ color: THEME.text.secondary, textTransform: 'uppercase', fontSize: 12 }}>Status</TableCell>
                                        <TableCell align="right" sx={{ color: THEME.text.secondary, textTransform: 'uppercase', fontSize: 12 }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {MOCK_SHIPMENTS.map(shipment => (
                                        <HierarchyRow key={shipment.id} item={shipment} onViewDetail={handleViewDetail} />
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </motion.div>
                ) : (
                    <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        {/* Breadcrumbs */}
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button startIcon={<ArrowBack />} onClick={() => setView('OVERVIEW')} sx={{ color: THEME.text.secondary }}>
                                Back
                            </Button>
                            <Breadcrumbs separator={<ChevronRight sx={{ color: THEME.text.secondary }} />} sx={{ '& .MuiBreadcrumbs-li': { color: THEME.text.secondary } }}>
                                <Link color="inherit" onClick={() => setView('OVERVIEW')} sx={{ cursor: 'pointer' }}>Dashboard</Link>
                                <Link color="inherit">Inventory</Link>
                                <Typography color={THEME.text.accent}>Pallet #{selectedId}</Typography>
                            </Breadcrumbs>
                        </Box>

                        {/* Header Row */}
                        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <Chip label="SSCC-18" size="small" sx={{ bgcolor: '#3B82F6', color: 'white', mb: 1, fontWeight: 'bold' }} />
                                <Typography variant="caption" display="block" color={THEME.text.secondary}>Last updated: {PALLET_DETAIL.lastUpdated} by {PALLET_DETAIL.scanner}</Typography>
                                <Typography variant="h3" fontFamily="monospace" fontWeight="bold" sx={{ letterSpacing: 2, mt: 1 }}>
                                    {PALLET_DETAIL.sscc_raw}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button variant="outlined" startIcon={<Flag />} sx={{ color: THEME.text.secondary, borderColor: THEME.text.secondary }}>Report Issue</Button>
                                <Button variant="contained" startIcon={<Print />} sx={{ bgcolor: THEME.text.accent, '&:hover': { bgcolor: '#0284C7' } }}>Print Label</Button>
                            </Box>
                        </Box>

                        {/* Stats Row */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatBox label="CURRENT STATUS" value={PALLET_DETAIL.status} icon={LocalShipping} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatBox label="NEXT STOP" value={PALLET_DETAIL.nextStop} icon={LocationOn} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatBox label="TOTAL CASES" value={PALLET_DETAIL.totalCases} icon={Inventory2} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatBox label="TOTAL WEIGHT" value={PALLET_DETAIL.totalWeight} icon={LocalShipping} /> // Using Placeholder Icon
                            </Grid>
                        </Grid>

                        {/* Journey & Lifecycle */}
                        <Paper sx={{ bgcolor: THEME.card, p: 3, borderRadius: 2, mb: 4 }}>
                            <JourneyTimeline steps={PALLET_DETAIL.lifecycle} />
                        </Paper>

                        {/* Split Info & Map */}
                        <Grid container spacing={4} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={7}>
                                <Paper sx={{ bgcolor: THEME.card, p: 3, borderRadius: 2, height: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                        <Inventory2 sx={{ color: THEME.text.accent }} />
                                        <Typography variant="h6">Pallet Information</Typography>
                                    </Box>
                                    <Grid container spacing={4}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color={THEME.text.secondary} display="block" gutterBottom>BATCH / LOT NUMBER</Typography>
                                            <Typography variant="subtitle1" fontWeight="bold">{PALLET_DETAIL.info.batch}</Typography>
                                            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                                            <Typography variant="caption" color={THEME.text.secondary} display="block" gutterBottom>MANUFACTURING DATE</Typography>
                                            <Typography variant="subtitle1" fontWeight="bold">{PALLET_DETAIL.info.mfgDate}</Typography>
                                            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                                            <Typography variant="caption" color={THEME.text.secondary} display="block" gutterBottom>ORIGIN FACILITY</Typography>
                                            <Typography variant="subtitle1" fontWeight="bold">{PALLET_DETAIL.info.origin}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color={THEME.text.secondary} display="block" gutterBottom>PRODUCT GTIN</Typography>
                                            <Typography variant="subtitle1" fontWeight="bold">{PALLET_DETAIL.info.gtin}</Typography>
                                            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                                            <Typography variant="caption" color={THEME.text.secondary} display="block" gutterBottom>EXPIRY DATE</Typography>
                                            <Typography variant="subtitle1" fontWeight="bold">{PALLET_DETAIL.info.expDate}</Typography>
                                            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                                            <Typography variant="caption" color={THEME.text.secondary} display="block" gutterBottom>CARRIER</Typography>
                                            <Typography variant="subtitle1" fontWeight="bold">{PALLET_DETAIL.info.carrier}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <Paper sx={{ bgcolor: '#111827', p: 0, borderRadius: 2, height: '100%', minHeight: 400, overflow: 'hidden', position: 'relative', border: '1px solid #374151' }}>
                                    {/* Mock Map View */}
                                    <Box sx={{
                                        position: 'absolute', inset: 0, opacity: 0.6,
                                        background: 'radial-gradient(circle at 50% 50%, #1F2937 0%, #000 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {/* Simple SVG Map Representation */}
                                        <svg width="100%" height="100%" viewBox="0 0 400 300">
                                            <path d="M50 200 Q 150 100 350 150" stroke="#38BDF8" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                                            <circle cx="50" cy="200" r="4" fill="#6B7280" />
                                            <circle cx="350" cy="150" r="4" fill="#6B7280" />
                                            <circle cx="200" cy="150" r="8" fill="#38BDF8" fillOpacity="0.3" />
                                            <circle cx="200" cy="150" r="4" fill="#38BDF8" />
                                        </svg>
                                    </Box>
                                    <Box sx={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Map sx={{ color: THEME.text.accent }} />
                                        <Typography variant="subtitle2">Live Location</Typography>
                                        <Chip label="• Live Updating" size="small" sx={{ bgcolor: 'transparent', color: THEME.text.accent, border: 'none', ml: 'auto' }} />
                                    </Box>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        sx={{ position: 'absolute', bottom: 120, left: '50%', transform: 'translateX(-50%)', bgcolor: '#1F2937' }}
                                    >
                                        Hwy 57, Mile 204
                                    </Button>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Inventory Grid */}
                        <Paper sx={{ bgcolor: THEME.card, p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FilterList /> Case Inventory (48)
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button size="small" variant="outlined" startIcon={<FilterList />} sx={{ color: THEME.text.secondary, borderColor: '#374151' }}>Filter</Button>
                                    <Button size="small" variant="outlined" sx={{ color: THEME.text.secondary, borderColor: '#374151' }}>Export</Button>
                                </Box>
                            </Box>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: '#374151' }}>
                                        <TableRow>
                                            <TableCell sx={{ color: THEME.text.secondary }}>GTIN</TableCell>
                                            <TableCell sx={{ color: THEME.text.secondary }}>SERIAL NUMBER</TableCell>
                                            <TableCell sx={{ color: THEME.text.secondary }}>PRODUCT DESCRIPTION</TableCell>
                                            <TableCell sx={{ color: THEME.text.secondary }}>STATUS</TableCell>
                                            <TableCell align="right" sx={{ color: THEME.text.secondary }}>ACTIONS</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {PALLET_DETAIL.inventory.map((item, idx) => (
                                            <TableRow key={idx} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: THEME.text.primary } }}>
                                                <TableCell sx={{ fontFamily: 'monospace' }}>{item.gtin}</TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace' }}>{item.serial}</TableCell>
                                                <TableCell>{item.desc}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={item.status === 'OK' ? '• OK' : '▲ Flagged'}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: item.status === 'OK' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                                                            color: item.status === 'OK' ? '#34D399' : '#FBBF24',
                                                            justifyContent: 'flex-start', pl: 1, pr: 2, minWidth: 80
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" sx={{ color: THEME.text.secondary }}><ChevronRight /></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Button fullWidth sx={{ mt: 2, color: THEME.text.secondary }}>View All 48 Cases</Button>
                        </Paper>

                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
}
