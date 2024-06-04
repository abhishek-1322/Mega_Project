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





// (async function() {

    
    
//     // Upload an image
//     const uploadResult = await cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg", {
//         public_id: "shoes"
//     }).catch((error)=>{console.log(error)});
    
//     console.log(uploadResult);
    
//     // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url("shoes", {
//         fetch_format: 'auto',
//         quality: 'auto'
//     });
    
//     console.log(optimizeUrl);
    
//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url("shoes", {
//         crop: 'auto',
//         gravity: 'auto',
//         width: 500,
//         height: 500,
//     });
    
//     console.log(autoCropUrl);    
// })();


