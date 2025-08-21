import { redis } from "../lib/redis.js"
import User from "../models/user.model.js"
import jwt from "jsonwebtoken"

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" })

    return { accessToken, refreshToken }
}

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60)
}

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",//prevents csrf
        maxAge: 15 * 60 * 1000,
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",//prevents csrf
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
}

export const signup = async (req, res) => {
    const { name, email, password } = req.body
    try {
        const userExists = await User.findOne({ email })

        if (userExists) {
            return res.status(400).json({ message: "user already exists" })
        }
        const user = await User.create({ name, email, password })

        const { accessToken, refreshToken } = generateTokens(user._id)

        await storeRefreshToken(user._id, refreshToken)

        setCookies(res, accessToken, refreshToken)

        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }, message: "user created successfully"
        })
    } catch (error) {
        console.log("error in signup")
        res.status(500).json({ message: error.message })
    }

}
export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })

        if (user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = generateTokens(user._id)

            await storeRefreshToken(user._id, refreshToken)
            setCookies(res, accessToken, refreshToken)


            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,

            })
        } else {
            res.status(401).json({ message: "Invalid email or password" })
        }

    } catch (error) {
        console.log("error in login")
        res.status(500).json({ message: error.message })
    }
}
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            await redis.del(`refresh_token:${decoded.userId}`)
        }
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        res.json({ message: "Logged out successfully" })
    } catch (error) {
        res.status(500).json({ message: "server error", error: error.message })
    }
}
export const refreshToken = async(req,res) => {
    try {
        const  refreshToken = req.cookies.refreshToken

        if(!refreshToken){
            return res.status(401).json({message: "No refresh token provided"})
        }

        const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
        const storedToken = await redis.get(`refresh_token:${decoded.userId}`)

        if(storedToken !== refreshToken){
            return res.status(401).json({message:"Invalid refresh token"})
        }

        const accessToken = jwt.sign({userId:decoded.userId},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"15m"})

        res.cookie("accessToken",accessToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15*60*1000,
        })

        res.json({message: "Token refreshed successfully"})


    } catch (error) {
        res.status(500).json({message:"server error", error:error.message})
    }
}
//implement later
export const getProfile = async(req,res) => {
    try {
        res.json(req.user)
    } catch (error) {
        res.status(500).json({message: "server error",error: error.message})
    }
}