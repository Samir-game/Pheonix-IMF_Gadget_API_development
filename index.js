const dotenv= require('dotenv')
const app= require('./app.js')
const {connectionDB}= require('./database/db.config.js')
const {connectRedis}= require("./database/redis.config.js")

dotenv.config({ 
    path:"./.env"
})

const PORT=process.env.PORT || 3001

connectionDB()
.then(() => connectRedis())
.then(() => {
    app.listen(PORT,()=>{
      console.log("SERVER started at PORT:",PORT)
    })
})
.catch((error)=>{
    console.error("Error while starting server:",error.message)
    process.exit(1)
})
