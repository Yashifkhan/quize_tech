import express from 'express'
import { createQuiz, getQuiz, submitQuiz, updateQuiz } from '../../controller/adminController/quizeController.js'
const quizeRoute =express.Router()

quizeRoute.route('/create-quiz').post(createQuiz)
quizeRoute.route("/get-quiz").get(getQuiz)
quizeRoute.route("/update-quiz",).post(updateQuiz)
quizeRoute.route("/submit-quiz").post(submitQuiz)

export default quizeRoute