import {AsyncHandler} from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


const isAuthenticated = AsyncHandler(async (req, res, next) => {
 
    const accessToken =
        req.cookies?.accessToken ||
        req.headers.authorization?.replace("Bearer ", "");

 
    if (!accessToken) {
        throw new ApiError(
            401,
            "Authentication required"
        );
    }
 
    let decoded;

    try {
        decoded = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET
        );
    } catch (error) {
        throw new ApiError(
            401,
            "Invalid or expired access token"
        );
    }
 
    const user = await User
        .findById(decoded.id)
        .select("-password -refreshToken");


    if (!user) {
        throw new ApiError(
            401,
            "User no longer exists"
        );
    }
 
    req.user = user;

    next();
});


export { isAuthenticated };