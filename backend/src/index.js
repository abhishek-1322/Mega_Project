import { connectDB } from "./db/db.js"
import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config();


// =======function to make connection with mongoDB======
connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log("App is running on port ", process.env.PORT || 8000);
    })
})
.catch((error) => {
    console.log("Error in mongodb connection", error);
    process.exit(1);
})
