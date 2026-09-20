const mongoose = require('mongoose');
const { Schema } = mongoose;

const sectionSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
        // e.g. "CS101-A" — faculty-chosen, shown to students so they can be
        // pointed at the right section without needing a raw ObjectId
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }]
}, {
    timestamps: true
});

const Section = mongoose.model("section", sectionSchema);

module.exports = Section;
