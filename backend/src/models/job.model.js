import mongoose ,{Schema} from "mongoose";

const jobSchema = new Schema({
  title:{
    type: String,
    required: true,
    trim : true
  },
  description : {
    type : String,
    required : true,
  },
  companyId : {
    type : Schema.Types.ObjectId,
    ref : "Company",
  },
  skills: [
    {
      type : String,
      trim : true
    }
  ],
  jobType : {
    type : String,
    enum : ["Full-Time","Internship"]
  },
  mode : {
    type : String,
    enum : ["Hybrid" , "On-site" , "Remote"]
  },
  salary : {
    type : Number,
    required : true,
  },
  applicationDeadline : {
    type : Date,
    required : true
  }
},{timestamps : true});


const Job = mongoose.model("Job",jobSchema);

export default Job;