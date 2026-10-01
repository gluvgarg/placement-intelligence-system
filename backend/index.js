import dotenv from "dotenv";
import connectDB from "./src/db/mongooseDB.js";
dotenv.config();
 
import app from "./app.js";

connectDB()
.then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`);
});
})
.catch((error) => {
  console.error("Error connecting to MongoDB:", error);
  process.exit(1);
});

