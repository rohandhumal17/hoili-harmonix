import React, { useState } from "react";
import { Box, Typography, Button, Alert, TextField, Tabs, Tab } from "@mui/material";
import QrReader from 'modern-react-qr-reader';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

const QRScannerComponent = () => {
    const [qrResult, setQrResult] = useState('');
    const [message, setMessage] = useState(null);
    const [tabIndex, setTabIndex] = useState(0);
    const [manualQR, setManualQR] = useState('');
    const [isCameraActive, setIsCameraActive] = useState(false);

    const handleTabChange = (event, newIndex) => {
        setTabIndex(newIndex);
        setIsCameraActive(false); // Stop camera when switching tabs
    };

    const startScanner = () => {
        setIsCameraActive(true); // Show camera
        setMessage(null); // Reset any previous message
    };

    const handleScan = async (data) => {
        if (data) {
            setQrResult(data);
            setIsCameraActive(false); // Turn off camera after successful scan
            await verifyQR(data);
        }
    };

    const handleError = (error) => {
        console.error("QR Scanner Error:", error);
    };

    const verifyQR = async (qrValue) => {
        try {
            const response = await fetch("/api/verifyQR", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qrValue }),
            });
            const data = await response.json();
            setMessage(data.success ? { type: "success", text: data.message } : { type: "error", text: data.error });
        } catch (error) {
            setMessage({ type: "error", text: "Server error, please try again" });
        }
    };

    const handleManualSubmit = () => {
        if (manualQR.trim()) {
            verifyQR(manualQR);
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
            <Tabs value={tabIndex} onChange={handleTabChange} centered>
                <Tab label="Scan via Camera" />
                <Tab label="Enter QR Manually" />
            </Tabs>

            {tabIndex === 0 && (
                <>
                    {!isCameraActive ? (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<QrCodeScannerIcon />}
                            onClick={startScanner}
                            sx={{ mt: 2 }}
                        >
                            Scan QR
                        </Button>
                    ) : (
                        <Box width="300px" height="300px" mt={2}>
                            <QrReader
                                delay={300}
                                onError={handleError}
                                onScan={handleScan}
                                constraints={{ facingMode: "environment" }} // Forces back camera on mobile
                                style={{ width: "100%" }}
                            />
                        </Box>
                    )}
                </>
            )}

            {tabIndex === 1 && (
                <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
                    <TextField
                        label="Enter QR Code"
                        variant="outlined"
                        value={manualQR}
                        onChange={(e) => setManualQR(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <Button variant="contained" color="primary" onClick={handleManualSubmit}>Submit</Button>
                </Box>
            )}

            {message && <Alert severity={message.type} sx={{ mt: 2 }}>{message.text}</Alert>}
        </Box>
    );
};

export default QRScannerComponent;