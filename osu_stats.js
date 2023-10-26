require("dotenv").config();

const utils = require('./utils');
const { Client, Auth } = require('osu-web.js');
const twitch = require('./twitch');

const userId = parseInt(process.env.OSU_USER_ID);
const userOAuthId = process.env.OSU_OAUTH_CLIENT_ID;
const userOAuthSecret = process.env.OSU_OAUTH_CLIENT_SECRET;
const minimumMapRank = parseInt(process.env.OSU_MINIMUM_MAP_RANK);
const twitchChannel = process.env.TWITCH_TARGET_CHANNEL

console.log(`[${utils.getNow()}] Starting osu stats...`);

const auth = new Auth(userOAuthId, userOAuthSecret, '');
var client
(async () => {
  let token = await auth.clientCredentialsGrant();
  client = new Client(token.access_token);
  
  // get initial stats
  await getStats();
  await getRecentPlay();
})();

var lastPPStats, lastRankStats, lastRecentPlayId;
async function getStats(){
  console.log(`[${utils.getNow()}] getting stats`);

  let userStats = await client.users.getUser(userId, {
    urlParams: { mode: 'osu' }
  });

  let pp = userStats.statistics.pp;
  let rank = userStats.statistics.global_rank;

  if (!lastPPStats || !lastRankStats){
    lastPPStats = pp;
    lastRankStats = rank

    console.log(`Status: ${userStats.username} #${rank}, pp: ${pp}`);
    return;
  }
  
  if (lastPPStats != pp){
    let gainedPP = Math.ceil(pp - lastPPStats)
    lastPPStats = pp
    sendTwitchMessage(`${( gainedPP > 0 ? '+'+ gainedPP : gainedPP )}pp!`);
  }
  if (lastRankStats != rank){
    let gainedRank = rank - lastRankStats
    lastRankStats = rank
    sendTwitchMessage(`Rank: #${rank} (${( gainedRank > 0 ? '+'+ gainedRank : gainedRank )})`);
  }
}
async function getRecentPlay(){
  console.log(`[${utils.getNow()}] getting recent play`);

  let recentPlay = await client.users.getUserRecentActivity(userId, {
    query: { limit:1 }
  });

  let id = recentPlay[0].id;
  if (!id) return;
  
  if (!lastRecentPlayId){
    lastRecentPlayId = id;
    console.log('lastRecentPlayId: '+ id);
    return;
  }

  if (lastRecentPlayId != id){
    lastRecentPlayId = id
    let rank = recentPlay[0].rank;
    if (rank > minimumMapRank)
      return;
    
    let user = recentPlay[0].user.username
    let map = recentPlay[0].beatmap.title
    sendTwitchMessage(`${user} achieved rank #${rank} on ${map}`);
  }
}

function sendTwitchMessage(message){
  twitch.client.say(twitchChannel, message);
}

setInterval(async () => {
  await getStats();
  await getRecentPlay();
}, parseInt(process.env.OSU_REFRESH_STATS_COOLDOWN));