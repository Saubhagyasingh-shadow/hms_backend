import express from 'express';
import {
    getAllDepartments,
    getAllDoctorsInDepartment,
    createDepartment
} from '../controllers/department.controller.js'; // Update this path to your actual controller file
import { verifyJWT_doctor } from '../middlewares/auth.middleware.js'; // Update this path to your middleware file

const router = express.Router();

// Route to get all departments
router.get('/getall', getAllDepartments);

// Route to get all doctors in a specific department
router.get('/doctors/:departmentId', getAllDoctorsInDepartment);

// Route to create a new department
router.post('/create', verifyJWT_doctor, createDepartment);

export default router;
