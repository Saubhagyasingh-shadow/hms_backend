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


const createAppointmentByPatient = asyncHandler(async(req,res)=>{
    //only the doctor id from the body is required for staff both required
    const {doctorId,date,time,reason,status} = req.body;
    if(!doctorId){
        throw new ApiError(400, "All fields are required");
    }

    const doctor = await Doctor.findById(doctorId);
    const patientId =req.patient._id
    if(!doctor){
        throw new ApiError(404, "Doctor not found");
    }
   
    const appointment = await Appointment.create({
        doctor: doctorId,
        patient: patientId,
        date:date,
        time:time,
        reason:reason,
        status
    })

    res.status(201).json(
        new ApiResponse(201, appointment, "Appointment created successfully")
    )

})


const createAppointmentByStaff = asyncHandler(async(req,res)=>{
    
    const {doctorId,patientId,date,time,reason,status} = req.body;

    if(!doctorId || !patientId){
        throw new ApiError(400, "All fields are required");
    }

    const doctor = await Doctor.findById(doctorId);
    if(!doctor){
        throw new ApiError(404, "Doctor not found");
    }

    const patient = await Patient.findById(patientId);
    if(!patient){
        throw new ApiError(404, "Patient not found");
    }

    const appointment = await Appointment.create({
        doctor: doctorId,   
        patient: patientId,
        date:date,
        time:time,
        reason:reason,
        status
    })

     const createdAppointment= await Appointment.findById(appointment._id)
     if(!createdAppointment){
        throw new ApiError(500, "Something went wrong appointment  not found")
     }


    res.status(201).json(
        new ApiResponse(201, appointment, "Appointment created successfully")
    )
})

const getAllAppointmentsforAPatient = asyncHandler(async(req,res)=>{
    const patientId =  req.body.patientId  || req.patient._id ;//for patient ,second for staff

    const patient = await Patient.findById(patientId);
    if(!patient){
        throw new ApiError(404, "Patient not found");
    }

    const appointments = await Appointment.aggregate([
        {
            $match :{
                patient:new  mongoose.Types.ObjectId(patientId)
            }
        }
    ])

   if(!appointments){
    return  new ApiError(500, "Something went wrong appointments  not found")
   }
   
   return res.status(200).json( new ApiResponse(200,appointments,"success"))
}
)


const getAllAppointmentsforADoctor = asyncHandler(async(req,res)=>{
    const doctorId = req.body.doctorId || req.doctor._id;//for patient ,second for staff

    const doctor = await Doctor.findById(doctorId);
    if(!doctor){
        throw new ApiError(404, "Dcotor not found");
    }

    const appointments = await Appointment.aggregate([
        {
            $match :{
                doctor:new  mongoose.Types.ObjectId(doctorId)
            }
        }
    ])

   if(!appointments){
    throw new ApiError(500, "Something went wrong appointments  not found")
   }
   
   return res.status(200).json(new ApiResponse(200,appointments,"success"))

}
)

const updateAppointment = asyncHandler(async(req,res)=>{
    const appointmentId = req.params.id;
    const {status,date,time,reason} = req.body;
    

    const appointment = await Appointment.findByIdAndUpdate(appointmentId,{
        $set:{
            status,date,time,reason
        }
    })


    if(!appointment){
        throw new ApiError(404, "Appointment not Updated");
    }
    return res.status(200).json(new ApiResponse(200,appointment,"Appointment updated successfully"))
})

const deleteAppointment = asyncHandler(async(req,res)=>{
    const appointmentId = req.params.id;
    
const appointmentx = await Appointment.findById(appointmentId);

    if(!appointmentx){
        throw new ApiError(404, "Appointment not found");
    }
    const appointment = await Appointment.findByIdAndDelete(appointmentId) 

   
    return res.status(200).json(new ApiResponse(200,appointment,"Appointment deleted successfully"))

})



export {createAppointmentByPatient,createAppointmentByStaff,getAllAppointmentsforAPatient,getAllAppointmentsforADoctor,updateAppointment,deleteAppointment}