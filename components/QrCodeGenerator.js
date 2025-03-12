import axios from "axios";
import jsPDF from "jspdf";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import React, { useState, useRef } from "react";
import AppbarComponent from "./appbarComponent";
import { Box, Container, TextField, Button, Typography, Grid, Card, CardContent, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

const QrCodeGenerator = () => {
    const qrRef = useRef(null);
    const [formData, setFormData] = useState({
        userName: "",
        mobile: "",
        referenceName: "",
        numberOfPeople: "",
        category: ""
    });

    const [qrValue, setQrValue] = useState("");
    const [error, setError] = useState("");
    const [randValue, setRandValue] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generateQrCode = async () => {
        const { userName, mobile, referenceName, numberOfPeople, category } = formData;

        if (!userName || !mobile || !referenceName || !numberOfPeople || !category) {
            setError("All fields are required!");
            return;
        }

        setError("");

        try {
            const response = await axios.post(`/api/savePass`, { formData });
            if (response.status === 201) {
                const newRandValue = Math.floor(100000 + Math.random() * 900000);
                setRandValue(newRandValue);
                setQrValue(response.data.pass.qrValue);
            } else {
                setError(response.data.error || "Failed to generate pass.");
            }
        } catch (err) {
            setError("Failed to save pass.");
        }
    };

    const downloadPass = () => {
        if (!qrRef.current) {
            console.error("QR reference is not available");
            return;
        }

        html2canvas(qrRef.current, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");

            const imgWidth = 180;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 15, 20, imgWidth, imgHeight);
            pdf.save(`${qrValue}.pdf`);
        });
    };

    return (
        <>
            <AppbarComponent />
            <Container maxWidth="lg" style={{ marginTop: 100, backgroundColor: '#f5f5f5', padding: 2 }}>
                <Card sx={{ p: 3, borderRadius: 3 }}>
                    <CardContent>
                        <Grid container spacing={3}>
                            {/* Left Section - Form */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="User Name"
                                    fullWidth
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleChange}
                                    margin="normal"
                                />
                                <TextField
                                    label="Mobile Number"
                                    fullWidth
                                    name="mobile"
                                    type="number"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    margin="normal"
                                />
                                <TextField
                                    label="Reference Name (Admin)"
                                    fullWidth
                                    name="referenceName"
                                    value={formData.referenceName}
                                    onChange={handleChange}
                                    margin="normal"
                                />
                                <TextField
                                    label="Number of People"
                                    fullWidth
                                    name="numberOfPeople"
                                    type="number"
                                    value={formData.numberOfPeople}
                                    onChange={handleChange}
                                    margin="normal"
                                />

                                {/* Category Dropdown */}
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        label="Category"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="Male">Male</MenuItem>
                                        <MenuItem value="Female">Female</MenuItem>
                                        <MenuItem value="Couple">Couple</MenuItem>
                                        <MenuItem value="Female Group">Female Group</MenuItem>
                                        <MenuItem value="Male Group">Male Group</MenuItem>
                                        <MenuItem value="Mixed Group">Mixed Group</MenuItem>
                                    </Select>
                                </FormControl>

                                {error && <Typography color="error">{error}</Typography>}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={generateQrCode}
                                    sx={{ mt: 2 }}
                                >
                                    Generate Pass
                                </Button>
                                {/* Download Button */}
                                {qrValue && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={downloadPass}
                                        sx={{ mt: 2, ml: 2 }}
                                    >
                                        Download Pass
                                    </Button>
                                )}
                            </Grid>

                            {/* Right Section - Pass Display */}
                            <Grid item xs={12} md={6} textAlign="center">
                                {qrValue ? (
                                    <Box ref={qrRef} position="relative" display="inline-block">
                                        {/* Background Image */}
                                        <img
                                            src="/pass.jpg"
                                            alt="Pass Background"
                                            style={{ width: "100%", height: "auto" }}
                                        />

                                        {/* QR Code (Centered Properly) */}
                                        <Box
                                            position="absolute"
                                            top="44%"
                                            left="35%"
                                            transform="translate(-50%, -50%)"
                                            bgcolor="white"
                                            p={1}
                                            borderRadius={1}
                                        >
                                            <QRCode value={qrValue} size={140} />
                                        </Box>

                                        {/* Ticket Details (Centered and Styled) */}
                                        <Box
                                            position="absolute"
                                            top="69%"
                                            left="16%"
                                            transform="translate(-50%, -50%)"
                                            p={1}
                                            borderRadius={2}
                                            textAlign="center"
                                        >
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                color="white"
                                                sx={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}
                                            >
                                                ({formData.numberOfPeople}) Tickets <br />
                                                Category: {formData.category} <br />
                                                Booking ID: {qrValue}
                                            </Typography>
                                        </Box>
                                    </Box>

                                ) : (
                                    <Typography color="textSecondary" mt={5}>
                                        QR Code will appear here after generation.
                                    </Typography>
                                )}


                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Container>
        </>
    );
};

export default QrCodeGenerator;
