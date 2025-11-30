import express from 'express'
import { createQuiz, genrateQuize, getAllQuizs, getQuiz, getQuizCategoryTopicname, getReAttemptQuiz, recommendationQuiz, reviewQuiz, submitQuiz, updateQuiz } from '../../controller/adminController/quizeController.js'
const quizeRoute =express.Router()

quizeRoute.route('/create-quiz').post(createQuiz)
quizeRoute.route("/get-quiz/:selectedDiff/:userId").get(getQuiz)
quizeRoute.route("/update-quiz",).post(updateQuiz)
quizeRoute.route("/submit-quiz").post(submitQuiz)
quizeRoute.route("/reviewQuiz/:quizId/:userId").get(reviewQuiz)
quizeRoute.route("/getQuizCategoryTopicname").get(getQuizCategoryTopicname)
quizeRoute.route("/re-attempt-quiz/:userId/:quizId/:selectedReAtteQuiz").get(getReAttemptQuiz)
quizeRoute.route("/get-quizs-all").get(getAllQuizs)
quizeRoute.route("/recommendation-quiz/:userId").get(recommendationQuiz)
quizeRoute.route("/genrate-quize").post(genrateQuize)

export default quizeRoute