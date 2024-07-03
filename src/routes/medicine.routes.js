import express from 'express';
import {
    getAllMedicines,
    getMedicineById,
    createMedicine,
    updateMedicineById
} from '../controllers/medicine.controller.js'; // Update this path to your actual controller file
import { verifyJWT_doctor } from '../middlewares/auth.middleware.js'; // Update this path to your middleware file

const router = express.Router();

// Route to get all medicines
router.get('/getall', getAllMedicines);

// Route to get a specific medicine by ID
router.get('/getmedicine/:id', getMedicineById);

// Route to create a new medicine
router.post('/create', verifyJWT_doctor, createMedicine);

// Route to update a specific medicine by ID
router.put('/update/:id', verifyJWT_doctor, updateMedicineById);//get the doctor or staff id from the token as the jwt here
router.put('/update/doctoridinbody/:id', updateMedicineById);
//in the body send the doctorId
export default router;
