const fs = require('fs');
const path = require('path');

module.exports = {
    interval: 1 * 60 * 1000, // 1 minute in milliseconds
    once: false,
    async execute(client) {
        console.log('Checking reminders...');
        const reminderPath = path.join(__dirname, '/../../data/reminders.json');
        const reminders = JSON.parse(fs.readFileSync(reminderPath, 'utf8'));
        
        const sendReminder = async (reminder) => {
            try {
                const [channel, user] = await Promise.all([
                    client.channels.fetch(reminder.channelId),
                    client.users.fetch(reminder.userId)
                ]);
        
                await channel.send(`Hey <@${user.id}>: ${reminder.message}`);
            } catch (error) {
                console.error(error);
            }
        };

        if (reminders && reminders.length > 0) {
            const remindersToRemove = [];
        
            for (const reminder of reminders) {
                if (reminder.reminderTime < Date.now() / 1000) {
                    await sendReminder(reminder);
                    remindersToRemove.push(reminder);
                }
            }
        
            for (const reminder of remindersToRemove) {
                const reminderIndex = reminders.findIndex(r => r.id === reminder.id);
                reminders.splice(reminderIndex, 1);
            }
        
            fs.writeFileSync(reminderPath, JSON.stringify(reminders, null, 2));
        
        }
    },
};
