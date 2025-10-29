import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Connect database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) console.log("❌ Kết nối cơ sở dữ liệu không thành công:", err);
  else console.log("✅ Đã kết nối với cơ sở dữ liệu MySQL!");
});

app.get("/", (req, res) => {
  res.send("✅ VSTEP Backend đang chạy thành công!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Máy chủ đã khởi động trên cổng ${PORT}`));
