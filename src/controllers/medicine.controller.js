import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Doctor } from "../models/doctor.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Patient } from "../models/patient.model.js";
import { Appointment } from "../models/appointment.model.js";
import Comment from "../models/comments.model.js";
import { Diagnosis } from "../models/diagnosis.model.js";
import { Medicine } from "../models/medicine.model.js";

const getAllMedicines = asyncHandler(async (req, res) => {
    const medicines = await Medicine.find();
    res.status(200).json( new ApiResponse( 200, medicines,"Medicines fetched successfully" ));
});

const getMedicineById = asyncHandler(async (req, res) => {
    const medicine = await Medicine.findById(req.params.id);
    res.status(200).json( new ApiResponse( 200,medicine, "Medicine fetched successfully"));
});

const createMedicine = asyncHandler(async (req, res) => {
    const { name, manufacturer, batchNumber, expiryDate, quantity, reorderLevel, price, dosageperday, quantityChanged } = req.body;
    const doctorId = req.body.doctorId || req.doctor._id
    
    if (!name || !manufacturer || !batchNumber || !expiryDate || !quantity || !price || !dosageperday || !quantityChanged) {
        throw new ApiError(400, "All fields are required");
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new ApiError(404, "Doctor not found,please send the doctor id also");
    }
    const objectDoctorId= new mongoose.Types.ObjectId(doctorId)
    const changesby = [{
        doctor: objectDoctorId,
        doctorName: doctor.fullName,
        quantityChanged: quantityChanged
    }];

    const medicine = await Medicine.create({
        name,
        price,
        manufacturer,
        batchNumber,
        expiryDate,
        quantity,
        reorderLevel,
        dosageperday,
        changesby
    });
    console.log(medicine);
    if (!medicine) {
        throw new ApiError( 500, "Medicine not created");
    }

    return res.status(200).json( new ApiResponse( 200, medicine, "Medicine created successfully" ));
});

const updateMedicineById = asyncHandler(async (req, res) => {
    const medicineId = req.params.id;
    const { name, manufacturer, batchNumber, expiryDate, reorderLevel, price, dosageperday, quantityChanged } = req.body;

    const doctorId = req.body.doctorId || req.doctor._id;
    let returnstring = "Medicine updated successfully";
    let retstring = "";

    // Check for required fields (excluding quantityChanged)
    if ([name, manufacturer, batchNumber, expiryDate, price, dosageperday].some(field => field === undefined || field === null)) {
        throw new ApiError(400, "All fields except quantityChanged are required");
    }

    // Check quantityChanged separately
    if (quantityChanged === undefined || quantityChanged === null) {
        throw new ApiError(400, "quantityChanged is required");
    } else if (quantityChanged === 0) {
        retstring += " (changes are for the main medicine, not the quantity)";
    } else {
        retstring += " (changes are for the quantity)";
    }

    // Find the doctor by ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    // Find the medicine by ID
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
        throw new ApiError(404, "Medicine not found");
    }

    // Calculate new quantity
    const oldQuantity = medicine.quantity;
    const newQuantity = oldQuantity + quantityChanged;

    // Update changesby array
    const changesby = medicine.changesby;
    changesby.push({
        doctor: doctorId,
        doctorName: doctor.fullName + retstring, // Add retstring to doctorName
        quantityChanged: quantityChanged
    });

    // Update medicine
    const updatedMedicine = await Medicine.findByIdAndUpdate(
        medicineId,
        {
            name,
            manufacturer,
            batchNumber,
            expiryDate,
            quantity: newQuantity,
            reorderLevel,
            price,
            dosageperday,
            changesby
        },
        { new: true }
    );

    if (!updatedMedicine) {
        throw new ApiError(500, "Medicine not updated");
    }

    // Include retstring in the response message
    return res.status(200).json(new ApiResponse(200, updatedMedicine, returnstring));
});

export { getAllMedicines, getMedicineById, createMedicine, updateMedicineById };
