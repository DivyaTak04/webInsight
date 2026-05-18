const express  = require('express');
const router   = express.Router();
const Groq     = require('groq-sdk');
const Issue    = require('../models/issue');
const Feedback = require('../models/feedback');
const Project  = require('../models/project');
const { protect } = require('../middleware/auth');

router.use(protect);

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

// ✅ llama3-8b-8192 is DECOMMISSIONED — using llama-3.1-8b-instant instead
const askGroq = async (prompt, jsonMode = false) => {
  const groq = getGroq();
  const res = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: jsonMode
          ? 'You are a UX analyst. Respond with valid JSON only. No markdown, no code blocks, no preamble.'
          : 'You are a senior UX and design expert. Give concise, actionable responses.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.4,
    max_tokens: 1024,
  });
  return res.choices[0]?.message?.content?.trim() || '';
};

const safeJSON = (text) => {
  try { return JSON.parse(text); } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch { } }
    return null;
  }
};

// ─── POST /api/ai/analyze ─────────────────────────────────────────────────────
router.post('/analyze', async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) return res.status(400).json({ success: false, message: 'projectId required.' });

  try {
    const project  = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const issues   = await Issue.find({ project: projectId });
    const feedback = await Feedback.find({ project: projectId });

    if (!issues.length && !feedback.length) {
      return res.json({
        success: true,
        data: {
          summary: 'No issues or feedback yet. Add feedback pins in the Review page to get started.',
          healthScore: 100, accessibilityScore: 100, consistencyScore: 100,
          patterns: [],
          recommendations: [{ title: 'Add first feedback', description: 'Go to Review, select a project, click the website to pin feedback.', impact: 'High', effort: 'Low' }],
        },
      });
    }

    const iList = issues.map(i => `[${i.severity}] ${i.title} (${i.status})`).join('\n') || 'None';
    const fList = feedback.map(f => `[${f.category}] ${f.text}`).join('\n') || 'None';

    const prompt = `Analyze UX for: ${project.name} (${project.url})
Issues: ${iList}
Feedback: ${fList}

Return ONLY this JSON (no other text):
{"summary":"string","healthScore":75,"accessibilityScore":80,"consistencyScore":70,"patterns":[{"category":"string","title":"string","description":"string","severity":"High"}],"recommendations":[{"title":"string","description":"string","impact":"High","effort":"Medium"}]}`;

    const text = await askGroq(prompt, true);
    let data   = safeJSON(text) || {
      summary: `Found ${issues.length} issues and ${feedback.length} feedback for ${project.name}.`,
      healthScore: Math.max(40, 100 - issues.length * 8),
      accessibilityScore: 75, consistencyScore: 70, patterns: [],
      recommendations: [{ title: 'Review issues', description: 'Address high severity issues first.', impact: 'High', effort: 'Medium' }],
    };

    await Project.findByIdAndUpdate(projectId, { aiAnalyzed: true });
    res.json({ success: true, data });
  } catch (err) {
    console.error('AI analyze:', err.message);
    res.status(500).json({ success: false, message: 'AI analysis failed: ' + err.message });
  }
});

// ─── POST /api/ai/suggest-fix ─────────────────────────────────────────────────
router.post('/suggest-fix', async (req, res) => {
  const { issueTitle, issueDescription, severity } = req.body;
  if (!issueTitle) return res.status(400).json({ success: false, message: 'issueTitle required.' });

  try {
    const prompt = `Fix this design issue:
Title: ${issueTitle}
Description: ${issueDescription || 'N/A'}
Severity: ${severity || 'Medium'}
Return ONLY: {"suggestion":"1-2 sentences","codeSnippet":"short CSS or empty string","estimatedTime":"e.g. 30 minutes"}`;

    const text = await askGroq(prompt, true);
    const data = safeJSON(text) || { suggestion: 'Review and apply design system fixes.', codeSnippet: '', estimatedTime: '30 minutes' };
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'AI suggest-fix failed: ' + err.message });
  }
});

// ─── POST /api/ai/summarize-feedback ─────────────────────────────────────────
router.post('/summarize-feedback', async (req, res) => {
  const { feedbackTexts } = req.body;
  if (!Array.isArray(feedbackTexts) || !feedbackTexts.length)
    return res.status(400).json({ success: false, message: 'feedbackTexts array required.' });
  try {
    const summary = await askGroq(`Summarize in 2-3 sentences:\n${feedbackTexts.map((t, i) => `${i + 1}. ${t}`).join('\n')}\nPlain text only.`);
    res.json({ success: true, data: { summary } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'AI summarize failed: ' + err.message });
  }
});

module.exports = router;