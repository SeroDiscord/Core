require('dotenv').config();
const Discord = require('discord.js');
const TOKEN = process.env.TOKEN;

// Initialize Discord Bot
const bot = new Discord.Client();
bot.login(TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
  });

bot.on('message', msg => {
    if (msg.content === 'ping') {
      msg.reply('replying to user pong!');
      msg.channel.send('replying in channel pong!');
    }
  });