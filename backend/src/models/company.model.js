import mongoose ,{ Schema} from 'mongoose';

const companySchema = new Schema({
  name:{
    type : String,
    required : true
  },
  manager:{
    type : String,             //for V2 : type : mongoose.Schema.Types.ObjectId, ref : "User"
    trim : true,
  },
  description:{
    type : String,
    trim : true,
  },
  email:{
    type : String,
    required : true,
    lowercase : true,
  },
  contact:{
    type : String,
    required : true
  },
  location:{
    type : String,
    required : true
  },
  logo:{
    type : String,
    trim : true
  }
},{timestamps : true});

const Company = mongoose.model("Company",companySchema);
export default Company;