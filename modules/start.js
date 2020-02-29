module.exports = {
    declare : function(bot) {
        bot.add_command(bot, "start", start);
    }
}

function start(info) {
        // db.Player.findOne({where: {id: info.message.author.id}}).then(function (player) {
        db.Player.findOne({where: {id: 1234}}).then(function (player) {
        if (!player) {

            // fetch all available Job options
            db.Job.findAll({attributes: ['title', 'emoji']}, {raw: true}).then(function (jobs) {
                jobIcons = [];

                for (job in jobs) jobIcons.push(jobs[job].emoji);
                info.message.channel.send("Choose your Job:\n").then( message => {
                    // add all Job icons as reactions
                    addMultipleReactions(message, jobIcons, )
                })
            })
        } else {
            info.message.channel.reply("you have already made a character!"); return;
        }
    });
}

function addMultipleReactions(message, reactions, callback) {
    reactions.reduce(
        function reducer(promiseChain, value) {
            var nextLink = promiseChain.then(
                function() {
                    return(message.react(value))
                }
            );
            return(nextLink);
        },
        Promise.resolve(null)
    );
}

