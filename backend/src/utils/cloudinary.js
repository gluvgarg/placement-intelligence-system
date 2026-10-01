import {v2 as cloudinary} from "cloudinary";
import "dotenv/config";
import fs from "fs";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localfilePath) => {
  try {
    if(!localfilePath) return null
    const result = await cloudinary.uploader.upload(localfilePath,{
      resource_type : "auto",
    });

    fs.unlinkSync(localfilePath);
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);

    if(localfilePath){
      fs.unlinkSync(localfilePath)
    }

    return null

  }
}

export {uploadOnCloudinary}