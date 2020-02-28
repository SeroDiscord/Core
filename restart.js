var sys = require('util')
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { console.log(stdout) }

var os = require('os');
//control OS
//then run command depengin on the OS

if (os.type() === 'Windows_NT')
   exec("del /F /Q wolf.sqlite && rm wulfers.log && pm2 restart WULFERS-AWESUMZ-BOT", puts);
else
    exec("rm wolf.sqlite && rm wulfers.log && pm2 restart WULFERS-AWESUMZ-BOT", puts)