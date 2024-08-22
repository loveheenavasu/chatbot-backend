import moment from 'moment';
import mongoose, { Types } from 'mongoose';
import UserInfo from '../interfaces/information.interface';

const infoSchema = new mongoose.Schema<UserInfo>({
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
    createdAt: { type: Number, default: () => moment().utc().valueOf() },
    updatedAt: { type: Number, default: () => moment().utc().valueOf() }
}, {
    timestamps: false // Disable timestamp because we are handling createdAt and updatedAt manually, if we are setting this to true then it will create automatically createdAt and updatedAt with Date type.
})

const infoModel = mongoose.model<UserInfo>("Infos", infoSchema);
export default infoModel;