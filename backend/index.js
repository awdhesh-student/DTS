const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const DBConnection = require('./config/connect')


const app = express()
dotenv.config()

//////connection of DB/////////
DBConnection()

const PORT = process.env.PORT 


//////middleware/////////
app.use(express.json())
app.use(cors())

// app.use('/api/admin', require(''))
app.use('/api/user', require('./router/userRoutes'))



app.listen(PORT, ()=> console.log(`running on ${PORT}`))