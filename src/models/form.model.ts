import moment from 'moment';
import mongoose from 'mongoose';
import Forms from '../interfaces/form.interface';

const formSchema = new mongoose.Schema<Forms>({
    documentId: { type: String, default: null },
    fields: [
        {
            _id: false, // This disables the automatic _id field for objects in the array
            name: { type: String, default: null },
            type: { type: String, default: null },
            label: { type: String, default: null },
            isRequired: { type: Boolean, default: false }
        }
    ],
    createdAt: { type: Number, default: () => moment().utc().valueOf() },
    updatedAt: { type: Number, default: () => moment().utc().valueOf() }
}, {
    timestamps: false // Disable timestamp because we are handling createdAt and updatedAt manually, if we are setting this to true then it will create automatically createdAt and updatedAt with Date type.
})

const formModel = mongoose.model<Forms>("Forms", formSchema);
export default formModel;