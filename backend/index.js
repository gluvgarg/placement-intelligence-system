import dotenv from "dotenv";
import connectDB from "./src/db/mongooseDB.js";
import startJobDeadlineScheduler
  from "./src/utils/jobDeadlineScheduler.js";
dotenv.config();
 
import app from "./app.js";

connectDB()
.then(() => {
    const PORT = process.env.PORT || 5000;
    startJobDeadlineScheduler();
    app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`);
});
})
.catch((error) => {
  console.error("Error connecting to MongoDB:", error);
  process.exit(1);
});

