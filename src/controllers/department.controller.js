import {Department} from '../models/department.model.js';
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


// Controller to get all departments
export const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find().populate('head', 'name');
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// Controller to get all doctors in a department
export const getAllDoctorsInDepartment = asyncHandler(async (req, res) => {
    const  departmentId  = req.params.departmentId;
    console.log(departmentId);
    const department = await Department.findById(departmentId);
    if (!department) {
        return res.status(404).json({ message: 'Department not found' });
    }
const departname= department.name
    const doctors = await Doctor.aggregate([
        {
            $match: {
                department:departname
            }
        }
    ])

    if(!doctors){
        return res.status(404).json({ message: 'No doctors found in this department' });
    }
    
    return res.status(200).json( new ApiResponse(200,doctors,"all doctors are here for the department"))
})

// Controller to create a new department
export const createDepartment = async (req, res) => {
    const { name, head } = req.body;
    try {
        const existingDepartment = await Department.findOne({ name });
        if (existingDepartment) {
            return res.status(400).json({ message: 'Department already exists' });
        }

        const department = new Department({
            name,
            head
        });

        await department.save();
        res.status(201).json(department);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
