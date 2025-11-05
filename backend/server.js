import express from 'express';
import dotenv from 'dotenv';
import {connectDB} from './config/db.js';
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import sessionsRoutes from "./routes/sessions.js";
import incidentsRoutes from "./routes/incidents.js";
import deptsRoutes from "./routes/depts.js";
import companiesRoutes from "./routes/companies.js";
import attendanceRoutes from "./routes/attendance.js";

dotenv.config();

const app = express();

app.use(express.json())
app.use(cors({
  origin: "http://localhost:5173", // Default Frontend URL
  credentials: true
}))
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)

// new mounts
app.use("/api/sessions", sessionsRoutes);
app.use("/api/incidents", incidentsRoutes);
app.use("/api/depts", deptsRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/attendance", attendanceRoutes);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB(); // connect first
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

start();