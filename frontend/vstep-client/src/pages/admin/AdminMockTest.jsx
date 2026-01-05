import React, { useState } from 'react';
import { Save, Zap, RefreshCcw, FileText, CheckCircle2, LayoutDashboard, AlertCircle, BarChart3 } from 'lucide-react'; 
import toast from 'react-hot-toast';

const AdminMockTest = () => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  // HÀM: Xử lý tạo tự động (Giữ nguyên logic)
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
            setLastResult(data.stats); 
            setTitle(''); 
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
    <div className="max-w-4xl mx-auto p-8 space-y-6 bg-white min-h-screen font-sans animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="text-indigo-600" size={24} />
            Khởi tạo Đề Thi Thử
          </h1>
          <p className="text-sm text-slate-500 mt-1">Hệ thống tự động trích xuất ngẫu nhiên từ ngân hàng câu hỏi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* THIẾT LẬP ĐỀ THI */}
        <div className="border border-slate-200 rounded-lg p-8 space-y-6 shadow-sm">
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Tên đề thi hiển thị
              </label>
              <input 
                  type="text" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-lg text-slate-800" 
                  placeholder="" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Ghi chú mô tả
              </label>
              <textarea 
                  rows="3"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm text-slate-600" 
                  placeholder="Nhập ghi chú hoặc hướng dẫn cho đề thi này..." 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)} 
              />
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded flex items-start gap-3">
            <AlertCircle className="text-amber-600 mt-0.5" size={18} />
            <p className="text-xs text-amber-700 leading-relaxed italic">
              Lưu ý: Hệ thống sẽ tự động chọn 1 bài Reading, 1 bài Listening, 1 Writing và 1 Speaking từ kho đề đã được duyệt.
            </p>
          </div>

          <button 
            onClick={handleAutoGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 bg-slate-900 text-white rounded font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:bg-slate-300"
          >
            {isGenerating ? <RefreshCcw className="animate-spin" size={18}/> : <Zap size={18}/>}
            {isGenerating ? "ĐANG KHỞI TẠO DỮ LIỆU..." : "TẠO ĐỀ THI TỰ ĐỘNG"}
          </button>

          {/* KẾT QUẢ THỐNG KÊ SAU KHI TẠO */}
          {lastResult && (
             <div className="mt-8 pt-8 border-t border-slate-100 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2 text-emerald-600 mb-6">
                  <CheckCircle2 size={20}/>
                  <span className="text-sm font-bold uppercase tracking-widest">Khởi tạo thành công!</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border border-slate-100 bg-slate-50 rounded text-center group hover:border-emerald-200 transition-colors">
                        <div className="text-2xl font-mono font-black text-slate-900 mb-1">{lastResult.reading}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kỹ năng Đọc</div>
                    </div>
                    <div className="p-4 border border-slate-100 bg-slate-50 rounded text-center group hover:border-emerald-200 transition-colors">
                        <div className="text-2xl font-mono font-black text-slate-900 mb-1">{lastResult.writing}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kỹ năng Viết</div>
                    </div>
                    <div className="p-4 border border-slate-100 bg-slate-50 rounded text-center group hover:border-emerald-200 transition-colors">
                        <div className="text-2xl font-mono font-black text-slate-900 mb-1">{lastResult.speaking}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kỹ năng Nói</div>
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                   <button 
                    onClick={() => window.location.href = '/admin/questions'}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-all"
                   >
                     Xem chi tiết trong Ngân hàng câu hỏi <BarChart3 size={14}/>
                   </button>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminMockTest;