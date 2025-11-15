const mongoose = require('mongoose');

async function connectToDB(){
    await mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log("connected to db");
        
    })

}


module.exports = connectToDB