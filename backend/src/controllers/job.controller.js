import mongoose from "mongoose";
import Company from "../models/company.model.js";
import Job from "../models/job.model.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Register a new job
const registerJob = AsyncHandler(async (req, res) => {
  const {
    title,
    description,
    jobType,
    mode,
    salary,
    applicationDeadline,
  } = req.body;

  const companyId = req.body.companyId || req.params.companyId;

  if (!companyId) {
    throw new ApiError(400, "Company ID is required!");
  }

  const company = await Company.findById(companyId);

  if (!company) {
    throw new ApiError(404, "Company does not exist!");
  }

  if (
    !title?.trim() ||
    !description?.trim() ||
    salary === undefined ||
    salary === null ||
    salary === "" ||
    !applicationDeadline
  ) {
    throw new ApiError(400, "All required fields must be provided!");
  }

  const deadline = new Date(applicationDeadline);

  if (Number.isNaN(deadline.getTime())) {
    throw new ApiError(400, "Invalid application deadline!");
  }

  let skills = req.body.skills;

  if (typeof skills === "string") {
    try {
      skills = JSON.parse(skills);
    } catch {
      throw new ApiError(400, "Invalid skills data!");
    }
  }

  if (skills !== undefined && !Array.isArray(skills)) {
    throw new ApiError(400, "Skills must be an array!");
  }

  const job = await Job.create({
    title: title.trim(),
    description: description.trim(),
    jobType,
    mode,
    salary,
    applicationDeadline: deadline,
    skills: skills ?? [],
    companyId: company._id,
  });

  return res.status(201).json(
    new ApiResponse(201, "Job registered successfully!", job)
  );
});


// Get all jobs
// Get all active jobs with company information
const getAllJobs = AsyncHandler(async (req, res) => {

  const jobs = await Job.find({
    status: "active",
    applicationDeadline: { $gt: new Date() },
  })
    .populate({
      path: "companyId",
      select: "name location logo",
    })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      "Jobs retrieved successfully!",
      jobs
    )
  );
});


// Get a job by ID
const getJobById = AsyncHandler(async (req, res) => {
  const { jobId } = req.params;

  // 1. Validate the job ID
  if (!jobId || !mongoose.isValidObjectId(jobId)) {
    throw new ApiError(400, "Invalid job ID!");
  }

  // 2. Retrieve the job
  const job = await Job.findById(jobId)
    .populate("companyId");

  if (!job) {
    throw new ApiError(404, "Job not found!");
  }

  // 3. Check whether the deadline has passed
  const isExpired =
    new Date(job.applicationDeadline) <= new Date();

  // 4. Return job details and availability
  return res.status(200).json(
    new ApiResponse(200, "Job retrieved successfully!", {
      job,
      isExpired,
      canApply: job.status === "active" && !isExpired,
    })
  );
});



// Update a job by ID
const updateJob = AsyncHandler(async (req, res) => {
  const id = req.params.jobId || req.params.id;

  if (!id) {
    throw new ApiError(400, "Job ID is required!");
  }

  const {
    title,
    description,
    jobType,
    mode,
    salary,
    applicationDeadline,
  } = req.body;

  const updatedData = {};

  // Add only fields that were provided
  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      throw new ApiError(400, "Title cannot be empty!");
    }
    updatedData.title = title.trim();
  }

  if (description !== undefined) {
    if (typeof description !== "string" || !description.trim()) {
      throw new ApiError(400, "Description cannot be empty!");
    }
    updatedData.description = description.trim();
  }

  if (jobType !== undefined) updatedData.jobType = jobType;
  if (mode !== undefined) updatedData.mode = mode;

  if (salary !== undefined) {
    if (salary === "" || !Number.isFinite(Number(salary)) ||
        Number(salary) < 0) {
      throw new ApiError(400, "Invalid salary!");
    }
    updatedData.salary = salary;
  }

  if (applicationDeadline !== undefined) {
    const deadline = new Date(applicationDeadline);

    if (Number.isNaN(deadline.getTime())) {
      throw new ApiError(400, "Invalid application deadline!");
    }

    updatedData.applicationDeadline = deadline;
  }

  // Handle skills when supplied
  let skills = req.body.skills;

  if (typeof skills === "string") {
    try {
      skills = JSON.parse(skills);
    } catch {
      throw new ApiError(400, "Invalid skills data!");
    }
  }

  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      throw new ApiError(400, "Skills must be an array!");
    }
    updatedData.skills = skills;
  }

  if (Object.keys(updatedData).length === 0) {
    throw new ApiError(400, "Provide at least one field to update!");
  }

  const updatedJob = await Job.findByIdAndUpdate(
    id,
    { $set: updatedData },
    { new: true, runValidators: true }
  );

  if (!updatedJob) {
    throw new ApiError(404, "Job not found!");
  }

  return res.status(200).json(
    new ApiResponse(200, "Job updated successfully!", updatedJob)
  );
});


// Delete a job by ID
const deleteJob = AsyncHandler(async (req, res) => {
  const id = req.params.jobId || req.params.id;

  if (!id) {
    throw new ApiError(400, "Job ID is required!");
  }

  const deletedJob = await Job.findByIdAndDelete(id);

  if (!deletedJob) {
    throw new ApiError(404, "Job not found!");
  }

  return res.status(200).json(
    new ApiResponse(200, "Job deleted successfully!", deletedJob)
  );
});


// Get jobs by company ID
const getJobByCompanyId = AsyncHandler(async (req, res) => {
  const companyId = req.params.companyId || req.body.companyId;

  if (!companyId) {
    throw new ApiError(400, "Company ID is required!");
  }

  const company = await Company.findById(companyId);

  if (!company) {
    throw new ApiError(404, "Company does not exist!");
  }

  const jobs = await Job.find({ companyId }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, "Company jobs retrieved successfully!", jobs)
  );
});


export {
  registerJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobByCompanyId,
};
