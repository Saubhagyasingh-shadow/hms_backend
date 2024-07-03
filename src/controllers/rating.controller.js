//create rating for all
//taking rating for the particular doctor,medicine,room
//take average rating and add that field in it
//Delete particular rating
import {Department} from '../models/department.model.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {Doctor} from "../models/doctor.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Medicine } from "../models/medicine.model.js"
import { Rating } from '../models/rating.model.js';
import { Room } from "../models/room.model.js"

const createRating = asyncHandler(async (req, res) => {
    const patient_id = req.patient._id
    const {rating_type, type_id, rating_value} = req.body
    console.log(rating_type);
    let rating = null;
    if(rating_type == "Doctor"){
        const doctor = await Doctor.findById(type_id)
        if(!doctor) throw new ApiError("Doctor not found", 404)
          rating = await Rating.create({patient_id, type_id: doctor._id, rating_type:"Doctor", rating_value})
    }
    else if(rating_type == "Room"){
        const room = await Room.findById(type_id)
        if(!room) throw new ApiError("Room not found", 404)
         rating = await Rating.create({patient_id, type_id: room._id, rating_type:"Room", rating_value})
    }
    else if(rating_type == "Medicine"){
        const medicine = await Medicine.findById(type_id)
        if(!medicine) throw new ApiError("Medicine not found", 404)
         rating = await Rating.create({patient_id, type_id: medicine._id, rating_type:"Medicine", rating_value})
    }
    else {
        throw new ApiError("Invalid rating type", 400)  
    }
   console.log(rating);
    return res.status(200).json( new ApiResponse( 200, "Rating created successfully", rating))

});


const ratingsForRoomByIdandalsoaverage = asyncHandler(async (req, res) => {
    const roomId = req.params.id;
    const room = await Room.findById(roomId);
    if (!room) throw new ApiError("Room not found", 404);

    // Get the average rating
    const averageResult = await Rating.aggregate([
        {
            $match: { type_id:new mongoose.Types.ObjectId(roomId) }
        },
        {
            $group: {
                _id: null,
                average: { $avg: "$rating_value" }
            }
        },
        {
            $project: {
                _id: 0,
                average: { $round: ["$average", 2] }
            }
        }
    ]);

    // Get the individual ratings
    const ratings = await Rating.find({ type_id: roomId });

    // Extract the average rating from the aggregation result
    const averageRating = averageResult.length > 0 ? averageResult[0].average : null;

    // Send the response back to client with both individual ratings and the average 
    const result = {
        averageRating: averageRating,
        ratings: ratings
    }
   return res.status(200).json( new ApiResponse( 200, "Ratings fetched successfully",result) )
});
const ratingsForDoctorByIdAndAlsoAverage = asyncHandler(async (req, res) => {
    const doctorId = req.params.id;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new ApiError("Doctor not found", 404);

    // Get the average rating
    const averageResult = await Rating.aggregate([
        {
            $match: { type_id: new mongoose.Types.ObjectId(doctorId) }
        },
        {
            $group: {
                _id: null,
                average: { $avg: "$rating_value" }
            }
        },
        {
            $project: {
                _id: 0,
                average: { $round: ["$average", 2] }
            }
        }
    ]);

    // Get the individual ratings
    const ratings = await Rating.find({ type_id: doctorId });

    // Extract the average rating from the aggregation result
    const averageRating = averageResult.length > 0 ? averageResult[0].average : null;

    // Send the response back to client with both individual ratings and the average 
    const result = {
        averageRating: averageRating,
        ratings: ratings
    }
    return res.status(200).json(new ApiResponse( 200, "Ratings fetched for doctor successfully", result));
});

const ratingsForMedicineByIdAndAlsoAverage = asyncHandler(async (req, res) => {
    const medicineId = req.params.id;
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) throw new ApiError("Medicine not found", 404);

    // Get the average rating
    const averageResult = await Rating.aggregate([
        {
            $match: { type_id:new mongoose.Types.ObjectId(medicineId) }
        },
        {
            $group: {
                _id: null,
                average: { $avg: "$rating_value" }
            }
        },
        {
            $project: {
                _id: 0,
                average: { $round: ["$average", 2] }
            }
        }
    ]);

    // Get the individual ratings
    const ratings = await Rating.find({ type_id: medicineId });

    // Extract the average rating from the aggregation result
    const averageRating = averageResult.length > 0 ? averageResult[0].average : null;

    // Send the response back to client with both individual ratings and the average 
    const result = {
        averageRating: averageRating,
        ratings: ratings
    }
    return res.status(200).json(new ApiResponse(200, "Ratings fetched successfully", result));
});

const deleteRatingById = asyncHandler(async (req, res) => {
    const ratingId = req.params.id;
    const rating = await Rating.findByIdAndDelete(ratingId);
    if (!rating) throw new ApiError("Rating not found", 404);
    return res.status(200).json(new ApiResponse(200, "Rating deleted successfully", rating));
});

const updateRatingById = asyncHandler(async (req, res) => {
    const ratingId = req.params.id;
    const { rating_value } = req.body;
    const rating = await Rating.findByIdAndUpdate(ratingId,
        {
            rating_value
        },{
            new: true
        }
    );
    if (!rating) throw new ApiError("Rating not found", 404);
    return res.status(200).json(new ApiResponse(200, "Rating Updated successfully", rating));
});

export { createRating, ratingsForRoomByIdandalsoaverage, ratingsForDoctorByIdAndAlsoAverage, ratingsForMedicineByIdAndAlsoAverage ,
    deleteRatingById,updateRatingById};
