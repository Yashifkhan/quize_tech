import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoute from './routes/userRoutes/authRoutes.js'
dotenv.config()
const app=express()
app.use(cors())
app.use(express.json())
app.use('/api/v1',authRoute)

app.listen(process.env.PORT || 8000,()=>{
    console.log(`server is running on port ${process.env.PORT}`);
    
})