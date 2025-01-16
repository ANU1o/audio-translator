import createDubFromFile from "../index.js";
import path, { dirname } from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  try {
    const inputFilePath = path.join(__dirname, "./seth.mp4");
    const fileFormat = "video/mp4";
    const sourceLanguage = "en";
    const targetLanguage = "hi";

    const result = await createDubFromFile(
      inputFilePath,
      fileFormat,
      sourceLanguage,
      targetLanguage
    );
    if (result) {
      console.log("Dubbing was successful! File saved at:", result);
    } else {
      console.log("Dubbing failed or timed out.");
    }
  } catch (error) {
    console.error("Error during the dubbing process:", error);
  }
})();
