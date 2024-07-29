import express from 'express';
import Controller from './user.controller';
import { authorization } from '../../middleware/authorization';
const router = express.Router();

import multer from 'multer';
// const upload = multer({ dest: 'src/uploads/' });
const upload = multer();

router.post('/signup', Controller.signup)
router.post('/verify', authorization, Controller.verifyEmail)
router.post('/resend', Controller.resendOtp)
router.post('/forgot', Controller.forgotPassword)
router.post('/verify-otp', Controller.verifyOtp)
router.post('/reset', Controller.resetPassword)
router.post('/login', Controller.login)
router.get('/profile',authorization, Controller.profile)


router.post('/social-login', Controller.socialLogin);
router.get('/chatbot', authorization, Controller.chatbotLists)
router.delete('/chatbot', authorization, Controller.deleteChatbot)
router.post('/text', authorization, Controller.saveTexts)
router.patch('/text', authorization, Controller.updateTexts)
router.get('/text', authorization, Controller.textDetail)
router.post('/upload', authorization, upload.single('file'), Controller.textExtract)
router.get('/files', authorization, Controller.fileLists)
router.delete('/files', authorization, Controller.deleteFile)
router.delete('/logout', authorization, Controller.logout);


// router.post('/url', Controller.url)

export default router;