import express from "express";
import { createServer } from "node:http";
import connect  from "./connection/db.js";

import { Server } from "socket.io";

import cors from "cors";
import dotenv from "dotenv";
import userRouter from "././routes/users.routes.js";
import { connectToSocket } from "./controllers/socketManager.js";
import morgan from "morgan";

dotenv.config()

const port = 3000;
const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true}));
app.use(morgan("dev"));
connect();

app.use('/api/users/', userRouter);

app.get('/', (req, res)=>{
   return res.send("server running");
})


server.listen(port, () => {
  console.log(`server is running on the port http://localhost:${port}`);
})