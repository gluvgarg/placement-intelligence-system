class ApiError extends Error {
  constructor(statuscode , message = "something went wrong" , errors = [] , stacktrace = null){
    super(message)
    this.statuscode = statuscode 
    this.errors = errors
    this.success = false
    this.data = null

    if(stacktrace){
      this.stack = stacktrace
    }
    else{
      Error.captureStackTrace(this , this.constructor)
    }
  }
}


export {ApiError}