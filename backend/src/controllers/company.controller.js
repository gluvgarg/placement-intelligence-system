//add company 
// for V1 : only the admin can add the company
import Company from "../models/company.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";



const registerCompany = AsyncHandler(async (req,res) => {
  const {name , description , manager ,email , contact  , location } = req.body;

  //validate the data 
  if(!name || !email || !contact || !location){
    throw new ApiError(400, "All fields are required");
  }

  const logoPath = req.file?.path;

  let logoUrl 

  if (logoPath) {
  logoUrl = await uploadOnCloudinary(logoPath);

  if (!logoUrl) {
    throw new ApiError(500, "Failed to upload company logo");
  }
}

  const newCompany = await Company.create({
    name,
    description,
    manager,
    email,
    contact,
    location,
    logo : logoUrl,
  })


  if(!newCompany){
    throw new ApiError(500,"Unable to create new company");
  }

  res.status(201).json(
    new ApiResponse(201 , "Company register successfully" , newCompany )
  )
})

const deleteCompany = AsyncHandler(async (req, res) => {

  const companyId = req.params.id;

  if (!companyId) {
    throw new ApiError(400, "Company ID is required");
  }

  const company = await Company.findByIdAndDelete(companyId);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      "Company deleted successfully",
      company
    )
  );
});

const getAllCompanies = AsyncHandler(async (req,res) => {
    const companies = await Company.find();

    res.status(200).json(
      new ApiResponse(200 , "companies data successfully retreived", companies)
    )
})

const getCompany = AsyncHandler(async (req,res) => {
  const id = req.params.id;

  if(!id ){
    throw new ApiError(400 , "Id is required")
  }

  const company = await Company.findById(id);

  if(company){
    res.status(200).json(
      new ApiResponse(200 , "company found successfully ", company)
    )
  }
  else { 
    throw new ApiError(404 , "Company does not exist !!")
  }
})
 
const updateCompanyDetails = AsyncHandler(async (req , res) => {
  const id = req.params?.id;

  if(!id){
    throw new ApiError(400 , "company does not found")
  }

  const {name , manager , description , email , contact , location} = req.body;

  const logoPath = req.file?.path

  let logoUrl

  if(logoPath){
    logoUrl = await uploadOnCloudinary(logoPath)

    if(!logoUrl){
      throw new ApiError(500,"Logo upload failed")
    }
  }

  const updatedCompany = {}

  if (name !== undefined) updatedCompany.name = name;
  if (manager !== undefined) updatedCompany.manager = manager;
  if (description !== undefined) updatedCompany.description = description;
  if (email !== undefined) updatedCompany.email = email;
  if (contact !== undefined) updatedCompany.contact = contact;
  if (location !== undefined) updatedCompany.location = location;

  if (logoUrl) {
    updatedCompany.logo = logoUrl;
  } 

  const company = await Company.findByIdAndUpdate(id , updatedCompany , {
    returnDocument : "after",
    runValidators : true
  })

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  res.status(200).json(
    new ApiResponse(200 , "Company details updated Successfully" , company)
  )
})


export{
  registerCompany,
  deleteCompany,
  getAllCompanies,
  getCompany,
  updateCompanyDetails
}