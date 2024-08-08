"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
var SignType;
(function (SignType) {
    SignType["GOOGLE"] = "GOOGLE";
})(SignType || (exports.SignType = SignType = {}));
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
    type: { type: String, enum: Object.values(SignType), default: null },
    isEmailVerified: { type: Boolean, default: false },
    createdAt: { type: Number, default: () => (0, moment_1.default)().utc().valueOf() },
    updatedAt: { type: Number, default: 0 },
}, {
    timestamps: false // Disable timestamp because we are handling createdAt and updatedAt manually, if we are setting this to true then it will create automatically createdAt and updatedAt with Date type.
});
const userModel = mongoose_1.default.model("Users", userSchema);
exports.default = userModel;
