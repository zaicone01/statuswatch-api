'use strict';

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const SERVICES = [
  // ── CLOUD ────────────────────────────────────────────────────────────────
  { id:'cloudflare',   name:'Cloudflare',          cat:'Cloud',      type:'statuspage', url:'https://www.cloudflarestatus.com/api/v2/summary.json',                statusPageUrl:'https://www.cloudflarestatus.com' },
  { id:'digitalocean', name:'DigitalOcean',        cat:'Cloud',      type:'statuspage', url:'https://status.digitalocean.com/api/v2/summary.json',                statusPageUrl:'https://status.digitalocean.com' },
  { id:'linode',       name:'Akamai / Linode',     cat:'Cloud',      type:'statuspage', url:'https://status.linode.com/api/v2/summary.json',                      statusPageUrl:'https://status.linode.com' },
  { id:'fastly',       name:'Fastly',              cat:'Cloud',      type:'statuspage', url:'https://status.fastly.com/api/v2/summary.json',                      statusPageUrl:'https://status.fastly.com' },
  { id:'fly_io',       name:'Fly.io',              cat:'Cloud',      type:'statuspage', url:'https://status.flyio.net/api/v2/summary.json',                       statusPageUrl:'https://status.flyio.net' },
  { id:'scaleway',     name:'Scaleway',            cat:'Cloud',      type:'statuspage', url:'https://status.scaleway.com/api/v2/summary.json',                    statusPageUrl:'https://status.scaleway.com' },
  { id:'bunny_cdn',    name:'Bunny CDN',           cat:'Cloud',      type:'statuspage', url:'https://status.bunny.net/api/v2/summary.json',                       statusPageUrl:'https://status.bunny.net' },
  // ── CHAT ─────────────────────────────────────────────────────────────────
  { id:'slack',        name:'Slack',               cat:'Chat',       type:'slack',      url:'https://status.slack.com/api/v2.0.0/current',                        statusPageUrl:'https://status.slack.com' },
  { id:'zoom',         name:'Zoom',                cat:'Chat',       type:'statuspage', url:'https://status.zoom.us/api/v2/summary.json',                         statusPageUrl:'https://status.zoom.us' },
  { id:'discord',      name:'Discord',             cat:'Chat',       type:'statuspage', url:'https://discordstatus.com/api/v2/summary.json',                      statusPageUrl:'https://discordstatus.com' },
  { id:'loom',         name:'Loom',                cat:'Chat',       type:'statuspage', url:'https://www.loomstatus.com/api/v2/summary.json',                     statusPageUrl:'https://www.loomstatus.com' },
  // ── SOCIAL ───────────────────────────────────────────────────────────────
  { id:'reddit',       name:'Reddit',              cat:'Social',     type:'statuspage', url:'https://www.redditstatus.com/api/v2/summary.json',                   statusPageUrl:'https://www.redditstatus.com' },
  { id:'twitch',       name:'Twitch',              cat:'Social',     type:'statuspage', url:'https://status.twitch.tv/api/v2/summary.json',                       statusPageUrl:'https://status.twitch.tv' },
  // ── STREAMING ────────────────────────────────────────────────────────────
  { id:'spotify',      name:'Spotify',             cat:'Streaming',  type:'statuspage', url:'https://www.spotifystatus.com/api/v2/summary.json',                  statusPageUrl:'https://www.spotifystatus.com' },
  // ── IA ───────────────────────────────────────────────────────────────────
  { id:'openai',       name:'OpenAI / ChatGPT',    cat:'IA',         type:'statuspage', url:'https://status.openai.com/api/v2/summary.json',                      statusPageUrl:'https://status.openai.com' },
  { id:'anthropic',    name:'Anthropic / Claude',  cat:'IA',         type:'statuspage', url:'https://status.anthropic.com/api/v2/summary.json',                   statusPageUrl:'https://status.anthropic.com' },
  { id:'huggingface',  name:'Hugging Face',        cat:'IA',         type:'statuspage', url:'https://status.huggingface.co/api/v2/summary.json',                  statusPageUrl:'https://status.huggingface.co' },
  { id:'replicate',    name:'Replicate',           cat:'IA',         type:'statuspage', url:'https://www.replicatestatus.com/api/v2/summary.json',                statusPageUrl:'https://www.replicatestatus.com' },
  { id:'cohere',       name:'Cohere',              cat:'IA',         type:'statuspage', url:'https://status.cohere.com/api/v2/summary.json',                      statusPageUrl:'https://status.cohere.com' },
  { id:'groq',         name:'Groq',                cat:'IA',         type:'statuspage', url:'https://groqstatus.com/api/v2/summary.json',                         statusPageUrl:'https://groqstatus.com' },
  { id:'elevenlabs',   name:'ElevenLabs',          cat:'IA',         type:'statuspage', url:'https://status.elevenlabs.io/api/v2/summary.json',                   statusPageUrl:'https://status.elevenlabs.io' },
  { id:'pinecone',     name:'Pinecone',            cat:'IA',         type:'statuspage', url:'https://status.pinecone.io/api/v2/summary.json',                     statusPageUrl:'https://status.pinecone.io' },
  // ── DEV ──────────────────────────────────────────────────────────────────
  { id:'github',       name:'GitHub',              cat:'Dev',        type:'statuspage', url:'https://www.githubstatus.com/api/v2/summary.json',                   statusPageUrl:'https://www.githubstatus.com' },
  { id:'vercel',       name:'Vercel',              cat:'Dev',        type:'statuspage', url:'https://www.vercel-status.com/api/v2/summary.json',                  statusPageUrl:'https://www.vercel-status.com' },
  { id:'netlify',      name:'Netlify',             cat:'Dev',        type:'statuspage', url:'https://www.netlifystatus.com/api/v2/summary.json',                  statusPageUrl:'https://www.netlifystatus.com' },
  { id:'bitbucket',    name:'Bitbucket',           cat:'Dev',        type:'statuspage', url:'https://bitbucket.status.atlassian.com/api/v2/summary.json',         statusPageUrl:'https://bitbucket.status.atlassian.com' },
  { id:'jira',         name:'Jira',                cat:'Dev',        type:'statuspage', url:'https://jira-software.status.atlassian.com/api/v2/summary.json',     statusPageUrl:'https://jira-software.status.atlassian.com' },
  { id:'confluence',   name:'Confluence',          cat:'Dev',        type:'statuspage', url:'https://confluence.status.atlassian.com/api/v2/summary.json',        statusPageUrl:'https://confluence.status.atlassian.com' },
  { id:'npm',          name:'npm Registry',        cat:'Dev',        type:'statuspage', url:'https://status.npmjs.org/api/v2/summary.json',                       statusPageUrl:'https://status.npmjs.org' },
  { id:'circleci',     name:'CircleCI',            cat:'Dev',        type:'statuspage', url:'https://status.circleci.com/api/v2/summary.json',                    statusPageUrl:'https://status.circleci.com' },
  { id:'sentry',       name:'Sentry',              cat:'Dev',        type:'statuspage', url:'https://status.sentry.io/api/v2/summary.json',                       statusPageUrl:'https://status.sentry.io' },
  { id:'datadog',      name:'Datadog',             cat:'Dev',        type:'statuspage', url:'https://status.datadoghq.com/api/v2/summary.json',                   statusPageUrl:'https://status.datadoghq.com' },
  { id:'linear',       name:'Linear',              cat:'Dev',        type:'statuspage', url:'https://linearstatus.com/api/v2/summary.json',                       statusPageUrl:'https://linearstatus.com' },
  { id:'twilio',       name:'Twilio',              cat:'Dev',        type:'statuspage', url:'https://status.twilio.com/api/v2/summary.json',                      statusPageUrl:'https://status.twilio.com' },
  { id:'supabase',     name:'Supabase',            cat:'Dev',        type:'statuspage', url:'https://status.supabase.com/api/v2/summary.json',                    statusPageUrl:'https://status.supabase.com' },
  { id:'planetscale',  name:'PlanetScale',         cat:'Dev',        type:'statuspage', url:'https://www.planetscalestatus.com/api/v2/summary.json',              statusPageUrl:'https://www.planetscalestatus.com' },
  { id:'render',       name:'Render',              cat:'Dev',        type:'statuspage', url:'https://status.render.com/api/v2/summary.json',                      statusPageUrl:'https://status.render.com' },
  { id:'retool',       name:'Retool',              cat:'Dev',        type:'statuspage', url:'https://status.retool.com/api/v2/summary.json',                      statusPageUrl:'https://status.retool.com' },
  { id:'newrelic',     name:'New Relic',           cat:'Dev',        type:'statuspage', url:'https://status.newrelic.com/api/v2/summary.json',                    statusPageUrl:'https://status.newrelic.com' },
  { id:'elastic',      name:'Elastic Cloud',       cat:'Dev',        type:'statuspage', url:'https://status.elastic.co/api/v2/summary.json',                      statusPageUrl:'https://status.elastic.co' },
  { id:'confluent',    name:'Confluent Cloud',     cat:'Dev',        type:'statuspage', url:'https://status.confluent.cloud/api/v2/summary.json',                 statusPageUrl:'https://status.confluent.cloud' },
  { id:'snowflake',    name:'Snowflake',           cat:'Dev',        type:'statuspage', url:'https://status.snowflake.com/api/v2/summary.json',                   statusPageUrl:'https://status.snowflake.com' },
  { id:'fivetran',     name:'Fivetran',            cat:'Dev',        type:'statuspage', url:'https://status.fivetran.com/api/v2/summary.json',                    statusPageUrl:'https://status.fivetran.com' },
  { id:'dbt_cloud',    name:'dbt Cloud',           cat:'Dev',        type:'statuspage', url:'https://status.getdbt.com/api/v2/summary.json',                      statusPageUrl:'https://status.getdbt.com' },
  { id:'mongodb_atlas',name:'MongoDB Atlas',       cat:'Dev',        type:'statuspage', url:'https://status.mongodb.com/api/v2/summary.json',                     statusPageUrl:'https://status.mongodb.com' },
  { id:'segment',      name:'Segment',             cat:'Dev',        type:'statuspage', url:'https://status.segment.com/api/v2/summary.json',                     statusPageUrl:'https://status.segment.com' },
  { id:'pusher',       name:'Pusher',              cat:'Dev',        type:'statuspage', url:'https://status.pusher.com/api/v2/summary.json',                      statusPageUrl:'https://status.pusher.com' },
  { id:'ably',         name:'Ably',                cat:'Dev',        type:'statuspage', url:'https://status.ably.com/api/v2/summary.json',                        statusPageUrl:'https://status.ably.com' },
  { id:'liveblocks',   name:'Liveblocks',          cat:'Dev',        type:'statuspage', url:'https://liveblocks.statuspage.io/api/v2/summary.json',               statusPageUrl:'https://liveblocks.statuspage.io' },
  { id:'cloudinary',   name:'Cloudinary',          cat:'Dev',        type:'statuspage', url:'https://status.cloudinary.com/api/v2/summary.json',                  statusPageUrl:'https://status.cloudinary.com' },
  // ── PRODUCTIVIDAD ────────────────────────────────────────────────────────
  { id:'notion',       name:'Notion',              cat:'Productiv.', type:'statuspage', url:'https://www.notion-status.com/api/v2/summary.json',                  statusPageUrl:'https://status.notion.so' },
  { id:'figma',        name:'Figma',               cat:'Design',     type:'statuspage', url:'https://status.figma.com/api/v2/summary.json',                       statusPageUrl:'https://status.figma.com' },
  { id:'trello',       name:'Trello',              cat:'Productiv.', type:'statuspage', url:'https://trello.status.atlassian.com/api/v2/summary.json',            statusPageUrl:'https://trello.status.atlassian.com' },
  { id:'monday',       name:'Monday.com',          cat:'Productiv.', type:'statuspage', url:'https://status.monday.com/api/v2/summary.json',                      statusPageUrl:'https://status.monday.com' },
  { id:'dropbox',      name:'Dropbox',             cat:'Productiv.', type:'statuspage', url:'https://status.dropbox.com/api/v2/summary.json',                     statusPageUrl:'https://status.dropbox.com' },
  { id:'airtable',     name:'Airtable',            cat:'Productiv.', type:'statuspage', url:'https://status.airtable.com/api/v2/summary.json',                    statusPageUrl:'https://status.airtable.com' },
  { id:'hubspot',      name:'HubSpot',             cat:'Productiv.', type:'statuspage', url:'https://status.hubspot.com/api/v2/summary.json',                     statusPageUrl:'https://status.hubspot.com' },
  { id:'miro',         name:'Miro',                cat:'Productiv.', type:'statuspage', url:'https://status.miro.com/api/v2/summary.json',                        statusPageUrl:'https://status.miro.com' },
  { id:'shortcut',     name:'Shortcut',            cat:'Productiv.', type:'statuspage', url:'https://status.shortcut.com/api/v2/summary.json',                    statusPageUrl:'https://status.shortcut.com' },
  { id:'coda',         name:'Coda',                cat:'Productiv.', type:'statuspage', url:'https://status.coda.io/api/v2/summary.json',                         statusPageUrl:'https://status.coda.io' },
  { id:'box',          name:'Box',                 cat:'Productiv.', type:'statuspage', url:'https://status.box.com/api/v2/summary.json',                         statusPageUrl:'https://status.box.com' },
  { id:'typeform',     name:'Typeform',            cat:'Productiv.', type:'statuspage', url:'https://status.typeform.com/api/v2/summary.json',                    statusPageUrl:'https://status.typeform.com' },
  { id:'webflow',      name:'Webflow',             cat:'Productiv.', type:'statuspage', url:'https://status.webflow.com/api/v2/summary.json',                     statusPageUrl:'https://status.webflow.com' },
  { id:'helpscout',    name:'Help Scout',          cat:'Productiv.', type:'statuspage', url:'https://status.helpscout.net/api/v2/summary.json',                   statusPageUrl:'https://status.helpscout.net' },
  // ── EMAIL ────────────────────────────────────────────────────────────────
  { id:'sendgrid',     name:'SendGrid',            cat:'Email',      type:'statuspage', url:'https://status.sendgrid.com/api/v2/summary.json',                    statusPageUrl:'https://status.sendgrid.com' },
  { id:'braze',        name:'Braze',               cat:'Email',      type:'statuspage', url:'https://status.braze.com/api/v2/summary.json',                       statusPageUrl:'https://status.braze.com' },
  { id:'iterable',     name:'Iterable',            cat:'Email',      type:'statuspage', url:'https://status.iterable.com/api/v2/summary.json',                    statusPageUrl:'https://status.iterable.com' },
  // ── PAGOS ────────────────────────────────────────────────────────────────
  { id:'wise',         name:'Wise',                cat:'Pagos',      type:'statuspage', url:'https://status.wise.com/api/v2/summary.json',                        statusPageUrl:'https://status.wise.com' },
  { id:'coinbase',     name:'Coinbase',            cat:'Pagos',      type:'statuspage', url:'https://status.coinbase.com/api/v2/summary.json',                    statusPageUrl:'https://status.coinbase.com' },
  { id:'plaid',        name:'Plaid',               cat:'Pagos',      type:'statuspage', url:'https://status.plaid.com/api/v2/summary.json',                       statusPageUrl:'https://status.plaid.com' },
  { id:'klarna',       name:'Klarna',              cat:'Pagos',      type:'statuspage', url:'https://status.klarna.com/api/v2/summary.json',                      statusPageUrl:'https://status.klarna.com' },
  { id:'chargebee',    name:'Chargebee',           cat:'Pagos',      type:'statuspage', url:'https://status.chargebee.com/api/v2/summary.json',                   statusPageUrl:'https://status.chargebee.com' },
  { id:'brex',         name:'Brex',                cat:'Pagos',      type:'statuspage', url:'https://status.brex.com/api/v2/summary.json',                        statusPageUrl:'https://status.brex.com' },
  { id:'amplitude',    name:'Amplitude',           cat:'Analytics',  type:'statuspage', url:'https://status.amplitude.com/api/v2/summary.json',                   statusPageUrl:'https://status.amplitude.com' },
  { id:'mixpanel',     name:'Mixpanel',            cat:'Analytics',  type:'statuspage', url:'https://status.mixpanel.com/api/v2/summary.json',                    statusPageUrl:'https://status.mixpanel.com' },
  // ── GAMING ───────────────────────────────────────────────────────────────
  { id:'epicgames',    name:'Epic Games',          cat:'Gaming',     type:'statuspage', url:'https://status.epicgames.com/api/v2/summary.json',                   statusPageUrl:'https://status.epicgames.com' },
  // ── E-COMMERCE ───────────────────────────────────────────────────────────
  { id:'shopify',      name:'Shopify',             cat:'E-com',      type:'statuspage', url:'https://www.shopifystatus.com/api/v2/summary.json',                  statusPageUrl:'https://www.shopifystatus.com' },
  { id:'squarespace',  name:'Squarespace',         cat:'E-com',      type:'statuspage', url:'https://status.squarespace.com/api/v2/summary.json',                 statusPageUrl:'https://status.squarespace.com' },
  { id:'wix',          name:'Wix',                 cat:'E-com',      type:'statuspage', url:'https://status.wix.com/api/v2/summary.json',                         statusPageUrl:'https://status.wix.com' },
  { id:'xero',         name:'Xero',                cat:'E-com',      type:'statuspage', url:'https://status.xero.com/api/v2/summary.json',                        statusPageUrl:'https://status.xero.com' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
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
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('JSON parse error')); }
      });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
  });
}

