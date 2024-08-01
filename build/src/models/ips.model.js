"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = __importDefault(require("mongoose"));
const ipSchema = new mongoose_1.default.Schema({
    ipAddress: { type: String, default: null },
    documentId: { type: String, default: null },
    createdAt: { type: Number, default: (0, moment_1.default)().utc().valueOf() }
});
const ipAddressModel = mongoose_1.default.model("ips", ipSchema);
exports.default = ipAddressModel;
