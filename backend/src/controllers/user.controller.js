import { asyncHandler } from "../utilis/asyncHandler.js";
import ApiError from "../utilis/ApiError.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import User from "../models/user.model.js";
import { uploadCloudinary } from "../utilis/cloudinary.js";

export const registerUser = asyncHandler(async (req, res) => {
    console.log("inside register")
    const {username,fullName,email,password}=req.body;
    console.log("email",email);
    // ======validate condition to check all fields are not empty======
    if([username,fullName,email,password].some((field)=> field.trim()==="")){
        throw new ApiError(400,"All fields are required");
    }

    // ===========check existing username or email===========
    const existingUser= await User.findOne({
        $or:[{ username },{ email }]
    });
    console.log("existingUser",existingUser);
    if(existingUser){
        throw new ApiError(409,"User already exists");
    }
    console.log("req.files",req?.files)

    // ===========validate images========
    const avatarLocalImage=req?.files?.avatar[0]?.path;
    let coverLocalImage;
    if(req.files && Array.isArray(req?.files?.coverImage) && req?.files?.coverImage.length>0){
        coverLocalImage=req?.files?.coverImage[0]?.path;
    }
    console.log("avatarLocalImage",avatarLocalImage,coverLocalImage)
    if(!avatarLocalImage){
        throw new ApiError(400,"Avatar image is required");
    }
    // =======upload image on cloudinary=============
    const avatar=await uploadCloudinary(avatarLocalImage);
    const coverImage=await uploadCloudinary(coverLocalImage);
    console.log("avatar",avatar,coverImage)
    if(!avatar){
        throw new ApiError(400,"Avatar Image upload failed");
    }
    // ==========Add data to MongoDB========
    const response=await User.create({
        username:username.toLowerCase(),
        fullName,
        email,
        password,
        avatar:avatar?.url,
        coverImage:coverImage?.url || ""
    });

    const createdUser=await User.findById(response._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(400,"Something went wrong while registering user");
    }
    
    return res.status(201).json(
        new ApiResponse(201,createdUser,"User created successfully")
    )

})

export const loginUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "User Logged In successfully",
    });
})