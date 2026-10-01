import User from "../models/user.model.js";
import {AsyncHandler} from "../utils/AsyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({
        validateBeforeSave: false
    });

    return {
        accessToken,
        refreshToken
    };
};

//register user 
const registerUser = AsyncHandler(async(req,res) => {
  //algo :
  //step1: take data from req.body
  //step2 : check if user already exists or not
  //step3 : if user exists then throw error else create new user
  //step4 : send the response to the user with success message and user data

  
    const {fullname , email , password , mobile } = req.body;

    if(!fullname || !email || !password || !mobile){
      throw new ApiError(400 , "All fields are required");
    }

    const existingUser = await User.findOne({email});

    if(existingUser) {
      throw new ApiError(400 , "user already exists!");
    }

    const newUser = await User.create({
      fullname,
      email,
      password,
      mobile
    });

    res.status(201).json(
      new ApiResponse(201 , "user registered successfully" , newUser)
    )

})

//login user
const loginUser = AsyncHandler(async(req,res)=>{
  //tasks : 
  //step1 : take email and password from req.body
  //step2 : check if user exists or not
  //step3 : if user exists then check if password is correct or not
  //step4 : generate access token and refresh token and send it to the user
  //step4 : if password is correct then send the response to the user with success message and user data
  //step5 : if password is incorrect then throw error

  const {email,password} = req.body;

  if(!email || !password){
    throw new ApiError(400 , "email and password are required");
  }

  const user = await User.findOne({email});

  if(!user){
    throw new ApiError(404 , "Invalid email or password");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if(!isPasswordCorrect){
    throw new ApiError(400 , "invalid email or password");
  }

  const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly : true,
    secure : process.env.NODE_ENV === "production" ? true : false,
    sameSite : process.env.NODE_ENV === "production" ? "none" : "lax",
  }

  res
  .status(200)
  .cookie("refreshToken" , refreshToken , options)
  .cookie("accessToken" , accessToken , options)
  .json(
    new ApiResponse(200 , "user logged in successfully" , {
      user : loggedInUser,
      accessToken,
      refreshToken
    })
  )

})

//logout user
const logoutUser = AsyncHandler(async(req,res) => {
  const refreshToken = req.cookies?.refreshToken || req.headers.authorization?.replace("Bearer ", "");

  if(!refreshToken){
    throw new ApiError(400,"Not authorized request");
  }

  const user = await User.findOne({refreshToken});

  if(!user){
    throw new ApiError(404,"User Not found");
  }

  user.refreshToken = null;
 
  const options = {
    httpOnly : true,
    secure : process.env.NODE_ENV === "production" ? true : false,
    sameSite : process.env.NODE_ENV === "production" ? "none" : "lax",
  }

  await user.save({
    validateBeforeSave : false
  })

  res
  .status(200)
  .clearCookie("refreshToken" , options)
  .clearCookie("accessToken" , options)
  .json(
    new ApiResponse(200,"User logout Successfully")
  )
})


//update profile {coverimage and avatar handled separately}
const updateProfile = AsyncHandler(async(req,res) => {
  const user = await User.findById(req.user._id);

  if(!user){
    throw new ApiError(404 , "user not found");
  }

  const { githubUrl , linkedinUrl} = req.body;

  let skills;

  if (req.body.skills !== undefined) {
    try {
      skills = JSON.parse(req.body.skills);
    } catch (error) {
      throw new ApiError(400, "Invalid skills data");
    }
  }

  let education;

  if (req.body.education !== undefined) {
    try {
      education = JSON.parse(req.body.education);
    } catch (error) {
      throw new ApiError(400, "Invalid education data");
    }
  }
 

  if (skills !== undefined) {
        user.skills = skills;
    }

    if (education !== undefined) {
        user.education = education;
    }

    if (githubUrl !== undefined) {
        user.githubUrl = githubUrl;
    }

    if (linkedinUrl !== undefined) {
        user.linkedinUrl = linkedinUrl;
    }

  if (req.file) {

        const resumeUrl =
            await uploadOnCloudinary(req.file.path);

        if (!resumeUrl) {
            throw new ApiError(
                500,
                "Failed to upload resume"
            );
        }

        user.resumeUrl = resumeUrl;
    }

  await user.save();

  const updatedUser = await User.findById(req.user._id).select("-password -refreshToken");

  res.status(200).json(
    new ApiResponse(200 , "user profile updated successfully" , updatedUser)
  )
})

//update avatar of the user
const updateAvatar = AsyncHandler(async(req,res) => {
  const user = await User.findById(req.user._id); 

  if (!user) {
    throw new ApiError(404, "User not found");
}

  const avatar = req.file?.path;

  if(!avatar){
    throw new ApiError(400 , "avatar is required");
  }

  const avatarUrl = await uploadOnCloudinary(avatar);

  if(!avatarUrl){
    throw new ApiError(500 , "failed to upload avatar");
  }

  user.avatar = avatarUrl;

  await user.save();

  const updatedUser = await User.findById(req.user._id).select("-password -refreshToken");

  res.status(200).json(
    new ApiResponse(200 , "user avatar updated successfully" , updatedUser)
  )

})

//update cover image of the user 
const updateCoverImage = AsyncHandler(async(req,res) => {
  const user = await User.findById(req.user._id); 

  if (!user) {
    throw new ApiError(404, "User not found");
}

  const coverImage = req.file?.path;

  if(!coverImage){
    throw new ApiError(400 , "cover image is required");
  }

  const coverImageUrl = await uploadOnCloudinary(coverImage);

  if(!coverImageUrl){
    throw new ApiError(500 , "failed to upload cover image");
  }

  user.coverImage = coverImageUrl;

  await user.save();

  const updatedUser = await User.findById(req.user._id).select("-password -refreshToken");

  res.status(200).json(
    new ApiResponse(200 , "user cover image updated successfully" , updatedUser)
  )

})

//update refresh token of the user
const updateRefreshToken = AsyncHandler(async(req,res) => {

  const refreshToken = req.cookies?.refreshToken || req.headers.authorization?.replace("Bearer ", "");

  if(!refreshToken){
    throw new ApiError(400 , "refresh token is required");
  }
  
  let decoded;
  try{
    decoded = jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401 , "invalid refresh token");  
  }
 

  const user = await User.findById(decoded.id);

  if(!user){
    throw new ApiError(404 , "user not found");
  }

  if (user.refreshToken !== refreshToken) {
        throw new ApiError(
            401,
            "Invalid or revoked refresh token"
        );
    }

  const {accessToken , refreshToken : newRefreshToken} = await generateAccessAndRefreshToken(user._id);
 

  const options = {
    httpOnly : true,
    secure : process.env.NODE_ENV === "production" ? true : false,
    sameSite : process.env.NODE_ENV === "production" ? "none" : "lax",
  }

  res
  .status(200)
  .cookie("refreshToken" , newRefreshToken , options)
  .cookie("accessToken" , accessToken , options)
  .json(
    new ApiResponse(200 , "refresh token updated successfully" , {
      accessToken : accessToken,
      refreshToken : newRefreshToken
    })
  )
})

//get user profile
const getProfile = AsyncHandler(async(req,res) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken");

  if(!user){
    throw new ApiError(404 , "user not found");
  } 

  res.status(200).json(
    new ApiResponse(200 , "user profile fetched successfully" , user)
  )
})

export {
  registerUser,
  loginUser,
  logoutUser,
  updateRefreshToken,
  updateProfile,
  updateAvatar,
  updateCoverImage,
  getProfile,
}