"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
var signType;
(function (signType) {
    signType["GOOGLE"] = "GOOGLE";
})(signType || (exports.signType = signType = {}));
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, default: null },
    firstname: { type: String, default: null },
    lastname: { type: String, default: null },
    email: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    image: { type: String, default: null },
    password: { type: String, default: null },
    otp: { type: String, default: null },
    uniqueCode: { type: String, default: null },
    type: { type: String, enum: signType, default: null },
    isEmailVerified: { type: Boolean, default: false },
    createdAt: { type: Number, default: 0 },
    updatedAt: { type: Number, default: 0 },
});
const userModel = mongoose_1.default.model("users", userSchema);
exports.default = userModel;
