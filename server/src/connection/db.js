import mongoose from "mongoose";

const connect = async () => {
  try {
    console.log(process.env.MONGODB_URL)
    await mongoose.connect(process.env.MONGODB_URL);
    
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Failed to connect Database", error);
    process.exit(1);
  }
};

export default connect;