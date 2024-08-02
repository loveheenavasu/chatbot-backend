import express from 'express';
import Controller from './user.controller';
import { authorization } from '../../middleware/authorization';
const router = express.Router();

import multer from 'multer';
import Validation from './user.validation';
// const upload = multer({ dest: 'src/uploads/' });
const upload = multer();

router.post('/signup', Validation.signup, Controller.signup)
router.post('/verify', Validation.verify, authorization, Controller.verifyEmail)
router.post('/resend', Validation.resendAndForgot, Controller.resendOtp)
router.post('/forgot', Validation.resendAndForgot, Controller.forgotPassword)
router.post('/verify-otp', Validation.verifyForgot, Controller.verifyOtp)
router.post('/reset', Validation.resetPass, Controller.resetPassword)
router.post('/login', Validation.login, Controller.login)
// router.get('/profile',authorization, Controller.profile)

router.post('/social-login', Validation.socialLogin, Controller.socialLogin);
router.get('/chatbot', authorization, Controller.chatbotLists)
router.delete('/chatbot', Validation.documentId, authorization, Controller.deleteChatbot)
router.post('/text', Validation.text, authorization, Controller.saveTexts)
router.patch('/text', Validation.updateText, authorization, Controller.updateTexts)
router.get('/text', Validation.textDetail, authorization, Controller.textDetail)
router.post('/upload', upload.single('file'), Validation.uploadFile, authorization, Controller.textExtract)
router.get('/files', Validation.documentIdWithPL, authorization, Controller.fileLists)
router.delete('/files', Validation.deleteFile, authorization, Controller.deleteFile)
router.delete('/logout', authorization, Controller.logout)

router.get('/chat-history', Validation.documentIdWithPL, authorization, Controller.chatHistory)
router.get('/chat', Validation.sessionIdWithPL, authorization, Controller.chatDetail)
// router.post('/url', Controller.url)
export default router;