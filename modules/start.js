module.exports = {
    declare : function(bot) {
        bot.add_command(bot, "start", start);
    }
}

function start(info) {
    db.Player.findOne({where: {id: info.message.author.id}}).then(function (player) {
        if (!player) {

            // fetch all available Job options
            db.Job.findAll({attributes: ['name', 'emoji']}, {raw: true}).then(function (jobs) {
                jobIcons = [];
                jobText = '';

                for (job in jobs) {
                    // craft jobs message and emoji array
                    jobIcons.push(jobs[job].emoji);
                    jobText += jobs[job].emoji + ' - ' + jobs[job].name + '\n';
                }

                info.message.channel.send("Please select your Job:\n" + jobText).then( message => {
                    // add all Job icons as reactions
                    helper.addMultipleReactions(message, jobIcons)
                    // wait for player to choose a reaction
                    const filter = (reaction, user) => {
                        return jobIcons.includes(reaction.emoji.name) && user.id === info.message.author.id;
                    };

                    message.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
                    .then(collected => {
                        createNewPlayer(info, collected.first()); return;
                    })
                    .catch(collected => {
                        info.message.channel.send('you did not reply in time!');
                    });
                })
            })
        } else {
            info.message.channel.send("you have already made a character!"); return;
        }
    });
}

function createNewPlayer(info, reaction) {
    // find job selected by player
    db.Job.findOne({where: {emoji: reaction.emoji.name}
    }).then(function (selectedJob) {
        // create new player
        db.Player.create({ id: info.message.author.id, JobId: selectedJob.id })
        .then((newPlayer) => {
            console.log("New player created:", newPlayer.id);
            info.message.channel.send(`${info.message.author.tag} is a level 1 ${selectedJob.emoji}${selectedJob.name}! Good luck out there!`);
            // TODO: post welcome/help text
        })
    })

}
