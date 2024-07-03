import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {Patient} from "../models/patient.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const patient = await Patient.findById(userId)
        const accessToken = patient.generateAccessToken()
        const refreshToken = patient.generateRefreshToken()

        patient.refreshToken = refreshToken
        await patient.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerPatient = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, patientname, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, patientname, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedPatient = await Patient.findOne({
        $or: [{ patientname }, { email }]
    })

    if (existedPatient) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const patient = await Patient.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        patientname: patientname.toLowerCase()
    })

    const createdPatient = await Patient.findById(patient._id).select(
        "-password -refreshToken"
    )

    if (!createdPatient) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdPatient, "User registered Successfully")
    )

} )

const loginpatient = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, patientname, password} = req.body
    console.log(email);

    if (!patientname && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const patient = await Patient.findOne({
        $or: [{patientname}, {email}]
    })

    if (!patient) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await patient.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(patient._id)

    const loggedInPatient = await Patient.findById(patient._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken_patient", accessToken, options)
    .cookie("refreshToken_patient", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                patient: loggedInPatient, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutPatient = asyncHandler(async(req, res) => {
    await Patient.findByIdAndUpdate(
        req.patient._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken_patient", options)
    .clearCookie("refreshToken_patient", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken_patient || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const patient = await Patient.findById(decodedToken?._id)
    
        if (!patient) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== patient?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(patient._id)
    
        return res
        .status(200)
        .cookie("accessToken_patient", accessToken, options)
        .cookie("refreshToken_patient", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const patient = await Patient.findById(req.patient?._id)
    if(!patient){
        throw new ApiError(404, "User not found")
    }
    console.log("patient found hre")
;    const isPasswordCorrect = await patient.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    patient.password = newPassword
    await patient.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})


const getCurrentPatient = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.patient,
        "User fetched successfully"
    ))
})

const authenticateUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.patient, "User authenticated successfully"))
})
const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email, patientname,} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const patient = await Patient.findByIdAndUpdate(
        req.patient?._id,
        {
            $set: {
               fullName: fullName,
                email: email,
                patientname: patientname
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, patient, "Account details updated successfully"))
});


///////
const updatePatientAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const patient = await Patient.findByIdAndUpdate(
        req.patient?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, patient, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const patient = await Patient.findByIdAndUpdate(
        req.patient?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, patient, "Cover image updated successfully")
    )
})


// const getWatchHistory = asyncHandler(async(req, res) => {
//     const user = await User.aggregate([
//         {
//             $match: {
//                 _id: new mongoose.Types.ObjectId(req.user._id)
//             }
//         },
//         {
//             $lookup: {
//                 from: "videos",
//                 localField: "watchHistory",
//                 foreignField: "_id",
//                 as: "watchHistory",
//                 pipeline: [
//                     {
//                         $lookup: {
//                             from: "users",
//                             localField: "owner",
//                             foreignField: "_id",
//                             as: "owner",
//                             pipeline: [
//                                 {
//                                     $project: {
//                                         fullName: 1,
//                                         username: 1,
//                                         avatar: 1
//                                     }
//                                 }
//                             ]
//                         }
//                     },
//                     {
//                         $addFields:{
//                             owner:{
//                                 $first: "$owner"
//                             }
//                         }
//                     }
//                 ]
//             }
//         }
//     ])

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(
//             200,
//             user[0].watchHistory,
//             "Watch history fetched successfully"
//         )
//     )
// })

 const getPatientById= asyncHandler(async(req, res) => {
    const id = req.params.id;
    const patient = await Patient.findById(id)
    if(!patient){
        throw new ApiError(404, "Patient not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, patient, "Doctor fetched successfully"))
})



const getAllPatient = asyncHandler(
    async(req,res)=>{
       const patient = await Patient.find().select("-password");

       return res
       .status(200)
       .json(new ApiResponse(200,patient,"All patient fetched successfully"))
    }
)
export {
    registerPatient,
    loginpatient,
    logoutPatient,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentPatient,
    updateAccountDetails,
    updatePatientAvatar,
    updateUserCoverImage,
    authenticateUser,
    getPatientById,
    getAllPatient
    // getUserChannelProfile,
    // getWatchHistory
}