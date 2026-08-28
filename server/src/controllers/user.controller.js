import httpStatus from 'http-status'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';

const register = async (req, res) => {
    const { name, email, password } = req.body;
    console.log("register user data:", req.body);
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({
                message: "email alredy exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });


        let token = jwt.sign({ userId: newUser._id, name: newUser.name, email: newUser.email }, process.env.SECRET_KEY);
        res.status(httpStatus.OK).json({
            userData: newUser,
            message: "register successfully",
            token
        })
    } catch (error) {
        console.log("register new user:", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'internal server error',
        })
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: "all fields are required"
            })
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" })
        }
        const isValid= await bcrypt.compare(password, user.password);
        if (isValid) {
            let token = jwt.sign({userId: user._id, name: user.name, email: user.email}, process.env.SECRET_KEY);
            return res.status(httpStatus.OK).json({
                userData: user,
                token,
                message: "login successfully"
            })
        }
    } catch (error) {
        console.log("login error :", error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: ` something went worng ${error}`
        })
    }
}

export { login, register }