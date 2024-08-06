import { IErrorResponse } from "../../../handler/error";
import * as Handler from "../../../handler/handler";

const matchData = async (documentId: string) => {
    try {
        return {
            $match: {
                documentId: documentId
            }
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const lookupChatSessions = async () => {
    try {
        return {
            $lookup: {
                from: "chatsessions",
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
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const unwindChatSessions = async () => {
    try {
        return {
            $unwind: {
                path: "$chatsessions",
                preserveNullAndEmptyArrays: false
            }
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const lookupMessages = async () => {
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
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const groupData = async () => {
    try {
        return {
            $group: {
                _id: "$chatsessions._id",
                ipAddress: { $first: "$ipAddress" },
                documentId: { $first: "$documentId" },
                sessionType: { $first: "$chatsessions.sessionType" },
                message: { $first: "$messages" }
            }
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const facetData = async (pagination: number, limit: number) => {
    try {
        return {
            $facet: {
                count: [{ $count: "count" }],
                data: [
                    { $sort: { _id: -1 } },
                    { $skip: (pagination - 1) * limit },
                    { $limit: limit }
                ]
            }
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

export {
    matchData,
    lookupChatSessions,
    unwindChatSessions,
    lookupMessages,
    groupData,
    facetData
}