module.exports = {
    declare : function(bot) {
        bot.add_command(bot, "start", start);
    }
}

start = (info) => {
    db.Player.findOne({where: {id: info.message.author.id}}).then(function (player) {
        if (!player) {

            // fetch all available Job options
            db.Job.findAll({attributes: ['name', 'emoji']}, {raw: true}).then(function (jobs) {
                jobIcons = [], jobText = '';

                for (job in jobs) {
                    // craft jobs message and emoji array
                    jobIcons.push(jobs[job].emoji);
                    jobText += jobs[job].emoji + ' - ' + jobs[job].name + '\n';
                }

                // character creation message
                info.message.channel.send(new Discord.RichEmbed()
                .setColor('#0099ff')
                .setTitle(`Create New Character`)
                .addField("Select your Job: \n", jobText))
                .then( message => {
                    // add all Job icons as reactions
                    helper.addMultipleReactions(message, jobIcons)
                    helper.collectFirstReaction(info, message, jobIcons).then((jobReaction) => {

                        db.Ability.findAll().then(function (abilities) {
                            abilityIcons = [], abilityText = '';

                            for (ability in abilities) {
                                // craft abilities message and emoji array
                                abilityIcons.push(abilities[ability].emoji);
                                abilityText += abilities[ability].emoji + ' ' + abilities[ability].name + ' - ' + abilities[ability].description + '\n';
                            }

                            message.delete();

                            info.message.channel.send(new Discord.RichEmbed()
                            .setColor('#0099ff')
                            .setTitle('Create New Character')
                            .addField("Select your first Job Ability: \n", abilityText))
                            .then( message => {
                                helper.addMultipleReactions(message, abilityIcons)
                                helper.collectFirstReaction(info, message, abilityIcons).then((abilityReaction) => {

                                    // create new player with selected job
                                    createNewPlayer(info, jobReaction, abilityReaction); return;
                                })
                            })
                        })
                    })
                })
            })
        } else {
            info.message.channel.send("you have already made a character!"); return;
        }
    });
}

function createNewPlayer(info, job, ability) {
    // find job selected by player
    db.Job.findOne({where: {emoji: job.emoji.name}})
    .then(function (selectedJob) {

        db.Ability.findOne({where: {emoji: ability.emoji.name}})
        .then(function (selectedAbility) {

            // create new player with Job and Ability
            console.log('saving player: ' + info.message.author.id);
            db.Player.create({ id: info.message.author.id, JobId: selectedJob.id })
            .then((newPlayer) => {
                newPlayer.addAbility(selectedAbility);
                console.log("New player created:", newPlayer.id);
                info.message.channel.send(`${info.message.author.tag} is a Level 1 ${selectedJob.emoji}${selectedJob.name}! Good luck out there!`);
            })

        })
    })
}
