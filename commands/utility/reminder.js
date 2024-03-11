const { ButtonBuilder, ButtonStyle, ComponentType, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

// Array of available timezones
const timezones = [
    'America/New_York', // US East
    'America/Los_Angeles', // US West
    'America/Halifax', // Nova Scotia
    'Europe/London', // UK
    'Europe/Edinburgh', // UK (Edinburgh)
    'Europe/Amsterdam', // Central Europe (Amsterdam)
    'Europe/Oslo', // Central Europe (Oslo)
    'Europe/Stockholm', // Central Europe (Stockholm)
    'Asia/Tokyo', // Tokyo
];

// Function to read reminders from file
function readRemindersFromFile(remindersPath) {
    let reminders = [];

    try {
        const existingData = fs.readFileSync(remindersPath, 'utf8');
        reminders = JSON.parse(existingData);
    } catch (error) {
        console.error('Error reading reminders file:', error);
    }

    return reminders;
}

// Function to write reminders to file
function writeRemindersToFile(remindersPath, reminders) {
    fs.writeFileSync(remindersPath, JSON.stringify(reminders, null, 2));
}

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('reminder')
        .setDescription('Reminder stuff!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set a reminder')
                .addStringOption(option =>
                    option
                        .setName('time')
                        .setDescription('Time in HH:mm format')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('timezone')
                        .setDescription('Timezone')
                        .setRequired(true)
                        .setChoices(...timezones.map(timezone => ({ name: timezone, value: timezone })))
                )
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('Message to be reminded')
                        .setRequired(true)
                )
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User to notify (optional)')
                )
                .addBooleanOption(option =>
                    option
                        .setName('secret')
                        .setDescription('If True, reminder confirmation will be hidden from other users')
                )
                .addStringOption(option =>
                    option
                        .setName('date')
                        .setDescription('Reminder date in YYYY-MM-DD format (optional)')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('get')
                .setDescription('List reminders')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User to list reminders for (optional)')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('all')
                .setDescription('List all reminders')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a reminder')
        ),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'set') {
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
            let reminders = readRemindersFromFile(remindersPath);

            reminders.push(reminderData);

            writeRemindersToFile(remindersPath, reminders);

            // Send confirmation message to the user
            const formattedReminderTime = `<t:${reminderTime}:f>`;
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Reminder Set')
                .setDescription(`Reminder set for ${formattedReminderTime}.`);
            await interaction.reply({ embeds: [embed], ephemeral: secret });

        } else if (interaction.options.getSubcommand() === 'get') {
            const userToCheck = interaction.options.getUser('user') || interaction.user;
            const remindersPath = path.join(__dirname, '/../../data/reminders.json');
            const reminders = readRemindersFromFile(remindersPath);

            const userReminders = reminders.filter(reminder => reminder.userId === userToCheck.id);

            if (userReminders.length === 0) {
                return interaction.reply('No reminders found for this user.', { ephemeral: true });
            }

            const reminderList = userReminders.map(reminder => {
                const formattedReminderTime = `<t:${reminder.reminderTime}:f>`;
                return `Created by <@${reminder.author}>: ${reminder.message} - ${formattedReminderTime}`;
            });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle(`Reminders for ${userToCheck.tag}`)
                .setDescription(reminderList.join('\n'));
            await interaction.reply({ embeds: [embed], ephemeral: true });

        } else if (interaction.options.getSubcommand() === 'all') {
            const remindersPath = path.join(__dirname, '/../../data/reminders.json');
            const reminders = readRemindersFromFile(remindersPath);

            if (reminders.length === 0) {
                return interaction.reply('No reminders found.', { ephemeral: true });
            }

            const reminderList = reminders.map(reminder => {
                const formattedReminderTime = `<t:${reminder.reminderTime}:f>`;
                return `Created by <@${reminder.author}> | Time: ${formattedReminderTime} | Message: ${reminder.message} | User: <@${reminder.userId}>`;
            });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('All reminders')
                .setDescription(reminderList.join('\n'));
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (interaction.options.getSubcommand() === 'remove') {
            const remindersPath = path.join(__dirname, '/../../data/reminders.json');
            const reminders = readRemindersFromFile(remindersPath);

            if (reminders.length === 0) {
                return interaction.reply('No reminders found.', { ephemeral: true });
            }

            const userReminders = reminders.filter(reminder => reminder.userId === interaction.user.id);

            if (userReminders.length === 0) {
                return interaction.reply('No reminders found for this user.', { ephemeral: true });
            }

            const reminderOptions = userReminders.map(reminder => {
                const formattedReminderTime = `<t:${reminder.reminderTime}:f>`;
                return new StringSelectMenuOptionBuilder()
                    .setLabel(formattedReminderTime)
                    .setValue(reminder.id)
                    .setDescription(reminder.message);
            });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('removeReminder')
                .setPlaceholder('Select a reminder to remove')
                .addOptions(reminderOptions);

            const actionRow = new ActionRowBuilder()
                .addComponents(selectMenu);

            const reply = await interaction.reply({ content: 'Select a reminder to remove:', components: [actionRow], ephemeral: true });

            const collector = reply.createMessageComponentCollector({ 
                componentType: ComponentType.StringSelect,
                filter: (i) => i.user.id === interaction.user.id && i.customId === 'removeReminder',
                time: 60_000,
            });

            collector.on('collect', (i) => {
                const reminderId = i.values[0];
                const reminderMessage = userReminders.find(reminder => reminder.id === reminderId).message;
                // Ask for confirmation using a button
                i.update({ content: `Are you sure you want to remove this reminder?:\n${reminderMessage}`, components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirmRemove')
                            .setLabel('Yes')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('cancelRemove')
                            .setLabel('No')
                            .setStyle(ButtonStyle.Danger)
                    )
                ] });

                const confirmationCollector = i.channel.createMessageComponentCollector({ 
                    componentType: ComponentType.Button,
                    filter: (i) => i.user.id === interaction.user.id,
                    time: 60_000,
                });

                confirmationCollector.on('collect', async (i) => {
                    if (i.customId === 'confirmRemove') {
                        const reminderIndex = reminders.findIndex(reminder => reminder.id === reminderId);
                        reminders.splice(reminderIndex, 1);
                        writeRemindersToFile(remindersPath, reminders);
                        i.update({ content: 'Reminder removed.', components: [] });
                    } else if (i.customId === 'cancelRemove') {
                        i.update({ content: 'Reminder removal cancelled.', components: [] });
                    }
                });
            });
        }
    },
};
