'use strict'

/**
 * Module Dependencies
 */
const config        = require('./config');
const fs            = require('fs');
const restify       = require('restify');
const errors        = require('restify-errors');
const bunyan        = require('bunyan');
const winston       = require('winston');
const bunyanWinston = require('bunyan-winston-adapter');
const rcswitch      = require('rcswitch');
const path          = require('path');

/**
 * Logging
 */
// workaround for https://github.com/winstonjs/winston/issues/875
if (!fs.existsSync(path.join(__dirname, "logs"))) {
   fs.mkdirSync(path.join(__dirname, "logs"));
}

global.logger = new winston.Logger({
    transports: [
        new winston.transports.File({
          filename: path.join(__dirname, "logs", "info.log"),
          level: 'info',
          timestamp: true
        })
    ]
})

/**
 * Initialize Server
 */
global.server = restify.createServer({
    name    : config.name,
    version : config.version,
    log     : bunyanWinston.createAdapter(logger),
})

/**
 * Initialize 443mhz Transmitter
 */
rcswitch.enableTransmit(config.transmitter_pin);

/**
 * Error Handling
 */
server.on('uncaughtException', (req, res, route, err) => {
    logger.error(err.stack)
    res.send(err)
});

/**
 * Lift Server & Bind Routes
 */
server.listen(config.port, function() {
  logger.info('raspi-rcswitch-api Server listening on port ' + config.port);
  logger.info('Using configuration:');
  logger.info('config.transmitter_pin: ' + config.transmitter_pin);
  logger.info('config.reties:          ' + config.retries);
});

server.get('/api/v1/switch/:systemCode/:unitCode/:state', switchFunction);
server.get('/api/v1/switch/:deviceName/:state', mappedSwitchFunction);

/**
 * Route functions
 */
function switchFunction(request, response, next){
  // Argument validation
  if(request.params.systemCode.length != 5 || !isBinaryString(request.params.systemCode)) {
    return next(new errors.InvalidArgumentError("The systen code have to be a 5 character long binary string"));
  }

  if(isNaN(request.params.unitCode) || parseInt(request.params.unitCode) < 1 || parseInt(request.params.unitCode) > 4) {
    return next(new errors.InvalidArgumentError("The unit code have to be an number between 1 and 4."));
  }

  if(!request.params.state || (request.params.state != 'on' && request.params.state != 'off')) {
    return next(new errors.InvalidArgumentError("The new state have to be either 'on' or 'off'."));
  }

  switchUnit(request.params.systemCode, parseInt(request.params.unitCode), request.params.state);

  response.send({"systemCode:": request.params.systemCode, "systemCode:": request.params.unitCode, "state": request.params.state});
  next();
}

function mappedSwitchFunction(request, response, next){
  var switchConfig = JSON.parse(fs.readFileSync('device_config.json', 'utf8'));

  // Argument validation
  if(switchConfig[request.params.deviceName]) {
    if(switchConfig[request.params.deviceName].systemCode.length != 5 || !isBinaryString(switchConfig[request.params.deviceName].systemCode)) {
      return next(new errors.InvalidArgumentError("The systen code have to be a 5 character long binary string"));
    }

    if(isNaN(switchConfig[request.params.deviceName].unitCode) || parseInt(switchConfig[request.params.deviceName].unitCode) < 1 || parseInt(switchConfig[request.params.deviceName].unitCode) > 4) {
      return next(new errors.InvalidArgumentError("The unit code have to be an number between 1 and 4."));
    }
  } else {
    return next(new errors.InternalError("Configuration file 'device_config.json' doesn't define such a device or is missing."));
  }

  if(!request.params.state || (request.params.state != 'on' && request.params.state != 'off')) {
    return next(new errors.InvalidArgumentError("The new state have to be either 'on' or 'off'."));
  }

  switchUnit(switchConfig[request.params.deviceName].systemCode, parseInt(switchConfig[request.params.deviceName].unitCode), request.params.state);

  response.send('{"systemCode:" '+switchConfig[request.params.deviceName].systemCode+',"systemCode:" '+switchConfig[request.params.deviceName].unitCode+',"state": '+request.params.state+'}');
  next();
}

/**
 * Logic functions
 */
function switchUnit(systemCode, unitCode, state) {
  logger.info('switchUnit: systemCode='+systemCode+', unitCode='+unitCode+', state='+state);

  var retries = config.retries ? config.retries : 1;
  var currentTry = 0;
  var intervalObj = setInterval((systemCode, unitCode) => {
    logger.debug('switchUnit: systemCode='+systemCode+', unitCode='+unitCode+', state='+state+', try='+currentTry);

    if(state === 'on') {
      rcswitch.switchOn(systemCode, unitCode);
    } else if(state === 'off') {
      rcswitch.switchOff(systemCode, unitCode);
    }

    if(++currentTry == retries) {
      clearInterval(intervalObj);
    }
  }, 100, systemCode, unitCode);
}

/**
 * Help functions
 */
function isBinaryString(input) {
  for (var i = 0; i < input.length; i++) {
    if(!(input[i] === '1' ||  input[i] === '0')) {
      return false;
    }
  }
  return true;
}
