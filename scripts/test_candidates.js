'use strict';
const https = require('https');
const http  = require('http');

const CANDIDATES = [
  // Auth / Identity
  { id:'auth0',        url:'https://status.auth0.com/api/v2/summary.json' },
  { id:'okta',         url:'https://status.okta.com/api/v2/summary.json' },
  { id:'onelogin',     url:'https://status.onelogin.com/api/v2/summary.json' },
  // CRM / Support
  { id:'salesforce',   url:'https://status.salesforce.com/api/v2/summary.json' },
  { id:'zendesk',      url:'https://status.zendesk.com/api/v2/summary.json' },
  { id:'freshdesk',    url:'https://status.freshdesk.com/api/v2/summary.json' },
  { id:'freshworks',   url:'https://status.freshworks.com/api/v2/summary.json' },
  { id:'intercom',     url:'https://www.intercomstatus.com/api/v2/summary.json' },
  { id:'drift',        url:'https://status.drift.com/api/v2/summary.json' },
  { id:'gorgias',      url:'https://status.gorgias.com/api/v2/summary.json' },
  // Pagos
  { id:'stripe',       url:'https://status.stripe.com/api/v2/summary.json' },
  { id:'paypal',       url:'https://www.paypal-status.com/api/v2/summary.json' },
  { id:'adyen',        url:'https://status.adyen.com/api/v2/summary.json' },
  { id:'paddle',       url:'https://status.paddle.com/api/v2/summary.json' },
  { id:'braintree',    url:'https://status.braintreepayments.com/api/v2/summary.json' },
  { id:'square',       url:'https://status.squareup.com/api/v2/summary.json' },
  { id:'mollie',       url:'https://status.mollie.com/api/v2/summary.json' },
  { id:'checkout_com', url:'https://status.checkout.com/api/v2/summary.json' },
  // Cloud / Hosting
  { id:'heroku',       url:'https://status.heroku.com/api/v2/summary.json' },
  { id:'vultr',        url:'https://status.vultr.com/api/v2/summary.json' },
  { id:'hetzner',      url:'https://status.hetzner.com/api/v2/summary.json' },
  { id:'ovh',          url:'https://status.ovhcloud.com/api/v2/summary.json' },
  { id:'upcloud',      url:'https://status.upcloud.com/api/v2/summary.json' },
  { id:'exoscale',     url:'https://status.exoscale.com/api/v2/summary.json' },
  { id:'contabo',      url:'https://status.contabo.com/api/v2/summary.json' },
  { id:'civo',         url:'https://status.civo.com/api/v2/summary.json' },
  // DB / Storage
  { id:'redis_cloud',  url:'https://status.redis.com/api/v2/summary.json' },
  { id:'cockroachdb',  url:'https://status.cockroachlabs.com/api/v2/summary.json' },
  { id:'neon',         url:'https://neonstatus.com/api/v2/summary.json' },
  { id:'xata',         url:'https://status.xata.io/api/v2/summary.json' },
  { id:'backblaze',    url:'https://status.backblaze.com/api/v2/summary.json' },
  { id:'wasabi',       url:'https://status.wasabi.com/api/v2/summary.json' },
  // Dev tools
  { id:'gitlab',       url:'https://status.gitlab.com/api/v2/summary.json' },
  { id:'dockerhub',    url:'https://www.dockerstatus.com/api/v2/summary.json' },
  { id:'pagerduty',    url:'https://status.pagerduty.com/api/v2/summary.json' },
  { id:'opsgenie',     url:'https://status.atlassian.com/api/v2/summary.json' },
  { id:'statuspage_io', url:'https://metastatuspage.com/api/v2/summary.json' },
  { id:'launchdarkly', url:'https://status.launchdarkly.com/api/v2/summary.json' },
  { id:'split_io',     url:'https://status.split.io/api/v2/summary.json' },
  { id:'rollbar',      url:'https://status.rollbar.com/api/v2/summary.json' },
  { id:'bugsnag',      url:'https://status.bugsnag.com/api/v2/summary.json' },
  { id:'logrocket',    url:'https://status.logrocket.com/api/v2/summary.json' },
  { id:'honeycomb',    url:'https://status.honeycomb.io/api/v2/summary.json' },
  { id:'grafana_cloud', url:'https://status.grafana.com/api/v2/summary.json' },
  { id:'pagerduty2',   url:'https://status.pagerduty.com/api/v2/summary.json' },
  // Email / SMS
  { id:'mailchimp',    url:'https://status.mailchimp.com/api/v2/summary.json' },
  { id:'postmark',     url:'https://status.postmarkapp.com/api/v2/summary.json' },
  { id:'sparkpost',    url:'https://status.sparkpost.com/api/v2/summary.json' },
  { id:'mailgun',      url:'https://status.mailgun.com/api/v2/summary.json' },
  { id:'messagebird',  url:'https://status.messagebird.com/api/v2/summary.json' },
  { id:'vonage',       url:'https://status.nexmo.com/api/v2/summary.json' },
  // AI extras
  { id:'mistral',      url:'https://status.mistral.ai/api/v2/summary.json' },
  { id:'together_ai',  url:'https://status.together.ai/api/v2/summary.json' },
  { id:'perplexity',   url:'https://status.perplexity.ai/api/v2/summary.json' },
  { id:'deepinfra',    url:'https://status.deepinfra.com/api/v2/summary.json' },
  { id:'anyscale',     url:'https://status.anyscale.com/api/v2/summary.json' },
  { id:'weaviate',     url:'https://status.weaviate.io/api/v2/summary.json' },
  { id:'qdrant',       url:'https://status.qdrant.io/api/v2/summary.json' },
  // Monitoring
  { id:'pingdom',      url:'https://status.pingdom.com/api/v2/summary.json' },
  { id:'uptimerobot',  url:'https://status.uptimerobot.com/api/v2/summary.json' },
  { id:'betterstack',  url:'https://status.betterstack.com/api/v2/summary.json' },
  // Video / Media
  { id:'mux',          url:'https://status.mux.com/api/v2/summary.json' },
  { id:'cloudflare_stream', url:'https://www.cloudflarestatus.com/api/v2/summary.json' },
  { id:'vimeo',        url:'https://status.vimeo.com/api/v2/summary.json' },
  // Maps / Location
  { id:'mapbox',       url:'https://status.mapbox.com/api/v2/summary.json' },
  // Misc SaaS
  { id:'zapier',       url:'https://status.zapier.com/api/v2/summary.json' },
  { id:'make',         url:'https://status.make.com/api/v2/summary.json' },
  { id:'n8n',          url:'https://status.n8n.io/api/v2/summary.json' },
  { id:'bubble',       url:'https://status.bubble.io/api/v2/summary.json' },
  { id:'netlify_forms', url:'https://www.netlifystatus.com/api/v2/summary.json' },
  { id:'stytch',       url:'https://status.stytch.com/api/v2/summary.json' },
  { id:'clerk',        url:'https://status.clerk.com/api/v2/summary.json' },
  { id:'novu',         url:'https://status.novu.co/api/v2/summary.json' },
  { id:'courier',      url:'https://status.courier.com/api/v2/summary.json' },
  { id:'resend',       url:'https://status.resend.com/api/v2/summary.json' },
  { id:'loops',        url:'https://status.loops.so/api/v2/summary.json' },
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
