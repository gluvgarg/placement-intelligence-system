import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema = new Schema({
  "role":{
    type:String,
    enum:["admin","user"],
    default : "user", 
  },
  "fullname": {
    type:String,
    required : true,
    index:true
  },
  "email":{
    type:String,
    required:true,
    lowercase:true,
    unique:true,
    trim:true,
  },
  "mobile":{
    type:Number,
  },
  "password":{
    type:String,
    required:[true,'password is required'], 
  },
  "coverImage":{
    type:String,  //cloudinary url
  },
  "avatar":{
    type:String, //cloudinary url
  },
  "skills": [{
    type:String
  }],
  "education":[{
     degree : {type:String},
     college : {type:String},
     yearOfPassing : {type:Number},
     cgpa : {type:Number}
  }], 
  "projects": [
    {
      title: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      technologies: [
        {
          type: String,
          trim: true,
        },
      ],
      projectUrl: {
        type: String,
        trim: true,
      },
      githubUrl: {
        type: String,
        trim: true,
      },
    },
  ],
  "experience": [
    {
      company: {
        type: String,
        trim: true,
      },
      position: {
        type: String,
        trim: true,
      },
      employmentType: {
        type: String,
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
        default: null,
      },
      currentlyWorking: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
        trim: true,
      },
    },
  ],
  "resumeUrl":{
    type:String
  },
  "githubUrl":{
    type:String
  },
  "linkedinUrl":{
    type:String
  },
  "refreshToken":{
    type:String 
  }
},{timestamps:true});


// pre hook to store the password in encrypted form whenever it is changed or modified
userSchema.pre('save',async function() {
    if(!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password,10);
})


//methods

//to compare the password
userSchema.methods.comparePassword = async function(password){
  return await bcrypt.compare(password,this.password)
}

//to generate the accesstoken 
userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
    {
      id : this._id,
      name : this.fullname,
      email : this.email,
      role : this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn : process.env.ACCESS_TOKEN_LIMIT }
  )
}

//to generate the refreshToken
userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
    {
      id : this._id, 
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn : process.env.REFRESH_TOKEN_LIMIT }
  )
}


const User = mongoose.model("User",userSchema);

export default User;