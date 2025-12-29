require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

const addAdmin = async () => {
    try {
        await connectDB();

        const adminData = {
            email: 'evan@admin.com',
            password: 'EvanAdmin2024!', // Will be hashed by the model pre-save hook
            name: 'Evan Lesnar'
        };

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log(`⚠️ Admin with email ${adminData.email} already exists.`);
            process.exit(0);
        }

        const admin = new Admin(adminData);
        await admin.save();

        console.log('✅ New admin created successfully');
        console.log(`📧 Email: ${admin.email}`);
        console.log(`🔑 Password: ${adminData.password}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding admin:', error.message);
        process.exit(1);
    }
};

addAdmin();
