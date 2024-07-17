"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const { SALT_ROUND, SECRET_KEY, CLIENT_ID } = process.env;
console.log("salt round---", SALT_ROUND);
console.log("secret key----", SECRET_KEY);
class CommonHelper {
}
_a = CommonHelper;
CommonHelper.setOptions = (pagination, limit, sort) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //     let setPagination = typeof(pagination) ?? 1;
        //     let setLimit = typeof(limit) ?? 10;
        //     let options = {
        //         lean: true,
        //         skip: parseInt(setPagination) * parseInt(setLimit),
        //         limit: setLimit,
        //         sort: { _id: -1 }
        //     }
        //     return options;
        const defaultLimit = 10;
        let options = {
            lean: true,
            sort: sort
        };
        if (pagination == undefined && typeof limit != undefined) {
            options = {
                lean: true,
                limit: parseInt(limit),
                sort: sort
            };
        }
        else if (typeof pagination != undefined && typeof limit == undefined) {
            options = {
                lean: true,
                skip: parseInt(pagination) * defaultLimit,
                limit: defaultLimit,
                sort: sort
            };
        }
        else if (typeof pagination != undefined && typeof limit != undefined) {
            options = {
                lean: true,
                skip: parseInt(pagination) * parseInt(limit),
                limit: parseInt(limit),
                sort: sort
            };
        }
        return options;
    }
    catch (err) {
        throw err;
    }
});
exports.default = CommonHelper;
