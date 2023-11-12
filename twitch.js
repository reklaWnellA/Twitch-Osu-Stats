require("dotenv").config();
const log = require('./utils');
const tmi = require("tmi.js");
const fs = require("fs");
const sendIrcMessage = require("./irc");
const getBeatmapInfo = require("./osu_stats")

const commandCooldown = parseInt(process.env.COMMAND_COOLDOWN);
const beatmapRequestCooldown = parseInt(process.env.BEATMAP_REQUEST_COOLDOWN);
const commands = getCommands().map((c) => c.trim().toLowerCase());
const twitchChannel = process.env.TWITCH_TARGET_CHANNEL
const options = {
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OAUTH_PASSWORD,
  },
  channels: [twitchChannel],
};

log('Starting Twitch...');

var twitchClient = new tmi.client(options);
twitchClient.on("message", async (target, context, msg, self) => await onMessageHandler(target, context, msg, self));
twitchClient.on("connected", (addr, port) => log(`Twitch started`));
twitchClient.on("disconnected", (reason) => { log(`Twitch disconnected: ${reason}`); process.exit(1);});
twitchClient.connect();

const beatmapRegex = /https:\/\/osu\.ppy\.sh\/beatmapsets\/\d+\#osu\/(\d+)/;
var lastCommandTime, lastBeatmapRequestTime
async function onMessageHandler(target, context, msg, self) {
  // beatmap request
  if (msg.includes("https://osu.ppy.sh/beatmapsets/") && !isBeatmapRequestInCooldown()){
    let match = msg.match(beatmapRegex)
    if (!match) return

    let beatmapInfo = await getBeatmapInfo(match[1])
    if (!beatmapInfo) return

    let message = `${target} requested (${beatmapInfo.message})[${match[0]}] ${beatmapInfo.stats}`
    sendIrcMessage(message)
    log(message)
  }
  // commands
  else{
    var command = msg.trim().toLowerCase();
    if (commands.includes(command) && !isCommandInCooldown()) {
      switch (command) {
        case "!skin":
          sendMessage(target, context, process.env.SKIN_LINK);
          log('Sending !skin to ${target}');
          break;
        case "!area":
          sendMessage(target, context, process.env.AREA_LINK);
          log(`Sending !area to ${target}`);
          break;
        case "!map":
        case "!np":
          fs.readFile(process.env.OSU_NP_TEXT_FILE_PATH, "utf8",
            function (err, contents) {
              if (err) {
                log(err);
                return;
              }
              sendMessage(target, context, contents);
              log(`Sending !np to ${target}: ${contents}`);
            }
          );
          break;
        default:
          log("invalid command");
      }
    }
  }
}

function getCommands() {
  const commandsString = process.env.COMMANDS;
  if (!commandsString ||
     !commandsString.length ||
     !commandsString.trim().length)
    return ["!np"];

  const commands = commandsString.split(",");
  if (!commands.length) 
    return ["!np"];

  return commands;
}

// Helper function to send the correct type of message:
function sendMessage(target, context, message) {
  if (context["message-type"] === "whisper")
    twitchClient.whisper(target, message);
  else 
    twitchClient.say(target, message);
}
function isCommandInCooldown(){
  if (lastCommandTime && lastCommandTime + commandCooldown > Date.now())
    return true;
  lastCommandTime = Date.now();
  return false;
}
function isBeatmapRequestInCooldown(){
  if (lastBeatmapRequestTime && lastBeatmapRequestTime + beatmapRequestCooldown > Date.now())
    return true;
  lastBeatmapRequestTime = Date.now();
  return false;
}

module.exports = (message) => twitchClient.say(twitchChannel, message)