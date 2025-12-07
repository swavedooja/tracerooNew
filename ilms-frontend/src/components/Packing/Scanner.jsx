import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Box, Typography, Button, Alert } from '@mui/material';

const Scanner = ({ onScan, onError, isScanning, onStartScan, onStopScan }) => {
    const scannerRef = useRef(null);
    const regionId = 'html5-qrcode-reader';

    useEffect(() => {
        // Cleanup function to clear scanner on unmount
        return () => {
            if (scannerRef.current) {
                const scanner = scannerRef.current;
                try {
                    // Check if scanner is running (optional but safer)
                    // If we are in the middle of scanning, stop it first
                    scanner.stop().then(() => {
                        scanner.clear();
                    }).catch(err => {
                        // If stop fails (e.g. not running), try clearing
                        console.log("Stop failed, clearing...", err);
                        scanner.clear().catch(e => console.error("Clear failed", e));
                    });
                } catch (e) {
                    console.error("Cleanup error", e);
                }
            }
        };
    }, []);

    useEffect(() => {
        if (isScanning && !scannerRef.current) {
            // Initialize scanner
            // Use Html5Qrcode class for more control if needed, but Scanner helper is easier for quick UI
            // Implementing custom start for better control over UI
            const html5QrCode = new Html5Qrcode(regionId);

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText, decodedResult) => {
                    onScan(decodedText, decodedResult);
                },
                (errorMessage) => {
                    // parse error, ignore usually
                    // onError(errorMessage); 
                }
            ).then(() => {
                scannerRef.current = html5QrCode;
            }).catch((err) => {
                console.error("Error starting scanner", err);
                onError("Camera permission denied or error starting camera.");
            });
        } else if (!isScanning && scannerRef.current) {
            scannerRef.current.stop().then(() => {
                scannerRef.current.clear();
                scannerRef.current = null;
            }).catch((err) => {
                console.error("Failed to stop scanner", err);
            });
        }
    }, [isScanning, onScan, onError]);

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {!isScanning ? (
                <Button
                    variant="contained"
                    size="large"
                    onClick={onStartScan}
                    sx={{ width: 200, height: 200, borderRadius: '50%', fontSize: '1.5rem' }}
                >
                    SCAN
                </Button>
            ) : (
                <Box sx={{ width: '100%', maxWidth: '400px' }}>
                    <div id={regionId}></div>
                    <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        onClick={onStopScan}
                        sx={{ mt: 2 }}
                    >
                        Stop Scanning
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default Scanner;
