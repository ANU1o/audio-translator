import dotenv from "dotenv";
import { ElevenLabsClient } from "elevenlabs";
import fs from "fs";
import path from "path";
import { Blob } from "buffer";
import os from "os";

dotenv.config();

const apiKey = process.env.ELEVENLABS_API_KEY;
const client = new ElevenLabsClient({ apiKey });

/**
 *
 * @param {string} dubbingId
 * @returns {Promise<boolean>}
 */
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
  const dirPath = path.join(os.homedir(), "Downloads");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  const filePath = path.join(dirPath, `${languageCode}-${dubbingId}.mp4`);
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

/**
 * Main function where user enters data related to file and specify it's source and target language.
 *
 * @param {string} inputFilePath Provides path of input file. In DOM accept through `input:file`.
 * @param {string} fileFormat Mention file format in **MIME (Multipurpose Internet Mail Extensions)** type. Eg: `video/mp4` for `.mp4`, `audio/mpeg` for `.mp3` file formats.
 * @param {"en" | "hi" | "pt" | "zh" | "es" | "fr" | "de" | "ja" | "ar" | "ru" | "ko" | "id" | "it" | "nl" | "tr" | "pl" | "sv" | "fil" | "ms" | "ro" | "uk" | "el" | "cs" | "da" | "fi" | "bg" | "hr" | "sk" | "ta"} sourceLanguage Source language whose syntax 2 lettered lowercase letters in string.
 * @param {"en" | "hi" | "pt" | "zh" | "es" | "fr" | "de" | "ja" | "ar" | "ru" | "ko" | "id" | "it" | "nl" | "tr" | "pl" | "sv" | "fil" | "ms" | "ro" | "uk" | "el" | "cs" | "da" | "fi" | "bg" | "hr" | "sk" | "ta"} targetLanguage Target language whose syntax 2 lettered lowercase letters in string.
 * @returns
 */
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
    watermark: false,
  });

  const dubbingId = response.dubbing_id;
  // console.log(dubbingId);

  const success = await waitForDubbingCompletion(dubbingId);
  if (success) {
    const outputFilePath = await downloadDubbedFile(dubbingId, targetLanguage);
    return outputFilePath;
  } else {
    return null;
  }
};

export default createDubFromFile;
