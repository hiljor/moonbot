const { Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		// Load all procedures
		const proceduresPath = path.join(__dirname, 'procedures');
		const procedureFiles = fs.readdirSync(proceduresPath).filter(file => file.endsWith('.js'));

		for (const file of procedureFiles) {
			const filePath = path.join(proceduresPath, file);
			const procedure = require(filePath);
			
			if ('execute' in procedure && ('interval' in procedure || ('once' in procedure && procedure.once))) {
				if ('once' in procedure && procedure.once) {
					procedure.execute(client);
				} else {
					setInterval(() => {
						procedure.execute(client);
					}, procedure.interval);
				}
			} else {
				console.log(`[WARNING] The procedure at ${filePath} is missing a required "execute" or "interval" or "once" property.`);
			}
		}
	},
};