// File: test_key.js
import 'dotenv/config';

const key = process.env.GEMINI_API_KEY;

// Kiểm tra xem đã lấy được key chưa
if (!key) {
    console.error("❌ LỖI: Không tìm thấy GEMINI_API_KEY trong file .env!");
    console.error("👉 Hãy chắc chắn file .env nằm cùng thư mục với file này.");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

console.log("🔍 Đang kiểm tra danh sách Model cho Key: " + key.substring(0, 10) + "...");

try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
        console.error("❌ LỖI API TỪ GOOGLE:", data.error.message);
    } else {
        console.log("✅ KẾT NỐI THÀNH CÔNG! Danh sách model bạn được dùng:");
        console.log("------------------------------------------------");
        
        // Lọc và in ra danh sách
        const models = data.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name.replace("models/", ""));
            
        console.log(models.join("\n"));
        console.log("------------------------------------------------");
    }
} catch (err) {
    console.error("❌ Lỗi mạng hoặc lỗi code:", err);
}