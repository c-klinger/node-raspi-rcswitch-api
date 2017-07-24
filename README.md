node-raspi-rcswitch-api
=======================
[![npm version](https://badge.fury.io/js/raspi-rcswitch-api.svg)](https://badge.fury.io/js/raspi-rcswitch-api)

RESTful API for the [node-rcswitch](https://github.com/marvinroger/node-rcswitch) binding based on Node.js/restify.
Allows controlling of 433Mhz RC remote controlled power sockets with the raspberry-pi using HTTP Protocol.

## Requirements

* To use node-rcswitch, [WiringPi](https://projects.drogon.net/raspberry-pi/wiringpi/download-and-install/) must be installed in order to compile.
* Tthe data and power Pins of the transmitter must be connected to the Raspberry Pi.

## Installation
```bash
$ npm install raspi-rcswitch-api
```

## Configuration

* `transmitter_pin` defines the GIPO pin on which the transmitter is connected to the Raspberry Pi. Note the number of the WiringPi data Pin. (see http://wiringpi.com/pins/)
* `retries` number of times the signal is send (optional)

## Usage
### Starting
```bash
$ npm start

> node-raspi-rcswitch-api@0.1.0 start /home/pi/node-raspi-rcswitch-api
> node daemon.js start

raspi-rcswitch-api Server started. PID: 9082
raspi-rcswitch-api listening at port 3000
```

The server is running as deamon using [daemonize2](https://github.com/niegowski/node-daemonize2/) by default. As alternative you can start with
```bash
$ node server.js
```

### Stopping
```bash
$ npm stop
```

### Direct device access
http://host:port/api/v1/switch/systemCode/unitCode/state

* `systemCode` five character long binary system code identifying the rc switch system.
* `unitCode` integer number between 1 and 4 identifying the power socket number in the system.
* `state` can be either `on` or `off` for the target state of the power socket.

For example a GET call to `http://host:port/api/v1/switch/10101/2/on` will switch on the second power socket of the system `10101`.

### Mapped device access
You can specify named devices in the `device_config.json` file to gain quick access to them.

The following example provides access the power socket with the system code `01001` and the unit code `1` under the name `Living_Room_Ambient_Light`.
```json
{
  "Living_Room_Ambient_Light": {
    "systemCode": "01001",
    "unitCode": 1
  }
}
```

Now you can quickly access the power plug using http://host:port/api/v1/switch/Living_Room_Ambient_Light/state. For the `state` and the config values the same restrictions as mentioned in 'Direct device access' section apply.

## License
Copyright (c) 2017 Chris Klinger. Licensed under MIT license, see  [LICENSE](LICENSE) for the full license.

## Bugs
See <https://github.com/c-klinger/node-raspi-rcswitch-api/issues>.
