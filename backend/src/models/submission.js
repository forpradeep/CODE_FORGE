const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'problem',
    required: true,
  },
  testId: {
    // Set only when this submission was made during a timed test.
    // Regular practice submissions leave this null.
    type: Schema.Types.ObjectId,
    ref: 'test',
    default: null
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'c++', 'java'],
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'wrong', 'error'],
    default: 'pending'
  },
  runtime: {
    type: Number,  // milliseconds
    default: 0
  },
  memory: {
    type: Number,  // kB
    default: 0
  },
  errorMessage: {
    type: String,
    default: ''
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  testCasesTotal: {  
    type: Number,
    default: 0
  }
}, { 
  timestamps: true
});


submissionSchema.index({ userId: 1, problemId: 1 });
submissionSchema.index({ testId: 1, userId: 1 });


const Submission = mongoose.model('submission',submissionSchema);

module.exports = Submission;