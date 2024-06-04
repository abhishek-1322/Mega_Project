import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log("MongoDB connected", connectionInstance.connection.host);
  } catch (error) {
    console.log("Error in mongodb connection", error);
    process.exit(1);
  }
};

/*
---this function is used for in index.js file when we write code in index file we can use this function-----
(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        app.on("error", (error)=>{
            console.log("Error in connection", error);
            throw error;
        })
        app.listen(process.env.PORT || 8000, ()=>{
            console.log("App is running on port 3000");
        })
    }
    catch(error){
        console.log(error);
        throw error;
    }
})
*/
