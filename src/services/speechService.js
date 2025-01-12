import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function transcribeAudio(audioUrl) {
  try {
    const response = await openai.audio.transcriptions.create({
      file: audioUrl,
      model: "whisper-1"
    });
    return response.text;
  } catch (error) {
    console.error('Transcription error:', error);
    return null;
  }
}

export async function analyzeIntent(text) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a plumbing service assistant. Analyze customer requests and categorize them into: schedule_service, emergency, pricing, or general_info."
        },
        {
          role: "user",
          content: text
        }
      ]
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Intent analysis error:', error);
    return 'general_info';
  }
}