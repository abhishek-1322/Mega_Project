import User from "../models/user.model.js";
import ApiError from "../utilis/ApiError.js";

export const verifyJWT=async (req,res,next)=>{
    try {
        const token=req?.cookies || req?.headers?.authorization?.split(" ")[1] || req?.headers?.Authorization?.split(" ")[1];
        if(!token){
            throw new ApiError(401,"Unauthorized");
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user=await User.findById(decodedToken.id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token");
        }
        
        req.user=user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
}