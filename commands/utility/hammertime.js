const { SlashCommandBuilder } = require('discord.js');
const { timezones } = require('../../data/timezones.js');

// discord timestamp formats
const formats = [
    "t", // Short Time
    "T", // Long Time
    "d", // Short Date
    "D", // Long Date
    "f", // Short Date/Time
    "F", // Long Date/Time (includes seconds and weekday)
    "R", // Relative Time
]

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('hammertime')
        .setDescription('Format a timestamp. (Still in development)')
        .addStringOption(option =>
            option
                .setName('time')
                .setDescription('The time to convert to a timestamp. Must be in the format HH:MM or HH:MM:SS.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('timezone')
                .setDescription('The timezone to convert the time to. Defaults to UTC.')
                .setChoices(...timezones.map(timezone => ({ name: timezone, value: timezone })))
        ),
    async execute(interaction) {
        // 
    }
};
