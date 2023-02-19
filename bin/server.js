const WebSocket = require('ws')
const http = require('http')
const wss = new WebSocket.Server({ noServer: true })
const setupWSConnection = require('./utils.js').setupWSConnection
const Y = require('yjs');
const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 8076

const messageListener = (message) => {
  const decoder = new TextDecoder();

  // Check if the data is an array buffer
  const data = message instanceof ArrayBuffer ? message : message.buffer;
  const decodedMessage = decoder.decode(data);

  let memoryDoc = Y.applyUpdate({}, decodedMessage);

  console.log(memoryDoc.toJSON());
};

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('okay')
})

wss.on('connection', setupWSConnection)

server.on('upgrade', (request, socket, head) => {

  console.log('setup client listener')
  // You may check auth of request here..
  // See https://github.com/websockets/ws#client-authentication
  /**
   * @param {any} ws
   */
  const handleAuth = ws => {
   
  wss.emit('connection', ws, request);

  ws.on('message', messageListener);
  }
  wss.handleUpgrade(request, socket, head, handleAuth)
})

server.listen(port, host, () => {
  console.log(`running at '${host}' on port ${port}`)
})
