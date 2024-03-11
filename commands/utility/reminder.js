const {Util, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

// Array of available timezones
const timezones = [
    'America/New_York', // US East
    'America/Los_Angeles', // US West
    'America/Halifax', // Nova Scotia
    'Europe/London', // UK
    'Europe/Amsterdam', // Central Europe (Amsterdam)
    'Europe/Oslo', // Central Europe (Oslo)
    'Europe/Stockholm', // Central Europe (Stockholm)
    'Asia/Tokyo', // Tokyo
  ];

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('reminder')
        .setDescription('Set a reminder')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time in HH:mm format')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('timezone')
                .setDescription('Timezone')
                .setRequired(true)
                .setChoices(...timezones.map(timezone => ({ name: timezone, value: timezone })))
        )
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message to be reminded')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to notify (optional)'))
        .addBooleanOption(option =>
            option.setName('secret')
                .setDescription('If True, reminder confirmation will be hidden from other users'))
        .addStringOption(option =>
            option.setName('date')
                .setDescription('Reminder date (optional, defaults to today)')),
    async execute(interaction) {
        // Retrieve command options
        const time = interaction.options.getString('time');
        const timezone = interaction.options.getString('timezone');
        const reminderMessage = interaction.options.getString('message');
        const userToNotify = interaction.options.getUser('user') || interaction.user;
        const secret = interaction.options.getBoolean('secret');
        const reminderDate = interaction.options.getString('date')
            ? moment.tz(interaction.options.getString('date'), timezone)
            : moment().tz(timezone);

        // Calculate reminder time in Unix timestamp
        const reminderTime = reminderDate.clone().set({ hour: time.split(':')[0], minute: time.split(':')[1] }).unix();

        if (reminderTime < moment().unix()) {
            return interaction.reply('The reminder time must be in the future.', { ephemeral: true });
        }

        // Create JSON object with reminder details
        const reminderData = {
            id: Math.random().toString(36).substring(7),
            userId: userToNotify.id,
            channelId: interaction.channel.id,
            message: reminderMessage,
            reminderTime: reminderTime,
            author: interaction.user.id,
        };

        // Save the reminderData object to a database or file for later use
        const remindersPath = path.join(__dirname, '/../../data/reminders.json');
        let reminders = [];

        try {
            const existingData = fs.readFileSync(remindersPath, 'utf8');
            reminders = JSON.parse(existingData);
        } catch (error) {
            console.error('Error reading reminders file:', error);
        }

        reminders.push(reminderData);

        fs.writeFileSync(remindersPath, JSON.stringify(reminders, null, 2));

        // Send confirmation message to the user
        const formattedReminderTime = `<t:${reminderTime}:T>`;
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Reminder Set')
            .setDescription(`Reminder set for ${formattedReminderTime}.`);
        await interaction.reply({ embeds: [embed], ephemeral: secret });
    },
};