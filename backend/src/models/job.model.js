import mongoose ,{Schema} from "mongoose";

const jobSchema = new Schema({
  status: {
    type: String,
    enum: ["active", "closed"],
    default: "active",
  },
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
    required : true,
  },
  skills: [
    {
      type : String,
      trim : true
    }
  ],
  jobType : {
    type : String,
    enum : ["Full-Time","Internship"],
    default : "Full-Time"
  },
  mode : {
    type : String,
    enum : ["Hybrid" , "On-site" , "Remote"],
    default : "On-site"
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

jobSchema.statics.closeExpiredJobs = async function () {
  return this.updateMany(
    {
      applicationDeadline: { $lte: new Date() },
      status: "active",
    },
    {
      $set: { status: "closed" },
    }
  );
};

const Job = mongoose.model("Job",jobSchema);

export default Job;