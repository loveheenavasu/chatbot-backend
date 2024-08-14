"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorType = void 0;
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = __importDefault(require("mongoose"));
var colorType;
(function (colorType) {
    colorType["PRIMARY"] = "PRIMARY";
    colorType["SECONDARY"] = "SECONDARY";
})(colorType || (exports.colorType = colorType = {}));
const themeSchema = new mongoose_1.default.Schema({
    theme: { type: String, default: null },
    createdAt: { type: Number, default: () => (0, moment_1.default)().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
}, {
    timestamps: false // Disable timestamp because we are handling createdAt and updatedAt manually, if we are setting this to true then it will create automatically createdAt and updatedAt with Date type.
});
const themeModel = mongoose_1.default.model("Themes", themeSchema);
exports.default = themeModel;
