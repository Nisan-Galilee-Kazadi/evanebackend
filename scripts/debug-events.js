require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');

const testEvents = async () => {
    console.log('Testing DB Connection...');
    console.log('URI:', process.env.MONGODB_URI ? 'Defined' : 'Undefined');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('Fetching events...');
        const events = await Event.find({});
        console.log(`Found ${events.length} events`);
        console.log(events);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

testEvents();
