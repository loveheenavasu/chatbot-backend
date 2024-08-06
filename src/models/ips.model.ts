import moment from 'moment';
import mongoose from 'mongoose';
import IIps from '../interfaces/ips.interface';

const ipSchema = new mongoose.Schema<IIps>({
    ipAddress: { type: String, default: null },
    documentId: { type: String, default: null },
    createdAt: { type: Number, default: () => moment().utc().valueOf() }
}, {
    timestamps: false
})

const ipAddressModel = mongoose.model<IIps>("Ips", ipSchema);
export default ipAddressModel;