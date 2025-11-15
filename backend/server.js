require('dotenv').config();
const http = require("http");   //
const app = require('./src/app');
const connectToDB = require('./src/db/db');
const initSocketServer = require('./src/sockets/socket.server');

connectToDB();


const server = http.createServer(app);


initSocketServer(server);







const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});