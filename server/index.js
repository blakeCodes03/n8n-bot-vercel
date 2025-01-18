import express from "express";
import cors from "cors";
import * as fs from "fs";
import bodyParser from "body-parser";
import OpenAI from "openai";
import path from "path";
import multer from "multer";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
// import { readFile } from "node:fs/promises";

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = 5433;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Create the uploads directory if it doesn't exist
const uploadsDir = "./uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// instantiate open ai
const openai = new OpenAI({
  apiKey:
    "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",
});

// Configure multer to save files with the .wav extension

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}.wav`);
  },
});

const upload = multer({ storage });
app.post("/transcribe", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });

    fs.unlinkSync(filePath); // Clean up the uploaded file

    res.json({ text: transcription.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to transcribe audio" });
  }
});

const sessionId = uuidv4(); // Generate a unique sessionId

// Endpoint to receive user's prompt and send it to n8n workflow
app.post("/api/chatbot/prompt", async (req, res) => {
  const userPrompt = req.body;
  console.log(userPrompt);

  try {
    // Send the prompt to the n8n workflow using a webhook
    const n8nResponse = await axios.post(
      "https://n8n-rag-chatbot-u24861.vm.elestio.app/webhook/9ba11544-5c4e-4f91-818a-08a4ecb596c5",
      {
        chatInput: userPrompt,
        sessionId: sessionId,
      }
    );

    // Send the response from n8n back to the chatbot interface
    res.json({ response: n8nResponse.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process prompt" });
  }
});

// Download processed document endpoint
app.get("/api/download/file", (req, res) => {
  const filename = req.query.filename;

  // console.log(filename);
  const downloadsDir = "./processed_files";
  if (!fs.existsSync(downloadsDir)) {
    return;
  }
  const filePath = path.join(downloadsDir, filename);

  const file = fs.readFileSync(filePath);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ); // Adjust MIME type based on your file
  res.setHeader("Content-Disposition", 'attachment; filename="records.docx"');
  res.send(file);
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(500).send(err.message);
  } else if (err) {
    return res.status(400).send(err.message);
  }
  next();
});

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

app.use(express.static(path.resolve("frontend", "dist")));
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});


module.exports = app;
//NPM RUN START
