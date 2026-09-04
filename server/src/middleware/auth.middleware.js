import jwt from "jsonwebtoken";
import httpStatus from "http-status";

const authUser = async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "User token is missing. Please login" });
    }
    try {
        const data = jwt.verify(token, process.env.SECRET_KEY);
        req.user = data;
        next();
    } catch (error) {
        console.log("internal server error", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "internal server error" });
    }
};
export {
    authUser,
}