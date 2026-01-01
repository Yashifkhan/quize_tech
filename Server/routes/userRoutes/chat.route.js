import express from 'express'
import multer from 'multer';
import { startChatController } from '../../controller/userController/chat.controller.js'
const chatRoute = express.Router()
const upload = multer({ dest: 'uploads/' });

chatRoute.route('/start').post(upload.single('file'), startChatController);
export default chatRoute