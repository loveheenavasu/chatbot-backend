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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactData = exports.facetData = exports.groupData = exports.lookupMessages = exports.unwindChatSessions = exports.lookupChatSessions = exports.matchData = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const Handler = __importStar(require("../../../handler/handler"));
const matchData = (documentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            $match: {
                documentId: documentId
            }
        };
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.matchData = matchData;
const lookupChatSessions = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            $lookup: {
                from: "chatsessions", // collection where to find the result based on match condition
                let: { ipAddressId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$ipAddressId", "$$ipAddressId"]
                            }
                        }
                    }
                ],
                as: "chatsessions"
            }
        };
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.lookupChatSessions = lookupChatSessions;
const unwindChatSessions = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            $unwind: {
                path: "$chatsessions",
                preserveNullAndEmptyArrays: false
            }
        };
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.unwindChatSessions = unwindChatSessions;
const lookupMessages = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            $lookup: {
                from: "messages", // collection from which we find the documents 
                let: { sessionId: "$chatsessions._id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$sessionId", "$$sessionId"]
                            }
                        }
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    },
                    {
                        $limit: 2 // limit the result with only 2 documents 
                    },
                    {
                        $sort: {
                            _id: 1
                        }
                    }
                ],
                as: "messages"
            }
        };
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.lookupMessages = lookupMessages;
const redactData = (startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let setStartDate = null, setEndDate = null;
        const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!!startDate && !!endDate) {
            setStartDate = moment_timezone_1.default.tz(Number(startDate), systemTimezone).valueOf();
            setEndDate = moment_timezone_1.default.tz(Number(endDate), systemTimezone).valueOf();
        }
        console.log("set start date---", setStartDate);
        console.log(" setEndDate ---", setEndDate);
        return {
            $redact: {
                $cond: {
                    if: {
                        $or: [
                            {
                                $and: [
                                    { $eq: [setStartDate, undefined] },
                                    { $eq: [setEndDate, undefined] }
                                ]
                            },
                            {
                                $and: [
                                    { $gte: ["$chatsessions.createdAt", setStartDate] },
                                    { $lte: ["$chatsessions.createdAt", setEndDate] }
                                ]
                            }
                        ]
                    },
                    then: "$$KEEP",
                    else: "$$PRUNE"
                }
            }
        };
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.redactData = redactData;
const groupData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            $group: {
                _id: "$chatsessions._id", // Group documents by the _id field
                ipAddress: { $first: "$ipAddress" },
                documentId: { $first: "$documentId" },
                sessionType: { $first: "$chatsessions.sessionType" },
                message: { $first: "$messages" }
            }
        };
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.groupData = groupData;
const facetData = (pagination, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            $facet: {
                count: [{ $count: "count" }], // counts the total number of documents
                data: [
                    { $sort: { _id: -1 } }, // Sort documents by _id in descending order
                    { $skip: (pagination - 1) * limit }, // Skip documents based on the current page
                    { $limit: limit } // Limit the number of documents
                ]
            }
        };
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.facetData = facetData;
