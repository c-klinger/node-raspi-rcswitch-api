'use strict'

const config        = require('./config');
const daemonize     = require("daemonize2");

var daemon = daemonize.setup({
  main: 'server.js',
  name: 'raspi-rcswitch-api',
  pidfile: 'raspircswitchapi.pid',
  silent: true
});

switch (process.argv[2]) {

  case "start":
    daemon.start();
    break;

  case "stop":
    daemon.stop();
    break;

  default:
    console.log("Usage: [start|stop]");
}

daemon.on("started", function(pid) {
  console.log("raspi-rcswitch-api Server started. PID: " + pid);
  console.log('raspi-rcswitch-api listening on port ' + config.port);
});
