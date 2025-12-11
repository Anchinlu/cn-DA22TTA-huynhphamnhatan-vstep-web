// File: backend/test_key.js
import 'dotenv/config';

const key = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;

if (!key) {
    console.error("❌ LỖI: Không tìm thấy Key (GROQ_API_KEY) trong file .env!");
    process.exit(1);
}

const url = "https://api.groq.com/openai/v1/models";

console.log(`🔍 Đang hỏi Groq danh sách model khả dụng...`);
console.log(`🔑 Key: ${key.substring(0, 10)}...`);
console.log("------------------------------------------------");

async function checkModels() {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("❌ LỖI API:", JSON.stringify(err, null, 2));
            return;
        }

        const data = await response.json();
        const models = data.data;

        console.log("✅ KẾT NỐI THÀNH CÔNG! Dưới đây là các Model bạn được dùng:");
        console.log("------------------------------------------------");
        
        // Lọc ra các model Llama và in ra
        models.forEach(m => {
            console.log(`- ${m.id}`);
        });
        
        console.log("------------------------------------------------");
        console.log("💡 GỢI Ý: Hãy chọn 'llama-3.3-70b-versatile' hoặc 'llama-3.1-8b-instant' để thay vào app.js");

    } catch (err) {
        console.error("❌ Lỗi mạng hoặc code:", err.message);
    }
}

checkModels();