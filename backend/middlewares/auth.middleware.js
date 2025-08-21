import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken
        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized -No access token provided" })
        }
        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
            const user = await User.findById(decoded.userId).select("-password")
            if (!user) {
                return res.status(401).json({ message: "user not found" })
            }

            req.user = user
            next()
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Unauthorized -Access token expired" })
            }
        }

    } catch (err) {
        console.log(err.message)
        return res.status(401).json({ message: "Unauthorized- Invalid access token" })
    }
}

export const adminRoute = (req,res,next) =>{
    try {
        if(req.user && req.user.role === "admin"){
            next()
        }else{
            return res.status(403).json({message:"Access denied -Admin only"})
        }
    } catch (error) {
        return res.status(500).json({message:"Internal server error"})
    }
}