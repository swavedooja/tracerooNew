import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
  Button,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { MaterialsAPI } from '../services/APIService';
import MaterialDetailCard from './MaterialDetailCard';
import FileUploader from './FileUploader';

const Section = ({ title, children }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
    <Paper variant="outlined" sx={{ p: 2 }}>{children}</Paper>
  </Box>
);

export default function MaterialForm() {
  const { code } = useParams();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [material, setMaterial] = useState(null);
  const [images, setImages] = useState([]);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' });

  const load = async () => {
    setLoading(true);
    try {
      const m = await MaterialsAPI.get(code);
      setMaterial(m);
      setForm({ ...m });
      try {
        const imgs = await MaterialsAPI.images(code);
        setImages(imgs);
      } catch { setImages([]); }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [code]);

  const onChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const save = async () => {
    try {
      await MaterialsAPI.update(code, form);
      setToast({ open: true, msg: 'Saved', sev: 'success' });
      setEdit(false);
      await load();
    } catch (e) {
      setToast({ open: true, msg: e?.response?.data?.message || 'Save failed', sev: 'error' });
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  if (!material) return <Typography>Material not found</Typography>;

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v)=> setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Material Details" />
        <Tab label="Bill Of Material" />
        <Tab label="Storage Location" />
        <Tab label="Supplier Details" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 1 }}>
                {!edit ? (
                  <Button variant="outlined" onClick={()=> setEdit(true)}>Edit</Button>
                ) : (
                  <>
                    <Button variant="contained" onClick={save}>Save</Button>
                    <Button variant="text" onClick={()=> { setEdit(false); setForm(material); }}>Cancel</Button>
                  </>
                )}
              </Box>
            </Grid>

            {!edit && (
              <Grid item xs={12}>
                <MaterialDetailCard material={material} images={images} />
              </Grid>
            )}

            {edit && (
              <>
            <Grid item xs={12} md={6}>
              <Section title="General Info">
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField label="Code" fullWidth size="small" value={form.materialCode || ''} onChange={onChange('materialCode')} disabled /></Grid>
                  <Grid item xs={6}><TextField label="Name" fullWidth size="small" value={form.materialName || ''} onChange={onChange('materialName')} disabled={!edit} /></Grid>
                  <Grid item xs={12}><TextField label="Description" fullWidth size="small" value={form.description || ''} onChange={onChange('description')} disabled={!edit} /></Grid>
                  <Grid item xs={6}><TextField label="SKU" fullWidth size="small" value={form.sku || ''} onChange={onChange('sku')} disabled={!edit} /></Grid>
                  <Grid item xs={6}><TextField label="Country of Origin" fullWidth size="small" value={form.countryOfOrigin || ''} onChange={onChange('countryOfOrigin')} disabled={!edit} /></Grid>
                </Grid>
              </Section>

              <Section title="Classification">
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField label="Type" fullWidth size="small" value={form.type || ''} onChange={onChange('type')} disabled={!edit} /></Grid>
                  <Grid item xs={6}><TextField label="Class" fullWidth size="small" value={form.materialClass || ''} onChange={onChange('materialClass')} disabled={!edit} /></Grid>
                  <Grid item xs={6}><TextField label="Group" fullWidth size="small" value={form.materialGroup || ''} onChange={onChange('materialGroup')} disabled={!edit} /></Grid>
                  <Grid item xs={6}><TextField label="GS1 Category Code" fullWidth size="small" value={form.gs1CategoryCode || ''} onChange={onChange('gs1CategoryCode')} disabled={!edit} /></Grid>
                </Grid>
              </Section>

              <Section title="Compliance & Safety">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel control={<Checkbox checked={!!form.isFragile} onChange={onChange('isFragile')} disabled={!edit} />} label="Fragile" />
                    <FormControlLabel control={<Checkbox checked={!!form.isEnvSensitive} onChange={onChange('isEnvSensitive')} disabled={!edit} />} label="Environment Sensitive" />
                    <FormControlLabel control={<Checkbox checked={!!form.isHighValue} onChange={onChange('isHighValue')} disabled={!edit} />} label="High Value" />
                    <FormControlLabel control={<Checkbox checked={!!form.isMilitaryGrade} onChange={onChange('isMilitaryGrade')} disabled={!edit} />} label="Military Grade" />
                    <FormControlLabel control={<Checkbox checked={!!form.isHazardous} onChange={onChange('isHazardous')} disabled={!edit} />} label="Hazardous" />
                  </Grid>
                  <Grid item xs={12}><TextField label="Hazardous Class" fullWidth size="small" value={form?.handlingParameter?.hazardousClass || ''} onChange={(e)=> setForm(f=> ({...f, handlingParameter: {...(f.handlingParameter||{}), hazardousClass: e.target.value}}))} disabled={!edit} /></Grid>
                </Grid>
              </Section>

              <Section title="Serialization & Batch">
                <Grid container spacing={2}>
                  <Grid item xs={6}><FormControlLabel control={<Checkbox checked={!!form.isBatchManaged} onChange={onChange('isBatchManaged')} disabled={!edit} />} label="Batch Managed" /></Grid>
                  <Grid item xs={6}><FormControlLabel control={<Checkbox checked={!!form.isSerialized} onChange={onChange('isSerialized')} disabled={!edit} />} label="Serialized" /></Grid>
                  <Grid item xs={6}><FormControlLabel control={<Checkbox checked={!!form.isRfidCapable} onChange={onChange('isRfidCapable')} disabled={!edit} />} label="RFID Capable" /></Grid>
                  <Grid item xs={12}><TextField label="EPC Format" fullWidth size="small" value={form?.handlingParameter?.epcFormat || ''} onChange={(e)=> setForm(f=> ({...f, handlingParameter: {...(f.handlingParameter||{}), epcFormat: e.target.value}}))} disabled={!edit} /></Grid>
                </Grid>
              </Section>
            </Grid>

            <Grid item xs={12} md={6}>
              <Section title="Dimensions & Weight">
                <Grid container spacing={2}>
                  <Grid item xs={4}><TextField label="Base UOM" fullWidth size="small" value={form.baseUOM || ''} onChange={onChange('baseUOM')} disabled={!edit} /></Grid>
                  <Grid item xs={4}><TextField type="number" label="Net Weight (kg)" fullWidth size="small" value={form.netWeightKg || ''} onChange={onChange('netWeightKg')} disabled={!edit} /></Grid>
                  <Grid item xs={4}><TextField label="Dimensions (LxWxH)" fullWidth size="small" value={form.dimensionsMM || ''} onChange={onChange('dimensionsMM')} disabled={!edit} /></Grid>
                  <Grid item xs={4}><TextField label="Trade UOM" fullWidth size="small" value={form.tradeUOM || ''} onChange={onChange('tradeUOM')} disabled={!edit} /></Grid>
                  <Grid item xs={4}><TextField type="number" label="Trade Weight (kg)" fullWidth size="small" value={form.tradeWeightKg || ''} onChange={onChange('tradeWeightKg')} disabled={!edit} /></Grid>
                  <Grid item xs={4}><TextField label="Trade Dimensions" fullWidth size="small" value={form.tradeDimensionsMM || ''} onChange={onChange('tradeDimensionsMM')} disabled={!edit} /></Grid>
                </Grid>
              </Section>

              <Section title="Storage & Handling">
                <Grid container spacing={2}>
                  <Grid item xs={4}><TextField type="number" label="Shelf Life (days)" fullWidth size="small" value={form.shelfLifeDays || ''} onChange={onChange('shelfLifeDays')} disabled={!edit} /></Grid>
                  <Grid item xs={4}><TextField label="Shelf Life UOM" fullWidth size="small" value={form.shelfLifeUom || ''} onChange={onChange('shelfLifeUom')} disabled={!edit} /></Grid>
                  <Grid item xs={4}><TextField label="Storage Type" fullWidth size="small" value={form.storageType || ''} onChange={onChange('storageType')} disabled={!edit} /></Grid>
                  <Grid item xs={4}><TextField label="Procurement Type" fullWidth size="small" value={form.procurementType || ''} onChange={onChange('procurementType')} disabled={!edit} /></Grid>
                  <Grid item xs={6}><TextField type="number" label="Temp Min (°C)" fullWidth size="small" value={form?.handlingParameter?.temperatureMin || ''} onChange={(e)=> setForm(f=> ({...f, handlingParameter: {...(f.handlingParameter||{}), temperatureMin: Number(e.target.value)}}))} disabled={!edit} /></Grid>
                  <Grid item xs={6}><TextField type="number" label="Temp Max (°C)" fullWidth size="small" value={form?.handlingParameter?.temperatureMax || ''} onChange={(e)=> setForm(f=> ({...f, handlingParameter: {...(f.handlingParameter||{}), temperatureMax: Number(e.target.value)}}))} disabled={!edit} /></Grid>
                  <Grid item xs={6}><TextField type="number" label="Humidity Min (%)" fullWidth size="small" value={form?.handlingParameter?.humidityMin || ''} onChange={(e)=> setForm(f=> ({...f, handlingParameter: {...(f.handlingParameter||{}), humidityMin: Number(e.target.value)}}))} disabled={!edit} /></Grid>
                  <Grid item xs={6}><TextField type="number" label="Humidity Max (%)" fullWidth size="small" value={form?.handlingParameter?.humidityMax || ''} onChange={(e)=> setForm(f=> ({...f, handlingParameter: {...(f.handlingParameter||{}), humidityMax: Number(e.target.value)}}))} disabled={!edit} /></Grid>
                </Grid>
              </Section>

              <Section title="Integration">
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField label="External ERP Code" fullWidth size="small" value={form.externalERPCode || ''} onChange={onChange('externalERPCode')} disabled={!edit} /></Grid>
                  <Grid item xs={6}><TextField label="Packaging Material Code" fullWidth size="small" value={form.packagingMaterialCode || ''} onChange={onChange('packagingMaterialCode')} disabled={!edit} /></Grid>
                </Grid>
              </Section>

              <Section title="Attachments">
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <FileUploader accept="image/*" onUpload={(file)=> MaterialsAPI.uploadImage(code, file)} />
                  <FileUploader accept="application/pdf" onUpload={(file)=> MaterialsAPI.uploadDocument(code, file, 'Technical')} />
                </Box>
              </Section>
            </Grid>
              </>
            )}
          </Grid>
        </Box>
      )}

      {tab !== 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
          <Typography>"{['Material Details','Bill Of Material','Storage Location','Supplier Details'][tab]}" screen is under construction.</Typography>
        </Paper>
      )}

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={()=> setToast(t=> ({...t, open:false}))}>
        <Alert severity={toast.sev} sx={{ width: '100%' }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
