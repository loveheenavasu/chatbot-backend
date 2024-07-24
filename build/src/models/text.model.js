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
exports.type = void 0;
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = __importStar(require("mongoose"));
var type;
(function (type) {
    type["TEXT"] = "TEXT";
    type["FILE"] = "FILE";
})(type || (exports.type = type = {}));
const textSchema = new mongoose_1.default.Schema({
    text: { type: String, default: null },
    type: { type: String, default: type.TEXT, enum: type },
    fileName: { type: String, default: null },
    documentId: { type: String, default: null },
    docNo: { type: Number, default: 1 },
    userId: { type: mongoose_1.Types.ObjectId, default: null, ref: "users" },
    createdAt: { type: Number, default: (0, moment_1.default)().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
});
const textModel = mongoose_1.default.model("texts", textSchema);
exports.default = textModel;
