const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Provides information about the server and its members.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Provides information about a user.')
				.addUserOption(option =>
					option.setName('user')
						.setDescription('The user to get information about.')
						.setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('server')
				.setDescription('Provides information about the server.')
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'user') {
			const user = interaction.options.getUser('user');
			const member = interaction.guild.members.cache.get(user.id);
			const roles = member.roles.cache
				.filter(role => role.id !== interaction.guild.id)
				.sort((a, b) => b.position - a.position)
				.map(role => role.toString())
				.join(', ') || 'None';
			const quizWins = member.roles.cache
				.filter(role => role.name.includes('quiz') || role.name.includes('Quiz'))
				.size;
			const joinedAt = member.joinedAt.toDateString();
			const embed = {
				color: member.displayColor,
				title: `User Information - ${member.user.tag}`,
				thumbnail: {
					url: member.user.displayAvatarURL({ dynamic: true }),
				},
				fields: [
					{
						name: 'Nickname',
						value: member.nickname || 'None',
						inline: true,
					},
					{
						name: 'Username',
						value: user.tag,
						inline: true,
					},
					{
						name: 'Quiz wins',
						value: quizWins,
						inline: true,
					},
					{
						name: 'Joined at',
						value: joinedAt,
					},
					{
						name: 'Roles',
						value: roles,
					},
				],
			};

			await interaction.reply({ embeds: [embed] });
		} else if (subcommand === 'server') {
			const guild = interaction.guild;
			const owner = await guild.fetchOwner();
			const roles = guild.roles.cache
				.filter(role => role.id !== guild.id)
				.sort((a, b) => b.position - a.position)
				.map(role => role.toString())
				.join(', ') || 'None';
			const channels = guild.channels.cache.size;
			const members = guild.memberCount;
			const embed = {
				color: 'BLUE',
				title: `Server Information - ${guild.name}`,
				thumbnail: {
					url: guild.iconURL({ dynamic: true }),
				},
				fields: [
					{
						name: 'Owner',
						value: owner.user.tag,
						inline: true,
					},
					{
						name: 'Roles',
						value: roles,
					},
					{
						name: 'Channels',
						value: channels,
						inline: true,
					},
					{
						name: 'Members',
						value: members,
						inline: true,
					},
				],
			};

			await interaction.reply({ embeds: [embed] });
		}
	},
};
