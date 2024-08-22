"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = __importDefault(require("mongoose"));
const infoSchema = new mongoose_1.default.Schema({
    documentId: { type: String, default: null },
    ipAddress: { type: String, default: null },
    fields: [
        {
            _id: false, // This disables the automatic _id field for objects in the array
            name: { type: String, default: null },
            type: { type: String, default: null },
            label: { type: String, default: null },
            value: { type: String, default: null }
        }
    ],
    createdAt: { type: Number, default: () => (0, moment_1.default)().utc().valueOf() },
    updatedAt: { type: Number, default: () => (0, moment_1.default)().utc().valueOf() }
}, {
    timestamps: false // Disable timestamp because we are handling createdAt and updatedAt manually, if we are setting this to true then it will create automatically createdAt and updatedAt with Date type.
});
const infoModel = mongoose_1.default.model("Infos", infoSchema);
exports.default = infoModel;
