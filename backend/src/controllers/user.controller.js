import { asyncHandler } from "../utilis/asyncHandler.js";
import ApiError from "../utilis/ApiError.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import User from "../models/user.model.js";
import { uploadCloudinary } from "../utilis/cloudinary.js";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler(async (req, res) => {
    console.log("inside register")
    const {username,fullName,email,password}=req.body;
    console.log("email",email);
    // ======validate condition to check all fields are not empty======
    if([username,fullName,email,password].some((field)=> field?.trim()==="")){
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

// ===================function to generate access and refresh token==============
const generateAccessAndRefreshToken=async(userId)=>{
    try{
        const user=await User.findById({_id:userId});
        console.log("inside genreate tkoken",user)
        const accessToken=await user.generateAccessToken();
        const refreshToken=await user.generateRefreshToken();
        console.log("gen",accessToken,refreshToken)
        user.refreshToken=refreshToken;
        user.save({
            validateBeforeSave:false //consition to save the refresh token ian db without validate
        })
        console.log("user after refresh token",user)
        return {
            accessToken,
            refreshToken
        }
    }
    catch(error){
        throw new ApiError(500,"Something went wrong while generating access and refresh token");
    }
}

// =======================lOGIN USER=========================
export const loginUser = asyncHandler(async (req, res) => {
    const {username,email,password}=req.body;
    if(username==="" && email===""){
        throw new ApiError(400,"Username or Email is required");
    }
    const user=await User.findOne({
        $or:[{ username },{ email }]
    });
    console.log("login in user",user)
    if(!user){
        throw new ApiError(401,"User does not exists");
    }
    const isPasswordCorrect=await user.isPasswordMatched(password);
    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid user credentials");
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user?._id?.valueOf());

    // ========after saving refresh token to db get user details again ===========
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken");
    if(!loggedInUser){
        throw new ApiError(500,"Something went wrong while login user");
    }
    // ==========options for cookies=========
    const options={
        httpOnly:true,
        secure:true
    }

    // =========SAVE REFRESH TOKEN AND ACCESS TOKEN IN COOKIES & SEND RESPONSE============
    res.status(200)
    .cookie("access_token",accessToken,options)
    .cookie("refresh_token",refreshToken,options)
    .json(
        new ApiResponse(200,
            {
                loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
    )
    
})

// =========================LOGOUT USER===========================
export const logoutUser=asyncHandler(async(req,res)=>{
    console.log("req.user",req.user,req.user._id.valueOf())
    const logOutUser= await User.findByIdAndUpdate(
        {_id:req.user._id.valueOf()},
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        })
    // ==========options for cookies=========
    const options={
        httpOnly:true,
        secure:true
    }

    // =========SAVE REFRESH TOKEN AND ACCESS TOKEN IN COOKIES & SEND RESPONSE============
    res.status(200)
    .clearCookie("access_token",options)
    .clearCookie("refresh_token",options)
    .json(
        new ApiResponse(200,
            {},
            "User logout successfully"
        )
    )


})

// =================refresh access token=================
export const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies?.refreshToken || req?.body?.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request");
    }

    const decodedToken=jwt?.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    const user=await User.findById(decodedToken?._id).select("-password -refreshToken");

    if(!user){
        throw new ApiError(401,"Invalid Refresh Token");
    }

    if(incomingRefreshToken!==user?.refreshToken){
        throw new ApiError(401,"Refresh token is expired or used")
    }

    const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user?._id?.valueOf());

    // ==========options for cookies=========
    const options={
        httpOnly:true,
        secure:true
    }

    // =========SAVE REFRESH TOKEN AND ACCESS TOKEN IN COOKIES & SEND RESPONSE============
    res.status(200)
    .cookie("access_token",accessToken,options)
    .cookie("refresh_token",newRefreshToken,options)
    .json(
        new ApiResponse(200,
            {
                accessToken,
                newRefreshToken
            },
            "Access Token Refreshed"
        )
    )
})

// =====================change password========================
export const changePassword=asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword}=req.body;
    const user= await User.findById(req.user._id);
    const isOldPasswordCorrect=await user.isPasswordMatched(oldPassword);
    if(!isOldPasswordCorrect){
        throw new ApiError(400,"Old password is incorrect");
    }
    user.password=newPassword;
    user.save({
        validateBeforeSave:false
    })
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"));
})

// ============================get current user============================
export const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(new ApiResponse(200,req.user,"User found successfully"))
})

// =====================updated account details============================
export const updatedAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body;
    if(!fullName || !email){
        return ApiError(400,"All fields are required");
    }
    const updatedUser=await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {
            new:true
        }).select("-password -refreshToken");
    return res
    .status(200)
    .ApiResponse(200,updatedUser,"Account details updated successfully")
})

// ===================Update Avtaar image ===================================
export const updateUserAvatarImage=asyncHandler(async(req,res)=>{
    const avatarLocalImagePath=req.file?.path;
    if(!avatarLocalImagePath){
        return ApiError(400,"Avatar image is required");
    }

    const avatarImage=await uploadCloudinary(avatarLocalImagePath);
    if(!avatarImage){
        return ApiError(400,"Something went wrong while uploading avatar image");
    }
    const updatedAvatarImage=await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                avatar:avatarImage?.url
            }
        },
        {
            new:true
        }).select("-password -refreshToken");
    return res
    .status(200)
    .json(new ApiResponse(200,updatedAvatarImage,"Avatar image updated successfully"))
})

// ===================Update Cover image ===================================
export const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path;
    if(!coverImageLocalPath){
        return ApiError(400,"Avatar image is required");
    }

    const coverImage=await uploadCloudinary(coverImageLocalPath);
    if(!coverImage){
        return ApiError(400,"Something went wrong while uploading avatar image");
    }
    const updatedCoverImage=await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                coverImage:coverImage?.url
            }
        },
        {
            new:true
        }).select("-password -refreshToken");
    return res
    .status(200)
    .json(new ApiResponse(200,updatedCoverImage,"Cover image updated successfully"))
})