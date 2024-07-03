//read-allforapatientfromitsobjectwegetit , allforadmin,allbydoctor(if possible),byid
//update-needed the confiramtionbywebcam for the dotor to update the diagnosis
//create add the diagnosis id in the medical history of the patient
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

const getalldiagnosis = asyncHandler(async (req, res) => {
    const diagnosis = await Diagnosis.find();
    res.status(200).json(diagnosis);
});

const getDiagnosisById = asyncHandler(async (req, res) => {
    const diagnosis = await Diagnosis.findById(req.params.id);
    if(!diagnosis){
        throw new ApiError(404, "Diagnosis not found");
    }
    res.status(200).json(diagnosis);
});

// const getalldiagnosisforapatient = asyncHandler(async (req, res) => {
    
//     const patientId =  req.params.id;
//    const patient = await Patient.findById(patientId);
//    console.log(patient);
//    if(!patient){
//     throw new ApiError(404, "Patient not found");
//    }
  
//    const diagnosis = await Patient.aggregate([
//     {
//        $lookup: {
//           from: "Diagnosis",
//           localField: "medicalHistory",
//           foreignField: "_id",
//           as: "diagnosis",
//           pipeline:[
//             {
//                 $project:{
//                     _id:1,
//                     diagnosis:1,
//                     appointmentId:1,
//                 }
//             }
//           ]
//        },
//     },
//     {
//        $unwind: "$diagnosis" // unwind the diagnosis array
//     },
//     {
//        $lookup: {
//           from: "Appointment",
//           localField: "diagnosis.appointmentId",
//           foreignField: "_id",
//           as: "diagnosis.appointment"
//        }
//     },
//     {
//        $group: {
//           _id: "$_id",
//           patientname: { $first: "$patientname" },
//           email: { $first: "$email" },
//           fullName: { $first: "$fullName" },
//           diagnosis: { $push: "$diagnosis" } // push back the modified diagnosis objects
//        }
//     },
//     {
//        $project: {
//           _id: 1,
//           patientname: 1,
//           email: 1,
//           fullName: 1,
//           diagnosis: 1,
//           medicalHistory:1
//        }
//     }
// ]);

// if(!diagnosis){
//     throw new ApiError(500, "Something went wrong diagnosis  not found")
// }
// return res.status(200).json(new ApiResponse(200,diagnosis,"success,diagnosis for  the user is"))

// });
const getalldiagnosisforapatient = asyncHandler(async (req, res) => {
    const patientId = req.params.id;

    try {
        // Find the patient first
        const patient = await Patient.findById(patientId);
        // console.log(patient);
       
        if (!patient) {
            throw new ApiError(404, "Patient not found");
        }
        const objectIdPatientId = new mongoose.Types.ObjectId(patientId);

        // Aggregate diagnosis details for the patient
        const diagnosis = await Patient.aggregate([
            { $match: { _id: objectIdPatientId } }, // Ensure we match the correct patient
            {
                $lookup: {
                    from: "diagnoses",
                    localField: "medicalHistory",
                    foreignField: "_id",
                    as: "diagnosis",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                diagnosis: 1,
                                   medicines: 1,
                                   diagnosisfee:1,
                                   appointmentID:1
                            }
                        }
                    ]
                },
            },
            { $unwind: "$diagnosis" }, // Unwind the diagnosis array
            {
                       $lookup: {
                          from: "appointments",
                          localField: "diagnosis.appointmentID",
                          foreignField: "_id",
                          as: "diagnosis.appointment"
                       }
                    },
            {
                $group: {
                    _id: "$_id",
                    patientname: { $first: "$patientname" },
                    email: { $first: "$email" },
                    fullName: { $first: "$fullName" },
                    diagnosis: { $push: "$diagnosis" }, // Push back the modified diagnosis objects
                    medicalHistory: { $first: "$medicalHistory" }
                }
            },
            {
                $project: {
                    _id: 1,
                    patientname: 1,
                    email: 1,
                    fullName: 1,
                    diagnosis: 1,
                    medicalHistory: 1
                }
            }
        ]);

        console.log('Diagnosis:', diagnosis);

        if (!diagnosis ) {
            throw new ApiError(500, "Something went wrong, diagnosis not found");
        }

        return res.status(200).json(new ApiResponse(200, diagnosis, "Success, diagnosis for the user is"));
    } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, null, error.message));
    }
});


const createDiagnosis = asyncHandler(async (req, res) => {
    const appointmentID = req.params.appointmentID;

    // Check if the appointment exists
    const appointment = await Appointment.findById(appointmentID);
    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    const { diagnosis, medicines, diagnosisfee } = req.body;

    // Create the diagnosis record
    const newDiagnosis = await Diagnosis.create({
        appointmentID,
        diagnosis,
        medicines,
        diagnosisfee,
    });

    if (!newDiagnosis) {
        throw new ApiError(500, "Something went wrong, diagnosis not created");
    }

    // Update patient's medical history with the new diagnosis ID
    const patientId = appointment.patient;
    const updatedPatient = await Patient.findByIdAndUpdate(
        patientId,
        {
            $push: {
                medicalHistory: newDiagnosis._id // Use the newly created diagnosis ID
            }
        },
        {
            new: true // Return the updated document
        }
    ).select("-password");
   

    if (!updatedPatient) {
        throw new ApiError(404, "Patient not found");
    }

    // Check if the diagnosis ID is added to the medicalhistory array in the updated patient
    console.log("Updated Patient:", updatedPatient);

    // Return the response
    res.status(201).json({ message: 'Diagnosis created successfully', diagnosis: newDiagnosis, patient: updatedPatient });
});




//for adding the medicine also 
const updateDiagnosis = asyncHandler(async (req, res) => {
    const diagnosisId = req.params.id;  
    const olddiagnosis = await Diagnosis.findById(diagnosisId);
    if (!olddiagnosis) {
        throw new ApiError(404, "Diagnosis not found");
    }
    const { diagnosis, medicines, diagnosisfee } = req.body;


    ///need to add to e able to change when face recognition successfull
    const updatedDiagnosis = await Diagnosis.findByIdAndUpdate(diagnosisId, {   
        diagnosis,
        medicines,
        diagnosisfee
    },
    {
        new: true // Return the updated document
    }
)
 


    if (!updatedDiagnosis) {
        throw new ApiError(404, "Diagnosis not found");
    }

   return res.status(200).json( new ApiResponse(200, updatedDiagnosis, "Diagnosis updated successfully"))
})



const deleteAllDiagnosis = asyncHandler(async (req, res) => {
    await Diagnosis.deleteMany({});
    res.status(200).json({ message: "All diagnoses deleted successfully" });
});

const deleteDiagnosisById = asyncHandler(async (req, res) => {
    const diagnosisId = req.params.id;
    const deletedDiagnosis = await Diagnosis.findByIdAndDelete(diagnosisId);
    if (!deletedDiagnosis) {
        throw new ApiError(404, "Diagnosis not found");
    }
    res.status(200).json({ message: "Diagnosis deleted successfully", deletedDiagnosis });
});


export { createDiagnosis, getDiagnosisById, getalldiagnosis, getalldiagnosisforapatient, updateDiagnosis ,deleteAllDiagnosis, deleteDiagnosisById}