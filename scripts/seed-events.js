const mongoose = require('mongoose');
const Event = require('../models/Event');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const eventsData = [
    {
        title: "Rire Sans Frontières",
        date: new Date("2026-02-15"),
        time: "19:00",
        venue: "Théâtre de la Ville",
        city: "Kinshasa",
        description: "Une soirée explosive de stand-up avec les meilleurs moments d'Evan Lesnar. Préparez-vous à rire aux éclats !",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
        tickets: [
            { type: "Standard", price: 15000, currency: "CDF", available: 150, total: 150 },
            { type: "VIP", price: 30000, currency: "CDF", available: 50, total: 50 },
        ],
        status: "upcoming"
    },
    {
        title: "Comedy Night Special",
        date: new Date("2026-03-22"),
        time: "20:00",
        venue: "Grand Hôtel",
        city: "Lubumbashi",
        description: "Spectacle unique à Lubumbashi ! Evan Lesnar débarque avec son humour décapant et ses sketches cultes.",
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop",
        tickets: [
            { type: "Standard", price: 12000, currency: "CDF", available: 200, total: 200 },
            { type: "VIP", price: 25000, currency: "CDF", available: 75, total: 75 },
        ],
        status: "upcoming"
    },
    {
        title: "Le Rire de Fin d'Année",
        date: new Date("2025-12-31"), // Tomorrow according to user current time 
        time: "21:00",
        venue: "Pullman Hotel",
        city: "Kinshasa",
        description: "Célébrez la nouvelle année avec Evan Lesnar ! Une soirée inoubliable mêlant humour, musique et festivités.",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
        tickets: [
            { type: "Standard", price: 20000, currency: "CDF", available: 100, total: 100 },
            { type: "VIP", price: 50000, currency: "CDF", available: 30, total: 30 },
            { type: "Premium Table", price: 200000, currency: "CDF", available: 10, total: 10 },
        ],
        status: "selling-fast"
    },
    {
        title: "Campus Comedy Tour",
        date: new Date("2026-04-10"),
        time: "18:00",
        venue: "Université de Kinshasa",
        city: "Kinshasa",
        description: "Evan Lesnar s'invite sur les campus ! Tarifs étudiants disponibles pour cette soirée spéciale.",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop",
        tickets: [
            { type: "Étudiant", price: 5000, currency: "CDF", available: 300, total: 300 },
            { type: "Standard", price: 10000, currency: "CDF", available: 100, total: 100 },
        ],
        status: "upcoming"
    },
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing events
        await Event.deleteMany({});
        console.log('🗑️  Cleared existing events');

        // Insert new events
        const createdEvents = await Event.insertMany(eventsData);
        console.log(`✅ Seeded ${createdEvents.length} events`);

        // Log IDs for reference
        createdEvents.forEach(event => {
            console.log(`   - ${event.title}: ${event._id}`);
        });

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected');
    }
};

seedDB();
