import moment from 'moment';
import mongoose, { Types } from 'mongoose';
import Theme from '../interfaces/theme.interface';

export enum colorType {
    PRIMARY = "PRIMARY",
    SECONDARY = "SECONDARY"
}

const themeSchema = new mongoose.Schema<Theme>({
    theme: { type: String, default: null },
    createdAt: { type: Number, default: () => moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
}, {
    timestamps: false // Disable timestamp because we are handling createdAt and updatedAt manually, if we are setting this to true then it will create automatically createdAt and updatedAt with Date type.
})

const themeModel = mongoose.model<Theme>("Themes", themeSchema);
export default themeModel;