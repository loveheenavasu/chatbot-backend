import moment from 'moment';
import mongoose, { Types } from 'mongoose';
import Theme from '../interfaces/theme.interface';

const themeSchema = new mongoose.Schema<Theme>({
    documentId: { type: String, default: null },
    primaryTheme: { type: String, default: null },
    primaryText: { type: String, default: null },
    secondaryTheme: { type: String, default: null },
    secondaryText: { type: String, default: null },
    createdAt: { type: Number, default: () => moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
}, {
    timestamps: false // Disable timestamp because we are handling createdAt and updatedAt manually, if we are setting this to true then it will create automatically createdAt and updatedAt with Date type.
})

const themeModel = mongoose.model<Theme>("Themes", themeSchema);
export default themeModel;