const mongoose = require('mongoose');
const { Schema } = mongoose;

const testSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    instructions: {
        type: String,
        default: ''
    },
    section: {
        type: Schema.Types.ObjectId,
        ref: 'section',
        required: true
    },
    problems: [{
        type: Schema.Types.ObjectId,
        ref: 'problem',
        required: true
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    // The window during which a student may START the test.
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    // Minutes a student gets from the moment THEY start, capped by endTime —
    // lets a test have e.g. a 4-hour open window but a 60-minute attempt.
    durationMinutes: {
        type: Number,
        required: true,
        min: 1
    }
}, {
    timestamps: true
});

testSchema.pre('validate', function (next) {
    if (this.startTime && this.endTime && this.startTime >= this.endTime) {
        return next(new Error("startTime must be before endTime"));
    }
    if (!this.problems || this.problems.length === 0) {
        return next(new Error("A test must include at least one problem"));
    }
    next();
});

const Test = mongoose.model("test", testSchema);

module.exports = Test;
