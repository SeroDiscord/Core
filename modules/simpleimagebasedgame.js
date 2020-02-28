const jimp = require('jimp');
const Discord = require('discord.js');
const fs = require('fs');

const TILE_COUNT = 2; //number of tiles vertical and horizontal must be equal
const TILE_SIZE = 16;  //width and height of tiles must be equal
const MAP_SIZE = 13;
const DEFAULT_POS = 84;   // starting player position
const TILES = {
    NONE : '0',
    GRASS : '1',
    LADY : '2',
    TREE : '3',
    STRAW : '4'
}
const STATE = {
    ROAM : "Roaming...",
    BLOCKED : "Uh oh! You're blocked!"
}
const CONTROLS = {
    ROAM : {
        LEFT : '◀',
        UP : '🔼',
        DOWN : '🔽',
        RIGHT : '▶'
    }
}
let map = {
    test_one : {
        base:       "1111111111111111111111111111444444444111144444444411114444444441111444444444111111111111111114444444441111444444444111144444444411114444444441111111111111111111111111111",
        layer:      "3333333333333300000000000330000000000033000000000003300000000000330000030000033000000000003300000000000330000000000033000000000003300000000000330000000000033333333333333"
    }
}
let sessions = {};  //contains all player sessions in progress

module.exports = {

declare : function(bot) {
    // set up table if there is none
    bot.add_command(bot, "simpleimagebasedgamestart", setup);
}

}

function replaceAt(str, index, replacement) {
    console.log(`${str}.substring(${index}, ${replacement.length}) = ${str.substring(index + replacement.length)}`)
    return str.substr(0, index) + replacement+ str.substring(index + replacement.length);
}

function setup(info) {
    if (sessions[info.message.author.id]== undefined) sessions[info.message.author.id] = {
        pos : DEFAULT_POS,
        map : map.test_one,
        state : STATE.ROAM
    };

    info.message.channel.send("....Booting up....").then(message => {
        sessions[info.message.author.id]['message'] = message.id;
        sessions[info.message.author.id]['channel'] = message.channel.id;
        generateImage(sessions[info.message.author.id],info);
    })
}//end setup

function generateImage(session,info) {
    map = [session.map.base,session.map.layer,replaceAt("0".repeat(MAP_SIZE*MAP_SIZE),session.pos,TILES.LADY)];
    console.log(map[2]);
    jimp.read('./modules/simpleimagebasedgame/tilesheet.png').then(tileimg =>{
        new jimp(MAP_SIZE*TILE_SIZE,MAP_SIZE*TILE_SIZE, (err,field) => {
            for (h in map) {
                for (let i = 0; i < MAP_SIZE*MAP_SIZE; i++) {
                    let x = i%MAP_SIZE;
                    let y = Math.floor(i/MAP_SIZE);
                    let piece = parseInt(map[h].charAt(i))-1;
                    if (piece >= 0) {
                        field.blit(tileimg,
                            x*TILE_SIZE,
                            y*TILE_SIZE,
                            piece%TILE_COUNT*TILE_SIZE,
                            Math.floor(piece/TILE_COUNT)*TILE_SIZE,
                            TILE_SIZE,TILE_SIZE
                        );
                    }
                }
            }
            field.write('./modules/simpleimagebasedgame/img.png');
            let chan = info.bot.channels.get(session.channel);
            chan.fetchMessage(session.message).then(oldmessage => {
                info.bot.remove_reactionadd_single_message(info.bot,oldmessage.id);
                oldmessage.delete();
                chan.send(new Discord.RichEmbed()
                .setTitle(session.state)
                .attachFiles(['./modules/simpleimagebasedgame/img.png'])
                .setImage('attachment://./modules/simpleimagebasedgame/img.png')
                ).then(message => addControls(info,session,message));
            });
        });
    });
}//end generateImage

//add controls
function addControls(info,session,message) {
    if (session.state == STATE.ROAM || session.state == STATE.BLOCKED) {
        message.react(CONTROLS.ROAM.LEFT).then(r => {
            message.react(CONTROLS.ROAM.UP).then(r =>{
                message.react(CONTROLS.ROAM.DOWN).then(r =>{
                    message.react(CONTROLS.ROAM.RIGHT).then(r => {
                        //this is where I'll set up to deal with reactions
                        info.bot.add_reactionadd_single_message(info.bot,message.id,roam);
                        session.message = message.id;
                    })
                })
            })
        })
    }
}

function roam(info) {
    if (sessions[info.user.id] === undefined) return;
    console.log(sessions[info.user.id].message)
    console.log(info.reaction.message.id)
    if (sessions[info.user.id].message !== info.reaction.message.id) return;
    
    sessions[info.user.id].state = STATE.ROAM;
    switch (info.reaction.emoji.name) {
        case CONTROLS.ROAM.LEFT:
            if (sessions[info.user.id].pos % MAP_SIZE !== 0 && sessions[info.user.id].map.layer.charAt(sessions[info.user.id].pos-1) == 0) {
                sessions[info.user.id].pos -= 1;
            } else {
                sessions[info.user.id].state = STATE.BLOCKED;
            }
            break;
        case CONTROLS.ROAM.RIGHT:
            if (sessions[info.user.id].pos % MAP_SIZE !== MAP_SIZE-1 && sessions[info.user.id].map.layer.charAt(sessions[info.user.id].pos+1) == 0) {
                sessions[info.user.id].pos += 1;
            } else {
                sessions[info.user.id].state = STATE.BLOCKED;
            }
            break;
        case CONTROLS.ROAM.UP:
            if (sessions[info.user.id].pos - MAP_SIZE >= 0 && sessions[info.user.id].map.layer.charAt(sessions[info.user.id].pos-MAP_SIZE) == 0) {
                sessions[info.user.id].pos -= MAP_SIZE;
            } else {
                sessions[info.user.id].state = STATE.BLOCKED;
            }
            break;
        case CONTROLS.ROAM.DOWN:
            if (sessions[info.user.id].pos + MAP_SIZE < MAP_SIZE*MAP_SIZE && sessions[info.user.id].map.layer.charAt(sessions[info.user.id].pos+MAP_SIZE) == 0) {
                sessions[info.user.id].pos += MAP_SIZE;
            } else {
                sessions[info.user.id].state = STATE.BLOCKED;
            }
            break;
    }
    generateImage(sessions[info.user.id],info);
}