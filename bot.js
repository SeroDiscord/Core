/********************************
 * Please always pass message and channel IDs as strings if they are being hardcoded. Javascript messes with the numbers from time to time
 * Please try not to hardcode message or channel IDs
 * All mentions of string are IDs unless mentioned otherwise
 * All functions are a callback unless specified otherwise
 *
 * The bot object in subordinate modules contains:
 *  {
 *      sql     // just the sqlite object
 *
 *      add_active(bot,function,integer,integer)        // occurs once every minute, first integer is intervals (minutes) between function call, second is minutes to offset by. To have a command occur every hour on the 5th minute you'd have those set to 60,4
 *
 * 		remove_reactionadd_single_message(bot,string)	// removes the single-message tied reaction callback
 *      add_reactionadd_single_message(bot,string,function)  // occurs when someone reacts to a message with a matching ID
 *      add_reactionadd_channel(bot,string,function)   // occurs when someone reacts to a message in a channel with a matching ID
 *      add_reactionadd_passive(bot,string,function)   // occurs when someone reacts to any message
 *
 *      add_channel(bot,string,function)    // occurs when someone speaks in a channel with a matching ID
 *      add_passive(bot,string,callback)    // occurs when someone speaks in any channel, indiscriminately
 *      add_command(bot,string,callback)    // occurs when someone uses a command matching the string parameter. String is not an ID, but a command name, eg '!ping' would be added as the string "ping"
 *
 *       add_voiceevent(bot,function)        // occurs when a user's voice status updates (joins/changes channel, mute/unmute)
 *
 *      add_guild_member_join(bot,function)     // occurs when a user joins the guild
 *      add_guild_member_update(bot,function)   // occurs when a member updates nickname, changes role, etc
 *
 *      call_command(info,string,string)       // calls a command, accepts a command name for the first string, and message contents for the second - could be used for testing, but haven't done so
 *  }
 *
 * Regarding "info" objects
 *      // they will never contain conflicting variable names
 *          e.g. "user" in one will mean the exact same thing as "user" in any other
 *
 * info objects contain:
 * from active:
 *  {
 *      bot         // just the bot object
 *      verbose     // contains the object from verbose.json, useful for debugging so you don't have to remove and re-add useful outputs
 *      throwErr    // a generic error handler
 *  }
 * from reactionadd_single_message, reactionadd_channel:
 *  {
 *      bot
 *      verbose
 *      throwErr
 *      admin       // true/false whether the user is an admin
 *      user        // a user object
 *      reaction    // reaction object
 *  }
 * from channel, passive:
 *  {
 *      bot
 *      verbose
 *      throwErr
 *      admin
 *      message     //the message object
 *  }
 * from command:
 *  {
 *      bot
 *      verbose
 *      throwErr
 *      admin
 *      message
 *      cmd     // the command being called
 *      msg     // the *line* of message subsequent the prefix and command
 *  }
 ***    each command from each line will be broken up if there's multiple lines of commands
 ***    for example:
 ***        !ping 1 2
 ***        !notping 3 4
 ***    will send out the command ping with the msg "1 2"
 ***    then will send the command notping with the msg "3 4"
 ***    this can be ignored most of the time, but does mean users will never be able to send a command or arguments with a line break in them
 ***    if you need to observe line-breaks, use the message object, not msg
 * from voiceevent, guild_member_join:
 *  {
 *      bot
 *      verbose
 *      throwErr
 *      admin
 *      user
 *  }
 * from guild_member_update:
 *  {
 *      bot
 *      verbose
 *      throwErr
 *      admin
 *      user
 *      olduser     // the user object from before the update
 *  }
 *
 *******************************/

const config = require('./config/config.json');
Discord = require('discord.js');
db = require('./models');
helper = require('./helpers/messages.js');
const fixtures = require('./config/fixtures.js');
const verbose = require('./verbose.json');
const fs = require("fs");

// initialize database tables
db.sequelize.sync();

// Initialize Discord Bot
const MODULES_DIR = "modules";
const bot = new Discord.Client();

function throwErr(err) {
    if (err && debug) {
        throw err;
	} else if (err) {
        console.log(err);
	}
}
//make sure there's a module dir and make it if need be
if (!fs.existsSync(MODULES_DIR)){
    fs.mkdirSync(MODULES_DIR);
}

