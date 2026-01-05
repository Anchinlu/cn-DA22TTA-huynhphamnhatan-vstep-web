import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Headphones, PenTool, Mic, 
  Trash2, Edit3, Loader2, ChevronRight, Filter, Eye, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuestionBank = () => {
  const [data, setData] = useState({ listening: [], reading: [], writing: [], speaking: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reading');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 1. Fetch dữ liệu từ API
  useEffect(() => {
    const fetchBank = async () => {
      try {
        const token = localStorage.getItem('vstep_token');
        const res = await fetch('http://localhost:5000/api/admin/question-bank', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (res.ok) {
          setData(json);
        }
      } catch (err) {
        toast.error("Không thể kết nối với máy chủ");
      } finally {
        setLoading(false);
      }
    };
    fetchBank();
  }, []);

  // 2. Logic xóa (Giả lập hoặc gọi API Delete sau này)
  const handleDelete = async (id, type) => {
    if (!window.confirm(`Bạn có chắc muốn xóa đề ${type.toUpperCase()} này không?`)) return;
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch(`http://localhost:5000/api/admin/questions/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Xóa thất bại');
      toast.success(`Xóa đề #${id} thành công`);
      // cập nhật giao diện: loại bỏ item khỏi state
      setData(prev => ({
        ...prev,
        [type]: prev[type].filter(it => it.id !== id)
      }));
    } catch (err) {
      toast.error('Không thể xóa đề thi');
    }
  };

  const handleViewDetail = async (id, type) => {
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch(`http://localhost:5000/api/admin/questions/${type}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return toast.error('Không thể tải chi tiết đề thi');
      const json = await res.json();
      setSelectedDetail({ ...json, type });
      setShowModal(true);
      setIsEditing(false);
    } catch (err) {
      toast.error('Lỗi khi tải chi tiết đề thi');
    }
  };

  const handleEdit = async (id, type) => {
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch(`http://localhost:5000/api/admin/questions/${type}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return toast.error('Không thể tải chi tiết đề thi');
      const json = await res.json();
      setSelectedDetail({ ...json, type });
      setShowModal(true);
      setIsEditing(true);
    } catch (err) {
      toast.error('Lỗi khi tải chi tiết đề thi');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedDetail) return;
    const { id, type } = selectedDetail;
    try {
      const token = localStorage.getItem('vstep_token');
      // Prepare payload based on type
      let payload = {};
      if (type === 'reading') {
        payload = { title: selectedDetail.title, content: selectedDetail.content, level_id: selectedDetail.level_id, topic_id: selectedDetail.topic_id, questions: selectedDetail.questions };
      } else if (type === 'listening') {
        payload = { title: selectedDetail.title, script_content: selectedDetail.script_content, audio_url: selectedDetail.audio_url, level_id: selectedDetail.level_id, topic_id: selectedDetail.topic_id, questions: selectedDetail.questions };
      } else if (type === 'writing') {
        payload = { title: selectedDetail.title, question_text: selectedDetail.question_text, level_id: selectedDetail.level_id, topic_id: selectedDetail.topic_id, task_type: selectedDetail.task_type };
      } else if (type === 'speaking') {
        payload = { title: selectedDetail.title, question_text: selectedDetail.question_text, level_id: selectedDetail.level_id, topic_id: selectedDetail.topic_id, part: selectedDetail.part };
      }

      const res = await fetch(`http://localhost:5000/api/admin/questions/${type}/${id}`, {
        method: 'PUT',
        headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: `Bearer ${token}` } : {}),
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) return toast.error(json.message || 'Lỗi khi cập nhật đề');
      toast.success('Cập nhật thành công');
      // Update local list
      setData(prev => ({
        ...prev,
        [type]: prev[type].map(it => it.id === id ? { ...it, title: selectedDetail.title, level_id: selectedDetail.level_id } : it)
      }));
      setShowModal(false);
      setIsEditing(false);
    } catch (err) {
      toast.error('Lỗi khi lưu thay đổi');
    }
  };

  const filteredItems = data[activeTab]?.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.topic_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const tabConfigs = [
    { id: 'reading', label: 'Reading', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'listening', label: 'Listening', icon: Headphones, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'writing', label: 'Writing', icon: PenTool, color: 'text-violet-600', bg: 'bg-violet-50' },
    { id: 'speaking', label: 'Speaking', icon: Mic, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-indigo-600 w-10 h-10"/>
      <p className="text-slate-500 font-medium">Đang truy xuất ngân hàng đề...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in p-2">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Ngân hàng Câu hỏi</h1>
          <p className="text-slate-500">Quản lý nội dung luyện tập cho toàn bộ hệ thống</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
          <input 
            type="text" 
            placeholder="Tìm theo tiêu đề hoặc chủ đề..." 
            className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-80 outline-none focus:ring-4 ring-indigo-50 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs Chuyển đổi Kỹ năng */}
      <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-fit overflow-x-auto">
        {tabConfigs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
              ? 'bg-slate-900 text-white shadow-lg scale-105' 
              : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : tab.color}/>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Hiển thị */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] border-b border-slate-100">
              <tr>
                <th className="p-6 w-20">ID</th>
                <th className="p-6">Thông tin đề thi</th>
                <th className="p-6">Chủ đề</th>
                <th className="p-6 text-center">Trình độ</th>
                <th className="p-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.length > 0 ? filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6">
                    <span className="text-slate-400 font-mono text-xs font-bold">#{item.id}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        tabConfigs.find(t => t.id === activeTab).bg
                      } ${tabConfigs.find(t => t.id === activeTab).color}`}>
                        <ChevronRight size={18} />
                      </div>
                      <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                      {item.topic_name || 'Chưa phân loại'}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black shadow-sm ${
                      item.level_id === 'B1' ? 'bg-emerald-100 text-emerald-700' : 
                      item.level_id === 'B2' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {item.level_id}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleViewDetail(item.id, activeTab)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleEdit(item.id, activeTab)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Sửa đề"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id, activeTab)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
  
                    {/* Modal Xem chi tiết */}
                    {showModal && selectedDetail && (
                      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
                          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex-1">
                              {isEditing ? (
                                <input value={selectedDetail.title} onChange={(e) => setSelectedDetail(prev => ({...prev, title: e.target.value}))} className="w-full text-xl font-black p-2 border border-slate-200 rounded-lg" />
                              ) : (
                                <>
                                  <h2 className="text-xl font-black text-slate-800">{selectedDetail.title}</h2>
                                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{selectedDetail.type} - {selectedDetail.level_id}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {isEditing ? (
                                <>
                                  <button onClick={handleSaveEdit} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Lưu</button>
                                  <button onClick={() => { setIsEditing(false); setShowModal(false); }} className="px-3 py-2 bg-white border rounded-xl">Hủy</button>
                                </>
                              ) : (
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-full shadow-sm"><X size={24}/></button>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Phần Nội dung (Passage/Script) */}
                            <div className="space-y-3">
                              <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">Nội dung đề thi</h3>
                              {isEditing ? (
                                <textarea rows={8} value={selectedDetail.content || selectedDetail.script_content || ''} onChange={(e) => {
                                  if (selectedDetail.type === 'reading') setSelectedDetail(prev => ({...prev, content: e.target.value}));
                                  else if (selectedDetail.type === 'listening') setSelectedDetail(prev => ({...prev, script_content: e.target.value}));
                                }} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100" />
                              ) : (
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-slate-700 leading-relaxed font-serif">
                                  {selectedDetail.content || selectedDetail.script_content || 'Không có nội dung văn bản'}
                                </div>
                              )}
                            </div>

                            {/* Phần Câu hỏi */}
                            <div className="space-y-4">
                              <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">Danh sách câu hỏi ({selectedDetail.questions?.length || 0})</h3>
                              <div className="grid gap-4">
                                {selectedDetail.questions?.map((q, i) => (
                                  <div key={i} className="p-5 border border-slate-100 rounded-2xl bg-white shadow-sm">
                                    <p className="font-bold text-slate-800 mb-3">{i+1}. {q.question_text || q.Question || q.question}</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div className={q.correct_answer === 'A' ? 'text-green-600 font-bold' : 'text-slate-500'}>A. {q.option_a || q.OptionA}</div>
                                      <div className={q.correct_answer === 'B' ? 'text-green-600 font-bold' : 'text-slate-500'}>B. {q.option_b || q.OptionB}</div>
                                      <div className={q.correct_answer === 'C' ? 'text-green-600 font-bold' : 'text-slate-500'}>C. {q.option_c || q.OptionC}</div>
                                      <div className={q.correct_answer === 'D' ? 'text-green-600 font-bold' : 'text-slate-500'}>D. {q.option_d || q.OptionD}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="flex flex-col items-center text-slate-300">
                      <Filter size={48} className="mb-4 opacity-20" />
                      <p className="italic font-medium">Không tìm thấy đề thi nào phù hợp</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
