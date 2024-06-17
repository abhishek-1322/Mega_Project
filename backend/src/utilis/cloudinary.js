import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';


export const uploadCloudinary= async(filePath)=>{
    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });
    console.log("filePath",filePath)
    try{
        if(!filePath) return null;
        const response= await cloudinary.uploader.upload(filePath,{
            resource_type: "auto",
        });
        //file has been uploaded
        fs.unlinkSync(filePath);
        return response;
    }
    catch(error){
        fs.unlink(filePath, (err)=>console.log("Error in file upload",err));
        return error;
    }
}
