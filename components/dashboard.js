import jsPDF from "jspdf";
import axios from "axios";
import html2canvas from "html2canvas";
import ReactQRCode from "react-qr-code";
import React, { useState, useRef, useEffect } from "react";
import {
    Container, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, CircularProgress, Alert, TablePagination,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Button
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

export default function Dashboard() {
    const qrRef = useRef(null); // Keep ref in top-level scope
    const [passes, setPasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(7);
    const [selectedPass, setSelectedPass] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [passToDelete, setPassToDelete] = useState(null);

    useEffect(() => {
        fetchPasses();
    }, []);

    const fetchPasses = async () => {
        try {
            const response = await fetch("/api/getPasses");
            const data = await response.json();
            if (data.error) {
                setError(data.error);
            } else {
                setPasses(data.passes);
            }
            setLoading(false);
        } catch (error) {
            setError("Failed to load passes.");
            setLoading(false);
        }
    };

    const handleViewPass = (pass) => {
        setSelectedPass(pass);
        setOpenDialog(true);
    };

    const handleDownloadPass = (qrVal) => {
        console.log(qrVal)
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
            pdf.save(`${qrVal}.pdf`);
        });
    };

    const handleDelete = async () => {
        try {
            console.log("Deleting pass:", passToDelete);

            await axios.delete("/api/deletePass", { data: { qrValue: passToDelete } });
            fetchPasses();
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error("Error deleting pass:", error);
        }
    };


    const confirmDelete = (qrValue) => {
        setPassToDelete(qrValue);
        setOpenDeleteDialog(true);
    };

    return (
        <Container sx={{ padding: "20px" }}>
            <Typography variant="h4" gutterBottom>
                Passes Dashboard
            </Typography>

            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Mobile</strong></TableCell>
                                <TableCell><strong>Reference</strong></TableCell>
                                <TableCell><strong>QR Code</strong></TableCell>
                                <TableCell><strong>Timestamp</strong></TableCell>
                                <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {passes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((pass, index) => (
                                <TableRow key={index}>
                                    <TableCell>{pass.name}</TableCell>
                                    <TableCell>{pass.mobile}</TableCell>
                                    <TableCell>{pass.referenceName}</TableCell>
                                    <TableCell>{pass.qrValue}</TableCell>
                                    <TableCell>{new Date(pass.timestamp).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleViewPass(pass)}>
                                            <VisibilityIcon color="primary" />
                                        </IconButton>
                                        <IconButton>
                                            <DeleteIcon color="error" onClick={() => confirmDelete(pass.qrValue)} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <TablePagination
                        rowsPerPageOptions={[7]}
                        component="div"
                        count={passes.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                    />
                </TableContainer>
            )}

            {/* Pass View Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
                <DialogTitle sx={{ textAlign: "center" }}>
                    View Pass
                    <IconButton onClick={() => setOpenDialog(false)} sx={{ position: "absolute", right: 10, top: 10 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                {selectedPass && (
                    <>
                        <DialogContent>

                            <Box ref={qrRef} id="pass-container" sx={{ position: "relative", margin: "auto" }}>
                                <img src="/pass.jpg" alt="Pass" style={{ width: "100%", height: "auto" }} />
                                <Box position="absolute" top="44%" left="35%" transform="translate(-50%, -50%)" bgcolor="white" p={1} borderRadius={1} >
                                    <ReactQRCode value={selectedPass.qrValue} size={140} />
                                </Box>
                                <Box position="absolute" top="69%" left="16%" transform="translate(-50%, -50%)" p={1} borderRadius={2} textAlign="center">
                                    <Typography variant="h6" fontWeight="bold" color="white" sx={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}>
                                        ({selectedPass.numberOfPeople}) Tickets <br />
                                        Booking ID: {selectedPass.qrValue}
                                    </Typography>
                                </Box>
                            </Box>

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleDownloadPass(selectedPass.qrValue)} color="success" variant="contained">
                                Download Pass
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this pass?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
}