function mapIndicator(ind) {
  if (!ind) return 'ok';
  switch (ind.toLowerCase()) {
    case 'none':        return 'ok';
    case 'minor':       return 'minor';
    case 'major':
    case 'critical':    return 'major';
    case 'maintenance': return 'maintenance';
    default:            return 'ok';
  }
}

function sanitize(s, max) {
  if (typeof s !== 'string') return '';
  return s.replace(/[<>"'`]/g, '').slice(0, max || 200);
}

function parseSlack(data) {
  if (!data) return null;
  const status = data.status || {};
  const emoji  = (status.emoji || '').toLowerCase();
  let st = 'ok';
  if (emoji.includes('warn') || emoji.includes('minor') || emoji.includes('yellow')) st = 'minor';
  else if (emoji.includes('major') || emoji.includes('critical') || emoji.includes('red')) st = 'major';
  return { status: st, description: sanitize(status.description || 'All Systems Operational', 150), incidents: [] };
}

async function fetchService(svc) {
  try {
    const data = await fetchUrl(svc.url);
    if (svc.type === 'slack') {
      const r = parseSlack(data);
      return { id: svc.id, name: svc.name, cat: svc.cat, type: 'statuspage',
        status: r.status, description: r.description, incidents: [],
        statusPageUrl: svc.statusPageUrl, checkedAt: Date.now(), error: null };
    }
    const rawDesc = (data.status && data.status.description) || 'All Systems Operational';
    const rawInc  = Array.isArray(data.incidents) ? data.incidents : [];
    return {
      id: svc.id, name: svc.name, cat: svc.cat, type: 'statuspage',
      status:      mapIndicator(data.status && data.status.indicator),
      description: sanitize(rawDesc, 150),
      incidents:   rawInc.slice(0, 3).map(i => ({
        name:    sanitize(i.name    || '', 120),
        status:  sanitize(i.status  || '', 40),
        updated: sanitize(i.updated_at || i.created_at || '', 40),
      })),
      statusPageUrl: svc.statusPageUrl,
      checkedAt: Date.now(),
      error: null,
    };
  } catch (err) {
    return {
      id: svc.id, name: svc.name, cat: svc.cat, type: 'statuspage',
      status: 'unknown', description: 'Sin datos', incidents: [],
      statusPageUrl: svc.statusPageUrl, checkedAt: Date.now(),
      error: err.message,
    };
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`Fetching ${SERVICES.length} services...`);
  const BATCH = 10;
  const results = [];
  for (let i = 0; i < SERVICES.length; i += BATCH) {
    const batch = SERVICES.slice(i, i + BATCH);
    const settled = await Promise.allSettled(batch.map(fetchService));
    settled.forEach(r => { if (r.status === 'fulfilled') results.push(r.value); });
    if (i + BATCH < SERVICES.length) await new Promise(r => setTimeout(r, 200));
  }

  const output = {
    updatedAt:    new Date().toISOString(),
    serviceCount: results.length,
    services: SERVICES.map(s => ({ id: s.id, name: s.name, cat: s.cat, statusPageUrl: s.statusPageUrl })),
    statuses: Object.fromEntries(results.map(r => [r.id, r])),
  };

  const outPath = path.join(__dirname, '..', 'docs', 'status.json');
  fs.writeFileSync(outPath, JSON.stringify(output));
  console.log(`Written ${outPath} — ${results.length} services`);

  const errors = results.filter(r => r.error);
  if (errors.length) {
    console.log(`\n${errors.length} errors:`);
    errors.forEach(r => console.warn(`  WARN ${r.id}: ${r.error}`));
  } else {
    console.log('All services OK!');
  }
})();
