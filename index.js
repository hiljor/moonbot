const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
	] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Load all commands
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		const commandName = file.split('.')[0];
		if ('data' in command && 'execute' in command) {
			console.log(`Loading command ${commandName}`);
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Find event files
const eventsPath = path.join(__dirname, 'events');

function readFilesRecursively(directory) {
    const files = [];

    fs.readdirSync(directory).forEach(file => {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            files.push(...readFilesRecursively(fullPath));
        } else if (file.endsWith('.js')) {
            files.push(fullPath);
        }
    });

    return files;
}

const eventPaths = readFilesRecursively(eventsPath);

// Load all events
for (const filePath of eventPaths) {
	console.log(`Loading event from ${filePath}`);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Cooldowns
client.cooldowns = new Collection();

client.login(token);