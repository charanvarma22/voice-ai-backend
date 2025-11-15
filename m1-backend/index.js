require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Supabase client (Service Role for server-side operations)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing SUPABASE_URL or SUPABASE_KEY. Add them to your .env');
}
const supabase = createClient(supabaseUrl, supabaseKey);

// OpenAI client
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  console.warn('Missing OPENAI_API_KEY. Add it to your .env');
}
const openai = new OpenAI({ apiKey: openaiApiKey });

// Twilio client
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
if (!twilioSid || !twilioToken) {
  console.warn('Missing Twilio credentials. Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to .env');
}
const twilioClient = (twilioSid && twilioToken) ? twilio(twilioSid, twilioToken) : null;

// Healthcheck
app.get('/', (req, res) => {
  res.send('API Running!');
});

// Twilio webhook endpoint (for calls/SMS). Configure this URL in Twilio console.
app.post('/twilio/webhook', async (req, res) => {
  try {
    // Basic echo and storage example; customize per your needs
    const payload = req.body || {};

    // Optionally detect inbound SMS vs Voice using Twilio params
    // e.g., payload.SmsMessageSid or payload.CallSid

    // Persist raw event if desired
    if (supabaseUrl && supabaseKey) {
      await supabase.from('messages').insert({
        user_id: null, // Attach to a user if you map numbers -> users
        direction: 'inbound',
        phone_number: payload.From || payload.FromCountry || null,
        body: payload.Body || JSON.stringify(payload),
      });
    }

    res.status(200).send('Webhook received');
  } catch (err) {
    console.error('Twilio webhook error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// AI summarization example
app.post('/ai/summarize', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ error: 'Missing transcript' });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You summarize phone calls into concise, actionable notes.' },
        { role: 'user', content: `Summarize the following call transcript into 5 bullet points and list action items at the end.\n\n${transcript}` }
      ]
    });

    const summary = completion.choices?.[0]?.message?.content || '';

    return res.json({ summary });
  } catch (err) {
    console.error('AI summarize error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Local development server
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}

// Export app for serverless platforms
module.exports = app;


