import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  coverLetter?: string;
  resume: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'accepted' | 'rejected';
  appliedAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema({
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: String,
  resume: { type: String, required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'accepted', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);