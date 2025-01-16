import dotenv from "dotenv";
import { ElevenLabsClient } from "elevenlabs";
import fs from "fs";
import path, { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Blob } from "buffer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const apiKey = process.env.ELEVENLABS_API_KEY;
const client = new ElevenLabsClient({ apiKey });

async function waitForDubbingCompletion(dubbingId) {
  const MAX_ATTEMPTS = 120;
  const CHECK_INTERVAL = 10000;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const metadata = await client.dubbing.getDubbingProjectMetadata(dubbingId);

    if (metadata.status === "dubbed") {
      return true;
    } else if (metadata.status === "dubbing") {
      console.log(
        `Dubbing in progress... Will check status again in ${
          CHECK_INTERVAL / 1000
        } seconds.`
      );
      await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL));
    } else {
      console.log(`Dubbing failed: ${metadata.error_message}`);
      return false;
    }
  }

  console.log("Dubbing timed out");
  return false;
}

const downloadDubbedFile = async (dubbingId, languageCode) => {
  const dirPath = path.join(__dirname, "data", dubbingId);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  const filePath = path.join(dirPath, `${languageCode}.mp4`);
  const fileStream = fs.createWriteStream(filePath);
  try {
    const response = await client.dubbing.getDubbedFile(
      dubbingId,
      languageCode
    );
    console.log("Dubbed file response:", response);
    if (!response) {
      throw new Error("Dubbed file response is undefined.");
    }
    response.pipe(fileStream);
    return new Promise((resolve, reject) => {
      fileStream.on("finish", () => {
        resolve(filePath);
      });
      fileStream.on("error", (error) => {
        reject(`Error downloading dubbed file: ${error.message}`);
      });
    });
  } catch (error) {
    console.error("Error during file download:", error);
    throw error;
  }
};

const createDubFromFile = async (
  inputFilePath,
  fileFormat,
  sourceLanguage,
  targetLanguage
) => {
  if (!fs.existsSync(inputFilePath)) {
    throw new Error(`The input file does not exist: ${inputFilePath}`);
  }

  const fileBuffer = fs.readFileSync(inputFilePath);
  const fileBlob = new Blob([fileBuffer], { type: fileFormat });

  const response = await client.dubbing.dubAVideoOrAnAudioFile({
    file: fileBlob,
    target_lang: targetLanguage,
    mode: "automatic",
    source_lang: sourceLanguage,
    num_speakers: 2,
    watermark: true,
  });

  const dubbingId = response.dubbing_id;
  console.log(dubbingId);

  const success = await waitForDubbingCompletion(dubbingId);
  if (success) {
    const outputFilePath = await downloadDubbedFile(dubbingId, targetLanguage);
    return outputFilePath;
  } else {
    return null;
  }
};

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
