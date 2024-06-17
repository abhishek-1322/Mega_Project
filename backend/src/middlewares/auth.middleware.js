import User from "../models/user.model.js";
import ApiError from "../utilis/ApiError.js";
import jwt from "jsonwebtoken";

export const verifyJWT=async (req,res,next)=>{
    try {
        const token=req?.cookies?.accessToken || req?.headers?.authorization?.split(" ")[1];
        console.log("headers",req.headers.authorization.split(" ")[1],req.cookies)
        console.log("inside jwt",token)
        if(!token){
            throw new ApiError(401,"Unauthorized");
        }
        const decodedToken=jwt?.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token");
        }
        
        req.user=user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
}