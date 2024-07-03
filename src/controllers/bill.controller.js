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
import { Diagnosis } from "../models/diagnosis.model.js";
import { Bill2 } from "../models/bill.model.js";

const createBill = asyncHandler(async (req, res) => {
    const { diagnosisID, patientId, deadline, address } = req.body;
    if (!diagnosisID || !patientId ) {
        throw new ApiError(400, "All fields are required");
    }

    const newBill = await Bill2.create({
        diagnosisID,
        patientId,
        deadline,
        address
    });

    if (!newBill) {
        return ApiError( 500,  "Bill not created");
    }

    return res.status(200).json( new ApiResponse( 200, newBill, "Bill created successfully"));
});

const getBillById = asyncHandler(async (req, res) => {
    const bill =  await Bill2.find({diagnosisID:req.params.id});
    // console.log(bill)
    if(!bill){
        throw new ApiError(404, "Bill not found");
    }
    const diagnosisId=req.params.id;
    const diagnosis = await Diagnosis.findById(diagnosisId);
    if(!diagnosis){
        throw new ApiError(404, "Diagnosis not found");
    }

    const diagnosisobjectId = new mongoose.Types.ObjectId(diagnosisId);
    const sending = await Diagnosis.aggregate([
        {
            $match: {
                _id: diagnosisobjectId
            }
        },
        {
            $lookup: {
                from: "medicines",
                localField: "medicines",
                foreignField: "_id",
                as: "medicinearray"
            }
        }
       
    ])

    const send = {
        bill:bill,
        sending:sending[0]
    }

    return res.status(200).json( new ApiResponse( 200, send, "Bill fetched successfully"));
});


const getBillByDiagnosisId = asyncHandler(async (req, res) => {
    const bill = await Bill2.find({diagnosisID:req.params.id});
    if(!bill){
        throw new ApiError(404, "Bill not found");
    }
    return res.status(200).json( new ApiResponse( 200, bill, "Bill fetched successfully"));
});


const updateBillStatus = asyncHandler(async (req, res) => {
    const bill = await Bill2.findById(req.params.id);
    if(!bill){
        throw new ApiError(404, "Bill not found");
    }
    const updatedBill = await Bill2.findByIdAndUpdate(req.params.id, {
        $set : {
            status : req.body.status
        }
    }, {new:true});
    if(!updatedBill){
        throw new ApiError(500, "Bill not updated");
    }
    return res.status(200).json( new ApiResponse( 200, updatedBill, "Bill updated successfully"));

});

const getAllBill = asyncHandler(async (req, res) => {
    const bill = await Bill2.find();
    if(!bill){
        throw new ApiError(404, "Bill not found");
    }
    return res.status(200).json( new ApiResponse( 200, bill, "Bill fetched successfully"));
});

const checkifbillwithdiagnosisIdexist = asyncHandler(async (req, res) => {
    console.log("hrllo")
    const bill = await Bill2.findOne({diagnosisID:req.params.id});
    if(!bill){
        return res.status(200).json(  new ApiResponse(404, false,"Bill not found"));
    }
    return res.status(200).json( new ApiResponse( 200, true, "Bill fetched successfully"));
}) 
const deleteall = asyncHandler(async (req, res) => {
    const bill = await Bill2.deleteMany();
    if(!bill){
        throw new ApiError(404, "Bill not found");
    }
    return res.status(200).json( new ApiResponse( 200, bill, "Bill deleted successfully"));
})


export { createBill, getBillById, updateBillStatus, getAllBill,checkifbillwithdiagnosisIdexist,deleteall,getBillByDiagnosisId }