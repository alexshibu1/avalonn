import twilio from 'twilio';
import dotenv from 'dotenv';
import { logComplaint } from '../services/database.js'; // Import the database function

dotenv.config();

const VoiceResponse = twilio.twiml.VoiceResponse; // Corrected import for VoiceResponse

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Mock analyzeIntent function (Add this to prevent the error)
async function analyzeIntent(recordingUrl) {
  console.log("Analyzing intent for recording:", recordingUrl);
  // This mock function just returns a sample transcription for testing purposes
  return "This is a sample transcription for testing purposes";
}
let unitNumber = ''; // Declare unitNumber outside the function to persist it through the request flow

export async function handleIncomingCall(req, res) {
  const twiml = new VoiceResponse();

  console.log("Incoming call request received:", req.body); // Log incoming request body

  if (req.body.Digits && !req.body.RecordingUrl) {
    // Case when gathering the unit number
    unitNumber = req.body.Digits && req.body.Digits !== 'hangup' ? req.body.Digits : 'unknown';
    console.log("Unit number received:", unitNumber);
  }

  if (req.body.RecordingUrl) {
    try {
      const transcription = await analyzeIntent(req.body.RecordingUrl);

      const complaintDetails = {
        unit: unitNumber,  // Use the persisted unit number here
        description: transcription,
        phoneNumber: req.body.From,
        isEmergency: transcription.toLowerCase().includes('emergency'),
      };

      console.log("Logging complaint details:", complaintDetails); // Log complaint details before logging it to DB

      // Attempt to log the complaint in the database
      const result = await logComplaint(complaintDetails);
      console.log("Complaint logged in database successfully:", result); // Log success

      if (complaintDetails.isEmergency) {
        // Send SMS to manager for emergency
        await client.messages.create({
          body: `EMERGENCY: Unit ${unitNumber} - ${transcription}`,
          to: process.env.MANAGER_PHONE,
          from: process.env.TWILIO_PHONE,
        });

        twiml.say({
          voice: 'Polly.Matthew',
          language: 'en-GB',
          rate: '1.2',
        }, 'I understand this is an emergency. The property manager has been notified and will contact you immediately.');
      } else {
        twiml.say({
          voice: 'Polly.Matthew',
          language: 'en-GB',
          rate: '1.2',
        }, 'Your maintenance request has been logged. The property manager will review it and take appropriate action. Thank you for using Avalon.');
      }
    } catch (error) {
      console.error("Error handling incoming call:", error); // Log any error that happens in this block
      twiml.say("There was an issue processing your request. Please try again later.");
    }
  } else {
    // Initial greeting - gather the 4-digit unit number
    twiml.gather({
      numDigits: 4,
      action: '/voice',
      method: 'POST',
    }).say({
      voice: 'Polly.Matthew',
      language: 'en-GB',
      rate: '1.2',
    }, 'Welcome to Avalon. Please enter your four-digit unit number, then describe your maintenance request after the beep.');

    twiml.record({
      action: '/handle-response',
      maxLength: 60,
      transcribe: true,
    });
  }

  res.type('text/xml');
  res.send(twiml.toString());
}
