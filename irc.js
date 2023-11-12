require("dotenv").config();
const log = require('./utils');
var irc = require('irc');

const username = process.env.OSU_IRC_USERNAME.replace(" ", "_")
const password = process.env.OSU_IRC_PASSWORD
const options = {
	userName: username,
	password: password,
	autoConnect: false
}

log('Starting Irc...')

// Create the bot name
var client = new irc.Client("irc.ppy.sh", username, options);
client.connect()
client.join(username)

// client.addListener("message", function(from, to, text, message) {
// 	console.log(`$message ${from} ${to} ${text} ${message}`);
// });

log('Irc started!')
module.exports = (message) => client.say(username, message);