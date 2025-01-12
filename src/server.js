
import express from 'express';
import { handleIncomingCall } from './controllers/callController.js';
import { getAllComplaints } from './services/database.js';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: './.env' }); // Explicitly provide path to .env file

console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID); // Should print your Account SID
console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN); // Should print your Auth Token
console.log("ENV LOADED:", dotenv.config().parsed); // Check if dotenv successfully reads `.env` file
const app = express();
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

app.post('/voice', handleIncomingCall);
app.post('/handle-response', handleIncomingCall);

// Simple endpoint to view complaints
app.get('/complaints', (_req, res) => {
  const complaints = getAllComplaints();
  res.json(complaints);
});

app.listen(PORT, () => {
  console.log(`Avalon system running on port ${PORT}`);
});