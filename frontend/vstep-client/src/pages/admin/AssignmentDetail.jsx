import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Link as LinkIcon, 
  CheckCircle2, Clock, User, Save, ExternalLink,
  Search, Filter, ChevronRight
} from 'lucide-react';

// Không import Header/Footer nữa để tối ưu không gian

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubs, setFilteredSubs] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, graded, pending

  // Fetch dữ liệu
  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch(`http://localhost:5000/api/assignments/${id}/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSubmissions(data);
      setFilteredSubs(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, [id]);

  // Filter & Search Logic
  useEffect(() => {
    let result = submissions;
    
    // Lọc theo trạng thái
    if (filterStatus === 'graded') result = result.filter(s => s.trang_thai_cham === 'da_cham');
    if (filterStatus === 'pending') result = result.filter(s => s.trang_thai_cham !== 'da_cham');

    // Lọc theo tên
    if (searchTerm) {
      result = result.filter(s => 
        s.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubs(result);
  }, [submissions, searchTerm, filterStatus]);

  // Chọn bài để chấm
  const handleSelect = (sub) => {
    setSelectedSub(sub);
    setGrade(sub.diem || '');
    setFeedback(sub.nhan_xet || '');
  };

  // Lưu điểm
  const handleGrade = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch(`http://localhost:5000/api/submissions/${selectedSub.bai_nop_id}/grade`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ diem: grade, nhan_xet: feedback })
      });

      if (res.ok) {
        // Cập nhật state local để không cần reload
        const updatedList = submissions.map(s => 
            s.bai_nop_id === selectedSub.bai_nop_id 
            ? { ...s, diem: grade, nhan_xet: feedback, trang_thai_cham: 'da_cham' } 
            : s
        );
        setSubmissions(updatedList);
        alert("Đã lưu kết quả chấm!");
      }
    } catch (err) {
      alert("Lỗi lưu điểm.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* --- CỘT 1: DANH SÁCH (SIDEBAR) - 25% --- */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-10">
        
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100 bg-gray-50">
          <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-white rounded-lg text-slate-500 transition-colors">
            <ArrowLeft size={20}/>
          </button>
          <h2 className="font-bold text-slate-800 truncate">Danh sách nộp</h2>
        </div>

        {/* Tools: Search & Filter */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm tên học viên..." 
              className="w-full pl-9 pr-3 py-2bg-slate-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setFilterStatus('all')} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${filterStatus === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>Tất cả</button>
            <button onClick={() => setFilterStatus('pending')} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${filterStatus === 'pending' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>Chờ chấm</button>
            <button onClick={() => setFilterStatus('graded')} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${filterStatus === 'graded' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500'}`}>Đã chấm</button>
          </div>
        </div>

        {/* List Items */}
        <div className="flex-1 overflow-y-auto">
          {filteredSubs.map(sub => (
            <div 
              key={sub.bai_nop_id}
              onClick={() => handleSelect(sub)}
              className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-slate-50
                ${selectedSub?.bai_nop_id === sub.bai_nop_id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-bold text-sm ${selectedSub?.bai_nop_id === sub.bai_nop_id ? 'text-indigo-900' : 'text-gray-700'}`}>
                    {sub.ho_ten}
                </span>
                {sub.trang_thai_cham === 'da_cham' ? (
                   <CheckCircle2 size={14} className="text-green-600" />
                ) : (
                   <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5"></div>
                )}
              </div>
              <p className="text-xs text-gray-400 truncate mb-1">{sub.email}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock size={10}/> {new Date(sub.ngay_nop).toLocaleDateString('vi-VN')}
                </span>
                {sub.diem && <span className="text-xs font-bold text-indigo-600">{sub.diem} đ</span>}
              </div>
            </div>
          ))}
          {filteredSubs.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">Không tìm thấy bài nộp.</div>}
        </div>
      </div>

      {/* --- CỘT 2: KHÔNG GIAN CHẤM BÀI (MAIN) - 75% --- */}
      <div className="flex-1 flex flex-col bg-slate-100 h-full overflow-hidden">
        
        {selectedSub ? (
          <div className="flex h-full">
            
            {/* A. Nội dung bài làm (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="bg-white min-h-full rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-12">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                    <FileText size={16}/> Bài làm của sinh viên
                 </h3>

                 {selectedSub.link_nop_bai ? (
                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-4">
                        <div className="p-3 bg-white rounded-lg shadow-sm text-blue-600"><LinkIcon size={24}/></div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-blue-900 mb-1">Bài nộp qua liên kết</p>
                            <a href={selectedSub.link_nop_bai} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm truncate block">
                                {selectedSub.link_nop_bai}
                            </a>
                        </div>
                        <a href={selectedSub.link_nop_bai} target="_blank" rel="noreferrer" className="p-2 hover:bg-blue-100 rounded-lg text-blue-700">
                            <ExternalLink size={20}/>
                        </a>
                    </div>
                 ) : (
                    <div className="prose prose-slate max-w-none">
                        <p className="whitespace-pre-wrap text-gray-800 leading-loose text-lg font-serif">
                            {selectedSub.duong_dan_tap_tin || "Học viên nộp dạng văn bản nhưng dữ liệu trống."}
                        </p>
                    </div>
                 )}
              </div>
            </div>

            {/* B. Form Chấm điểm (Fixed Right Sidebar) */}
            <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl z-20">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-lg">Đánh giá & Cho điểm</h3>
                    <p className="text-xs text-gray-500 mt-1">Nhập điểm số và nhận xét chi tiết</p>
                </div>

                <form onSubmit={handleGrade} className="flex-1 flex flex-col p-6 overflow-y-auto">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Điểm số (0-10)</label>
                            <div className="relative">
                                <input 
                                    type="number" step="0.1" max="10" min="0" required
                                    className="w-full p-4 text-3xl font-black text-center text-indigo-600 border-2 border-indigo-100 rounded-2xl focus:border-indigo-600 focus:ring-0 outline-none transition-all"
                                    placeholder="0.0"
                                    value={grade}
                                    onChange={e => setGrade(e.target.value)}
                                />
                                <span className="absolute top-1/2 right-6 -translate-y-1/2 text-gray-400 font-bold">/ 10</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Lời phê của giáo viên</label>
                            <textarea 
                                rows={10}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none text-sm leading-relaxed bg-gray-50 focus:bg-white transition-all"
                                placeholder="Nhận xét về ưu điểm, khuyết điểm..."
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-auto pt-6">
                        <button 
                            type="submit" 
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all hover:-translate-y-1"
                        >
                            <Save size={20} /> Lưu kết quả
                        </button>
                    </div>
                </form>
            </div>

          </div>
        ) : (
          // Empty State (Chưa chọn bài)
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
             <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                <User size={48} className="text-slate-400"/>
             </div>
             <h3 className="text-xl font-bold text-slate-600">Chưa chọn bài nộp</h3>
             <p className="max-w-xs text-center mt-2 text-sm">Vui lòng chọn một học viên từ danh sách bên trái để bắt đầu chấm bài.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default AssignmentDetail;