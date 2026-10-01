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

export default app;