const mongoose = require('mongoose');
const { Schema } = mongoose;

const attemptSchema = new Schema({
    test: {
        type: Schema.Types.ObjectId,
        ref: 'test',
        required: true
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    startedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    // Computed once at creation as min(startedAt + test.durationMinutes, test.endTime).
    // This is the single source of truth for server-side time-box enforcement —
    // every action during a test (run/submit/view) is checked against this,
    // not against wall-clock comparisons scattered across controllers.
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['in-progress', 'submitted', 'auto-submitted'],
        default: 'in-progress'
    },
    submittedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// One attempt per student per test — no restarts.
attemptSchema.index({ test: 1, student: 1 }, { unique: true });

const Attempt = mongoose.model("attempt", attemptSchema);

module.exports = Attempt;
