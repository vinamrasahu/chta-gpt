const { Server } = require("socket.io");
const cookie  = require('cookie');
const jwt = require('jsonwebtoken');
const userModel = require('../model/user.model');
const {generateResponce,generateVector} = require("../service/ai.service");
const messageModel = require('../model/message.model');
const {createMemory,querryMemory} =  require("../service/vector.service");
const { text } = require("express");
const { QueryVectorFromJSON } = require("@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_data");



function initSocketServer(httpServer){
    const io = new Server(httpServer,{
        cors: {
            origin: "http://localhost:5173",
            allowedHeaders: [ "Content-Type", "Authorization" ],
            credentials: true
        }
    })
    
    
 

io.use(async (socket,next)=>{
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
    if(!cookies.token){
        next(new Error("authentication error: no token provided"));
    }
    try{
        const decoded = jwt.verify(cookies.token,process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        socket.user = user;
        next();
    }catch(error){
        next(new Error("authentication error : invalid token"));
        

    }


    
    

})
   io.on("connection", (socket) => {

    
    socket.on('aiMessage', async (message)=>{
        // console.log(message);
        

        /* const userMessage = await messageModel.create({
            user:socket.user._id,
            chat:message.chat,
            content:message.content,
            role:"user"

        })

        const vectors = await generateVector(message.content);
        */
       const [userMessage,vectors] = await Promise.all([
        messageModel.create({
            user:socket.user._id,
            chat:message.chat,
            content:message.content,
            role:"user"

        }),
        generateVector(message.content),
         
       ])

       await createMemory({
            vectors,
            messageId:userMessage._id, //ALWAYS UNIQUE
            metadata:{
                chat:message.chat,
                user:socket.user._id,
                text:message.content,
            }
        })


    const [memmory,chatHistory] = await Promise.all([
        querryMemory({
            querryvector:vectors,
            limit: 3,
            metadata:{
                user:socket.user._id
            }
            
        }),
       messageModel.find({
                    chat: message.chat
                }).sort({ createdAt: -1 }).limit(20).lean().then(messages => messages.reverse())
            ])
        // console.log(memmory);



       
        // console.log(vectors);
        

       
    //  console.log(chatHistory);
     
        

        const stm = chatHistory.map(item =>{
            return {
                role:item.role,
                parts:[{text:item.content}]

            }

        });

        const ltm = [{
            role:"user",
            parts:[{text:`these are some previous message from the chat,use the to generate a responce
                ${memmory.map(item => item.metadata.text).join("\n")}

                `}]
        }]

        console.log(ltm[0]);
        console.log("short term memmory");
        
        console.log(stm);
        
        

      
        
        const response = await generateResponce([...ltm,...stm]);

        socket.emit("aiResponse",{
            content:response,
            chat:message.chat
        })

        const [responseMessage,responseVector] = await Promise.all([
            messageModel.create({
            user:socket.user._id,
            chat:message.chat,
            content:response,
            role:"model"
        }),
        generateVector(response)


        ])
        
        await createMemory({
            vectors:responseVector,
            messageId:responseMessage._id,
            metadata:{
                chat:message.chat,
                user:socket.user._id,
                text:response
            }
        })

        
        

    })
   
    
  
});

}


 


module.exports = initSocketServer;