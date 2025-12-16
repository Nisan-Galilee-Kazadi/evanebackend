const cron = require('node-cron');
const Event = require('../models/Event');
const Achievement = require('../models/Achievement');

// Run every day at midnight
const archiveExpiredEvents = cron.schedule('0 0 * * *', async () => {
    try {
        console.log(' Running event archiving job...');

        const now = new Date();

        // Find events that have passed
        const expiredEvents = await Event.find({
            date: { $lt: now },
            status: { $ne: 'past' }
        });

        if (expiredEvents.length === 0) {
            console.log(' No events to archive');
            return;
        }

        // Update events to past status
        for (const event of expiredEvents) {
            event.status = 'past';
            event.isArchived = true;
            await event.save();

            // Create achievement from event
            const achievement = new Achievement({
                title: event.title,
                description: event.description,
                date: event.date,
                image: event.image,
                type: 'event',
                sourceEvent: event._id,
                isManual: false
            });

            await achievement.save();
            console.log(` Archived event: ${event.title}`);
        }

        console.log(` Archived ${expiredEvents.length} event(s)`);
    } catch (error) {
        console.error(' Error archiving events:', error);
    }
}, {
    scheduled: false
});

module.exports = archiveExpiredEvents;
