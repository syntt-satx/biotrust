import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Router
app.use('/api', apiRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'BioTrust Verification Engine',
    timestamp: new Date().toISOString(),
    version: '2.0.0-PROD'
  });
});

// Serve frontend static files if client build exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🌿 BioTrust Security & Verification Engine listening on http://localhost:${PORT}`);
});
