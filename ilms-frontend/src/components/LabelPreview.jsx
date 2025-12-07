import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';

export default function LabelPreview({ width, height, elements, data = {} }) {
  // Helper to substitute {field} with data[field]
  const substitute = (text) => {
    if (!text) return '';
    return text.replace(/\{([^}]+)\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  };

  const getElementStyle = (el) => ({
    position: 'absolute',
    left: el.x,
    top: el.y,
    width: el.width,
    height: el.height,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Typography
    fontSize: el.fontSize || 14,
    fontWeight: el.fontWeight || 'normal',
    fontStyle: el.fontStyle || 'normal',
    textDecoration: el.textDecoration || 'none',
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
  });

  return (
    <Paper
      elevation={3}
      sx={{
        width: width,
        height: height,
        position: 'relative',
        bgcolor: 'white',
        border: '1px solid #ddd',
        boxSizing: 'border-box',
        overflow: 'hidden' // Ensure content doesn't spill out
      }}
    >
      {elements.map((el) => {
        const content = substitute(el.formatString);

        if (el.type === 'text') {
          return (
            <div key={el.id} style={getElementStyle(el)}>
              {content}
            </div>
          );
        }

        if (el.type === 'barcode') {
          return (
            <div key={el.id} style={{ ...getElementStyle(el), alignItems: 'flex-end' }}>
              {/* react-barcode doesn't support % sizing well, so we rely on container clipping or specific props if needed. 
                   For now, we fit it as best as possible. */}
              <Barcode
                value={content || '123456'}
                width={1.5}
                height={el.height - 20} // Leave room for text
                fontSize={12}
                displayValue={true}
              />
            </div>
          );
        }

        if (el.type === 'qr') {
          return (
            <div key={el.id} style={getElementStyle(el)}>
              <QRCodeSVG value={content || 'http://example.com'} size={Math.min(el.width, el.height)} />
            </div>
          );
        }

        if (el.type === 'image') {
          return (
            <div key={el.id} style={getElementStyle(el)}>
              <img src={el.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          );
        }

        return null;
      })}
    </Paper>
  );
}
