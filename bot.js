const config = require('./config.json');
const Discord = require('discord.js');
const helpers = require('./helpers/helpers.js');
const database = require('./database/database.js');
const moment = require('moment');

// Initialize Discord Bot
const bot = new Discord.Client();
bot.login(config.token);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on("ready", () => {
    database.initialize(bot);
  });

// bot now accepting input
bot.on('message', message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;
    if (message.content.indexOf(config.prefix) !== 0) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    if (command == "ping") message.channel.send("pong!");

    // command START - New Character
    if (command == 'start' ) {
        let player = bot.getPlayerByUserAndGuild.get(message.author.id, message.guild.id);
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

            // present player with Class options
            message.channel.send(ab).then( sentMessage => {
                sentMessage.react(Object.values(classes)[0])
                    .then(() => sentMessage.react(Object.values(classes)[1]))
                    .then(() => sentMessage.react(Object.values(classes)[2]))
                .catch(() => console.error('One of the emojis failed to react.'));

                const filter = (reaction, user) => {
                    return [Object.values(classes)[0], Object.values(classes)[1], Object.values(classes)[2]].includes(reaction.emoji.name) && user.id === message.author.id;
                };
                // wait for player to choose a reaction
                sentMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                .then(collected => {
                    const reaction = collected.first();
                    
                    player = {
                        id: `${message.guild.id}-${message.author.id}`,
                        user: message.author.id,
                        guild: message.guild.id,
                        level: 1,
                        exp: 0,
                        class: helpers.getKeyByValue(classes,reaction.emoji.name.toLowerCase())
                    }

                    // save new player to db
                    bot.setPlayer.run(player);
                    message.channel.send(`${message.author.tag} has joined the game as a puny level 1 ${reaction.emoji.name} ` + helpers.getKeyByValue(classes,reaction.emoji.name) + `! Good luck out there!`);
                })
                .catch(collected => {
                    message.reply('you did not reply in time!');
                });
            })
        } else {
            message.channel.send('You are already playing!'); return;
        }
    }

    // command QUEST
    if (command == 'quest' ) {

        const player = bot.getPlayerByUserAndGuild.get(message.author.id, message.guild.id);
        if (!player) noPlayerFound();
        
        let currentQuest = bot.getPlayerQuestByPlayerId.get(player.id); 
        if (currentQuest) {
            // TODO: questStatus(player, currentQuest); if player is currently on a quest, show time remaining
            return;
        }

        // get player level and determine quest difficulty
        // below should become a proper formula later (based on factors like level and gear and how many pokemon you have or something)
        const easyQuest = bot.getRandomQuestByDifficulty.get(player.level - 1);
        const normalQuest = bot.getRandomQuestByDifficulty.get(player.level);
        const hardQuest = bot.getRandomQuestByDifficulty.get(player.level + 2);

        const quests = {
            Wimpy: '🐭',
            Normal: '🙍',
            Hard: '☠️'
        }

        // present player with quest option "easy, normal, hard"
        message.reply('choose your quest difficulty!\n🐭 Wimpy Quest \n🙍 Normal Quest \n☠️ You Gonna Die').then( sentMessage => {
            sentMessage.react('🐭')
                .then(() => sentMessage.react('🙍'))
                .then(() => sentMessage.react('☠️'))
            .catch(() => console.error('One of the emojis failed to react.'));

            const filter = (reaction, user) => {
                return [Object.values(quests)[0], Object.values(quests)[1], Object.values(quests)[2]].includes(reaction.emoji.name) && user.id === message.author.id;
            };

            // wait for player to choose a reaction
            sentMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(collected => {
                const reaction = collected.first();
        
                let emojiChoice = helpers.getKeyByValue(quests,reaction.emoji.name);
                var now = moment();
                var then = moment().add(2, 'minutes');
                var duration = moment.duration(now.diff(then)).humanize();

                // save current quest to db
                // bot.setPlayerQuest.run(normalQuest.id, player.id, then.unix());
                message.reply(`Your ${reaction.emoji.name} ${emojiChoice} quest has begun! Time remaining: ${duration}`);
            })
            .catch(collected => {
                message.reply('you did not reply in time!');
            });
        })

    }
});

questStatus = (player, currentQuest) => {
    var now = moment();
    var then = moment().add(2, 'minutes');
    var duration = moment.duration(now.diff(then)).humanize();
    // returns duration object with the duration between x and y
    console.log(duration);

    return;
};

noPlayerFound = () => {
    message.reply("you don't have a character! Type !start to get started.")
}
