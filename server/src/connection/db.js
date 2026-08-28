import mongoose from "mongoose";

const connect = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/collabx' || process.env.MONGODB_URL);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Failed to connect Database", error);
    process.exit(1);
  }
};

export default connect;