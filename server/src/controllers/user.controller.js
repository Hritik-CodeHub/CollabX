import httpStatus from 'http-status'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import { Meeting } from '../models/meeting.model.js';

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
        const userData = {
            ...(newUser),
            userId: newUser._id
        };
        res.status(httpStatus.OK).json({
            userData,
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
        const user = await User.findOne({ email }).lean();
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" })
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
            let token = jwt.sign({ userId: user._id, name: user.name, email: user.email }, process.env.SECRET_KEY);
            const userData = {
                ...(user),
                userId: user._id
            };
            return res.status(httpStatus.OK).json({
                userData,
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

const createMeeting = async (req, res) => {
    try {
        let { userId, meetingCode } = req.body;

        const meeting = await Meeting.create({
            userId: userId,
            meetingCode: meetingCode,
            date: Date.now()
        });

        res.status(httpStatus.OK).json({
            meeting
        });
    } catch (error) {
        console.log("createMeeting error:", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: `Something went wrong: ${error.message}`
        });
    }
}

const validateMeeting = async (req, res) => {
    try {
        const { meetingCode } = req.params;
        if (!meetingCode) {
            return res.status(httpStatus.BAD_REQUEST).json({
                isValid: false,
                message: "Meeting code is required"
            });
        }

        const meeting = await Meeting.findOne({
            meetingCode: new RegExp(`^${meetingCode.trim()}$`, "i")
        }).lean();

        if (!meeting) {
            return res.status(httpStatus.NOT_FOUND).json({
                isValid: false,
                message: "Invalid meeting code"
            });
        }

        return res.status(httpStatus.OK).json({
            isValid: true,
            message: "Meeting is valid",
            meeting
        });
    } catch (error) {
        console.log("validateMeeting error:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            isValid: false,
            message: `Internal server error: ${error.message}`
        });
    }
}

const getUserHistory = async (req, res) => {
    try {
        const { userId, search } = req.query;

        if (!userId) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: "User ID is required"
            });
        }

        const query = { userId };

        if (search?.trim()) {
            const searchValue = search.trim();

            const conditions = [
                {
                    meetingCode: {
                        $regex: searchValue,
                        $options: "i"
                    }
                }
            ];

            // If search looks like YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}$/.test(searchValue)) {
                const startDate = new Date(`${searchValue}T00:00:00.000Z`);
                const endDate = new Date(`${searchValue}T23:59:59.999Z`);

                conditions.push({
                    date: {
                        $gte: startDate,
                        $lte: endDate
                    }
                });
            }

            query.$or = conditions;
        }

        const meetings = await Meeting.find(query)
            .sort({ date: -1 });

        return res.status(httpStatus.OK).json({
            meetings
        });

    } catch (error) {
        console.log("getUserHistory error:", error);

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: `Something went wrong: ${error.message}`
        });
    }
};

const deleteMeetingHistory = async (req, res) => {
    try {
        const { meetingId } = req.params;
        await Meeting.findByIdAndDelete(meetingId);
        return res.status(httpStatus.OK).json({
            message: "Meeting removed from history"
        });
    } catch (error) {
        console.log("deleteMeetingHistory error:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: `Something went wrong: ${error.message}`
        });
    }
}

export { login, register, createMeeting, validateMeeting, getUserHistory, deleteMeetingHistory }