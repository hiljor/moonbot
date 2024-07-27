const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('secret')
		.setDescription('Responds to a secret.')
		.addStringOption(option =>
			option.setName('secret')
				.setDescription('The secret you want to tell.')
				.setRequired(true)),
	async execute(interaction) {
    const responses = [
        'That\'s an interesting secret!',
        'Your secret is safe with me.',
        'I never saw that coming!',
        'Wow, thanks for sharing!',
        'I promise not to tell anyone.',
        'Your secret is safe in the vault.',
        'I\'m sworn to secrecy.'
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    await interaction.reply({content: randomResponse, ephemeral: true});
    }
};