if (verbose.emitter) console.log('emitter');
bot.once('ready', () => {
    error_count = 0;
	console.log(`Logged in as ${bot.user.tag}!`);
	if (verbose.setup.bot_info) console.log(`Bot User ID: ${bot.user.id}`);

	//initialize the bot
	bot.active = [];

	bot.passive = [];
	bot.channel = {};

	bot.reactionadd_passive = [];
	bot.reactionadd_single_message = {};
	bot.reactionadd_channel = {};

	bot.voicechat_updates = [];
	bot.guild_member_join = [];
	bot.guild_member_update = [];

    bot['cmd'] = [];
    bot.admins = [];

    fixtures.execute();
    db.Admin.findAll({attributes: ['id']}).then(function (list) {
    	for (i in list) bot.admins.push(list[i].id);
    });

    // bot.sql.prepare("CREATE TABLE IF NOT EXISTS admins (id CHAR(18));").run();
	// let adminsresult = bot.sql.prepare("SELECT id FROM admins;").all();
	// if (adminsresult.length == 0) {
	// 	bot.sql.prepare(`INSERT INTO admins (id) VALUES (${BOT_ADMINS.join("), (")});`).run();
	// 	adminsresult = bot.sql.prepare("SELECT id FROM admins;").all();
	// }
	// for (i in adminsresult) bot.admins.push(adminsresult[i]['id']);

	/*bot.sql.query("CREATE TABLE IF NOT EXISTS admins (id CHAR(18));", function (createerr, createresult) {
        if (createerr) throw createerr;
        console.log(createresult);
		bot.sql.query("SELECT id FROM admins;", function (adminserr, adminsresult) {
			if (adminserr) throw 	adminserr;
			for (i in adminsresult) for (j in adminsresult[i]) bot.admins.push(adminsresult[i][j]);
			if (verbose) console.log('Admins: %j',bot.admins);
		});
	});*/

	//add activity handlers
	bot.add_active = add_active;

	//add event handlers
	bot.remove_reactionadd_single_message = remove_reactionadd_single_message;
	bot.add_reactionadd_single_message = add_reactionadd_single_message;
	bot.add_reactionadd_channel = add_reactionadd_channel;
	bot.add_reactionadd_passive = add_reactionadd_passive;
	bot.add_channel = add_channel;
	bot.add_passive = add_passive;
	bot.add_command = add_command;
	bot.add_voiceevent = add_voiceevent;
	bot.add_guild_member_join = add_guild_member_join;
	bot.add_guild_member_update = add_guild_member_update;
	bot.call_command = call_command;

	//add modules
	load_modules(bot);
	let now = new Date().getTime();
	on_active_modules(bot,now);
});

function add_guild_member_update(bot,cb) {
	bot.guild_member_update.push(cb);
	if (verbose.setup.add_commands) console.log('Update Guild Member added, length:%d', Object.keys(bot.guild_member_update).length);
}

function add_guild_member_join(bot,cb) {
	bot.guild_member_join.push(cb);
	if (verbose.setup.add_commands) console.log('Add Guild Member added, length:%d', Object.keys(bot.guild_member_join).length);
}

function add_voiceevent(bot,cb) {
	bot.voicechat_updates.push(cb);
	if (verbose.setup.add_commands) console.log('Voice Chat Command Added, length:%d',Object.keys(bot.voicechat_updates).length);
}

function add_active(bot,cb,intervals_between,offset) {
	if (intervals_between <= offset) throw Error("Active module error: offset too great");
	bot.active.push([intervals_between,cb,offset]);
	if (verbose.setup.add_commands) console.log('Active Command Added, length:%d',Object.keys(bot.active).length);
}

function add_reactionadd_single_message(bot, id, cb) {
	if (bot.reactionadd_single_message[id] !== undefined) {
		throw Error("Single Message Watch " + id + " already exists. Please remove this command from one of the modules involved.")
	}
	bot.reactionadd_single_message[id] = cb
	if (verbose.setup.add_commands) console.log('Single Message ReactionAdd Command Added %s, length:%d',id,Object.keys(bot.reactionadd_single_message).length);
}

function remove_reactionadd_single_message(bot, id) {
	delete bot.reactionadd_single_message[id];
	if (verbose.setup.add_commands) console.log('Single Message ReactionAdd Command Removed %s, length:%d',id,Object.keys(bot.reactionadd_single_message).length);
}

function add_reactionadd_channel(bot, id, cb) {
	if (bot.reactionadd_channel[id] === undefined) {
		bot.reactionadd_channel[id] = []
	}
	bot.reactionadd_channel[id].push(cb);
	if (verbose.setup.add_commands) console.log('Channel ReactionAdd Command Added %s, length:%s',id,Object.keys(bot.reactionadd_channel).length);
}

function add_reactionadd_passive(bot, cb) {
	bot.reactionadd_passive.push(cb);
	if (verbose.setup.add_commands) console.log('Passive Command Added, length:%s',name,Object.keys(bot.reactionadd_passive).length);
}

