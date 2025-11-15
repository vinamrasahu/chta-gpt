const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.route');
const chatRoutes = require('./routes/chat.routes');
const cors = require('cors');



const app = express();


app.use(cors({
  origin: 'http://localhost:5173',  // specific origin likho
  credentials: true,                // credentials allow karo
}));

app.use(express.json());
app.use(cookieParser());





app.use("/api",authRoutes);
app.use('/api/chat',chatRoutes);



module.exports = app;