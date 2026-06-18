'use strict';
const https = require('https');
const http  = require('http');

const CANDIDATES = [
  // ── STREAMING ────────────────────────────────────────────────────────────
  { id:'plex',          url:'https://status.plex.tv/api/v2/summary.json' },
  { id:'crunchyroll',   url:'https://status.crunchyroll.com/api/v2/summary.json' },
  { id:'funimation',    url:'https://status.funimation.com/api/v2/summary.json' },
  { id:'dailymotion',   url:'https://status.dailymotion.com/api/v2/summary.json' },
  { id:'deezer',        url:'https://status.deezer.com/api/v2/summary.json' },
  { id:'soundcloud',    url:'https://status.soundcloud.com/api/v2/summary.json' },
  { id:'tidal',         url:'https://status.tidal.com/api/v2/summary.json' },
  { id:'bandcamp',      url:'https://status.bandcamp.com/api/v2/summary.json' },
  { id:'anchor',        url:'https://status.anchor.fm/api/v2/summary.json' },
  { id:'buzzsprout',    url:'https://status.buzzsprout.com/api/v2/summary.json' },
  { id:'transistor',    url:'https://status.transistor.fm/api/v2/summary.json' },
  { id:'riverside',     url:'https://status.riverside.fm/api/v2/summary.json' },
  { id:'streamyard',    url:'https://status.streamyard.com/api/v2/summary.json' },
  { id:'restream',      url:'https://status.restream.io/api/v2/summary.json' },
  { id:'cloudflare_stream', url:'https://www.cloudflarestatus.com/api/v2/summary.json' },
  { id:'mux2',          url:'https://status.mux.com/api/v2/summary.json' },
  { id:'fastpix',       url:'https://status.fastpix.io/api/v2/summary.json' },
  { id:'api_video',     url:'https://status.api.video/api/v2/summary.json' },
  // ── GAMING ───────────────────────────────────────────────────────────────
  { id:'steam',         url:'https://steamstat.us/api/v2/summary.json' },
  { id:'steam2',        url:'https://status.steampowered.com/api/v2/summary.json' },
  { id:'playstation',   url:'https://status.playstation.com/api/v2/summary.json' },
  { id:'xbox',          url:'https://status.xbox.com/api/v2/summary.json' },
  { id:'nintendo',      url:'https://status.nintendo.com/api/v2/summary.json' },
  { id:'riot',          url:'https://status.riotgames.com/api/v2/summary.json' },
  { id:'valorant',      url:'https://status.riotgames.com/api/v2/summary.json' },
  { id:'leagueoflegends', url:'https://status.leagueoflegends.com/api/v2/summary.json' },
  { id:'minecraft',     url:'https://status.minecraft.net/api/v2/summary.json' },
  { id:'mojang',        url:'https://status.mojang.com/api/v2/summary.json' },
  { id:'battlenet',     url:'https://status.battle.net/api/v2/summary.json' },
  { id:'blizzard',      url:'https://status.blizzard.com/api/v2/summary.json' },
  { id:'ubisoft',       url:'https://status.ubisoft.com/api/v2/summary.json' },
  { id:'2k',            url:'https://status.2k.com/api/v2/summary.json' },
  { id:'activision',    url:'https://status.activision.com/api/v2/summary.json' },
  { id:'warzone',       url:'https://status.activision.com/api/v2/summary.json' },
  { id:'genshin',       url:'https://status.hoyoverse.com/api/v2/summary.json' },
  { id:'hoyoverse',     url:'https://status.hoyoverse.com/api/v2/summary.json' },
  { id:'path_of_exile', url:'https://status.pathofexile.com/api/v2/summary.json' },
  { id:'poe2',          url:'https://status.pathofexile.com/api/v2/summary.json' },
  { id:'square_enix',   url:'https://status.na.square-enix.com/api/v2/summary.json' },
  { id:'finalfantasy',  url:'https://na.finalfantasyxiv.com/api/v2/summary.json' },
  { id:'runescape',     url:'https://status.runescape.com/api/v2/summary.json' },
  { id:'oldschool_rs',  url:'https://status.runescape.com/api/v2/summary.json' },
  { id:'guild_wars',    url:'https://status.guildwars2.com/api/v2/summary.json' },
  { id:'rockstar',      url:'https://status.rockstargames.com/api/v2/summary.json' },
  { id:'gta_online',    url:'https://status.rockstargames.com/api/v2/summary.json' },
  { id:'bungie',        url:'https://www.bungie.net/api/v2/summary.json' },
  { id:'destiny2',      url:'https://www.bungie.net/Platform/Status/' },
  { id:'fortnite',      url:'https://status.epicgames.com/api/v2/summary.json' },
  { id:'hypixel',       url:'https://status.hypixel.net/api/v2/summary.json' },
  { id:'curseforge',    url:'https://status.curseforge.com/api/v2/summary.json' },
  { id:'overwolf',      url:'https://status.overwolf.com/api/v2/summary.json' },
  { id:'faceit',        url:'https://status.faceit.com/api/v2/summary.json' },
  { id:'esea',          url:'https://status.esea.net/api/v2/summary.json' },
  { id:'gog',           url:'https://status.gog.com/api/v2/summary.json' },
  { id:'itch_io',       url:'https://status.itch.io/api/v2/summary.json' },
  { id:'game_jolt',     url:'https://status.gamejolt.com/api/v2/summary.json' },
  { id:'newgrounds',    url:'https://status.newgrounds.com/api/v2/summary.json' },
];

function fetchUrl(url, redirectsLeft) {
  if (redirectsLeft === undefined) redirectsLeft = 5;
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'statuswatch-api/1.0' },
      timeout: 8000
    }, res => {
      if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location && redirectsLeft > 0) {
        res.resume();
        const next = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
        return resolve(fetchUrl(next, redirectsLeft - 1));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch(e) { reject(new Error('JSON parse error')); }
      });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
  });
}

(async () => {
  const BATCH = 10;
  const ok = [], fail = [];
  for (let i = 0; i < CANDIDATES.length; i += BATCH) {
    const batch = CANDIDATES.slice(i, i + BATCH);
    const results = await Promise.allSettled(batch.map(async s => {
      try {
        const data = await fetchUrl(s.url);
        const isStatuspage = data.status && data.status.indicator !== undefined;
        const isSlack = data.status && data.status.emoji !== undefined;
        if (isStatuspage || isSlack) return { ...s, ok: true };
        return { ...s, ok: false, err: 'unexpected JSON' };
      } catch(e) {
        return { ...s, ok: false, err: e.message };
      }
    }));
    results.forEach(r => r.status === 'fulfilled' && (r.value.ok ? ok : fail).push(r.value));
    if (i + BATCH < CANDIDATES.length) await new Promise(r => setTimeout(r, 300));
  }
  console.log('=== OK (' + ok.length + ') ===');
  ok.forEach(s => console.log('OK|' + s.id + '|' + s.url));
  console.log('=== FAIL (' + fail.length + ') ===');
  fail.forEach(s => console.log('FAIL|' + s.id + '|' + s.err));
})();
