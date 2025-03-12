import fs from "fs";
import path from "path";

export default function handler(req, res) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // Get Booking ID from query params or request body
        const { qrValue } = req.body;

        if (!qrValue) {
            return res.status(400).json({ error: "Booking ID is required" });
        }

        // Define the JSON file path
        const filePath = path.join(process.cwd(), "public", "passes.json");

        // Read existing JSON file
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "Pass file not found" });
        }

        const fileData = fs.readFileSync(filePath, "utf8");
        const passes = JSON.parse(fileData);

        // Filter out the entry that matches the booking ID
        const updatedPasses = passes.filter((pass) => pass.qrValue !== qrValue);

        // Check if deletion was successful
        if (updatedPasses.length === passes.length) {
            return res.status(404).json({ error: "Booking ID not found" });
        }

        // Write updated data back to the file
        fs.writeFileSync(filePath, JSON.stringify(updatedPasses, null, 2));

        return res.status(200).json({ message: "Pass deleted successfully" });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
