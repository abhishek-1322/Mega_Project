import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema=new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email: {
        type: String,
        required: true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullName:{
        type: String,
        required: true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,
        required:true,
    },
    coverImage:{
        type:String,
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password: {
        type: String,
        required: [true, "Please provide a password"],
    },
    refreshToken: {
        type: String
    }
},
{
    timestamps: true
});

// ===========Pre hook for encrypt password==========
userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next(); //check password field is modified or not for pre save

    // encrypt the password pre when saved the data to mongodb
    this.password=await bcrypt.hash(this.password,10);
    next();
});

// ===========method define for check password with bcrypt password==========
userSchema.methods.isPasswordMatched=async function(password){
    return await bcrypt.compare(password,this.password);
}

// ================method for generating access token=============
userSchema.methods.generateAccessToken=async function(){
    return jwt.sign({
        id:this._id,
        username:this.username,
        email:this.email,
        fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    });
}

// ===========method for generating refresh token=============
userSchema.methods.generateRefreshToken=async function(){
    return jwt.sign({
        id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    });
}

const User=mongoose.model("User",userSchema);
export default User;