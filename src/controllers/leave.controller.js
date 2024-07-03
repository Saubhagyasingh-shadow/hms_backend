//applyleave,deleteleave,getallleaveforaemployee,updateleave
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {Doctor} from "../models/doctor.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import  { Leave } from "../models/leave.model.js";

//applyleave
export const applyLeave = asyncHandler(async (req, res) => {
    const doctorId = req.body.doctorId || req.doctor._id;
    const { reason, startDate, endDate, totaldays, type } = req.body;

    if (!reason || !startDate || !endDate || !totaldays) {
        throw new ApiError(400, "All fields are required");
    }

    // Ensure startDate is before endDate
    if (new Date(startDate) > new Date(endDate)) {
        throw new ApiError(400, "Start date must be before end date");
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    const oldleavedaysleft = doctor.totalLeaveinaYear;
    const newleavedaysleft = oldleavedaysleft - totaldays;
    
    // Check if the doctor has enough leave days left
    if (newleavedaysleft < 0) {
        throw new ApiError(400, "Not enough leave days left");
    }

    await Doctor.findByIdAndUpdate(doctorId, { totalLeaveinaYear: newleavedaysleft });

    const leave = await Leave.create({
        staff: doctorId,
        reason,
        type,
        startDate,
        endDate,
        totaldays
    });

    if (!leave) {
        throw new ApiError(500, "Something went wrong");
    }

    return res.status(200).json(new ApiResponse(200, leave, "Leave applied successfully"));
});

export const approveLeave = asyncHandler(async (req, res) => {
    // Extract leave ID and new status from the request body
    const {  leaveId, status } = req.body;
    const objectLeaveId = new mongoose.Types.ObjectId(leaveId);

    // Find the leave request by ID
    const leave = await Leave.findById(objectLeaveId);
    if(!leave){
        throw new ApiError(404, "Leave not found");
    }
    // // If leave request is not found, throw an error
    // if (!leave) {
    //     throw new ApiError(404, "Leave not found");
    // }
    // Update the leave request with the new status and return the updated document
    const updatedLeave = await Leave.findByIdAndUpdate(objectLeaveId, { status }, { new: true });
    // Send a successful response with the updated leave request
    return res.status(200).json( new ApiResponse( 200, updatedLeave, `Leave ${status} successfully` ));
});


export const getallleaveforaemployee = asyncHandler(async (req, res) => {
    const  staffId  = req.params.id;
    const doctor = await Doctor.findById(staffId);
    if(!doctor){
        throw new ApiError(404, "Doctor not found");
    }
    const leave = await Leave.find({ staff: staffId });
   
    return res.status(200).json( new ApiResponse( 200, leave, "Leave fetched successfully"));
});

export const findleaveByIdandUpdate= asyncHandler(async (req, res) => {
    const  leaveId  = req.params.id;
   const {
    reason,
    startDate,
    endDate,
    totaldays,
    type
   } = req.body;
   
   if(!reason || !totaldays || !type){
    throw new ApiError(400, "All fields are required");
   }

   // Ensure startDate is before endDate
   if (new Date(startDate) > new Date(endDate)) {
    throw new ApiError(400, "Start date must be before end date");
   }
   const oldleave= await Leave.findById(leaveId);
   if(!oldleave){
    throw new ApiError(404, "Leave not found");
   }
   if(oldleave.status !== "Pending"){
    throw new ApiError(400, "Leave already approved or rejected");
   }
   const leave = await Leave.findByIdAndUpdate(leaveId, {
    reason,
    startDate,
    endDate,
    totaldays,
    type}, { new: true });

   return res.status(200).json( new ApiResponse( 200, leave, "Leave updated successfully"));
});

