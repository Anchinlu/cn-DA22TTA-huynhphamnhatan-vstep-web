import dotenv from "dotenv";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "VSTEP_PRO_SECRET_KEY_2025";
