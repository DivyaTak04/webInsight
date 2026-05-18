const express  = require('express');
const router   = express.Router();
const Feedback = require('../models/feedback');
const Issue    = require('../models/issue');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/feedback
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.project)  filter.project  = req.query.project;
    if (req.query.resolved !== undefined) filter.resolved = req.query.resolved === 'true';

    const feedback = await Feedback.find(filter)
      .populate('author', 'name email')
      .populate('replies.author', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: feedback.length, data: feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/feedback  ── also auto-creates an Issue so Issues page updates immediately
router.post('/', async (req, res) => {
  try {
    const { text, project, type, category, position, pageUrl } = req.body;
    if (!text || !project)
      return res.status(400).json({ success: false, message: 'text and project are required.' });

    const pinCount = await Feedback.countDocuments({ project, type: 'pin' });

    // 1. Create feedback pin
    const feedback = await Feedback.create({
      text, project,
      type:      type || 'comment',
      category:  category || 'General',
      position:  position || { x: 0, y: 0 },
      pinNumber: type === 'pin' ? pinCount + 1 : undefined,
      pageUrl:   pageUrl || '',
      author:    req.user._id,
    });

    // 2. AUTO-CREATE an Issue from this pin — shows immediately on Issues page
    let createdIssue = null;
    if (type === 'pin') {
      const sevMap = { Accessibility: 'High', Bug: 'High', Performance: 'Medium', 'UI Consistency': 'Medium', General: 'Low' };
      const count  = await Issue.countDocuments();
      createdIssue = await Issue.create({
        project,
        title:       text.length > 80 ? text.slice(0, 80) + '...' : text,
        description: text,
        page:        pageUrl || 'Review Canvas',
        element:     category || 'General',
        severity:    sevMap[category] || 'Medium',
        status:      'Open',
        reporter:    req.user._id,
        issueId:     `WI-${String(count + 1).padStart(3, '0')}`,
      });

      // Link issue to feedback
      feedback.linkedIssue = createdIssue._id;
      await feedback.save();
    }

    const populated = await Feedback.findById(feedback._id)
      .populate('author', 'name email')
      .populate('replies.author', 'name email');

    res.status(201).json({ success: true, data: populated, issue: createdIssue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/feedback/:id/reply  ── collaborative discussion
router.post('/:id/reply', async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ success: false, message: 'Reply text required.' });

  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { $push: { replies: { author: req.user._id, text } } },
      { new: true }
    ).populate('author', 'name email').populate('replies.author', 'name email');

    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found.' });
    res.json({ success: true, data: feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/feedback/:id/resolve  ── also resolves linked issue
router.put('/:id/resolve', async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id, { resolved: true }, { new: true }
    ).populate('author', 'name email');

    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found.' });

    if (feedback.linkedIssue)
      await Issue.findByIdAndUpdate(feedback.linkedIssue, { status: 'Resolved' });

    res.json({ success: true, data: feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/feedback/:id  ── also deletes linked auto-created issue
router.delete('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (feedback?.linkedIssue) await Issue.findByIdAndDelete(feedback.linkedIssue);
    res.json({ success: true, message: 'Feedback deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;