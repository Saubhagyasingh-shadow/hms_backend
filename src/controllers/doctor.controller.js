import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {Doctor} from "../models/doctor.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const doctor = await Doctor.findById(userId)
        const accessToken = doctor.generateAccessToken()
        const refreshToken = doctor.generateRefreshToken()

        doctor.refreshToken = refreshToken
        await doctor.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerdoctor = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, doctorname, password, role,totalLeaveinaYear,department } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, doctorname, password, role,totalLeaveinaYear].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedDoctor = await Doctor.findOne({
        $or: [{ doctorname }, { email }]
    })

    if (existedDoctor) {
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
   
    console.log("hello till hhere")
    const doctor = await Doctor.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        department,
        role,
        doctorname: doctorname.toLowerCase(),
        totalLeaveinaYear
    })

    const createddoctor = await Doctor.findById(doctor._id).select(
        "-password -refreshToken"
    )

    if (!createddoctor) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createddoctor, "User registered Successfully")
    )

} )

const logindoctor = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, doctorname, password,role} = req.body
    console.log(email);

    if (!doctorname && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const doctor = await Doctor.findOne({
        $or: [{doctorname}, {email}]
    })

    if (!doctor) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await doctor.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(doctor._id)

    const loggedIndoctor = await Doctor.findById(doctor._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken_doctor", accessToken, options)
    .cookie("refreshToken_doctor", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                doctor: loggedIndoctor, accessToken, refreshToken,role
            },
            "User logged In Successfully"
        )
    )

})

const logoutdoctor = asyncHandler(async(req, res) => {
    await Doctor.findByIdAndUpdate(
        req.doctor._id,
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
    .clearCookie("accessToken_doctor", options)
    .clearCookie("refreshToken_doctor", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken_doctor || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const doctor = await Doctor.findById(decodedToken?._id)
    
        if (!doctor) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== doctor?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(doctor._id)
    
        return res
        .status(200)
        .cookie("accessToken_doctor", accessToken, options)
        .cookie("refreshToken_doctor", newRefreshToken, options)
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

    

    const doctor = await Doctor.findById(req.doctor?._id)
    const isPasswordCorrect = await doctor.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    doctor.password = newPassword
    await doctor.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})


const getCurrentdoctor = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.doctor,
        "User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email, role, department, doctorname} = req.body

    if (!fullName || !email ) {
        throw new ApiError(400, "All fields are required")
    }

    const doctor = await Doctor.findByIdAndUpdate(
        req.doctor?._id,
        {
            $set: {
               fullName: fullName,
                email: email,
                role:role,
                department:department,doctorname:doctorname
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, doctor, "Account details updated successfully"))
});


///////
const updatedoctorAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const doctor = await Doctor.findByIdAndUpdate(
        req.doctor?._id,
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
        new ApiResponse(200, doctor, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
console.log(coverImage)
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }
    // const doctorId=

    const doctor = await Doctor.findByIdAndUpdate(
        req.doctor?._id,
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
        new ApiResponse(200, doctor, "Cover image updated successfully")
    )
})

const getAllDoctor = asyncHandler(
     async(req,res)=>{
        const doctors = await Doctor.find({role: "doctor"}).select("-password");

        return res
        .status(200)
        .json(new ApiResponse(200,doctors,"All doctors fetched successfully"))
     }
)


const getdoctorById = asyncHandler(async(req, res) => {
    const id = req.params.id;
    const doctor = await Doctor.findById(id)
    if(!doctor){
        throw new ApiError(404, "Doctor not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, doctor, "Doctor fetched successfully"))
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


export {
    registerdoctor,
    logindoctor,
    logoutdoctor,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentdoctor,
    updateAccountDetails,
    updatedoctorAvatar,
    updateUserCoverImage,
    getAllDoctor,
    getdoctorById
    // getUserChannelProfile,
    // getWatchHistory
}