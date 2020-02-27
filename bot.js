const config = require('./config.json');
const Discord = require('discord.js');
const SQLite = require("better-sqlite3");
const sql = new SQLite('./wolf-game.sqlite');
const helpers = require('./helpers/helpers.js');

// Initialize Discord Bot
const bot = new Discord.Client();
bot.login(config.token);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on("ready", () => {
    // check if the table "players" exists.
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'players';").get();
    if (!table['count(*)']) {
      // if no table, create it
      sql.prepare("CREATE TABLE players (id TEXT PRIMARY KEY, user TEXT, guild TEXT, level INTEGER, class TEXT);").run();
      sql.prepare("CREATE UNIQUE INDEX idx_players_id ON players (id);").run();
      sql.pragma("synchronous = 1");
      sql.pragma("journal_mode = wal");
    }
  
    bot.getPlayer = sql.prepare("SELECT * FROM players WHERE user = ? AND guild = ?");
    bot.setPlayer = sql.prepare("INSERT OR REPLACE INTO players (id, user, guild, level, class) VALUES (@id, @user, @guild, @level, @class);");
  });

// bot now accepting input
bot.on('message', message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;
    if (message.content.indexOf(config.prefix) !== 0) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    if (command == "ping") message.channel.send("pong!");

    if (command == 'start' ) {
        let player = bot.getPlayer.get(message.author.id, message.guild.id);
        if (!player) {

            const classes = {
                Adventurer: '⚔️',
                Shopkeeper: '💰',
                Farmer: '🍞'
            }
        
            let ab = 'Please choose your character:\n';
            for (const key in classes) {
                ab += `${classes[key]} ${key}\n`;
            }

            message.channel.send(ab).then( sentMessage => {
                sentMessage.react(Object.values(classes)[0])
                    .then(() => sentMessage.react(Object.values(classes)[1]))
                    .then(() => sentMessage.react(Object.values(classes)[2]))
                .catch(() => console.error('One of the emojis failed to react.'));

                const filter = (reaction, user) => {
                    return [Object.values(classes)[0], Object.values(classes)[1], Object.values(classes)[2]].includes(reaction.emoji.name) && user.id === message.author.id;
                };

                sentMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                .then(collected => {
                    const reaction = collected.first();
                    
                    player = {
                        id: `${message.guild.id}-${message.author.id}`,
                        user: message.author.id,
                        guild: message.guild.id,
                        level: 1,
                        class: helpers.getKeyByValue(classes,reaction.emoji.name)
                    }

                    bot.setPlayer.run(player);
                    message.channel.send(`${message.author.tag} has joined the game as a puny level 1 ${reaction.emoji.name} ` + helpers.getKeyByValue(classes,reaction.emoji.name) + `! Good luck out there!`);
                })
                .catch(collected => {
                    message.reply('you did not reply in time!');
                });
            })
        } else {
            message.channel.send('You already have a character!'); return;
        }
    }
});
