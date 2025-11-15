const mongoose = require('mongoose');

async function connectToDB(){
    await mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log("connected to db");
        
    })
    .catch((err)=>{
        console.error("Error connecting to MongoDB", err);
    }); 

}


module.exports = connectToDB