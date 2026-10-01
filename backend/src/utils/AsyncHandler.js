const AsyncHandler = (func) => async(req,res,next)=>{
  try{
    return await func(req,res,next)
  }
  catch(err){
    res.status(err.code || 500).json({
      success : false,
      message : err.message
    })
  }
}


// const asyncHandler  = (fn) => async(req,res,next) =>{
//   try{
//     return await fn(req,res,next)      //call for the parameter function 
//   }
//   catch(err){
//     res.status(err.code || 500).json({
//       success : false,
//       message : err.message
//     })
//   }
// }


export {AsyncHandler}