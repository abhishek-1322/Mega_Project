import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
//take data fromthe json body
app.use(express.json({limit: "50mb"}));
//take data from the url
app.use(express.urlencoded({limit: "50mb", extended: true}));
//take data from the cookie
app.use(cookieParser());

app.use(bodyParser.json({limit: "50mb"}));

app.use(express.static("public"));

import userRouter from "./routes/user.router.js";

app.use("/api/users", userRouter);




export {app};