const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	category: 'utility',
    timeout: 30,
	data: new SlashCommandBuilder()
		.setName('timer')
		.setDescription('Creates a timer of at most 15m and notifies you when it is done.')
		.addNumberOption(option =>
			option.setName('minutes')
                .setDescription('The duration of the timer in minutes.')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('seconds')
                .setDescription('The duration of the timer in seconds.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send when the timer is done.')
                .setRequired(false))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to notify when the timer is done. You by default.')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('silent')
                .setDescription('Whether to send the message silently.')
                .setRequired(false)),
	async execute(interaction) {
        const minutes = interaction.options.getNumber('minutes');
        const seconds = interaction.options.getNumber('seconds') ?? 0;
        const message = interaction.options.getString('message') ?? 'The timer is done!';
        const user = interaction.options.getUser('user') ?? interaction.user;
        const silent = interaction.options.getBoolean('silent') ?? false;
        const duration = (minutes * 60 + seconds) * 1000;
        const now = Date.now();
        const end = now + duration;

        if (duration > 15 * 60 * 1000) {
            return interaction.reply({ content: 'The timer cannot be longer than 15 minutes.', ephemeral: true });
        }

        if (duration < 1_000) {
            return interaction.reply({ content: 'The timer cannot be shorter than 1 second.', ephemeral: true });
        }

        await interaction.reply({ content: `Timer set for ${minutes}m${seconds}s. Will complete <t:${Math.floor(end / 1000)}:R>.`, ephemeral: true });

        const timer = setTimeout(async () => {
            clearTimeout(timer);
            await interaction.editReply({ content: 'The timer is done!', ephemeral: true });
            await interaction.followUp({ content: `<@${user.id}> ${message}`, ephemeral: silent });
        }
        , duration);
    }
};