import express from 'express';
import Controller from './user.controller';
import { authorization } from '../../middleware/authorization';
const router = express.Router();

import multer from 'multer';
// const upload = multer({ dest: 'src/uploads/' });
const upload = multer();


router.post('/login', Controller.login);
router.post('/text',authorization, Controller.saveTexts); 
router.patch('/text',authorization, Controller.updateTexts)
router.get('/text/:_id', authorization, Controller.textDetail)
router.post('/upload', authorization, upload.single('file'), Controller.textExtract)
router.get('/files', authorization, Controller.fileLists)
router.delete('/files', authorization, Controller.deleteFile)
router.delete('/logout', authorization, Controller.logout)


export default router;