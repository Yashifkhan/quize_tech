import express from 'express'
import { createQuiz, getQuiz, getQuizCategoryTopicname, reviewQuiz, submitQuiz, updateQuiz } from '../../controller/adminController/quizeController.js'
const quizeRoute =express.Router()

quizeRoute.route('/create-quiz').post(createQuiz)
quizeRoute.route("/get-quiz/:selectedDiff").get(getQuiz)
quizeRoute.route("/update-quiz",).post(updateQuiz)
quizeRoute.route("/submit-quiz").post(submitQuiz)
quizeRoute.route("/reviewQuiz/:quizId/:userId").get(reviewQuiz)
quizeRoute.route("/getQuizCategoryTopicname").get(getQuizCategoryTopicname)

export default quizeRoute