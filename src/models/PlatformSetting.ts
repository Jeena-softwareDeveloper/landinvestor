import mongoose, { Schema, Model } from 'mongoose';

export interface IPlatformSettingDocument extends mongoose.Document {
  key: string;
  value: any;
  updatedAt: Date;
}

const PlatformSettingSchema = new Schema<IPlatformSettingDocument>({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const PlatformSetting: Model<IPlatformSettingDocument> =
  mongoose.models.PlatformSetting ||
  mongoose.model<IPlatformSettingDocument>('PlatformSetting', PlatformSettingSchema);

export default PlatformSetting;

