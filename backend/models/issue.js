const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    page: {
      type: String,
      default: 'General',
    },
    element: {
      type: String,
      default: '',
    },
    severity: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issueId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Auto-generate issue ID like WI-001
IssueSchema.pre('save', async function (next) {
  if (!this.issueId) {
    const count = await mongoose.model('Issue').countDocuments();
    this.issueId = `WI-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Issue', IssueSchema);