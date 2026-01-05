import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Headphones, PenTool, Mic, 
  Trash2, Edit3, Loader2, ChevronRight, Filter, Eye, X,
  PlayCircle, FileText, CheckCircle2, Info, Save, LayoutDashboard,
  Clock, ListChecks, AlertCircle
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

  const skillThemes = {
    reading: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', btn: 'bg-emerald-600', label: 'Reading' },
    listening: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', btn: 'bg-blue-600', label: 'Listening' },
    writing: { color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', btn: 'bg-violet-600', label: 'Writing' },
    speaking: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', btn: 'bg-orange-600', label: 'Speaking' },
  };

  const currentTheme = skillThemes[activeTab];

  useEffect(() => {
    fetchBank();
  }, []);

  const fetchBank = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('vstep_token');
      const res = await fetch('http://localhost:5000/api/admin/question-bank', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (err) {
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Xác nhận xóa đề #${id}?`)) return;
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch(`http://localhost:5000/api/admin/questions/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setData(prev => ({ ...prev, [type]: prev[type].filter(it => it.id !== id) }));
        toast.success("Đã xóa đề thi");
      }
    } catch (err) { toast.error("Xóa thất bại"); }
  };

  const handleFetchDetail = async (id, type, editMode = false) => {
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch(`http://localhost:5000/api/admin/questions/${type}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        setSelectedDetail({ ...json, type });
        setIsEditing(editMode);
        setShowModal(true);
      }
    } catch (err) { toast.error("Lỗi tải chi tiết"); }
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch(`http://localhost:5000/api/admin/questions/${selectedDetail.type}/${selectedDetail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(selectedDetail)
      });
      if (res.ok) {
        toast.success("Cập nhật thành công");
        setShowModal(false);
        fetchBank();
      }
    } catch (err) { toast.error("Lưu thất bại"); }
  };

  const filteredItems = data[activeTab]?.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.topic_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white text-slate-500 font-medium">
      <Loader2 className="animate-spin mr-2" /> Đang tải dữ liệu...
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6 bg-white min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="text-indigo-600" size={24} />
            Ngân hàng Đề thi
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý kho nội dung hệ thống VSTEP AI</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
          <input 
            type="text" 
            placeholder="Tìm kiếm nhanh..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-indigo-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TAB NAVIGATION - Gọn gàng hơn */}
      <div className="flex border-b border-slate-200 gap-8">
        {Object.entries(skillThemes).map(([key, theme]) => (
          <button 
            key={key}
            onClick={() => setActiveTab(key)}
            className={`pb-4 px-2 text-sm font-bold transition-all relative ${
              activeTab === key ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              {key === 'reading' && <BookOpen size={16}/>}
              {key === 'listening' && <Headphones size={16}/>}
              {key === 'writing' && <PenTool size={16}/>}
              {key === 'speaking' && <Mic size={16}/>}
              {theme.label}
              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-mono">
                {data[key]?.length || 0}
              </span>
            </div>
            {activeTab === key && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 animate-in slide-in-from-left-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* MAIN TABLE - Vuông vức chuyên nghiệp */}
      <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500 font-bold text-xs uppercase tracking-wider">
              <th className="px-6 py-4 w-20">ID</th>
              <th className="px-6 py-4">Tiêu đề đề thi</th>
              <th className="px-6 py-4">Chủ đề</th>
              <th className="px-6 py-4 text-center">Trình độ</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-all">
                <td className="px-6 py-4 font-mono text-xs text-slate-400">#{item.id}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">{item.title}</td>
                <td className="px-6 py-4">
                  <span className="text-xs text-slate-500 font-medium">{item.topic_name || 'General'}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                    item.level_id === 'B1' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    item.level_id === 'B2' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {item.level_id}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleFetchDetail(item.id, activeTab, false)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 rounded transition-all"><Eye size={16} /></button>
                    <button onClick={() => handleFetchDetail(item.id, activeTab, true)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 rounded transition-all"><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(item.id, activeTab)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-slate-200 rounded transition-all"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL XEM/SỬA - Gọn gàng kiểu Side Panel hoặc Modal trung tâm vuông */}
      {showModal && selectedDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-lg shadow-2xl flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded ${currentTheme.bg} ${currentTheme.color}`}>
                  {isEditing ? <Edit3 size={18}/> : <Info size={18}/>}
                </div>
                <div>
                  {isEditing ? (
                    <input 
                      value={selectedDetail.title} 
                      onChange={(e) => setSelectedDetail(prev => ({...prev, title: e.target.value}))} 
                      className="text-lg font-bold bg-white border border-slate-300 rounded px-3 py-1 outline-none focus:border-indigo-500 w-[400px]"
                    />
                  ) : (
                    <h2 className="text-lg font-bold text-slate-800">{selectedDetail.title}</h2>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing && (
                  <button onClick={handleSaveEdit} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded text-sm font-bold hover:bg-slate-800 transition-all">
                    <Save size={16}/> Lưu bài viết
                  </button>
                )}
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 text-slate-500 rounded transition-all"><X size={20}/></button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
              {activeTab === 'listening' && selectedDetail.audio_url && (
                <div className="bg-slate-50 p-4 border border-slate-200 rounded flex items-center gap-4">
                  <PlayCircle className="text-indigo-600" size={32} />
                  <audio src={selectedDetail.audio_url} controls className="flex-1 h-8" />
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nội dung bài thi</p>
                {isEditing ? (
                  <textarea 
                    rows={12} 
                    value={selectedDetail.content || selectedDetail.script_content || selectedDetail.question_text || ''} 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (activeTab === 'reading') setSelectedDetail(prev => ({...prev, content: val}));
                      else if (activeTab === 'listening') setSelectedDetail(prev => ({...prev, script_content: val}));
                      else setSelectedDetail(prev => ({...prev, question_text: val}));
                    }} 
                    className="w-full p-4 bg-white border border-slate-300 rounded outline-none focus:border-indigo-500 font-serif text-base"
                  />
                ) : (
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded text-slate-700 leading-relaxed font-serif text-base whitespace-pre-line overflow-auto max-h-[400px]">
                    {selectedDetail.content || selectedDetail.script_content || selectedDetail.question_text}
                  </div>
                )}
              </div>

              {/* Questions Area */}
              {(activeTab === 'reading' || activeTab === 'listening') && (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Hệ thống câu hỏi</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDetail.questions?.map((q, i) => (
                      <div key={i} className="p-4 border border-slate-200 rounded hover:border-indigo-200 transition-all">
                        <p className="font-bold text-sm text-slate-800 mb-3">{i+1}. {q.question_text || q.question}</p>
                        <div className="space-y-1">
                          {['a', 'b', 'c', 'd'].map(opt => {
                            const isCorrect = q.correct_answer === opt.toUpperCase();
                            return (
                              <div key={opt} className={`px-3 py-1.5 text-xs rounded border ${isCorrect ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' : 'bg-white text-slate-500 border-slate-100'}`}>
                                {opt.toUpperCase()}. {q[`option_${opt}`] || q[`Option${opt.toUpperCase()}`]}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;