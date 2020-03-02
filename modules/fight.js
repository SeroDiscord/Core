module.exports = {
    declare : function(bot) {
        bot.add_command(bot, "battle", battle);
    }
}

battle = (info) => {
    db.Player.findOne({where: {id: info.message.author.id}, include: [db.Ability] }).then((player) => {
        if (!player) {
            info.message.channel.send("You don't have a character! Create one with !start");
            return;
        }

        // fetch a random enemy
        db.Enemy.findOne({ order: db.sequelize.random() }).then((enemy) => {
            // set username of current player
            player.username = info.message.author.username;

            // prepare player abilities
            let abilitiesIcons = [];
            let abilitiesList = '';

            for (ability in player.Abilities) {
                abilitiesIcons.push(player.Abilities[ability].emoji);
                abilitiesList += player.Abilities[ability].emoji + ' ' + player.Abilities[ability].name + '\n';
            }
            // add Run Away ability if allowed
            abilitiesIcons.push('🏃');
            player.actions = {};
            player.actions.text = abilitiesList;
            player.actions.icons = abilitiesIcons;

            // initiate battle loop
            battleTurn(info, player, enemy, enemy.health, null, null);
        });
    });
}

battleTurn = (info, player, enemy, remainingHealth, battleLog, oldMessage) => {
    if (remainingHealth > 0) {

        if (!battleLog) battleLog = "New combat initiated!\n";

        if (oldMessage) {
            info.message.channel.fetchMessage(oldMessage.id).then(oldmessage => {
                oldmessage.delete();
            });
        }

        info.message.channel.send(
        new Discord.RichEmbed().addField("Battle Log",`${battleLog}`)
        .addField("Stats",`${enemy.name} HP: ${remainingHealth}/${enemy.health}\n${player.username} HP: ${player.current_health}/${player.max_health}\nAtk ${player.attack} - Def ${player.defense}`,true)
        .addField("What will you do?", player.actions.text + "\n🏃 Run Away",true))
        .then((message) => {
            helper.addMultipleReactions(message, player.actions.icons);
            helper.collectFirstReaction(info, message, player.actions.icons).then((reaction) => {
                remainingHealth -= 3;
                player.update({current_health: player.current_health - 4})
                .then(function () {
                    // limit battle log to 6 lines
                    if (battleLog.split(/\r\n|\r|\n/).length > 6) {
                        battleLog = battleLog.substring(battleLog.indexOf("\n") + 1);
                    }
                    db.Ability.findOne({where: {emoji: reaction.emoji.name}})
                    .then(function (selectedAbility) {

                        battleLog += `${player.username} ${selectedAbility.attackText} for 3 damage!\n`;

                        if (battleLog.split(/\r\n|\r|\n/).length > 3) {
                            battleLog = battleLog.substring(battleLog.indexOf("\n") + 1);
                        }
                        battleLog += `❗${enemy.name} bites you for 4 damage!\n`;

                        return battleTurn(info, player, enemy, remainingHealth, battleLog, message);

                    })
                })
            })
        })
    } else {

        if (oldMessage) {
            info.message.channel.fetchMessage(oldMessage.id).then(oldmessage => {
                oldmessage.delete();
            });
        }

        info.message.channel.send(
        new Discord.RichEmbed().addField("Battle Log",`${battleLog}`)
        .addField("Enemy has been defeated!"))
        return;
    }
}