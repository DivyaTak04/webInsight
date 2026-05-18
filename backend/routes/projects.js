const express  = require('express');
const router   = express.Router();
const { body, validationResult } = require('express-validator');
const Project  = require('../models/project');
const Issue    = require('../models/issue');
const Feedback = require('../models/feedback');
const User     = require('../models/user');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    }).populate('owner', 'name email').populate('members.user', 'name email').sort({ createdAt: -1 });

    const withCounts = await Promise.all(projects.map(async (p) => {
      const issueCount = await Issue.countDocuments({ project: p._id });
      const openIssues = await Issue.countDocuments({ project: p._id, status: { $ne: 'Resolved' } });
      return { ...p.toObject(), issueCount, openIssues };
    }));

    res.json({ success: true, count: projects.length, data: withCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects
router.post('/', [
  body('name').trim().notEmpty().withMessage('Project name required'),
  body('url').trim().notEmpty().withMessage('Project URL required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const project = await Project.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ⚠️ MUST come before /:id
// GET /api/projects/stats/summary
router.get('/stats/summary', async (req, res) => {
  try {
    const ids = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    }).distinct('_id');

    const totalProjects      = ids.length;
    const openIssues         = await Issue.countDocuments({ project: { $in: ids }, status: { $ne: 'Resolved' } });
    const highPriorityIssues = await Issue.countDocuments({ project: { $in: ids }, severity: 'High', status: { $ne: 'Resolved' } });
    const totalFeedback      = await Feedback.countDocuments({ project: { $in: ids } });

    res.json({ success: true, data: { totalProjects, openIssues, highPriorityIssues, totalFeedback } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id }, req.body, { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ success: false, message: 'Project not found or unauthorized.' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found or unauthorized.' });
    await Issue.deleteMany({ project: req.params.id });
    await Feedback.deleteMany({ project: req.params.id });
    res.json({ success: true, message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects/:id/invite  — invite team member by email
router.post('/:id/invite', async (req, res) => {
  const { email, role = 'editor' } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required.' });

  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found or unauthorized.' });

    const invitedUser = await User.findOne({ email: email.toLowerCase() });

    if (invitedUser) {
      const already = project.members.some(m => m.user?.toString() === invitedUser._id.toString())
                   || project.owner.toString() === invitedUser._id.toString();
      if (already) return res.status(400).json({ success: false, message: 'User already in project.' });

      project.members.push({ user: invitedUser._id, role });
      project.activity.push({ user: req.user._id, action: 'invited', target: invitedUser.name });
    } else {
      const alreadySent = project.pendingInvites?.some(i => i.email === email.toLowerCase());
      if (alreadySent) return res.status(400).json({ success: false, message: 'Invite already sent.' });
      if (!project.pendingInvites) project.pendingInvites = [];
      project.pendingInvites.push({ email: email.toLowerCase() });
      project.activity.push({ user: req.user._id, action: 'sent invite to', target: email });
    }

    await project.save();
    const updated = await Project.findById(project._id)
      .populate('owner', 'name email').populate('members.user', 'name email');

    res.json({
      success: true,
      message: invitedUser ? `${invitedUser.name} added!` : `Invite sent to ${email}`,
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:id/members/:userId
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $pull: { members: { user: req.params.userId } } },
      { new: true }
    ).populate('members.user', 'name email');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/projects/:id/activity
router.get('/:id/activity', async (req, res) => {
  try {
    const [recentIssues, recentFeedback, project] = await Promise.all([
      Issue.find({ project: req.params.id }).populate('reporter','name').sort({ createdAt:-1 }).limit(10).select('title reporter createdAt status severity'),
      Feedback.find({ project: req.params.id }).populate('author','name').sort({ createdAt:-1 }).limit(10).select('text author createdAt category type'),
      Project.findById(req.params.id).populate('activity.user','name').select('activity'),
    ]);

    const combined = [
      ...recentIssues.map(i => ({ type:'issue',    user:i.reporter, action:'created issue',       target:i.title,                      createdAt:i.createdAt })),
      ...recentFeedback.map(f => ({ type:'feedback', user:f.author,   action:'added feedback pin', target:f.text.slice(0,60)+'...',     createdAt:f.createdAt })),
      ...(project?.activity||[]).map(a => ({ type:'team', user:a.user, action:a.action, target:a.target, createdAt:a.createdAt })),
    ].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,20);

    res.json({ success: true, data: combined });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;