const chatModel = require('../model/chat.model');
const messageModel = require('../model/message.model');




async function createChatController(req,res){
    const {title} = req.body;
    const user = req.user;

   const chat = await chatModel.create({
        user:user._id,
        title:title,

    })
    res.status(201).json({
        message:"chat created successfully",
        chat:{
            _id:chat._id,
            title:chat.title,
            lastActivity:chat.lastActivity,
            user:chat.user
        }
    })



}

async function getChats(req, res) {
    const user = req.user;

    const chats = await chatModel.find({ user: user._id });

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats: chats.map(chat => ({
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }))
    });
}

async function getMessages(req, res) {

    const chatId = req.params.id;

    const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages: messages
    })

}

module.exports = {
    createChatController,
    getChats,
    getMessages
};