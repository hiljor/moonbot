const { Events } = require('discord.js');
const { answers } = require('../data/8ball.js');
const { greetings } = require('../data/greetings.js');
// This event will run whenever a message is created in a text channel that the bot can see.
module.exports = {
    name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot) return;

		const botMention = message.mentions.users.has(message.client.user.id);
		if (botMention) {
			console.log('Bot was mentioned with a message:', message.content);
			console.log(greetings);
			console.log(answers);
			// Check if the message contains a greeting
			if (greetings.some(greeting => message.content.toLowerCase().includes(greeting))) {
				// Reply with a random greeting from the greetings data
				let response = greetings[Math.floor(Math.random() * greetings.length)];
				// Make first letter capitalised at random
				response = Math.random() > 0.5 ? response.charAt(0).toUpperCase() + response.slice(1) : response;
			}
			// Check if the message contains a question mark
			else if (message.content.includes('?')) {
				// Get a random answer from the 8ball data
				const answer = answers[Math.floor(Math.random() * answers.length)];
				message.reply(answer);
			}
		}
	},
};