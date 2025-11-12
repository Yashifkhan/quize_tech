import express from 'express'
import { login, register } from '../../controller/userController/userController.js'
const authRoute = express.Router()

authRoute.route("/register").post(register)
authRoute.route("/login").post(login)

export default authRoute