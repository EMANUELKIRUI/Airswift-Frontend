// @ts-nocheck
import mongoose, { Schema, Document } from 'mongoose'

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId
  type: 'passport' | 'cv' | 'certificate' | 'cover_letter' | 'photo' | 'national_id'
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  status: 'missing' | 'uploaded' | 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  uploadedAt: Date
  reviewedAt?: Date
  reviewedBy?: mongoose.Types.ObjectId
  applicationId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const documentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['passport', 'cv', 'certificate', 'cover_letter', 'photo', 'national_id'],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['missing', 'uploaded', 'pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Prevent model recompilation in Next.js dev mode
const Document = mongoose.models.Document || mongoose.model<IDocument>('Document', documentSchema)

export default Document
