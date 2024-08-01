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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const handler_1 = __importDefault(require("../../../handler/handler"));
class ChatHistoryAggregation {
}
_a = ChatHistoryAggregation;
ChatHistoryAggregation.matchData = (documentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            $match: {
                documentId: documentId === null || documentId === void 0 ? void 0 : documentId.toString()
            }
        };
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
ChatHistoryAggregation.lookupChatSessions = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            $lookup: {
                from: "chatsessions",
                let: { ipAddressId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$ipAddressId", "$$ipAddressId"] },
                                    // { $eq: ["$sessionType", sessionType?.COMPLETED] }
                                ]
                            }
                        }
                    }
                ],
                as: "chatsessions"
            }
        };
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
ChatHistoryAggregation.unwindChatSessions = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            $unwind: {
                path: "$chatsessions",
                preserveNullAndEmptyArrays: false
            }
        };
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
ChatHistoryAggregation.lookupMessages = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            $lookup: {
                from: "messages",
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
                        $limit: 2
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
        yield handler_1.default.handleCustomError(err);
    }
});
// static unwindMessages = async () => {
//     try {
//         return {
//             $unwind: {
//                 path: "$messages",
//                 preserveNullAndEmptyArrays: false
//             }
//         }
//     }
//     catch (err) {
//         await Handler.handleCustomError(err);
//     }
// }
ChatHistoryAggregation.groupData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            $group: {
                _id: "$chatsessions._id",
                ipAddress: { $first: "$ipAddress" },
                documentId: { $first: "$documentId" },
                sessionType: { $first: "$chatsessions.sessionType" },
                message: { $first: "$messages" }
                // messageType: { $first: "$messages.messageType" },
                // createdAt: { $first:"$messages.createdAt"}
            }
        };
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
ChatHistoryAggregation.facetData = (pagination, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let setPagination = pagination !== null && pagination !== void 0 ? pagination : 0;
        let setLimit = limit !== null && limit !== void 0 ? limit : 10;
        return {
            $facet: {
                count: [{ $count: "count" }],
                data: [
                    { $sort: { _id: -1 } },
                    { $skip: parseInt(setPagination) * parseInt(setLimit) },
                    { $limit: parseInt(setLimit) }
                ]
            }
        };
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
exports.default = ChatHistoryAggregation;
