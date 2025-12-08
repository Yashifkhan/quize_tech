import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoute from './routes/userRoutes/authRoutes.js'
import quizeRoute from './routes/adminRoutes/quizeRoutes.js'
import http from "http"
import { Server } from 'socket.io'
import { OneVsOne, oneVsOneQuizeSubmit } from './socketIo/oneVsOne.js'

dotenv.config()

const app=express()
app.use(cors())
app.use(express.json())


const server=http.createServer(app)
const io=new Server(server,{
    cors:{origin:"*"}
})
OneVsOne(io)


app.use('/api/v1',authRoute)
app.use('/api/v1',quizeRoute)
app.post('/api/v1/submit-oneVsone-quiz/:user_id',oneVsOneQuizeSubmit)

server.listen(process.env.PORT || 8000,()=>{
    console.log(`server is running on port ${process.env.PORT}`);
    
})