const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {createChatController,getChats,getMessages} = require('../controller/chat.controller')




router.post('/',authMiddleware,createChatController);

/* GET /api/chat/ */
router.get('/', authMiddleware, getChats)


/* GET /api/chat/messages/:id */
router.get('/messages/:id', authMiddleware, getMessages)



module.exports = router;