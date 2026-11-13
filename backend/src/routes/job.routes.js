import { Router } from "express";

import {
  registerJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobByCompanyId,
  getAllJobsForAdmin,
} from "../controllers/job.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";

const jobRouter = Router();

// Get all jobs
jobRouter
  .route("/")
  .get(isAuthenticated, getAllJobs);

// Get jobs belonging to a specific company
jobRouter
  .route("/company/:companyId")
  .get(isAuthenticated, getJobByCompanyId);

// Register a job (admin only)
jobRouter
  .route("/register/:companyId")
  .post(isAuthenticated, authorizeRoles("admin"), registerJob);

// Get a particular job
jobRouter
  .route("/:jobId")
  .get(isAuthenticated, getJobById);

// Update a job (admin only)
jobRouter
  .route("/:jobId")
  .patch(isAuthenticated, authorizeRoles("admin"), updateJob);

// Delete a job (admin only)
jobRouter
  .route("/:jobId")
  .delete(isAuthenticated, authorizeRoles("admin"), deleteJob);

// Admin: retrieve every job
jobRouter
  .route("/admin/all")
  .get(isAuthenticated, authorizeRoles("admin"), getAllJobsForAdmin);

export default jobRouter
