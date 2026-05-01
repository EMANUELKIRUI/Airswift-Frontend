import mongoose, { Document, Schema } from 'mongoose';

export interface IInterview extends Document {
  application: mongoose.Types.ObjectId;
  interviewer: mongoose.Types.ObjectId;
  type: 'voice' | 'video';
  scheduledAt: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  recording?: string; // URL to recording
  feedback?: string;
  rating?: number; // 1-5
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema: Schema = new Schema({
  application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
  interviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['voice', 'video'], required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no-show'], default: 'scheduled' },
  notes: String,
  recording: String,
  feedback: String,
  rating: { type: Number, min: 1, max: 5 },
}, {
  timestamps: true,
});

export default mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);