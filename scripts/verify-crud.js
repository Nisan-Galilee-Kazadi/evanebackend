const mongoose = require('mongoose');
const Event = require('../models/Event');
const Order = require('../models/Order');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const verifyCRUD = async () => {
    console.log('🚀 Starting CRUD Verification...');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Create/Get Admin for Token
        let admin = await Admin.findOne({ email: 'test@admin.com' });
        if (!admin) {
            admin = new Admin({
                email: 'test@admin.com',
                password: 'password123',
                name: 'Test Admin'
            });
            await admin.save();
            console.log('✅ Test Admin created');
        }

        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        console.log('✅ Auth Token generated');

        // 2. Create Event (Complex Structure)
        const eventData = {
            title: 'Test Event',
            description: 'Test Description',
            date: new Date(),
            time: '20:00',
            venue: 'Test Venue',
            city: 'Test City',
            image: 'http://test.com/image.jpg',
            status: 'upcoming',
            tickets: [
                { type: 'Standard', price: 10, available: 100, total: 100 },
                { type: 'VIP', price: 50, available: 20, total: 20 }
            ]
        };

        const event = new Event(eventData);
        await event.save();
        console.log('✅ Event created with complex structure');
        console.log('   ID:', event._id);

        // 3. Create Order
        const orderData = {
            event: event._id,
            customerName: 'Test Customer',
            customerEmail: 'test@customer.com',
            customerPhone: '0123456789',
            tickets: [{ type: 'Standard', quantity: 2, price: 10 }],
            totalAmount: 20,
            paymentMethod: 'mpesa',
            paymentStatus: 'pending'
        };

        const order = new Order(orderData);
        await order.save();
        console.log('✅ Order created');
        console.log('   ID:', order._id);
        console.log('   Status:', order.paymentStatus);

        // 4. Validate Order (Simulate API logic)
        // In the real API, this is done via PUT /api/orders/:id/validate
        // We will manually update to simulate what the API does
        order.paymentStatus = 'validated';
        order.token = 'TEST-TOKEN-123';
        order.validatedAt = new Date();
        await order.save();

        console.log('✅ Order validated');
        console.log('   New Status:', order.paymentStatus);

        // 5. Cleanup
        await Event.findByIdAndDelete(event._id);
        await Order.findByIdAndDelete(order._id);
        // await Admin.deleteOne({ email: 'test@admin.com' }); // Keep admin for manual testing if needed
        console.log('✅ Cleanup done (Event & Order deleted)');

    } catch (error) {
        console.error('❌ Verification Failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected');
    }
};

verifyCRUD();
