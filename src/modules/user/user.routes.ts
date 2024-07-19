import express from 'express';
import Controller from './user.controller';
import { authorization } from '../../middleware/authorization';
const router = express.Router();

router.post('/login', Controller.login);
router.post('/embedding', Controller.embeddingsCreate);
router.get('/search', Controller.searchInput)

router.post('/text',authorization, Controller.saveTexts); 
router.patch('/text',authorization, Controller.updateTexts)
router.get('/text', authorization, Controller.textLists)
router.get('/text/:_id',authorization, Controller.textDetail)
router.delete('/text/:_id', authorization, Controller.deleteText)
router.get('/chatList/', authorization, Controller.chatList)
router.delete('/logout', authorization, Controller.logout)

export default router;