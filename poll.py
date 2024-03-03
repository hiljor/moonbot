
import discord
from discord.ui import Button, View
class PollButton(Button):
    def __init__(self, label):
        super().__init__(label=label, style=discord.ButtonStyle.primary)
        self.votes = 0
        self.voters = set()  # A set to keep track of users who have voted
        self.label = f"{label} - {self.votes} votes"

    async def callback(self, interaction):
        user_id = interaction.user.id
        if user_id in self.voters:
            # User has already voted, retract the vote
            self.votes -= 1
            self.voters.remove(user_id)
        else:
            # Register the user's vote
            self.votes += 1
            self.voters.add(user_id)
        self.label = f"{self.label.split(' - ')[0]} - {self.votes} votes"
        await interaction.response.edit_message(view=self.view)

class PollView(View):
    def __init__(self, options):
        super().__init__()
        for option in options:
            self.add_item(PollButton(option))