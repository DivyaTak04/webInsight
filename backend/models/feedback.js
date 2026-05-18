const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:   { type: String, required: true },
}, { timestamps: true });

const FeedbackSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    text:    { type: String, required: [true, 'Feedback text is required'] },
    type:    { type: String, enum: ['pin', 'comment', 'annotation'], default: 'comment' },
    category:{ type: String, enum: ['UI Consistency','Performance','Accessibility','General','Bug'], default: 'General' },
    position:{ x: { type: Number, default: 0 }, y: { type: Number, default: 0 } },
    pinNumber:    { type: Number },
    resolved:     { type: Boolean, default: false },
    replies:      [ReplySchema],
    linkedIssue:  { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', default: null },
    pageUrl:      { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', FeedbackSchema);