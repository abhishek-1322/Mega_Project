import mongoose from "mongoose";

const likeSchema=new mongoose.Schema({
    comment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment",
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video",
    },
    tweet:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tweet",
    },
},{
    timestamps:true
});

const Like = mongoose.model("Like", likeSchema);
export default Like;