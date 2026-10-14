
import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resumeUrl: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "applied",
        "assessment",
        "shortlisted",
        "interview_scheduled",
        "selected",
        "rejected",
        "withdrawn",
      ],
      default: "applied",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    statusUpdatedAt: {
      type: Date,
      default: Date.now,
    },

    interviewDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index(
  { userId: 1, jobId: 1 },
  { unique: true }
);

const Application = mongoose.model(
  "Application",
  applicationSchema
);

export default Application;


