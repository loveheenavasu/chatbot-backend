"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, default: null },
    email: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    image: { type: String, default: null },
    createdAt: { type: Number, default: 0 },
    updatedAt: { type: Number, default: 0 },
});
const userModel = mongoose_1.default.model("users", userSchema);
exports.default = userModel;
