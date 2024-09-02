"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionType = void 0;
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = __importStar(require("mongoose"));
var SessionType;
(function (SessionType) {
    SessionType["ONGOING"] = "ONGOING";
    SessionType["COMPLETED"] = "COMPLETED";
})(SessionType || (exports.SessionType = SessionType = {}));
const chatSessionSchema = new mongoose_1.default.Schema({
    ipAddressId: { type: mongoose_1.Types.ObjectId, default: null, ref: "Ips" },
    sessionType: { type: String, enum: Object.values(SessionType), default: SessionType.ONGOING },
    isFormCompleted: { type: Boolean, default: false },
    createdAt: { type: Number, default: () => (0, moment_1.default)().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
}, {
    timestamps: false /// Disable automatic timestamp because we are handling createdAt and updatedAt manually, if we are setting this to true then it will create automatically createdAt and updatedAt with Date type.
});
const chatSessionModel = mongoose_1.default.model("ChatSessions", chatSessionSchema);
exports.default = chatSessionModel;
