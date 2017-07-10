'use strict'

module.exports = {
    name: 'raspi-rcswitch-api',
    version: '0.1.0',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    base_url: process.env.BASE_URL || 'http://localhost:3000',
    transmitter_pin: 0,
    retries: 5
}
