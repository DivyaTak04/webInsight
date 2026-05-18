const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String },
  target: { type: String },
}, { timestamps: true });

const ProjectSchema = new mongoose.Schema(
  {
    name:        { type: String, required: [true, 'Project name required'], trim: true },
    url:         { type: String, required: [true, 'Project URL required'],  trim: true },
    description: { type: String, default: '' },
    owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{
      user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role:     { type: String, enum: ['editor', 'viewer'], default: 'editor' },
      joinedAt: { type: Date, default: Date.now },
    }],
    pendingInvites: [{
      email:     { type: String },
      invitedAt: { type: Date, default: Date.now },
    }],
    status:     { type: String, enum: ['active','in-review','completed','archived'], default: 'active' },
    progress:   { type: Number, default: 0, min: 0, max: 100 },
    thumbnail:  { type: String, default: '' },
    aiAnalyzed: { type: Boolean, default: false },
    activity:   [ActivitySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', ProjectSchema);