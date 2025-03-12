import React, { useState } from "react";
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Box, Typography, Button, Alert, TextField, Tabs, Tab } from '@mui/material';

const ScanQR = () => {
    const [qrResult, setQrResult] = useState('');
    const [scanner, setScanner] = useState(null);
    const [message, setMessage] = useState(null);
    const [tabIndex, setTabIndex] = useState(0);
    const [manualQR, setManualQR] = useState('');

    const handleTabChange = (event, newIndex) => {
        setTabIndex(newIndex);
    };

    const startScanner = () => {
        const qrScanner = new Html5QrcodeScanner(
            'reader',
            { fps: 10, qrbox: 250 },
            false
        );

        qrScanner.render(
            async (decodedText) => {
                setQrResult(decodedText);
                qrScanner.clear();
                await verifyQR(decodedText);
            },
            (error) => console.log(error)
        );

        setScanner(qrScanner);
    };

    const verifyQR = async (qrValue) => {
        try {
            const response = await fetch('/api/verifyQR', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrValue }),
            });
            const data = await response.json();
            setMessage(data.success ? { type: 'success', text: data.message } : { type: 'error', text: data.error });
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error, please try again' });
        }
    };

    const handleManualSubmit = () => {
        if (manualQR.trim()) {
            verifyQR(manualQR);
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
            {/* <Typography variant="h4" mb={2}>Scan QR Code</Typography> */}
            <Tabs value={tabIndex} onChange={handleTabChange} centered mb={5}>
                <Tab label="Scan via Camera" mt={5}/>
                <Tab label="Enter QR Manually" />
            </Tabs>
            {tabIndex === 0 && (
                <>
                    <Box id="reader" width="300px" height="300px" border="1px solid #ccc" mb={2} mt={2}/>
                    {!scanner && <Button variant="contained" color="primary" onClick={startScanner}>Start Scanning</Button>}
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

export default ScanQR;