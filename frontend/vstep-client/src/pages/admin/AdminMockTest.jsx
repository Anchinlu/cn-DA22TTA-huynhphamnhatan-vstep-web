import React, { useState } from 'react';
import { Save, Zap, RefreshCcw, FileText, CheckCircle2 } from 'lucide-react'; 
import toast from 'react-hot-toast';
import Header from '../../components/Header';

const AdminMockTest = () => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  // HÀM: Xử lý tạo tự động
  const handleAutoGenerate = async () => {
    if (!title.trim()) return toast.error("Vui lòng nhập tên đề thi trước!");
    
    setIsGenerating(true);
    try {
        const token = localStorage.getItem('vstep_token');
        const res = await fetch('http://localhost:5000/api/mock-tests/auto-generate', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, description: desc })
        });
        const data = await res.json();
        
        if (res.ok) {
            toast.success(`🎉 ${data.message}`);
            setLastResult(data.stats); // Lưu kết quả để hiển thị
            setTitle(''); // Reset form
            setDesc('');
        } else {
            toast.error("Lỗi: " + data.message);
        }
    } catch (err) {
        toast.error("Lỗi kết nối server");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Soạn Đề Thi Thử (Full Test)</h1>
            <p className="text-slate-500 mt-1">Hệ thống sẽ tự động lấy câu hỏi ngẫu nhiên từ ngân hàng.</p>
          </div>
        </div>

        {/* Form nhập liệu */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Tên đề thi (Bắt buộc)</label>
            <input 
                type="text" 
                className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg" 
                placeholder="VD: Thi thử VSTEP Online - Đề số 01" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả (Tùy chọn)</label>
            <textarea 
                rows="3"
                className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="Ghi chú về đề thi này..." 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
            />
          </div>

          <button 
            onClick={handleAutoGenerate}
            disabled={isGenerating}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:bg-gray-400"
          >
            {isGenerating ? <RefreshCcw className="animate-spin w-6 h-6"/> : <Zap className="w-6 h-6"/>}
            {isGenerating ? "Đang xào nấu đề thi..." : "TẠO ĐỀ THI TỰ ĐỘNG"}
          </button>

          {/* Hiển thị kết quả sau khi tạo */}
          {lastResult && (
             <div className="mt-8 p-6 bg-emerald-50 rounded-xl border border-emerald-100 animate-fade-in">
                <h3 className="font-bold text-emerald-800 flex items-center gap-2 mb-4">
                    <CheckCircle2 className="text-emerald-600"/> Đề thi đã được tạo thành công!
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg border border-emerald-100 text-center">
                        <div className="font-bold text-emerald-600">{lastResult.reading}</div>
                        <div className="text-gray-500">Bài Đọc</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-emerald-100 text-center">
                        <div className="font-bold text-emerald-600">{lastResult.writing}</div>
                        <div className="text-gray-500">Bài Viết</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-emerald-100 text-center">
                        <div className="font-bold text-emerald-600">{lastResult.speaking}</div>
                        <div className="text-gray-500">Bài Nói</div>
                    </div>
                </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminMockTest;