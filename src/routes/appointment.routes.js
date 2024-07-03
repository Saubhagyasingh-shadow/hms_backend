import express from 'express';
import {
  createAppointmentByPatient,
  createAppointmentByStaff,
  getAllAppointmentsforAPatient,
  getAllAppointmentsforADoctor,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointment.controller.js'; // Make sure to update this path to your actual controller file
import { verifyJWT_doctor, verifyJWT_patient } from '../middlewares/auth.middleware.js';
const router = express.Router();

// Route to create an appointment by a patient,so need the access so need to verify first
router.post('/createby/patient',verifyJWT_patient, createAppointmentByPatient);

// Route to create an appointment by staff
router.post('/createdby/staff',verifyJWT_doctor, createAppointmentByStaff);


//need to see the verification and then taking the id from the jwtbody
router.get('/getall/bypatient',verifyJWT_patient, getAllAppointmentsforAPatient);
// Route to get all appointments for a specific patient,here the id we will send by the body is patient id in the main body json
router.post('/getall/bystaff', getAllAppointmentsforAPatient);

// Route to get all appointments for a specific doctor,here the id we will send by the body is doctor id
//need to see the verification and then taking the id from the body
router.get('/doctor',verifyJWT_doctor, getAllAppointmentsforADoctor);
router.post('/inbody/seenbypatient/doctor', getAllAppointmentsforADoctor);

// Route to update an appointment
router.put('/update/:id', updateAppointment);

// Route to delete an appointment
router.delete('/delete/:id', deleteAppointment);

export default router;
