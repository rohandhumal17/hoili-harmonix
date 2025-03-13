import fs from 'fs';
import path from 'path';

const originalFilePath = path.join(process.cwd(), 'public', 'passes.json'); // Original file (read-only)
const writableFilePath = '/tmp/passes.json'; // Writable file

// Copy file to /tmp/ if it doesn't exist
if (!fs.existsSync(writableFilePath)) {
    fs.copyFileSync(originalFilePath, writableFilePath);
}

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { qrValue } = req.body;
    console.log("QR Value:", qrValue);

    if (!qrValue) {
        return res.status(400).json({ error: 'QR code is required' });
    }

    // Read from writable /tmp/ directory
    let passData = JSON.parse(fs.readFileSync(writableFilePath, 'utf-8'));

    const passIndex = passData.findIndex(pass => pass.qrValue === qrValue);
    if (passIndex === -1) {
        return res.status(404).json({ error: 'Invalid QR Code' });
    }

    if (passData[passIndex].scanned) {
        return res.status(400).json({ error: 'QR Code already scanned' });
    }

    passData[passIndex].scanned = true; // Mark as scanned

    // Write back to /tmp/
    fs.writeFileSync(writableFilePath, JSON.stringify(passData, null, 2));

    return res.status(200).json({ success: true, message: 'QR Code verified and marked as scanned' });
}
