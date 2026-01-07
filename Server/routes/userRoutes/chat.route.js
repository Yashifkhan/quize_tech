import express from 'express'
import multer from 'multer';
import { chatTestController, startChatController } from '../../controller/userController/chat.controller.js'
const chatRoute = express.Router()
const upload = multer({ dest: 'uploads/' });


chatRoute.route('/start').post(upload.single('file'), startChatController);
chatRoute.route('/simple-chat').post(chatTestController)
export default chatRoute