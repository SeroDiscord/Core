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