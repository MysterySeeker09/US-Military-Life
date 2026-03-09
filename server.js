const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Helper: call Gemini 2.0 Flash with Google Search grounding
async function callGemini(systemPrompt, userPrompt, maxTokens) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    tools: [{ googleSearch: {} }],
    generationConfig: {
      maxOutputTokens: maxTokens || 1000,
      temperature: 0.7
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Gemini error:', JSON.stringify(data));
    throw new Error(data.error?.message || 'Gemini API error');
  }

  const text = data.candidates?.[0]?.content?.parts
    ?.map(p => p.text || '')
    .join('') || '';

  // Return in same shape the frontend expects: { content: [{ text }] }
  return { content: [{ type: 'text', text }] };
}

// Main API route — same endpoint the frontend already calls
app.post('/api/claude', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server.' });
  }

  try {
    const { system, messages, max_tokens } = req.body;
    const userMessage = Array.isArray(messages)
      ? messages.map(m => m.content).join('\n')
      : '';

    const result = await callGemini(
      system || 'You are a helpful assistant.',
      userMessage,
      max_tokens || 1000
    );

    res.json(result);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: err.message || 'Request failed.' });
  }
});

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`US Military Life running on port ${PORT}`);
});
