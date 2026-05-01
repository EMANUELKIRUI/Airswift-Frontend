import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  benefits?: string[];
  postedBy: mongoose.Types.ObjectId;
  isActive: boolean;
  applicationsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['full-time', 'part-time', 'contract', 'freelance'], required: true },
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' },
  },
  requirements: [{ type: String }],
  benefits: [{ type: String }],
  postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  applicationsCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);