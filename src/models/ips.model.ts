import moment from 'moment';
import mongoose from 'mongoose';
import Ips from '../interfaces/ips.interface';

const ipSchema = new mongoose.Schema<Ips>({
    ipAddress: { type: String, default: null },
    documentId: { type: String, default: null },
    createdAt: { type: Number, default: () => moment().utc().valueOf() }
}, {
    timestamps: false // Disable timestamp because we are handling createdAt and updatedAt manually, if we are setting this to true then it will create automatically createdAt and updatedAt with Date type.
})

const ipAddressModel = mongoose.model<Ips>("Ips", ipSchema);
export default ipAddressModel;