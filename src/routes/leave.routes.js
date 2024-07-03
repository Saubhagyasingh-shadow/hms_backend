import express from 'express';
import {
    applyLeave,
    approveLeave,
    getallleaveforaemployee,
    findleaveByIdandUpdate
} from '../controllers/leave.controller.js'; // Update this path to your actual controller file
import { verifyJWT_doctor } from '../middlewares/auth.middleware.js'; // Update this path to your middleware file

const router = express.Router();

// Route to apply for leave
router.post('/apply', verifyJWT_doctor, applyLeave);

// Route to approve leave
router.put('/approve', verifyJWT_doctor, approveLeave);

// Route to get all leaves for a specific employee
router.get('/doctor/:id', verifyJWT_doctor, getallleaveforaemployee);

// Route to delete a leave by ID
router.put('/updatebyid/:id', verifyJWT_doctor, findleaveByIdandUpdate);

export default router;
