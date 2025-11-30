import React from 'react';
import { Box, Card, CardContent, CardMedia, Grid, Paper, Typography, Divider, Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function MaterialDetailCard({ material, images = [] }) {
  const mainImage = images[0]?.url || 'https://via.placeholder.com/600x400?text=Material+Image';

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        {material?.materialName || 'Material'}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 2, border: '1px dashed #cbd5e1', backgroundColor: '#fafafa' }}>
            <Box sx={{
              borderRadius: 1,
              height: 380,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb'
            }}>
              <CardMedia component="img" image={mainImage} alt={material?.materialName}
                sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', p: 2 }} />
            </Box>
            <CardContent>
              <Stack direction="row" spacing={1}>
                {images.slice(0, 6).map((img) => (
                  <Box key={img.id} component="img" src={img.url} alt={img.filename}
                    sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 1, border: '1px solid #e5e7eb' }} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Accordion defaultExpanded disableGutters sx={{ border: '1px solid #e5e7eb', boxShadow: 'none' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderBottom: '1px solid #e5e7eb' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Material Details</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              {[
                ['Material Code', material?.materialCode],
                ['Material Type', material?.type],
                ['Material Class', material?.materialClass],
                ['Material group', material?.materialGroup],
                ['Material Description', material?.description],
                ['Country of Origin', material?.countryOfOrigin],
                ['Base UOM', material?.baseUOM],
                ['Net Weight', material?.netWeightKg ? `${material.netWeightKg} kg` : '-'],
                ['Dimensions', material?.dimensionsMM],
                ['Shelf Life', material?.shelfLifeDays ? `${material.shelfLifeDays} ${material.shelfLifeUom || 'days'}` : '-'],
                ['Storage Type', material?.storageType],
                ['Temp Range', material?.handlingParameter?.temperatureMin ? `${material.handlingParameter.temperatureMin} - ${material.handlingParameter.temperatureMax} °C` : '-'],
                ['Humidity Range', material?.handlingParameter?.humidityMin ? `${material.handlingParameter.humidityMin} - ${material.handlingParameter.humidityMax} %` : '-'],
                ['Flags', [
                  material?.isFragile && 'Fragile',
                  material?.isEnvSensitive && 'Env Sensitive',
                  material?.isHighValue && 'High Value',
                  material?.isMilitaryGrade && 'Military Grade',
                  material?.isHazardous && 'Hazardous',
                  material?.isBatchManaged && 'Batch Managed',
                  material?.isSerialized && 'Serialized',
                  material?.isRfidCapable && 'RFID Capable'
                ].filter(Boolean).join(', ') || '-'],
                ['Material EAN/UPC', material?.materialEANupc],
              ].map(([label, value], idx, arr) => (
                <Box key={label} sx={{ px: 2, py: 1.25 }}>
                  <Grid container>
                    <Grid item xs={5}><Typography variant="body2" color="text.secondary">{label}</Typography></Grid>
                    <Grid item xs={7}><Typography variant="body2">{value ?? '-'}</Typography></Grid>
                  </Grid>
                  {idx < arr.length - 1 && <Divider sx={{ mt: 1 }} />}
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
}
