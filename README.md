A toy proxy to forward requests to the v4 Google Safebrowsing service

# Testing

You can test the Update API v4 endpoints using curl when the server is running
locally via `node sbserver.js`.

`curl --data "@sample/update.json" -H "Content-Type:application/json"
http://localhost:8000/sb/g/threatListUpdates:fetch`


`curl --data "@sample/fullhashes.json" -H "Content-Type:application/json"
http://localhost:8000/sb/g/fullHashes:find`
