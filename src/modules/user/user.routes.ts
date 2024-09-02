import express from 'express';
import * as Controller from './user.controller';
import { authorization } from '../../middleware/authorization';
import multer from 'multer';
import * as Validation from './user.validation';
const router = express.Router();
const upload = multer();

router.post('/signup', Validation.signup, Controller.signup)
router.post('/verify', Validation.verify, authorization, Controller.verifyEmail)
router.post('/resend', Validation.resendAndForgot, Controller.resendOtp)
router.post('/forgot', Validation.resendAndForgot, Controller.forgotPassword)
router.post('/verify-otp', Validation.verifyForgot, Controller.verifyOtp)
router.post('/reset', Validation.resetPassword, Controller.resetPassword)
router.post('/login', Validation.login, Controller.login)

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

router.post('/theme', Validation.themeCreate, Controller.createTheme)
router.get('/theme', Controller.themeList)

router.post('/form', Validation.formAdd, authorization, Controller.formAdd)
router.put('/form', Validation.formUpdate, authorization, Controller.formUpdate)
router.get('/form', Validation.documentId, authorization, Controller.formDetail)
router.get('/form-chatbot', Validation.documentId, Controller.formChatbot)
router.get('/form-ip', Validation.documentId, Controller.formWithIp)
router.post('/form-info', Validation.formInfoAdd, Controller.formInfoAdd)

export default router;