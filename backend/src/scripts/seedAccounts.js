require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const DEMO_PASSWORD = process.env.SEED_PASSWORD || 'Password@123';

const ACCOUNTS = [
    { firstName: 'Admin', emailId: 'admin@test.com', role: 'admin' },
    { firstName: 'Professor', emailId: 'faculty@test.com', role: 'faculty' },
    { firstName: 'Student', emailId: 'student@test.com', role: 'user' },
];

async function upsertAccount(account, hashedPassword) {
    const existing = await User.findOne({ emailId: account.emailId });
    if (!existing) {
        await User.create({ ...account, password: hashedPassword });
        console.log(`Created ${account.role} account: ${account.emailId}`);
        return;
    }

    existing.role = account.role;
    existing.password = hashedPassword;
    await existing.save();
    console.log(`Updated ${account.role} account: ${account.emailId}`);
}

async function seed() {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== 'true') {
        console.error('Refusing to seed while NODE_ENV=production. Set ALLOW_SEED=true to override.');
        process.exit(1);
    }

    if (!process.env.DB_CONNECT_STRING) {
        console.error('DB_CONNECT_STRING is not set');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        console.log('Connected to DB');

        const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
        for (const account of ACCOUNTS) {
            await upsertAccount(account, hashedPassword);
        }

        console.log('Seeding complete. Demo password is the SEED_PASSWORD value, or Password@123 by default.');
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
