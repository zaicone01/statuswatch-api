'use strict';

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ─── LISTA DE SERVICIOS ───────────────────────────────────────────────────────
// Agregá o quitá servicios acá sin tocar la extensión.
// Tipos:
//   statuspage  → API Atlassian statuspage (/api/v2/summary.json)
//   slack       → formato propio de Slack
const SERVICES = [
  // ── CLOUD ────────────────────────────────────────────────────────────────
  { id:'aws',          name:'Amazon AWS',          cat:'Cloud',      type:'statuspage', url:'https://status.aws.amazon.com/api/v2/summary.json',                     statusPageUrl:'https://status.aws.amazon.com' },
  { id:'google',       name:'Google Cloud',        cat:'Cloud',      type:'statuspage', url:'https://status.cloud.google.com/api/v2/summary.json',                   statusPageUrl:'https://status.cloud.google.com' },
  { id:'azure',        name:'Microsoft Azure',     cat:'Cloud',      type:'statuspage', url:'https://status.azure.com/api/v2/summary.json',                          statusPageUrl:'https://status.azure.com' },
  { id:'cloudflare',   name:'Cloudflare',          cat:'Cloud',      type:'statuspage', url:'https://www.cloudflarestatus.com/api/v2/summary.json',                   statusPageUrl:'https://www.cloudflarestatus.com' },
  { id:'digitalocean', name:'DigitalOcean',        cat:'Cloud',      type:'statuspage', url:'https://status.digitalocean.com/api/v2/summary.json',                   statusPageUrl:'https://status.digitalocean.com' },
  { id:'linode',       name:'Akamai / Linode',     cat:'Cloud',      type:'statuspage', url:'https://status.linode.com/api/v2/summary.json',                         statusPageUrl:'https://status.linode.com' },
  { id:'fastly',       name:'Fastly',              cat:'Cloud',      type:'statuspage', url:'https://status.fastly.com/api/v2/summary.json',                         statusPageUrl:'https://status.fastly.com' },
  // ── CHAT ─────────────────────────────────────────────────────────────────
  { id:'slack',        name:'Slack',               cat:'Chat',       type:'slack',      url:'https://status.slack.com/api/v2.0.0/current',                           statusPageUrl:'https://status.slack.com' },
  { id:'zoom',         name:'Zoom',                cat:'Chat',       type:'statuspage', url:'https://status.zoom.us/api/v2/summary.json',                            statusPageUrl:'https://status.zoom.us' },
  { id:'discord',      name:'Discord',             cat:'Chat',       type:'statuspage', url:'https://discordstatus.com/api/v2/summary.json',                         statusPageUrl:'https://discordstatus.com' },
  // ── SOCIAL ───────────────────────────────────────────────────────────────
  { id:'reddit',       name:'Reddit',              cat:'Social',     type:'statuspage', url:'https://www.redditstatus.com/api/v2/summary.json',                      statusPageUrl:'https://www.redditstatus.com' },
  { id:'twitch',       name:'Twitch',              cat:'Social',     type:'statuspage', url:'https://status.twitch.tv/api/v2/summary.json',                          statusPageUrl:'https://status.twitch.tv' },
  // ── STREAMING ────────────────────────────────────────────────────────────
  { id:'spotify',      name:'Spotify',             cat:'Streaming',  type:'statuspage', url:'https://www.spotifystatus.com/api/v2/summary.json',                     statusPageUrl:'https://www.spotifystatus.com' },
  // ── IA ───────────────────────────────────────────────────────────────────
  { id:'openai',       name:'OpenAI / ChatGPT',    cat:'IA',         type:'statuspage', url:'https://status.openai.com/api/v2/summary.json',                         statusPageUrl:'https://status.openai.com' },
  { id:'anthropic',    name:'Anthropic / Claude',  cat:'IA',         type:'statuspage', url:'https://status.anthropic.com/api/v2/summary.json',                      statusPageUrl:'https://status.anthropic.com' },
  { id:'huggingface',  name:'Hugging Face',        cat:'IA',         type:'statuspage', url:'https://status.huggingface.co/api/v2/summary.json',                     statusPageUrl:'https://status.huggingface.co' },
  { id:'replicate',    name:'Replicate',           cat:'IA',         type:'statuspage', url:'https://www.replicatestatus.com/api/v2/summary.json',                   statusPageUrl:'https://www.replicatestatus.com' },
  // ── DEV ──────────────────────────────────────────────────────────────────
  { id:'github',       name:'GitHub',              cat:'Dev',        type:'statuspage', url:'https://www.githubstatus.com/api/v2/summary.json',                      statusPageUrl:'https://www.githubstatus.com' },
  { id:'vercel',       name:'Vercel',              cat:'Dev',        type:'statuspage', url:'https://www.vercel-status.com/api/v2/summary.json',                     statusPageUrl:'https://www.vercel-status.com' },
  { id:'netlify',      name:'Netlify',             cat:'Dev',        type:'statuspage', url:'https://www.netlifystatus.com/api/v2/summary.json',                     statusPageUrl:'https://www.netlifystatus.com' },
  { id:'gitlab',       name:'GitLab',              cat:'Dev',        type:'statuspage', url:'https://status.gitlab.com/api/v2/summary.json',                         statusPageUrl:'https://status.gitlab.com' },
  { id:'bitbucket',    name:'Bitbucket',           cat:'Dev',        type:'statuspage', url:'https://bitbucket.status.atlassian.com/api/v2/summary.json',            statusPageUrl:'https://bitbucket.status.atlassian.com' },
  { id:'jira',         name:'Jira',                cat:'Dev',        type:'statuspage', url:'https://jira-software.status.atlassian.com/api/v2/summary.json',        statusPageUrl:'https://jira-software.status.atlassian.com' },
  { id:'confluence',   name:'Confluence',          cat:'Dev',        type:'statuspage', url:'https://confluence.status.atlassian.com/api/v2/summary.json',           statusPageUrl:'https://confluence.status.atlassian.com' },
  { id:'dockerhub',    name:'Docker Hub',          cat:'Dev',        type:'statuspage', url:'https://www.dockerstatus.com/api/v2/summary.json',                      statusPageUrl:'https://www.dockerstatus.com' },
  { id:'npm',          name:'npm Registry',        cat:'Dev',        type:'statuspage', url:'https://status.npmjs.org/api/v2/summary.json',                          statusPageUrl:'https://status.npmjs.org' },
  { id:'circleci',     name:'CircleCI',            cat:'Dev',        type:'statuspage', url:'https://status.circleci.com/api/v2/summary.json',                       statusPageUrl:'https://status.circleci.com' },
  { id:'sentry',       name:'Sentry',              cat:'Dev',        type:'statuspage', url:'https://status.sentry.io/api/v2/summary.json',                          statusPageUrl:'https://status.sentry.io' },
  { id:'datadog',      name:'Datadog',             cat:'Dev',        type:'statuspage', url:'https://status.datadoghq.com/api/v2/summary.json',                      statusPageUrl:'https://status.datadoghq.com' },
  { id:'pagerduty',    name:'PagerDuty',           cat:'Dev',        type:'statuspage', url:'https://status.pagerduty.com/api/v2/summary.json',                      statusPageUrl:'https://status.pagerduty.com' },
  { id:'linear',       name:'Linear',              cat:'Dev',        type:'statuspage', url:'https://linearstatus.com/api/v2/summary.json',                          statusPageUrl:'https://linearstatus.com' },
  { id:'twilio',       name:'Twilio',              cat:'Dev',        type:'statuspage', url:'https://status.twilio.com/api/v2/summary.json',                         statusPageUrl:'https://status.twilio.com' },
  { id:'supabase',     name:'Supabase',            cat:'Dev',        type:'statuspage', url:'https://status.supabase.com/api/v2/summary.json',                       statusPageUrl:'https://status.supabase.com' },
  { id:'planetscale',  name:'PlanetScale',         cat:'Dev',        type:'statuspage', url:'https://www.planetscalestatus.com/api/v2/summary.json',                 statusPageUrl:'https://www.planetscalestatus.com' },
  { id:'render',       name:'Render',              cat:'Dev',        type:'statuspage', url:'https://status.render.com/api/v2/summary.json',                         statusPageUrl:'https://status.render.com' },
  // ── PRODUCTIVIDAD ────────────────────────────────────────────────────────
  { id:'notion',       name:'Notion',              cat:'Productiv.', type:'statuspage', url:'https://www.notion-status.com/api/v2/summary.json',                     statusPageUrl:'https://status.notion.so' },
  { id:'figma',        name:'Figma',               cat:'Design',     type:'statuspage', url:'https://status.figma.com/api/v2/summary.json',                          statusPageUrl:'https://status.figma.com' },
  { id:'asana',        name:'Asana',               cat:'Productiv.', type:'statuspage', url:'https://trust.asana.com/api/v2/summary.json',                           statusPageUrl:'https://trust.asana.com' },
  { id:'trello',       name:'Trello',              cat:'Productiv.', type:'statuspage', url:'https://trello.status.atlassian.com/api/v2/summary.json',               statusPageUrl:'https://trello.status.atlassian.com' },
  { id:'monday',       name:'Monday.com',          cat:'Productiv.', type:'statuspage', url:'https://status.monday.com/api/v2/summary.json',                         statusPageUrl:'https://status.monday.com' },
  { id:'dropbox',      name:'Dropbox',             cat:'Productiv.', type:'statuspage', url:'https://status.dropbox.com/api/v2/summary.json',                        statusPageUrl:'https://status.dropbox.com' },
  { id:'airtable',     name:'Airtable',            cat:'Productiv.', type:'statuspage', url:'https://status.airtable.com/api/v2/summary.json',                       statusPageUrl:'https://status.airtable.com' },
  { id:'hubspot',      name:'HubSpot',             cat:'Productiv.', type:'statuspage', url:'https://status.hubspot.com/api/v2/summary.json',                        statusPageUrl:'https://status.hubspot.com' },
  { id:'intercom',     name:'Intercom',            cat:'Productiv.', type:'statuspage', url:'https://www.intercomstatus.com/api/v2/summary.json',                    statusPageUrl:'https://www.intercomstatus.com' },
  // ── EMAIL ────────────────────────────────────────────────────────────────
  { id:'mailchimp',    name:'Mailchimp',           cat:'Email',      type:'statuspage', url:'https://status.mailchimp.com/api/v2/summary.json',                      statusPageUrl:'https://status.mailchimp.com' },
  { id:'sendgrid',     name:'SendGrid',            cat:'Email',      type:'statuspage', url:'https://status.sendgrid.com/api/v2/summary.json',                       statusPageUrl:'https://status.sendgrid.com' },
  { id:'postmark',     name:'Postmark',            cat:'Email',      type:'statuspage', url:'https://status.postmarkapp.com/api/v2/summary.json',                    statusPageUrl:'https://status.postmarkapp.com' },
  // ── PAGOS ────────────────────────────────────────────────────────────────
  { id:'stripe',       name:'Stripe',              cat:'Pagos',      type:'statuspage', url:'https://status.stripe.com/api/v2/summary.json',                         statusPageUrl:'https://status.stripe.com' },
  { id:'wise',         name:'Wise',                cat:'Pagos',      type:'statuspage', url:'https://status.wise.com/api/v2/summary.json',                           statusPageUrl:'https://status.wise.com' },
  { id:'binance',      name:'Binance',             cat:'Pagos',      type:'statuspage', url:'https://status.binance.com/api/v2/summary.json',                        statusPageUrl:'https://status.binance.com' },
  { id:'coinbase',     name:'Coinbase',            cat:'Pagos',      type:'statuspage', url:'https://status.coinbase.com/api/v2/summary.json',                       statusPageUrl:'https://status.coinbase.com' },
  { id:'adyen',        name:'Adyen',               cat:'Pagos',      type:'statuspage', url:'https://status.adyen.com/api/v2/summary.json',                          statusPageUrl:'https://status.adyen.com' },
  // ── GAMING ───────────────────────────────────────────────────────────────
  { id:'epicgames',    name:'Epic Games',          cat:'Gaming',     type:'statuspage', url:'https://status.epicgames.com/api/v2/summary.json',                      statusPageUrl:'https://status.epicgames.com' },
  { id:'roblox',       name:'Roblox',              cat:'Gaming',     type:'statuspage', url:'https://status.roblox.com/api/v2/summary.json',                         statusPageUrl:'https://status.roblox.com' },
  { id:'ea',           name:'EA / Origin',         cat:'Gaming',     type:'statuspage', url:'https://status.ea.com/api/v2/summary.json',                             statusPageUrl:'https://status.ea.com' },
  // ── E-COMMERCE ───────────────────────────────────────────────────────────
  { id:'shopify',      name:'Shopify',             cat:'E-com',      type:'statuspage', url:'https://www.shopifystatus.com/api/v2/summary.json',                     statusPageUrl:'https://www.shopifystatus.com' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'statuswatch-api/1.0' }, timeout: 8000 }, res => {
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

    // Standard statuspage.io format
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

  // Fetch in batches of 10 to avoid hammering
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
    // Services list (id, name, cat) so extension can render even with stale cache
    services: SERVICES.map(s => ({ id: s.id, name: s.name, cat: s.cat, statusPageUrl: s.statusPageUrl })),
    // Status keyed by id
    statuses: Object.fromEntries(results.map(r => [r.id, r])),
  };

  const outPath = path.join(__dirname, '..', 'docs', 'status.json');
  fs.writeFileSync(outPath, JSON.stringify(output));
  console.log(`Written ${outPath} — ${results.length} services`);

  // Log any errors
  results.filter(r => r.error).forEach(r => console.warn(`  WARN ${r.id}: ${r.error}`));
})();
