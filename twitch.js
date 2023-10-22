require("dotenv").config();

const utils = require('./utils');
const tmi = require("tmi.js");
const fs = require("fs");

var lastCommandTime;
const commandCooldown = parseInt(process.env.COMMAND_COOLDOWN);
const commands = getCommands().map((c) => c.trim().toLowerCase());

let opts = {
  identity: {
    username: process.env.TWITCH_BOT_USERNAME,
    password: process.env.TWITCH_BOT_OAUTH_PASSWORD,
  },
  channels: [process.env.TWITCH_TARGET_CHANNEL],
};

console.log(`[${utils.getNow()}] Starting osu! np bot...`);

// Helper function to send the correct type of message:
function sendMessage(target, context, message) {
  if (context["message-type"] === "whisper")
    client.whisper(target, message);
  else 
    client.say(target, message);
}

// Create a client with our options:
var client = new tmi.client(opts);

// Register our event handlers (defined below):
client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);
client.on("disconnected", onDisconnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in:
function onMessageHandler(target, context, msg, self) {
  var command = msg.trim().toLowerCase();

  if (commands.includes(command)) {
    if (lastCommandTime) {
      // command cooldown
      if (lastCommandTime + commandCooldown > Date.now()) return;
    }
    lastCommandTime = Date.now();
    switch (command) {
      case "!skin":
        sendMessage(target, context, process.env.SKIN_LINK);
        console.log(`[${utils.getNow()}] Responded to !skin from ${target}`);
        break;
      case "!area":
        sendMessage(target, context, process.env.AREA_LINK);
        console.log(`[${utils.getNow()}] Responded to !area from ${target}`);
        break;
      case "!map":
      case "!np":
        fs.readFile(
          process.env.OSU_NP_TEXT_FILE_PATH,
          "utf8",
          function (err, contents) {
            if (err) {
              utils.logError(err);
              return;
            }
            sendMessage(target, context, contents);
            console.log(`[${utils.getNow()}] Responded to !np from ${target}: ${contents}`);
          }
        );
        break;
      default:
        utils.logError("invalid command");
    }
  }
}

// Called every time the bot connects to Twitch chat:
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

// Called every time the bot disconnects from Twitch:
function onDisconnectedHandler(reason) {
  console.log(`Disconnected: ${reason}`);
  process.exit(1);
}

function getCommands() {
  const commandsString = process.env.COMMANDS;

  if (
    !commandsString ||
    !commandsString.length ||
    !commandsString.trim().length
  ) {
    return ["!np"];
  }

  const commands = commandsString.split(",");

  if (!commands.length) {
    return ["!np"];
  }

  return commands;
}

module.exports = { client };