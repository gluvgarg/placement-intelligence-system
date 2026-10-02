import router from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  registerCompany,
  deleteCompany,
  getAllCompanies,
  getCompany,
  updateCompanyDetails
} from "../controllers/company.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";

const companyRouter = router.Router();

//admin protected routes
companyRouter.route("/").post(isAuthenticated,authorizeRoles("admin"),upload.single("logo"),registerCompany);

companyRouter.route("/:id").patch(isAuthenticated,authorizeRoles("admin"),upload.single("logo"),updateCompanyDetails)

companyRouter.route("/:id").delete(isAuthenticated,authorizeRoles("admin"),deleteCompany)

//normal routes for view company data
companyRouter.route("/").get(isAuthenticated,getAllCompanies);

companyRouter.route("/:id").get(isAuthenticated,getCompany)


export default companyRouter
