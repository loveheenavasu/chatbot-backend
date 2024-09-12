import moment from 'moment-timezone';
import { ErrorResponse } from "../../../handler/error";
import * as Handler from "../../../handler/handler";

const matchData = async (documentId: string) => {
    try {
        return {
            $match: { // match the documentId with the aggregate collection
                documentId: documentId
            }
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const lookupChatSessions = async () => {
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
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const unwindChatSessions = async () => {
    try {
        return {
            $unwind: { // array convert into objects with unwind (split into individual documents)
                path: "$chatsessions",
                preserveNullAndEmptyArrays: false
            }
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const lookupMessages = async () => {
    try {
        return {
            $lookup: {
                from: "messages", // collection from which we find the documents 
                let: { sessionId: "$chatsessions._id" },
                pipeline: [
                    {
                        $match: { // match the documents based on the condition
                            $expr: {
                                $eq: ["$sessionId", "$$sessionId"]
                            }
                        }
                    },
                    {
                        $sort: { // sorting in descending order based on _id
                            _id: -1
                        }
                    },
                    {
                        $limit: 2 // limit the result with only 2 documents 
                    },
                    {
                        $sort: { // sorting in ascending order based on _id
                            _id: 1
                        }
                    }
                ],
                as: "messages"
            }
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const redactData = async (startDate: number | undefined, endDate: number | undefined) => {
    try {
        let setStartDate = null, setEndDate = null;
        const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!!startDate && !!endDate) {
            setStartDate = moment.tz(Number(startDate), systemTimezone).valueOf();
            setEndDate = moment.tz(Number(endDate), systemTimezone).valueOf();
        }
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
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const groupData = async () => {
    try {
        return {
            $group: {
                _id: "$chatsessions._id", // Group documents by the _id field
                ipAddress: { $first: "$ipAddress" },
                documentId: { $first: "$documentId" },
                sessionType: { $first: "$chatsessions.sessionType" },
                message: { $first: "$messages" }
            }
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const facetData = async (pagination: number, limit: number) => {
    try {
        return {
            $facet: {  // $facet allows you to perform multiple separate aggregations on the same set of input documents.
                count: [{ $count: "count" }], // counts the total number of documents
                data: [
                    { $sort: { _id: -1 } }, // Sort documents by _id in descending order
                    { $skip: (pagination - 1) * limit }, // Skip documents based on the current page
                    { $limit: limit } // Limit the number of documents
                ]
            }
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

export {
    matchData,
    lookupChatSessions,
    unwindChatSessions,
    lookupMessages,
    groupData,
    facetData,
    redactData
}