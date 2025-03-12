import fs from "fs";
import path from "path";

export default function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const passesFilePath = path.join(process.cwd(), "public", "passes.json");

    let passes = [];

    if (fs.existsSync(passesFilePath)) {
        try {
            const fileData = fs.readFileSync(passesFilePath, "utf-8");
            passes = JSON.parse(fileData);

            if (!Array.isArray(passes)) {
                passes = [];
            }
        } catch (error) {
            console.error("Error reading passes file:", error);
            return res.status(500).json({ error: "Failed to read pass data" });
        }
    }

    return res.status(200).json({ passes });
}