function add_channel(bot, id, cb) {
	if (bot.channel[id] !== undefined) {
		bot.channel[id] = [];
	}
	bot.channel[id].push(cb);
	if (verbose.setup.add_commands) console.log('Channel Command Added %s, length:%s',id,Object.keys(bot.channel).length);
}

function add_passive(bot, cb) {
	bot.passive.push(cb);
	if (verbose.setup.add_commands) console.log('Passive Command Added, length:%s',Object.keys(bot.passive).length);
}

function add_command(bot, iden, cb) {
	if (bot.cmd[iden] !== undefined) {
		throw Error("Command " + iden + " already exists. Please remove this command from one of the modules involved.")
	}
	bot.cmd[iden] = cb;
	if (verbose.commands.add_commands) console.log('Command Added %s, length:%s',name,Object.keys(bot.cmd).length);
}

function call_command(info, cmd, msg) {
	if (verbose.commands.full_call_context) console.log(`Command Called: ${cmd}`);
	if (bot.cmd[cmd] === undefined) {
		if (verbose.commands.failed_calls) console.log('Command ' + cmd + ' doesn\'t exist');
		return;
	}
	info['cmd'] = cmd;
	info['msg'] = msg;
	new Promise((resolve, reject) => {
		let hrstart = process.hrtime();
		info.bot.cmd[info['cmd']](info);
		if (verbose.commands.successful_calls) console.log('Single Message Command %d : %d', i, process.hrtime(hrstart)[1] / 1000000);
		resolve();
	});
}

function load_modules(bot) {
	bot.cmd = {};
	let modules = fs.readdirSync(MODULES_DIR).filter(word => word.endsWith(".js"));

	for (let i in modules) {
		new Promise((resolve, reject) => {
			mod = require('./' + MODULES_DIR + '/' + modules[i]);
			console.log('./' + MODULES_DIR + '/' + modules[i]);
			mod.declare(bot);
			resolve();
		});
	}
}

/******************************
* Guild Member Update Handler *
******************************/
if (verbose.emitter) console.log('emitter');
bot.on('guildMemberUpdate', (olduser, user) => {
	if (verbose.memberupdate) console.log("Member update");
	let info = {
		"bot"	    :bot,
		"olduser"	:olduser,
		"user"		:user,
		"admin"		:bot.admins.includes(user.id),
		"verbose"	:verbose,
		"throwErr"	:throwErr
	};
	for (let i in bot.guild_member_update) {
		new Promise((resolve, reject) => {
			let hrstart = process.hrtime();
			bot.guild_member_update[i](info);
			if (verbose.memberupdate) console.log('[%d] Guild Member Update Module # %d : %d', new Date() / 60000, i, process.hrtime(hrstart)[1] / 1000000);
			resolve();
		})
	}
});

/***************************
* Guild Member Add Handler *
***************************/
if (verbose.emitter) console.log('emitter');
bot.on('guildMemberAdd', user => {
	let info = {
		"bot"	    :bot,
		"user"		:user,
		"admin"		:bot.admins.includes(user.id),
		"verbose"	:verbose,
		"throwErr"	:throwErr
	};
	for (let i in bot.guild_member_join) {
		new Promise((resolve, reject) => {
			let hrstart = process.hrtime();
			bot.guild_member_join[i](info);
			if (verbose.memberadd) console.log('[%d] Guild Member Add Module # %d : %d', new Date() / 60000, i, process.hrtime(hrstart)[1] / 1000000);
			resolve();
		})
	}
});

/****************************
* Voice Chat Update Handler *
****************************/
if (verbose.emitter) console.log('emitter');
bot.on('voiceStateUpdate', user => {
	let info = {
		"bot"    	:bot,
		"user"		:user,
		"admin"		:bot.admins.includes(user.id),
		"verbose"	:verbose,
		"throwErr"	:throwErr
	};
	for (let i in bot.voicechat_updates) {
		new Promise((resolve, reject) => {
			let hrstart = process.hrtime();
			bot.voicechat_updates[i](info);
			if (verbose.voice) console.log('[%d] Voice Chat Module # %d : %d', new Date() / 60000, i, process.hrtime(hrstart)[1] / 1000000);
			resolve();
		})
	}
});

