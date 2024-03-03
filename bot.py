import random
import discord
from discord.ext import commands
from poll import PollView

# TOKEN
with open('TOKEN', 'r') as file:
    TOKEN = file.read().strip()

intents = discord.Intents.default()
intents.messages = True
intents.message_content = True

# Command prefix setting
bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'Logged in as {bot.user.name}')

@bot.slash_command(name='hello', description='Says hello to you')
async def hei(ctx):
    responses = ['Hi', 'Hello', 'Good day', 'Howdy', 'Hey',
                 'Hi there', 'Hello there', 'Greetings', 
                 'Salutations', 'Good to see you', 'How are you doing', 
                 'What\'s up', 'How\'s it going', 'How\'s everything', 
                 'How are things', 'How\'s life', 'How\'s your day', 
                 'How are you', 'How are you doing'] 
    await ctx.respond(f'{responses[random.randint(0, len(responses)-1)]}, {ctx.author.mention}!')



@bot.event
async def on_message(message):
    # Bot should not respond to itself
    if message.author == bot.user:
        return

    # Bot should respond to mentions
    if bot.user.mentioned_in(message):
        if any(greeting in message.content.lower() for greeting in ['hi', 'hello', 'good day']):
            await message.channel.send('Hi!')

    # Necessary for commands to work
    await bot.process_commands(message)

# Poll command
@bot.slash_command(name='poll', description='Creates a poll!')
async def poll(ctx, question: str, option1: str, option2: str, option3: str = None, option4: str = None):
    """
    Creates a poll with up to 4 options
    """
    poll_options = [option1, option2]
    if option3:
        poll_options.append(option3)
    if option4:
        poll_options.append(option4)

    # Creates an embed with the poll question
    embed = discord.Embed(title="Poll", description=question, color=discord.Color.blue())
    embed.set_footer(text="Click the button to vote!")

    # Sends the poll with buttons
    view = PollView(poll_options)
    await ctx.respond(embed=embed, view=view)


@bot.command(name='poll')
async def poll(ctx, question: str, *options):
    """Creates a poll. Can have multiple options separated by spaces."""
    if len(options) < 2:
        await ctx.send("You must provide at least two options for the poll.")
        return

    # Creates an embed with the poll question
    embed = discord.Embed(title="Poll", description=question, color=discord.Color.blue())
    embed.set_footer(text="Click on a button to vote")

    # Creates a view with buttons for each option
    view = PollView(options)
    await ctx.send(embed=embed, view=view)


# Run the bot
bot.run(TOKEN)