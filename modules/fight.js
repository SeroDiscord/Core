module.exports = {
    declare : function(bot) {
        bot.add_command(bot, "battle", battle);
    }
}

battle = (info) => {
    db.Player.findOne({where: {id: info.message.author.id}}).then(function (player) {
        if (!player) {
            info.message.channel.send("You don't have a character! Create one with !start");
            return;
        }

        // db.Enemy.findOne().then(function (enemy) {
        //     beginBattle(info, player, enemy);
        // });
        const enemy = {
            name: "Test Monster",
            health: 20,
            attack: 1,
            defense: 1
        }
        battleTurn(info, player, enemy, enemy.health, null, null);
    });
}

battleTurn = (info, player, enemy, remainingHealth, battleLog, message) => {
    if (remainingHealth > 0) {

        let playerAbilities = ['🤜', '🔥', '🏃'];
        if (!battleLog) battleLog = "New combat initiated!\n";

        info.message.channel.send(
        new Discord.RichEmbed().addField("Battle Log",`${battleLog}`)
        .addField("Stats",`${enemy.name} HP: ${remainingHealth}/${enemy.health}\nSusan HP: ${player.current_health}/${player.max_health}\nAtk ${player.attack} - Def ${player.defense}`,true)
        .addField("What will you do?","🤜 Lightning Jab\n🔥 Sizzling Flare\n🏃 Run",true))
        .then((message) => {
            helper.addMultipleReactions(message, playerAbilities);
            helper.collectFirstReaction(info, message, playerAbilities).then((reaction) => {
                // db.Ability.findOne({where: {emoji: reaction.emoji.name}
                // }).then(function (selectedAbility) {
                    // adjust health and do stuff
                // })
                remainingHealth -= 3;
                player.update({health: player.current_health - 4})
                .then(function () {
                    // limit battle log to 4 lines
                    if (battleLog.split(/\r\n|\r|\n/).length > 3) {
                        battleLog = battleLog.substring(battleLog.indexOf("\n") + 1);
                    }
                    battleLog += `Susan attacks with ${reaction.emoji.name} for 3 damage!\n`;

                    if (battleLog.split(/\r\n|\r|\n/).length > 3) {
                        battleLog = battleLog.substring(battleLog.indexOf("\n") + 1);
                    }
                    battleLog += `❗${enemy.name} bites you for 4 damage!\n`;

                    return battleTurn(info, player, enemy, remainingHealth, battleLog, message);
                })
            })
        })
    } else {
        info.message.channel.send("[enemy image]",
        new Discord.RichEmbed().addField("Battle Log",`${battleLog}`)
        .addField("Enemy has been defeated!"))
        return;
    }
}