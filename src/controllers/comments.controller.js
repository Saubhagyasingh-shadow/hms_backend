import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {Doctor} from "../models/doctor.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Patient } from "../models/patient.model.js";
import { Appointment } from "../models/appointment.model.js";
import Comment from "../models/comments.model.js";

const createCommentByPatient = asyncHandler(async(req,res)=>{
    //only the doctor id from the body is required for staff both required
    const {doctorId,content} = req.body;
    const objectdoctorId= new mongoose.Types.ObjectId(doctorId)
    if(!doctorId){
        throw new ApiError(400, "All fields are required");
    }

    const doctor = await Doctor.findById(objectdoctorId);
    if(!doctor){
        throw new ApiError(404, "Doctor not found");
    }
    const patientId =req.patient._id
    if(!doctor){
        throw new ApiError(404, "Doctor not found");
    }
   
    const comment = await Comment.create({
        doctor: doctorId,
        patient: patientId,
        content
    })

    res.status(201).json(
        new ApiResponse(201, comment, "Comment created successfully")
    )

})



const getAllCommentsforAPatient = asyncHandler(async(req,res)=>{
    const patientId = req.body.patientId || req.patient._id ;//for patient ,second for staff
     
    const patient = await Patient.findById(patientId);
    if(!patient){
        throw new ApiError(404, "Patient not found");
    }

    const comment = await Comment.aggregate([
        {
            $match :{
                patient:new mongoose.Types.ObjectId(patientId)
            }
        }
    ])

   if(!comment){
    throw new ApiError(500, "Something went wrong appointments  not found")
   }
   
   return res.status(200).json(new ApiResponse(200,comment,"all the comment  for the patients are"))

}
)
const getAllCommentsforADoctor = asyncHandler(async(req,res)=>{
    const doctorId = req.body.doctorId || req.doctor._id ;//for patient ,second for staff


    const doctor = await Doctor.findById(doctorId);
    if(!doctor){
        throw new ApiError(404, "Dcotor not found");
    }

    const comment = await Comment.aggregate([
        {
            $match :{
                doctor:new mongoose.Types.ObjectId(doctorId)
            }
        }
    ])

   if(!comment){
    throw new ApiError(500, "Something went wrong appointments  not found")
   }
   
   return res.status(200).json(new ApiResponse(200,comment,"success for doctor comments"))

}
)

const updateComment = asyncHandler(async(req,res)=>{
    const commentId = req.params.id;
    const {content} = req.body;
    

    const comment = await Comment.findByIdAndUpdate(commentId,{
        $set:{
            content
        }
    })


    if(!comment){
        throw new ApiError(404, "comment not Updated");
    }

    const commentx = await Comment.findById(commentId);
    return res.status(200).json(new ApiResponse(200,commentx,"comment updated successfully"))
})



const deleteComment = asyncHandler(async(req,res)=>{
    const commentId = req.params.id;
    
const commentx = await Comment.findById(commentId);

    if(!commentx){
        throw new ApiError(404, "Comment not found");
    }
    const comment = await Comment.findByIdAndDelete(commentId) 

   
    return res.status(200).json(new ApiResponse(200,comment,"Comment deleted successfully"))

})



export {createCommentByPatient,getAllCommentsforAPatient,getAllCommentsforADoctor,updateComment,deleteComment}