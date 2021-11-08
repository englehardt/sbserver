const express = require('express')
const fs = require('fs')
const yargs = require('yargs')
const forwardRequest = require("./lib/forward-request")

const app = express()

const argv = yargs
  .boolean('debug')
  .describe('debug', 'Run the server in debug mode. No requests send to Google')
  .argv;

function getApiKeyFromFile(fileName) {
  console.log(`Reading API key from ${fileName}`)
  try {
    return fs.readFileSync(fileName, 'utf-8')
  } catch (err) {
    console.error(err)
  }
}

const CONFIG = {
  google: {
    baseUrl: 'https://safebrowsing.googleapis.com/v4/',
    apiKey: process.env.SB_KEY || getApiKeyFromFile('sb_key.txt'),
    endpoints: [
      "threatListUpdates:fetch",
      "fullHashes:find"
    ]
  },
  debug: {
    baseUrl: 'https://en5f7iigsdfrs.x.pipedream.net/',
    apiKey: 'API_KEY',
    endpoints: [
      "threatListUpdates:fetch",
      "fullHashes:find"
    ]
  }
}

const isDebugging = argv.debug || process.env.DEBUG || false
if (isDebugging) {
  console.log(`Running in debug mode. Requests forwarded to ${CONFIG['debug']['baseUrl']}`)
}

function createTarget(req, service, endpoint) {
  let url = new URL(CONFIG[service]['baseUrl'] + endpoint)
  url.searchParams.set('key', CONFIG[service]['apiKey'])
  return url
}

function pruneUserAgent(ua) {
  // TODO
  return ua
}

app.post("/sb/g/:operation", (req, res) => {
  let service = 'google'
  if (isDebugging) {
    service = 'debug'
  }

  let operation = req.params.operation && req.params.operation.trim()
  if (!operation) {
    throw new Error("No operation provided")
  }
  if (!CONFIG[service]['endpoints'].includes(operation)) {
    throw new Error(`Unknown operation ${operation}`)
  }
  let target = createTarget(req, service, operation);
  console.log("server", { msg: `forwarding to ${target}` });

  forwardRequest(req, res, {
    target,
    headers: {
      "user-agent": pruneUserAgent(req.headers["user-agent"]),
    },
  });
});

const port = process.env.PORT || '8000'
app.listen(port, () => {
  console.log(`Server started and listening on port: ${port}.`)
})
