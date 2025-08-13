import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";

const apiMapping: Record<string, string> = {
  '/anthropic': 'https://api.anthropic.com',
  '/cerebras': 'https://api.cerebras.ai',
  '/cohere': 'https://api.cohere.ai',
  '/discord': 'https://discord.com/api',
  '/fireworks': 'https://api.fireworks.ai',
  '/gemini': 'https://generativelanguage.googleapis.com',
  '/groq': 'https://api.groq.com/openai',
  '/huggingface': 'https://api-inference.huggingface.co',
  '/meta': 'https://www.meta.ai/api',
  '/novita': 'https://api.novita.ai',
  '/nvidia': 'https://integrate.api.nvidia.com',
  '/oaipro': 'https://api.oaipro.com',
  '/openai': 'https://api.openai.com',
  '/openrouter': 'https://openrouter.ai/api',
  '/portkey': 'https://api.portkey.ai',
  '/reka': 'https://api.reka.ai',
  '/telegram': 'https://api.telegram.org',
  '/together': 'https://api.together.xyz',
  '/xai': 'https://api.x.ai'
};

console.log('API Mappings:');
for (const [prefix, target] of Object.entries(apiMapping)) {
  console.log(`  ${prefix} -> ${target}`);
}
console.log('');

const args = parse(Deno.args);
let port = 3000;
let hostname = '0.0.0.0';

if (args.listen) {
  const parts = String(args.listen).split(':');
  if (parts.length === 2) {
    hostname = parts[0];
    port = Number(parts[1]);
  } else if (parts.length === 1) {
    port = Number(parts[0]);
  }
} else if (args.port) {
  port = Number(args.port);
} else if (args.host) {
  hostname = String(args.host);
}

console.log(`Listening on http://${hostname}:${port}`);
console.log('');

serve(async (request) => {
  const startTime = Date.now();
  console.log(`${request.method} ${request.url}`);
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname === '/' || pathname === '/index.html') {
    return new Response('Service is running!', {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  } 
  
  if (pathname === '/robots.txt') {
    return new Response('User-agent: *\nDisallow: /', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  const [prefix, rest] = extractPrefixAndRest(pathname, Object.keys(apiMapping));
  if (!prefix) {
    return new Response('Not Found', { status: 404 });
  }

  const targetUrl = `${apiMapping[prefix]}${rest}${url.search}`;

  try {
    const headers = new Headers();
    const allowedHeaders = ['accept', 'content-type', 'authorization'];
    for (const [key, value] of request.headers.entries()) {
      if (allowedHeaders.includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    }

    console.log(`Forwarding request to: ${targetUrl}`);
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.body
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('X-Frame-Options', 'DENY');
    responseHeaders.set('Referrer-Policy', 'no-referrer');

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Response for ${request.method} ${request.url} - Status: ${response.status}, Duration: ${duration}ms`);

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.error(`Failed to fetch ${request.url} - Error: ${error instanceof Error ? error.message : String(error)}, Duration: ${duration}ms`);
    return new Response('Internal Server Error', { status: 500 });
  }
}, { port, hostname });

function extractPrefixAndRest(pathname: string, prefixes: string[]) {
  for (const prefix of prefixes) {
    if (pathname.startsWith(prefix)) {
      return [prefix, pathname.slice(prefix.length)];
    }
  }
  return [null, null];
}