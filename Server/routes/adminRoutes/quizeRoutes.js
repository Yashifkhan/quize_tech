import express from 'express'
import { createQuiz, getQuiz } from '../../controller/adminController/quizeController.js'
const quizeRoute =express.Router()

quizeRoute.route('/create-quiz').post(createQuiz)
quizeRoute.route("/get-quiz").get(getQuiz)

export default quizeRoute