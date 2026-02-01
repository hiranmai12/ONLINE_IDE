const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post('/chat', async (req, res) => {
  try {
    const { question, code, language } = req.body;

    if (!question) {
      return res.status(400).json({
        output: 'Question is required',
      });
    }

    const messages = [
      {
        role: 'system',
        content: `
You are an AI assistant inside an online programming IDE.

IMPORTANT RULES:
- You MUST answer ONLY programming, coding, debugging, algorithms, computer science, or software-related questions.
- If the user asks anything NOT related to programming or coding, respond EXACTLY with:

"Sorry, I can only answer programming and coding-related questions."

- Do NOT add anything else in that case.
- Do NOT explain why.
- Do NOT answer non-coding questions.
- When answering coding questions, format the response clearly using paragraphs, bullet points, and code blocks where appropriate.
`
      },
      {
        role: 'user',
        content: `
Programming Language:
${language || 'Not specified'}

Current Code:
${code || 'No code provided'}

User Question:
${question}
`
      }
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', // ✅ ACTIVE + FAST
      messages,
      temperature: 0.3,
    });

    const aiReply =
      completion.choices?.[0]?.message?.content ||
      'Sorry, I could not generate a response.';

    res.json({ output: aiReply });

  } catch (err) {
    console.error('AI ERROR:', err.message);
    res.status(500).json({
      output: 'AI failed to respond',
    });
  }
});

module.exports = router;
