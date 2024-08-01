import Handler from "../../../handler/handler"
import { sessionType } from "../../../models/chat-session.model";

export default class ChatHistoryAggregation {

    static matchData = async (documentId: any) => {
        try {
            return {
                $match: {
                    documentId: documentId?.toString()
                }
            }
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static lookupChatSessions = async () => {
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
            }
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static unwindChatSessions = async () => {
        try {
            return {
                $unwind: {
                    path: "$chatsessions",
                    preserveNullAndEmptyArrays: false
                }
            }
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static lookupMessages = async () => {
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
            await Handler.handleCustomError(err);
        }
    }

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

    static groupData = async () => {
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
            }
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static facetData = async (pagination: any, limit: any) => {
        try {
            let setPagination = pagination ?? 0;
            let setLimit = limit ?? 10

            return {
                $facet: {
                    count: [{ $count: "count" }],
                    data: [
                        { $sort: { _id: -1 } },
                        { $skip: parseInt(setPagination) * parseInt(setLimit) },
                        { $limit: parseInt(setLimit) }
                    ]
                }
            }

        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }
}