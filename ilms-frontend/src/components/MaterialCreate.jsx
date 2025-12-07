import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { AutoFixHigh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { MaterialsAPI } from '../services/APIService';
import MaterialDetailCard from './MaterialDetailCard';

const TYPES = ['Raw Material', 'Finished Goods', 'Scrap'];
const STATES = ['Solid', 'Liquid', 'Dust'];
const CLASSES = ['Packed FG', 'Unpacked FG', 'Intermediate'];
const GROUPS = ['Latitude Laptops', '100 ML Shampoo Bottles', 'Default Group'];
const STORAGE_TYPES = ['Ambient', 'Cool Storage', 'Cold Storage'];
const PROCUREMENT_TYPES = ['Make To Stock', 'Make To Order', 'Purchase'];
const UOMS = ['EA', 'KG', 'LT', 'TON'];

export default function MaterialCreate() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    materialCode: '',
    materialName: '',
    description: '',
    sku: '',
    countryOfOrigin: '',
    type: '',
    materialClass: '',
    materialGroup: '',
    materialState: '',
    baseUOM: '',
    netWeightKg: '',
    dimensionsMM: '',
    shelfLifeDays: '',
    materialEANupc: '',
    upc: '',
    storageType: '',
    procurementType: '',
    tradeUOM: '',
    tradeWeightKg: '',
    tradeDimensionsMM: '',
    isPackaged: false,
    isFragile: false,
    isHighValue: false,
    isEnvSensitive: false,
    isBatchManaged: false,
    isSerialized: false,
    handlingParameter: {
      temperatureMin: '',
      temperatureMax: '',
      humidityMin: '',
      humidityMax: '',
      hazardousClass: '',
      epcFormat: '',
      envParameters: '',
      precautions: '',
    },
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' });

  const onChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };
  const onHP = (field) => (e) => {
    setForm((f) => ({ ...f, handlingParameter: { ...(f.handlingParameter || {}), [field]: e.target.value } }));
  };

  const handleAutoFill = () => {
    const unique = Math.floor(Math.random() * 1000);
    setForm({
      materialCode: `MAT-${unique}`,
      materialName: `Auto Material ${unique}`,
      description: 'Auto-generated material for testing',
      sku: `SKU-${unique}`,
      countryOfOrigin: 'USA',
      type: TYPES[0],
      materialClass: CLASSES[0],
      materialGroup: GROUPS[0],
      materialState: STATES[0],
      baseUOM: 'EA',
      netWeightKg: 5,
      dimensionsMM: '10x10x10',
      shelfLifeDays: 365,
      materialEANupc: `EAN-${unique}`,
      upc: `UPC-${unique}`,
      storageType: STORAGE_TYPES[0],
      procurementType: PROCUREMENT_TYPES[0],
      tradeUOM: 'EA',
      tradeWeightKg: 6,
      tradeDimensionsMM: '12x12x12',
      isPackaged: true,
      isFragile: false,
      isHighValue: false,
      isEnvSensitive: false,
      isBatchManaged: true,
      isSerialized: false,
      handlingParameter: {
        temperatureMin: 10,
        temperatureMax: 25,
        humidityMin: 30,
        humidityMax: 60,
        hazardousClass: 'None',
        epcFormat: 'URN',
        envParameters: 'Keep Dry',
        precautions: 'Handle with care',
      },
    });
  };

  const valid = useMemo(() => {
    return (
      form.materialCode.trim() &&
      form.materialName.trim() &&
      form.type &&
      form.materialClass &&
      form.materialGroup &&
      form.baseUOM
    );
  }, [form]);

  const stepValid = useMemo(() => {
    switch (activeStep) {
      case 0:
        return form.materialCode.trim() && form.materialName.trim() && form.type && form.materialClass && form.materialGroup;
      case 1:
        return !!form.baseUOM;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return valid;
      default:
        return true;
    }
  }, [activeStep, form, valid]);

  const submit = async () => {
    if (!valid) {
      setToast({ open: true, msg: 'Please complete all required fields.', sev: 'error' });
      return;
    }
    setSaving(true);
    try {
      // Parse dimensions string "10x10x10" -> length, width, height
      let length = null, width = null, height = null;
      if (form.dimensionsMM) {
        const parts = form.dimensionsMM.toLowerCase().split('x');
        if (parts.length === 3) {
          length = Number(parts[0]);
          width = Number(parts[1]);
          height = Number(parts[2]);
        }
      }

      const payload = {
        code: form.materialCode, // Mapped from materialCode
        name: form.materialName, // Mapped from materialName
        description: form.description,
        type: form.type,
        category: form.materialGroup, // Mapping Group to Category
        baseUom: form.baseUOM, // Mapped from baseUOM to baseUom

        isBatchManaged: form.isBatchManaged,
        isSerialManaged: form.isSerialized, // Mapped from isSerialized

        shelfLifeDays: form.shelfLifeDays ? Number(form.shelfLifeDays) : null,
        minStock: 0, // Default
        maxStock: 0, // Default

        grossWeight: form.tradeWeightKg ? Number(form.tradeWeightKg) : null, // Assuming trade weight is gross
        netWeight: form.netWeightKg ? Number(form.netWeightKg) : null,
        weightUom: 'KG', // specific to form field netWeightKg

        length: length,
        width: width,
        height: height,
        dimensionUom: 'MM', // specific to form field dimensionsMM

        isHazmat: form.handlingParameter.hazardousClass && form.handlingParameter.hazardousClass !== 'None',
        hazmatClass: form.handlingParameter.hazardousClass,
        unNumber: null, // No field in form

        status: 'ACTIVE'
      };

      await MaterialsAPI.create(payload);
      setToast({ open: true, msg: 'Material created', sev: 'success' });
      // Short delay to allow toast to be seen before navigation or just nav
      setTimeout(() => navigate(`/materials`), 1000);
    } catch (e) {
      console.error(e);
      setToast({ open: true, msg: e?.response?.data?.message || e.message || 'Create failed', sev: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Create Material</Typography>
        <Button startIcon={<AutoFixHigh />} onClick={handleAutoFill} color="secondary">Auto-Fill</Button>
      </Box>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {['General', 'Dimensions & Weight', 'Storage & Handling', 'Identifiers', 'Flags', 'Review & Submit'].map(label => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>General</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}><TextField label="Material Code" required fullWidth size="small" value={form.materialCode} onChange={onChange('materialCode')} /></Grid>
            <Grid item xs={6}><TextField label="Material Name" required fullWidth size="small" value={form.materialName} onChange={onChange('materialName')} /></Grid>
            <Grid item xs={12}><TextField label="Description" multiline minRows={2} fullWidth size="small" value={form.description} onChange={onChange('description')} /></Grid>
            <Grid item xs={6}><TextField label="SKU" fullWidth size="small" value={form.sku} onChange={onChange('sku')} /></Grid>
            <Grid item xs={6}><TextField label="Country of Origin" fullWidth size="small" value={form.countryOfOrigin} onChange={onChange('countryOfOrigin')} /></Grid>
            <Grid item xs={6}><TextField select label="Material Type" required fullWidth size="small" value={form.type} onChange={onChange('type')}>{TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={6}><TextField select label="Material State" fullWidth size="small" value={form.materialState} onChange={onChange('materialState')}>{STATES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={6}><TextField select label="Material Class" required fullWidth size="small" value={form.materialClass} onChange={onChange('materialClass')}>{CLASSES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={6}><TextField select label="Material Group" required fullWidth size="small" value={form.materialGroup} onChange={onChange('materialGroup')}>{GROUPS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
          </Grid>
        </Paper>
      )}

      {activeStep === 1 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Dimensions & Weight</Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}><TextField select label="Base UOM" required fullWidth size="small" value={form.baseUOM} onChange={onChange('baseUOM')}>{UOMS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={4}><TextField type="number" label="Net Weight (kg)" fullWidth size="small" value={form.netWeightKg} onChange={onChange('netWeightKg')} /></Grid>
            <Grid item xs={4}><TextField label="Dimensions (LxWxH)" fullWidth size="small" value={form.dimensionsMM} onChange={onChange('dimensionsMM')} /></Grid>
            <Grid item xs={4}><TextField select label="Trade UOM" fullWidth size="small" value={form.tradeUOM} onChange={onChange('tradeUOM')}>{UOMS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={4}><TextField type="number" label="Trade Weight (kg)" fullWidth size="small" value={form.tradeWeightKg} onChange={onChange('tradeWeightKg')} /></Grid>
            <Grid item xs={4}><TextField label="Trade Dimensions" fullWidth size="small" value={form.tradeDimensionsMM} onChange={onChange('tradeDimensionsMM')} /></Grid>
          </Grid>
        </Paper>
      )}

      {activeStep === 2 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Storage & Handling</Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}><TextField type="number" label="Shelf Life (days)" fullWidth size="small" value={form.shelfLifeDays} onChange={onChange('shelfLifeDays')} /></Grid>
            <Grid item xs={4}><TextField select label="Storage Type" fullWidth size="small" value={form.storageType} onChange={onChange('storageType')}>{STORAGE_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={4}><TextField select label="Procurement Type" fullWidth size="small" value={form.procurementType} onChange={onChange('procurementType')}>{PROCUREMENT_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={6}><TextField type="number" label="Temp Min (°C)" fullWidth size="small" value={form.handlingParameter.temperatureMin} onChange={onHP('temperatureMin')} /></Grid>
            <Grid item xs={6}><TextField type="number" label="Temp Max (°C)" fullWidth size="small" value={form.handlingParameter.temperatureMax} onChange={onHP('temperatureMax')} /></Grid>
            <Grid item xs={6}><TextField type="number" label="Humidity Min (%)" fullWidth size="small" value={form.handlingParameter.humidityMin} onChange={onHP('humidityMin')} /></Grid>
            <Grid item xs={6}><TextField type="number" label="Humidity Max (%)" fullWidth size="small" value={form.handlingParameter.humidityMax} onChange={onHP('humidityMax')} /></Grid>
            <Grid item xs={6}><TextField label="Hazardous Class" fullWidth size="small" value={form.handlingParameter.hazardousClass} onChange={onHP('hazardousClass')} /></Grid>
            <Grid item xs={6}><TextField label="EPC Format" fullWidth size="small" value={form.handlingParameter.epcFormat} onChange={onHP('epcFormat')} /></Grid>
            <Grid item xs={12}><TextField label="Environment Parameters" fullWidth size="small" value={form.handlingParameter.envParameters} onChange={onHP('envParameters')} /></Grid>
            <Grid item xs={12}><TextField label="Precautions" fullWidth size="small" value={form.handlingParameter.precautions} onChange={onHP('precautions')} /></Grid>
          </Grid>
        </Paper>
      )}

      {activeStep === 3 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Identifiers</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}><TextField label="Material EAN/UPC" fullWidth size="small" value={form.materialEANupc} onChange={onChange('materialEANupc')} /></Grid>
            <Grid item xs={6}><TextField label="UPC" fullWidth size="small" value={form.upc} onChange={onChange('upc')} /></Grid>
            <Grid item xs={6}><TextField label="External ERP Code" fullWidth size="small" value={form.externalERPCode || ''} onChange={onChange('externalERPCode')} /></Grid>
            <Grid item xs={6}><TextField label="Packaging Material Code" fullWidth size="small" value={form.packagingMaterialCode || ''} onChange={onChange('packagingMaterialCode')} /></Grid>
          </Grid>
        </Paper>
      )}

      {activeStep === 4 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Flags</Typography>
          <Grid container>
            <Grid item xs={12}>
              <FormControlLabel control={<Checkbox checked={!!form.isPackaged} onChange={onChange('isPackaged')} />} label="Packaged Material" />
              <FormControlLabel control={<Checkbox checked={!!form.isFragile} onChange={onChange('isFragile')} />} label="Fragile Material" />
              <FormControlLabel control={<Checkbox checked={!!form.isHighValue} onChange={onChange('isHighValue')} />} label="High Value" />
              <FormControlLabel control={<Checkbox checked={!!form.isEnvSensitive} onChange={onChange('isEnvSensitive')} />} label="Environment Sensitive" />
              <FormControlLabel control={<Checkbox checked={!!form.isBatchManaged} onChange={onChange('isBatchManaged')} />} label="Batch Material" />
              <FormControlLabel control={<Checkbox checked={!!form.isSerialized} onChange={onChange('isSerialized')} />} label="Serialized" />
            </Grid>
          </Grid>
        </Paper>
      )}

      {activeStep === 5 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Review</Typography>
          <MaterialDetailCard material={form} images={[]} />
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Button disabled={activeStep === 0} onClick={() => setActiveStep(s => Math.max(0, s - 1))}>Back</Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeStep < 5 && (
            <Button variant="contained" onClick={() => setActiveStep(s => s + 1)} disabled={!stepValid}>Next</Button>
          )}
          {activeStep === 5 && (
            <>
              <Button variant="outlined" onClick={() => setPreviewOpen(true)} disabled={!valid}>Preview</Button>
              <Button variant="contained" onClick={submit} disabled={!valid || saving}>{saving ? 'Saving...' : 'Submit'}</Button>
            </>
          )}
        </Box>
      </Box>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Preview</DialogTitle>
        <DialogContent>
          <MaterialDetailCard material={form} images={[]} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))}>
        <Alert severity={toast.sev} sx={{ width: '100%' }}>{toast.msg}</Alert>
      </Snackbar>
    </Paper>
  );
}