/***********************
* Active Event Handler *
***********************/
function on_active_modules(bot,timeToCheckMS) {
	one_minute = 60000;
	time_betweeen_check = one_minute; //runs every minute
	let activehrstart = process.hrtime();
	let info = {
		"bot"	    :bot,
		"verbose"	:verbose,
		"throwErr"	:throwErr
	};
	for (let i in bot.active) {
		if (timeToCheckMS%(time_betweeen_check*bot.active[i][0]) == bot.active[i][2]) {
			new Promise((resolve, reject) => {
				let hrstart = process.hrtime();
				bot.active[i][1](info);
				if (verbose.active) console.log('[%d] Active Module # %d : %d', new Date() / 60000, i, process.hrtime(hrstart)[1] / 1000000);
				resolve();
			});
		}
	}
	now = new Date().getTime();
	let between = time_betweeen_check - now % time_betweeen_check;
	if (between < time_betweeen_check / 10) between = between + time_betweeen_check;
	if (verbose.active) console.log('Active Modules Loop: %d, time to next loop: %s', process.hrtime(activehrstart)[1] / 1000000, between);
	setTimeout(() => {on_active_modules(bot,Math.floor(now / time_betweeen_check)*time_betweeen_check+time_betweeen_check)}, between);
}


/*************************
* Reaction Event Handler *
*************************/
if (verbose.emitter) console.log('emitter');
bot.on('messageReactionAdd', (reaction,user) => {
	let info = {
		"bot"   	:bot,
		"reaction"	:reaction,
        "admin"		:bot.admins.includes(user.id),
        "user"      :user,
		"throwErr"	:throwErr,
		"verbose"	:verbose,
	}

	// message specific commands
	if (bot.reactionadd_single_message[reaction.message.id] !== undefined) {
		new Promise((resolve, reject) => {
			let hrstart = process.hrtime();
			bot.reactionadd_single_message[reaction.message.id](info);
			if (verbose.commands.successful_calls) console.log('ReactionAdd Single Message Command %d : %d', i, process.hrtime(hrstart)[1] / 1000000);
			resolve();
		});
	}

	// channel specific commands
	if (bot.reactionadd_channel[reaction.message.channel.id] !== undefined){
		for (i in bot.reactionadd_channel[reaction.message.channel.id]) {
			new Promise((resolve, reject) => {
				let hrstart = process.hrtime();
				bot.reactionadd_channel[reaction.message.channel.id][i](info);
				if (verbose.commands.successful_calls) console.log('ReactionAdd Channel Command %d : %d', i, process.hrtime(hrstart)[1] / 1000000);
				resolve();
			});
		}
	}

	// passive commands
	for (i in bot.reactionadd_passive) {
		new Promise((resolve, reject) => {
			let hrstart = process.hrtime();
			bot.reactionadd_passive[i](info)
			if (verbose.commands.successful_calls) console.log('ReactionAdd Passive Command %d : %d', i, process.hrtime(hrstart)[1] / 1000000);
			resolve();
		});
	}
});

/************************
* Message Event Handler *
************************/
if (verbose.emitter) console.log('emitter');
bot.on('message', msg => {
	//don't respond to ourselves
	if (msg.author.id === bot.user.id) return;

	let info = {
		"bot"	    :bot,
		"message"	:msg,
		"admin"		:bot.admins.includes(msg.author.id),
		"throwErr"	:throwErr,
		"verbose"	:verbose,
	}

	// specific commands
	if (msg.content.charAt(0) == config.prefix) {
		// only use msg for contents in modules, message may contain multiple lines
		// commands on multiple lines in a single message will be split and executed seperately as long as they continue to be delimited as commands
		let executions = msg.content.split("\n");
		for (m in executions) {
			if (executions[m].charAt(0) === config.prefix) {
				let msglen = executions[m].indexOf(' ');
				let info_cmd;
				let info_msg;
				if (msglen === -1) {
					info_cmd = executions[m].substring(config.prefix.length).trim();
					info_msg = undefined;
				} else {
					info_cmd = executions[m].substring(config.prefix.length,msglen).trim();
					info_msg = executions[m].substring(msglen).trim();
				}
				bot.call_command(info, info_cmd.toLowerCase(), info_msg);
			}
		}
	}

	// channel specific commands
	if (bot.channel[msg.channel.id] !== undefined){
		for (i in bot.channel[msg.channel.id]) {
			new Promise((resolve, reject) => {
				let hrstart = process.hrtime();
				bot.channel[msg.channel.id][i](info);
				if (verbose.commands.successful_calls) console.log('Channel Command %d : %d', i, process.hrtime(hrstart)[1] / 1000000);
				resolve();
			});
		}
	}

	// passive commands
	for (i in bot.passive) {
		new Promise((resolve, reject) => {
			let hrstart = process.hrtime();
			bot.passive[i](info);
			if (verbose.commands.successful_calls) console.log('Passive Command %d : %d', i, process.hrtime(hrstart)[1] / 1000000);
			resolve();
		});
	}
});

//I'm not even 100% sure this works, but it's supposed to handle if the network disconnects
bot.on('error', error => {
	error_count++;
	console.log('error');
	console.log(error);
	if (error_count < 5) bot.login(config.token);
	if (error_count >= 5) setTimeout(() => {bot.login(config.token);},30000);
});

bot.login(config.token);
