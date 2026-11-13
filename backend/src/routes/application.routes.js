import { Router } from "express";

import {
  createApplication,
  updateApplicationStatus,
  allApplicationByJobId,
  allApplicationsByUserId,
  getApplication,
  withdrawApplication,
  getAllApplications
} from "../controllers/application.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const applicationRouter = Router();

// Create a new application
applicationRouter.route("/:jobId").post(
  isAuthenticated,
  authorizeRoles("user"),
  upload.single("resume"),
  createApplication
);

// Get all applications submitted by the logged-in user
applicationRouter.route("/my").get(
  isAuthenticated,
  allApplicationsByUserId
);

// Get all applications for a particular job (admin only)
applicationRouter.route("/job/:jobId").get(
  isAuthenticated,
  authorizeRoles("admin"),
  allApplicationByJobId
);

// Update application status (admin only)
applicationRouter.route("/:applicationId/status").patch(
  isAuthenticated,
  authorizeRoles("admin"),
  updateApplicationStatus
);

// Withdraw an application (logged-in student)
applicationRouter.route("/:applicationId/withdraw").patch(
  isAuthenticated,
  authorizeRoles("user"),
  withdrawApplication
);

// Get an individual application
applicationRouter.route("/:applicationId").get(
  isAuthenticated,
  getApplication
);

// Get all applications (admin only)
applicationRouter.route("/").get(
  isAuthenticated,
  authorizeRoles("admin"),
  getAllApplications
);

export default applicationRouter;
