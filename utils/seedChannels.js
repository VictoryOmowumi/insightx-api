const mongoose = require('mongoose');
const Channel = require('../models/Channel');

const channels = [
  { name: 'Facebook' },
  { name: 'Instagram' },
  { name: 'Twitter' },
  { name: 'LinkedIn' },
  { name: 'YouTube' },
  { name: 'TikTok' },
  { name: 'Snapchat' },
  { name: 'Pinterest' },
  { name: 'Reddit' },
  { name: 'WhatsApp' },
  { name: 'Telegram' },
  { name: 'Email' },
  { name: 'SMS' },
  { name: 'Website' },
];


const seedChannels = async () => {
  try {
    await Channel.deleteMany(); // Clear existing channels
    await Channel.insertMany(channels); // Insert new channels
    console.log('Channels seeded successfully');
  } catch (err) {
    console.error('Error seeding channels:', err);
  } finally {
    mongoose.connection.close();
  }
};

module.exports = seedChannels;