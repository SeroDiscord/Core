module.exports = {
    declare : function(bot) {
        // set up table if there is none
        bot.add_command(bot, "exec", exec);
    }
}

function exec(info) {
	if (info.admin) {
		try{
			eval(info.msg);
		} catch (e) {
			console.log(e);
		}
	}
}