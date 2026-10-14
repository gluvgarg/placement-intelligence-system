import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json({limit: "256kb"}));
app.use(express.urlencoded({extended: true, limit: "256kb"}));
app.use(express.static("public"))
app.use(cookieParser());

//user Routes
import userRouter from "./src/routes/user.routes.js";
app.use("/api/v1/users" , userRouter);

//company Routes
import companyRouter from "./src/routes/company.routes.js";
app.use("/api/v1/companies" , companyRouter);

//job Routes
import jobRouter from "./src/routes/job.routes.js";
app.use("/api/v1/jobs", jobRouter);

//application Routes
import applicationRouter from "./src/routes/application.routes.js";
app.use("/api/v1/applications",applicationRouter);

export default app;