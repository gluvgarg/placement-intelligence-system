import mongoose from "mongoose"
import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//create a application
const createApplication = AsyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const user = req.user;

  if (!user?._id) {
    throw new ApiError(401, "Please log in first!");
  }

  if (!mongoose.isValidObjectId(jobId)) {
    throw new ApiError(400, "Invalid job ID!");
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(404, "Job not found!");
  }

  if (
    job.status !== "active" ||
    new Date(job.applicationDeadline) <= new Date()
  ) {
    throw new ApiError(400, "Applications for this job are closed!");
  }

  // Check for an existing application
  const existingApplication = await Application.findOne({
    userId: user._id,
    jobId,
  });

  if (existingApplication) {
    throw new ApiError(
      409,
      "You have already applied for this job!"
    );
  }

  // Prefer the resume saved in the user's profile
  let resumeUrl = user.resumeUrl;

  // If no profile resume exists, allow an uploaded resume
  if (!resumeUrl) {
    if (!req.file?.path) {
      throw new ApiError(
        400,
        "Please upload a resume or add one to your profile!"
      );
    }

    const uploadedResume = await uploadOnCloudinary(req.file.path);

    // Adjust this according to your Cloudinary utility's return shape
    resumeUrl =
      typeof uploadedResume === "string"
        ? uploadedResume
        : uploadedResume?.secure_url;
  }

  if (!resumeUrl) {
    throw new ApiError(500, "Resume upload failed!");
  }

  const newApplication = await Application.create({
    userId: user._id,
    jobId: job._id,
    resumeUrl,
    status: "applied",
    appliedAt: new Date(),
    statusUpdatedAt: new Date(),
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      "Application submitted successfully!",
      newApplication
    )
  );
});

//update application (status)
const updateApplicationStatus = AsyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { status, interviewDate } = req.body;

  if (!mongoose.isValidObjectId(applicationId)) {
    throw new ApiError(400, "Invalid application ID!");
  }

  const allowedStatuses = [
    "under_review",
    "assessment",
    "shortlisted",
    "interview_scheduled",
    "selected",
    "rejected",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid application status!");
  }

  const updatedData = {
    status,
    statusUpdatedAt: new Date(),
  };

  if (status === "interview_scheduled") {
    if (!interviewDate) {
      throw new ApiError(400, "Interview date is required!");
    }

    const parsedDate = new Date(interviewDate);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new ApiError(400, "Invalid interview date!");
    }

    updatedData.interviewDate = parsedDate;
  }

  const updatedApplication = await Application.findByIdAndUpdate(
    applicationId,
    { $set: updatedData },
    { new: true, runValidators: true }
  );

  if (!updatedApplication) {
    throw new ApiError(404, "Application not found!");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      "Application status updated successfully!",
      updatedApplication
    )
  );
});

//get all application by job id (used for admin for v1)
const allApplicationByJobId = AsyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.isValidObjectId(jobId)) {
    throw new ApiError(400, "Invalid job ID!");
  }

  const applications = await Application.find({ jobId })
    .populate("userId", "fullname email resumeUrl")
    .sort({ appliedAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      "Applications retrieved successfully!",
      applications
    )
  );
});

//get all applications by user id
const allApplicationsByUserId = AsyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Please log in first!");
  }

  // const applications = await Application.find({ userId })
  //   .populate("jobId")
  //   .sort({ appliedAt: -1 });

  const applications = await Application.find({ userId })
  .populate({
    path: "jobId",
    populate: {
      path: "companyId",
      select: "name location logo",
    },
  })
  .sort({ appliedAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      "Your applications retrieved successfully!",
      applications
    )
  );
});

//get application by appliaitonId
const getApplication = AsyncHandler(async (req, res) => {
  const { applicationId } = req.params;

  if (!mongoose.isValidObjectId(applicationId)) {
    throw new ApiError(400, "Invalid application ID!");
  }

  const application = await Application.findById(applicationId)
    .populate("jobId")
    .populate("userId", "name email resumeUrl");

  if (!application) {
    throw new ApiError(404, "Application not found!");
  }

  const isOwner =
    application.userId._id.toString() === req.user._id.toString();

  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You cannot access this application!");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      "Application retrieved successfully!",
      application
    )
  );
});

//withdraw applicaiton
const withdrawApplication = AsyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.isValidObjectId(applicationId)) {
    throw new ApiError(400, "Invalid application ID!");
  }

  const application = await Application.findById(applicationId);

  if (!application) {
    throw new ApiError(404, "Application not found!");
  }

  if (application.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "You cannot withdraw this application!");
  }

  if (
    ["selected", "rejected", "withdrawn"].includes(application.status)
  ) {
    throw new ApiError(
      400,
      "This application cannot be withdrawn in its current status!"
    );
  }

  application.status = "withdrawn";
  application.statusUpdatedAt = new Date();

  await application.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      "Application withdrawn successfully!",
      application
    )
  );
});

export {
  createApplication,
  updateApplicationStatus,
  allApplicationByJobId,
  allApplicationsByUserId,
  getApplication,
  withdrawApplication
}