"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("./user.controller"));
const authorization_1 = require("../../middleware/authorization");
const router = express_1.default.Router();
router.post('/login', user_controller_1.default.login);
router.post('/embedding', user_controller_1.default.embeddingsCreate);
router.get('/search', user_controller_1.default.searchInput);
router.post('/text', authorization_1.authorization, user_controller_1.default.saveTexts);
router.patch('/text', authorization_1.authorization, user_controller_1.default.updateTexts);
router.get('/text', authorization_1.authorization, user_controller_1.default.textLists);
router.get('/text/:_id', authorization_1.authorization, user_controller_1.default.textDetail);
router.delete('/text/:_id', authorization_1.authorization, user_controller_1.default.deleteText);
router.get('/chatList/', authorization_1.authorization, user_controller_1.default.chatList);
exports.default = router;
