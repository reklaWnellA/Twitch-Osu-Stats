require("dotenv").config();
const log = require('./utils');
const { Client, Auth } = require('osu-web.js');
const sendTwitchMessage = require('./twitch');

const userId = parseInt(process.env.OSU_USER_ID);
const userOAuthId = process.env.OSU_OAUTH_CLIENT_ID;
const userOAuthSecret = process.env.OSU_OAUTH_CLIENT_SECRET;
const minimumMapRank = parseInt(process.env.OSU_MINIMUM_MAP_RANK);
const auth = new Auth(userOAuthId, userOAuthSecret, '');
var client

log('Starting Osu Stats...');

(async () => {
  let token = await auth.clientCredentialsGrant();
  client = new Client(token.access_token);
  
  // get initial stats
  await getStats();
  await getRecentPlay();
  
  log('Osu Stats started!')
})();

var lastPPStats, lastRankStats, lastRecentPlayId;
async function getStats(){
  let userStats = await client.users.getUser(userId, {
    urlParams: { mode: 'osu' }
  });

  let pp = userStats.statistics.pp;
  let rank = userStats.statistics.global_rank;

  if (!lastPPStats || !lastRankStats){
    lastPPStats = pp;
    lastRankStats = rank

    log(`Osu Stats: ${userStats.username} #${rank}, pp: ${pp}`);
    return;
  }
  
  if (lastPPStats != pp){
    let gainedPP = Math.ceil(pp - lastPPStats)
    lastPPStats = pp
    if (gainedPP != 0) // filter 0 pp messages
      sendTwitchMessage(`${( gainedPP > 0 ? '+'+ gainedPP : gainedPP )}pp!`);
  }
  if (lastRankStats != rank){
    let gainedRank = rank - lastRankStats
    lastRankStats = rank
    sendTwitchMessage(`Rank: #${rank} (${( gainedRank > 0 ? '-' + gainedRank : '+' + gainedRank )})`);
  }
}
async function getRecentPlay(){
  let recentPlay = await client.users.getUserRecentActivity(userId, {
    query: { limit:1 }
  });

  let id = recentPlay[0].id;
  if (!id) return;
  
  if (!lastRecentPlayId){
    lastRecentPlayId = id;
    return;
  }

  if (lastRecentPlayId != id){
    lastRecentPlayId = id
    let rank = recentPlay[0].rank;
    if (rank > minimumMapRank)
      return;
    
    let user = recentPlay[0].user.username
    let map = recentPlay[0].beatmap.title
    let message = `${user} achieved rank #${rank} on ${map}`
    sendTwitchMessage(message);
    log(message)
  }
}

async function getBeatmapInfo(beatmapId){
  log(`Getting beatmap info: ${beatmapId}`)
  let info
  try {
    info = await client.beatmaps.getBeatmap(parseInt(beatmapId));
  } catch (e) {
    log('An error occurred while trying to get beatmap information')
  }
  
  if (!info) return

  let artist = info.beatmapset.artist;
  let title = info.beatmapset.title;
  let diff = info.version;
  let status = info.status
  let stars = info.difficulty_rating
  let bpm = info.bpm
  let ar = info.ar
  let od = info.accuracy
  let cs = info.cs
  let hp = info.drain
  
  return {
    message: `${artist} - ${title} [${diff}]`,
    stats: `${status} | ★ ${stars} | BPM ${bpm} | AR ${ar} | OD ${od} | CS ${cs} | HP ${hp}`
  }
}

setInterval(async () => {
  await getStats();
  await getRecentPlay();
}, parseInt(process.env.OSU_REFRESH_STATS_COOLDOWN));

module.exports = getBeatmapInfo