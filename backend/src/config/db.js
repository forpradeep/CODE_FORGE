const mongoose = require('mongoose');

// Older builds put unique:true on problemSolved. That multikey unique index
// lets only one user in the whole database record a given solved problem.
async function dropLegacyProblemSolvedIndex() {
    const User = require('../models/user');
    try {
        const indexes = await User.collection.indexes();
        for (const index of indexes) {
            if (index.unique && index.key && Object.prototype.hasOwnProperty.call(index.key, 'problemSolved')) {
                await User.collection.dropIndex(index.name);
                console.log(`Dropped legacy unique index ${index.name}`);
            }
        }
    } catch (err) {
        if (err.codeName !== 'NamespaceNotFound') {
            console.error('Legacy index cleanup skipped:', err.message);
        }
    }
}

async function main() {
    if (!process.env.DB_CONNECT_STRING) {
        throw new Error('DB_CONNECT_STRING is not set');
    }

    await mongoose.connect(process.env.DB_CONNECT_STRING, {
        serverSelectionTimeoutMS: 10000,
    });
    await dropLegacyProblemSolvedIndex();
}

module.exports = main;
