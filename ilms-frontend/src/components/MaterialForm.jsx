import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Grid, Paper, TextField, Typography, MenuItem, Tab, Tabs, FormControlLabel, Switch, IconButton } from '@mui/material';
import { Save, ArrowBack, AutoFixHigh, Delete } from '@mui/icons-material';
import { MaterialsAPI, MasterDefinitionsAPI } from '../services/APIService';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MaterialForm() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    code: '', name: '', description: '', type: '', category: 'GENERAL', status: 'ACTIVE', baseUom: 'EA',
    isBatchManaged: false, isSerialManaged: false, shelfLifeDays: '', minStock: '', maxStock: '',
    grossWeight: '', netWeight: '', weightUom: 'KG',
    length: '', width: '', height: '', dimensionUom: 'CM', volume: '', volumeUom: 'L',
    isHazmat: false, hazmatClass: '', unNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState([]);
  const [cats, setCats] = useState([]);

  useEffect(() => {
    loadMasters();
    if (code) {
      load(code);
    }
  }, [code]);

  const loadMasters = async () => {
    try {
      const defs = await MasterDefinitionsAPI.list();
      setTypes(defs.filter(d => d.defType === 'MATERIAL_TYPE'));
      setCats(defs.filter(d => d.defType === 'MATERIAL_CAT'));
    } catch (e) { console.error(e); }
  };

  const load = async (c) => {
    setLoading(true);
    try {
      const data = await MaterialsAPI.get(c);
      setForm(data);
    } catch (e) { console.error(e); alert('Failed load'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleAutoFill = () => {
    const unique = Math.floor(Math.random() * 1000);
    setForm({
      ...form,
      code: code || `MAT-${unique}`,
      name: `Auto Material ${unique}`,
      description: 'Auto-generated material for testing',
      type: types[0]?.defValue || 'RAW',
      baseUom: 'EA',
      isBatchManaged: true,
      shelfLifeDays: 365,
      minStock: 10,
      grossWeight: 5.5,
      netWeight: 5.0
    });
  };

  const save = async () => {
    setLoading(true);
    try {
      if (code) {
        await MaterialsAPI.update(code, form);
      } else {
        await MaterialsAPI.create(form);
      }
      navigate('/materials');
    } catch (e) { console.error(e); alert('Failed save'); }
    finally { setLoading(false); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/materials')}><ArrowBack /></IconButton>
        <Typography variant="h5" fontWeight="bold">{code ? `Edit: ${code}` : 'New Material'}</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={handleAutoFill} color="secondary" title="Auto-fill"><AutoFixHigh /></IconButton>
        <Button variant="contained" startIcon={<Save />} onClick={save} disabled={loading}>Save</Button>
      </Box>

      <Paper variant="outlined">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="General Info" />
          <Tab label="Track & Trace" />
          <Tab label="Physical & Storage" />
        </Tabs>

        <TabPanel value={tab} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={6}><TextField label="Material Code" name="code" value={form.code} onChange={handleChange} fullWidth required disabled={!!code} /></Grid>
            <Grid item xs={6}><TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth required /></Grid>
            <Grid item xs={12}><TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth multiline rows={2} /></Grid>
            <Grid item xs={4}>
              <TextField select label="Type" name="type" value={form.type} onChange={handleChange} fullWidth>
                {types.map(t => <MenuItem key={t.id} value={t.defValue}>{t.description}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField select label="Category" name="category" value={form.category} onChange={handleChange} fullWidth>
                {cats.map(c => <MenuItem key={c.id} value={c.defValue}>{c.description}</MenuItem>)}
                <MenuItem value="GENERAL">General</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={4}><TextField label="Base UOM" name="baseUom" value={form.baseUom} onChange={handleChange} fullWidth /></Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12}><Typography variant="subtitle2" color="primary">Tracking Control</Typography></Grid>
            <Grid item xs={3}><FormControlLabel control={<Switch checked={form.isBatchManaged} onChange={handleChange} name="isBatchManaged" />} label="Batch Managed" /></Grid>
            <Grid item xs={3}><FormControlLabel control={<Switch checked={form.isSerialManaged} onChange={handleChange} name="isSerialManaged" />} label="Serial Managed" /></Grid>
            <Grid item xs={6} />

            <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle2" color="primary">Planning</Typography></Grid>
            <Grid item xs={4}><TextField label="Shelf Life (Days)" name="shelfLifeDays" type="number" value={form.shelfLifeDays} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={4}><TextField label="Min Stock" name="minStock" type="number" value={form.minStock} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={4}><TextField label="Max Stock" name="maxStock" type="number" value={form.maxStock} onChange={handleChange} fullWidth /></Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Grid container spacing={2}>
            <Grid item xs={12}><Typography variant="subtitle2" color="primary">Weight & Dimensions</Typography></Grid>
            <Grid item xs={3}><TextField label="Gross Weight" name="grossWeight" type="number" value={form.grossWeight} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={3}><TextField label="Net Weight" name="netWeight" type="number" value={form.netWeight} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={2}><TextField label="Unit" name="weightUom" value={form.weightUom} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={4} />

            <Grid item xs={3}><TextField label="Length" name="length" type="number" value={form.length} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={3}><TextField label="Width" name="width" type="number" value={form.width} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={3}><TextField label="Height" name="height" type="number" value={form.height} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={2}><TextField label="Unit" name="dimensionUom" value={form.dimensionUom} onChange={handleChange} fullWidth /></Grid>

            <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle2" color="primary">Hazardous Material</Typography></Grid>
            <Grid item xs={12}><FormControlLabel control={<Switch checked={form.isHazmat} onChange={handleChange} name="isHazmat" />} label="Is Hazardous Material" /></Grid>
            {form.isHazmat && (
              <>
                <Grid item xs={6}><TextField label="Hazmat Class" name="hazmatClass" value={form.hazmatClass} onChange={handleChange} fullWidth /></Grid>
                <Grid item xs={6}><TextField label="UN Number" name="unNumber" value={form.unNumber} onChange={handleChange} fullWidth /></Grid>
              </>
            )}
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
}
