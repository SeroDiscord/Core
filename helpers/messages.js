// @param {array} reactions - array of emojis
exports.addMultipleReactions = (message, reactions) => {
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

// @param {array} reactions - array of emojis
exports.collectFirstReaction = (info, message, reactions) => {
    return new Promise((resolve, reject) => {
        const filter = (reaction, user) => {
            return reactions.includes(reaction.emoji.name) && user.id === info.message.author.id;
        };

        message.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
        .then(collected => {
            resolve(collected.first());
        })
        .catch(collected => {
            info.message.channel.send('you did not reply in time!');
        });
    })
}