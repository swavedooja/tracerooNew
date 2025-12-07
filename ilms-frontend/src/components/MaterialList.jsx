import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, IconButton, TextField, Chip } from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { MaterialsAPI } from '../services/APIService';

export default function MaterialList() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await MaterialsAPI.list();
      setMaterials(data);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (code) => {
    if (window.confirm('Delete material?')) {
      await MaterialsAPI.remove(code);
      load();
    }
  };

  const filtered = materials.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Materials</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/materials/new')}>New Material</Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Search sx={{ color: 'text.secondary', mr: 1 }} />
          <TextField variant="standard" placeholder="Search by name or code..." fullWidth value={search} onChange={(e) => setSearch(e.target.value)} />
        </Box>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>UOM</TableCell>
              <TableCell>Track & Trace</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.code}>
                <TableCell fontWeight="bold">{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell><Chip label={row.type} size="small" /></TableCell>
                <TableCell>{row.baseUom}</TableCell>
                <TableCell>
                  {row.isBatchManaged && <Chip label="Batch" size="small" color="primary" variant="outlined" sx={{ mr: 0.5 }} />}
                  {row.isSerialManaged && <Chip label="Serial" size="small" color="secondary" variant="outlined" />}
                </TableCell>
                <TableCell>{row.netWeight ? `${row.netWeight} ${row.weightUom || ''}` : '-'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => navigate(`/materials/${row.code}`)} color="primary"><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(row.code)} color="error"><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
