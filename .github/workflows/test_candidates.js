'use strict';
const https = require('https');
const http  = require('http');

const CANDIDATES = [
  { id:'gitlab',       url:'https://status.gitlab.com/api/v2/summary.json' },
  { id:'dockerhub',    url:'https://www.dockerstatus.com/api/v2/summary.json' },
  { id:'pagerduty',    url:'https://status.pagerduty.com/api/v2/summary.json' },
  { id:'mailchimp',    url:'https://status.mailchimp.com/api/v2/summary.json' },
  { id:'postmark',     url:'https://status.postmarkapp.com/api/v2/summary.json' },
  { id:'stripe',       url:'https://status.stripe.com/api/v2/summary.json' },
  { id:'binance',      url:'https://status.binance.com/api/v2/summary.json' },
  { id:'roblox',       url:'https://status.roblox.com/api/v2/summary.json' },
  { id:'huggingface',  url:'https://status.huggingface.co/api/v2/summary.json' },
  { id:'asana',        url:'https://trust.asana.com/api/v2/summary.json' },
  { id:'intercom',     url:'https://www.intercomstatus.com/api/v2/summary.json' },
  { id:'adyen',        url:'https://status.adyen.com/api/v2/summary.json' },
  { id:'spotify',      url:'https://www.spotifystatus.com/api/v2/summary.json' },
  { id:'fastly',       url:'https://status.fastly.com/api/v2/summary.json' },
  { id:'salesforce',   url:'https://status.salesforce.com/api/v2/summary.json' },
  { id:'zendesk',      url:'https://status.zendesk.com/api/v2/summary.json' },
  { id:'heroku',       url:'https://status.heroku.com/api/v2/summary.json' },
  { id:'cloudinary',   url:'https://status.cloudinary.com/api/v2/summary.json' },
  { id:'okta',         url:'https://status.okta.com/api/v2/summary.json' },
  { id:'auth0',        url:'https://status.auth0.com/api/v2/summary.json' },
  { id:'newrelic',     url:'https://status.newrelic.com/api/v2/summary.json' },
  { id:'segment',      url:'https://status.segment.com/api/v2/summary.json' },
  { id:'amplitude',    url:'https://status.amplitude.com/api/v2/summary.json' },
  { id:'plaid',        url:'https://status.plaid.com/api/v2/summary.json' },
  { id:'paddle',       url:'https://status.paddle.com/api/v2/summary.json' },
  { id:'klarna',       url:'https://status.klarna.com/api/v2/summary.json' },
  { id:'braintree',    url:'https://status.braintreepayments.com/api/v2/summary.json' },
  { id:'fly_io',       url:'https://status.flyio.net/api/v2/summary.json' },
  { id:'railway',      url:'https://status.railway.app/api/v2/summary.json' },
  { id:'hetzner',      url:'https://status.hetzner.com/api/v2/summary.json' },
  { id:'vultr',        url:'https://status.vultr.com/api/v2/summary.json' },
  { id:'scaleway',     url:'https://status.scaleway.com/api/v2/summary.json' },
  { id:'ovh',          url:'https://status.ovhcloud.com/api/v2/summary.json' },
  { id:'backblaze',    url:'https://status.backblaze.com/api/v2/summary.json' },
  { id:'bunny_cdn',    url:'https://status.bunny.net/api/v2/summary.json' },
  { id:'neon',         url:'https://neonstatus.com/api/v2/summary.json' },
  { id:'mongodb_atlas', url:'https://status.mongodb.com/api/v2/summary.json' },
  { id:'redis_cloud',  url:'https://status.redis.com/api/v2/summary.json' },
  { id:'elastic',      url:'https://status.elastic.co/api/v2/summary.json' },
  { id:'confluent',    url:'https://status.confluent.cloud/api/v2/summary.json' },
  { id:'snowflake',    url:'https://status.snowflake.com/api/v2/summary.json' },
  { id:'fivetran',     url:'https://status.fivetran.com/api/v2/summary.json' },
  { id:'retool',       url:'https://status.retool.com/api/v2/summary.json' },
  { id:'xero',         url:'https://status.xero.com/api/v2/summary.json' },
  { id:'freshworks',   url:'https://status.freshworks.com/api/v2/summary.json' },
  { id:'helpscout',    url:'https://status.helpscout.net/api/v2/summary.json' },
  { id:'typeform',     url:'https://status.typeform.com/api/v2/summary.json' },
  { id:'webflow',      url:'https://status.webflow.com/api/v2/summary.json' },
  { id:'squarespace',  url:'https://status.squarespace.com/api/v2/summary.json' },
  { id:'wix',          url:'https://status.wix.com/api/v2/summary.json' },
  { id:'pusher',       url:'https://status.pusher.com/api/v2/summary.json' },
  { id:'ably',         url:'https://status.ably.com/api/v2/summary.json' },
  { id:'loom',         url:'https://www.loomstatus.com/api/v2/summary.json' },
  { id:'miro',         url:'https://status.miro.com/api/v2/summary.json' },
  { id:'clickup',      url:'https://status.clickup.com/api/v2/summary.json' },
  { id:'shortcut',     url:'https://status.shortcut.com/api/v2/summary.json' },
  { id:'coda',         url:'https://status.coda.io/api/v2/summary.json' },
  { id:'box',          url:'https://status.box.com/api/v2/summary.json' },
  { id:'cohere',       url:'https://status.cohere.com/api/v2/summary.json' },
  { id:'mistral',      url:'https://status.mistral.ai/api/v2/summary.json' },
  { id:'groq',         url:'https://groqstatus.com/api/v2/summary.json' },
  { id:'perplexity',   url:'https://status.perplexity.ai/api/v2/summary.json' },
  { id:'together_ai',  url:'https://status.together.ai/api/v2/summary.json' },
  { id:'elevenlabs',   url:'https://status.elevenlabs.io/api/v2/summary.json' },
  { id:'pinecone',     url:'https://status.pinecone.io/api/v2/summary.json' },
  { id:'langchain',    url:'https://status.langchain.com/api/v2/summary.json' },
  { id:'deno',         url:'https://www.denostatus.com/api/v2/summary.json' },
  { id:'turso',        url:'https://status.turso.tech/api/v2/summary.json' },
  { id:'cockroachdb',  url:'https://status.cockroachlabs.com/api/v2/summary.json' },
  { id:'hasura',       url:'https://status.hasura.io/api/v2/summary.json' },
  { id:'airbyte',      url:'https://status.airbyte.com/api/v2/summary.json' },
  { id:'dbt_cloud',    url:'https://status.getdbt.com/api/v2/summary.json' },
  { id:'mixpanel',     url:'https://status.mixpanel.com/api/v2/summary.json' },
  { id:'braze',        url:'https://status.braze.com/api/v2/summary.json' },
  { id:'iterable',     url:'https://status.iterable.com/api/v2/summary.json' },
  { id:'sendbird',     url:'https://status.sendbird.com/api/v2/summary.json' },
  { id:'algolia',      url:'https://status.algolia.com/api/v2/summary.json' },
  { id:'appwrite',     url:'https://status.appwrite.online/api/v2/summary.json' },
  { id:'cockroach2',   url:'https://status.cockroachlabs.com/api/v2/summary.json' },
  { id:'chargebee',    url:'https://status.chargebee.com/api/v2/summary.json' },
  { id:'brex',         url:'https://status.brex.com/api/v2/summary.json' },
  { id:'liveblocks',   url:'https://liveblocks.statuspage.io/api/v2/summary.json' },
  { id:'meilisearch',  url:'https://status.meilisearch.com/api/v2/summary.json' },
  { id:'sendbird2',    url:'https://status.sendbird.com/api/v2/summary.json' },
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
