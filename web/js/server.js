// server.js
const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const app = express();
const port = 8080;

const cors = require("cors");
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST'], // Allow specific methods
  allowedHeaders: ['Content-Type'] // Allow specific headers
}));

app.use(express.json());

// Handle POST requests to /api/generate-proof
app.post("/api/generate-proof", (req, res) => {
  const score = req.body.score;
  console.log("Received proof generation request for score:", score);

  const scriptDir = path.join(__dirname, "../script");

  const command = `cargo run --release --bin main -- --prove --score ${score}`;

  console.log(command);

  exec(command, { cwd: scriptDir }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }
    console.log("Proof generation output:\n", stdout);

    // For example, assume stdout contains a line like "Proof generated: <proofId>"
    const match = stdout.match(/Proof generated: (\S+)/);
    const proofId = match ? match[1] : "unknown";
    res.json({ proofId });
  });
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
