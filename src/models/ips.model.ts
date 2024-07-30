import moment from 'moment';
import mongoose from 'mongoose';

const ipSchema = new mongoose.Schema({
    ipAddress: { type: String, default: null },
    createdAt: { type: Number, default: moment().utc().valueOf() }
})

const ipAddressModel = mongoose.model("ips", ipSchema);
export default ipAddressModel;