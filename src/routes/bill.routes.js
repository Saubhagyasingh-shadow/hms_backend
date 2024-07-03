import express from 'express';
import  {createBill, getBillById, updateBillStatus, getAllBill,checkifbillwithdiagnosisIdexist,deleteall,getBillByDiagnosisId } from '../controllers/bill.controller.js'; // Make sure to update this path to your actual controller file

const router = express.Router();

router.route("/create").post(createBill);
router.route("/getbydiagnosisid/:id").get(getBillById);
router.route("/updatestatus/:id").put(updateBillStatus);
router.route("/getall").get(getAllBill);
router.route("/checkbyid/:id").get(checkifbillwithdiagnosisIdexist);
router.route("/delteall").delete(deleteall);
// router.route("/getbydiagnosisid/:id").get(getBillByDiagnosisId);
export default router