import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { createServer } from 'http';

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(cookieParser());
app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({ extended: true , limit: '16kb'}));
app.use(express.static('public'));

import userRouter from './routes/user.routes.js'
import doctorRouter from './routes/doctor.routes.js'
import patientRouter from './routes/patient.routes.js'
import diagnosisRouter from './routes/diagnosis.routes.js'
import appointmentRouter from './routes/appointment.routes.js'
import commentsRouter from './routes/comments.routes.js'
import departmentRouter from './routes/department.routes.js'
import leaveRouter from './routes/leave.routes.js'
import medicineRouter from './routes/medicine.routes.js'
import ratingRouter from './routes/rating.routes.js'
import roomRouter from './routes/room.routes.js'
import  billRouter  from './routes/bill.routes.js';
app.use("/api/users",userRouter)
app.use("/api/doctors",doctorRouter)//
app.use("/api/patients",patientRouter)//
app.use("/api/diagnosis",diagnosisRouter)//
app.use("/api/appointment",appointmentRouter)//
app.use("/api/comments",commentsRouter)//
app.use("/api/department",departmentRouter)//need update route
app.use("/api/leave",leaveRouter)//
app.use("/api/medicine",medicineRouter);//
app.use("/api/ratings",ratingRouter);
app.use("/api/room",roomRouter)//
app.use("/api/bill",billRouter)//

export {app};