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
import { Room } from "./../models/room.model.js";


//create room,update room(status,patientin),updateroompic,getroombyid, getallrooms,getavailablerooms

//create room
const createRoom = asyncHandler(async (req, res) => {
    const { roomNumber, type, status, assignedPatient,patientEmail } = req.body;

    if (!roomNumber || !type || !status) {
        throw new ApiError(400, "All fields are required");
    }

    const existedroom = await Room.findOne({ roomNumber });
    if(existedroom){
        throw new ApiError(400, "Room already exists");
    }

    let roomImag = req.files?.roomImage[0]?.path;
    if(!roomImag){
        throw new ApiError(400, "Room image is required");
    }
    const result = await uploadOnCloudinary(roomImag);
    if(!result){
        throw new ApiError(400, "Room image upload failed");
    }

    const newRoom = await Room.create({
        roomNumber,
        type,
        status,
        assignedPatient,
        roomImage:result?.url || "",
        patientEmail
    });

    if (!newRoom) {
        return ApiError( 500,  "Room not created");
    }

    return res.status(200).json( new ApiResponse( 200, newRoom, "Room created successfully"));

})


//update room

const updateRoom = asyncHandler(async (req, res) => {
    const { roomNumber, type, status, assignedPatient,patientEmail } = req.body;
    const  id  = req.params.id;
    const  oldroom = await Room.findById(id)
    
    if(!oldroom){
        throw new ApiError(400, "Room not found");}

   const updateRoom= await Room.findByIdAndUpdate(id, {
       $set : {
           roomNumber, type, status, assignedPatient,patientEmail
       }
    },{
        new : true
       })

    return res.status(200).json( new ApiResponse( 200, "Room updated successfully", updateRoom));
})


//updateroompic
const updateRoomPic = asyncHandler(async (req, res) => {
    const id =req.params.roomId;
  const roomImage = req?.file?.path;
  if(!roomImage){
      throw new ApiError(400, "Room image not found");
  }

  const result = await uploadOnCloudinary(roomImage);
  if(!result.url){
      throw new ApiError(400, "Room image upload failed");
  }
 
   const updateroom = await Room.findByIdAndUpdate(id, {
    $set : {
        roomImage : result.url
    }
    },{
        new : true
    })
    return res.status(200).json( new ApiResponse( 200, updateroom, "Room updated successfully"));

})

const getroombyid = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const room = await Room.findById(id);
    if (!room) {
        throw new ApiError(400, "Room not found");
    }

    return res.status(200).json(new ApiResponse(200, room, "Room found successfully"));
})

const getAllRooms = asyncHandler(async (req, res) => {
    const rooms = await Room.find();
    return res.status(200).json(new ApiResponse( 200, rooms, "Rooms found successfully"));
})

const getAvailableRooms = asyncHandler(async (req, res) => {
    const status_room = req.body.status;
    const rooms = await Room.find({ status: status_room });
    if(!rooms){
        throw new ApiError(400, "Rooms not found");
    }

    return res.status(200).json( new ApiResponse( 200, rooms, `Rooms found successfully, ${rooms.length}`));
})

const getPatientbyEmail = asyncHandler(async (req, res) => {
    const email = req.body.patientEmail;
    const patient = await Patient.findOne({ email: email });
    if (!patient) {
        throw new ApiError(400, "Patient not found");
    }
    return res.status(200).json( new ApiResponse( 200, patient, "Patient found successfully in the room"));
})

export { createRoom, updateRoom, updateRoomPic, getroombyid, getAllRooms, getAvailableRooms,getPatientbyEmail }