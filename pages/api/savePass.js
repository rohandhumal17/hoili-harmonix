import fs from "fs";
import path from "path";

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { formData, qrValue } = req.body;
    console.log("Data:", formData, qrValue);

    if (!formData || !formData.userName || !formData.mobile || !formData.referenceName) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const passesFilePath = path.join(process.cwd(), "public", "passes.json");

    let passes = [];

    // Read existing JSON data with error handling
    if (fs.existsSync(passesFilePath)) {
        try {
            const fileData = fs.readFileSync(passesFilePath, "utf-8");
            passes = JSON.parse(fileData);

            // Ensure passes is always an array
            if (!Array.isArray(passes)) {
                passes = [];
            }
        } catch (error) {
            console.error("Error reading JSON file:", error);
            passes = [];
        }
    }

    // Check if mobile number already exists
    if (passes.some(pass => pass.mobile === formData.mobile)) {
        return res.status(400).json({ error: "Pass already generated for this mobile number" });
    }

    // Create new pass
    const newPass = {
        name: formData.userName,
        mobile: formData.mobile,
        referenceName: formData.referenceName,
        qrValue: generateQRCodeValue(), // Use provided QR or generate a new one
        numberOfPeople: formData.numberOfPeople,
        category: formData.category,
        timestamp: new Date().toISOString()
    };

    // Save updated data to file
    passes.push(newPass);
    try {
        fs.writeFileSync(passesFilePath, JSON.stringify(passes, null, 2), "utf-8");
    } catch (error) {
        console.error("Error writing to file:", error);
        return res.status(500).json({ error: "Failed to save pass" });
    }

    return res.status(201).json({ message: "Pass generated successfully", pass: newPass });
}

// Function to generate a unique QR Code value
const generateQRCodeValue = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomLetters = letters[Math.floor(Math.random() * 26)] + letters[Math.floor(Math.random() * 26)];
    const randomNumbers = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    return `holi-harmonix${randomLetters}${randomNumbers}`;
};
