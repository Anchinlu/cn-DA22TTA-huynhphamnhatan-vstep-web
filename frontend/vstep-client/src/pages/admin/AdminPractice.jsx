import React, { useState, useEffect } from 'react';
import { 
  Upload, FileSpreadsheet, FileAudio, Save, 
  Plus, Check, X, Layers, AlertCircle, Eye, Loader2, FileText, Bot, 
  Settings2, Tag, LayoutDashboard, Sparkles, ListChecks, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast'; 

const AdminPractice = () => {
  // --- STATE CẤU HÌNH ---
  const [skill, setSkill] = useState('reading');
  const [level, setLevel] = useState('B1');
  const [topicId, setTopicId] = useState('');
  const [taskType, setTaskType] = useState('task1'); 
  const [part, setPart] = useState('1'); 
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); 
  const [scriptContent, setScriptContent] = useState(''); 
  const [questions, setQuestions] = useState([]); 
  const [audioUrl, setAudioUrl] = useState(null); 
  const [listeningMode, setListeningMode] = useState('ai'); 
  const [questionCount, setQuestionCount] = useState(5); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [topics, setTopics] = useState([]);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [loading, setLoading] = useState(false);

  // Cấu hình Theme theo kỹ năng (Square style)
  const skillThemes = {
    reading: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', btn: 'bg-emerald-600', label: 'Reading (Đọc hiểu)' },
    listening: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', btn: 'bg-blue-600', label: 'Listening (Nghe hiểu)' },
    writing: { color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', btn: 'bg-violet-600', label: 'Writing (Viết)' },
    speaking: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', btn: 'bg-orange-600', label: 'Speaking (Nói)' },
  };

  const currentTheme = skillThemes[skill];

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch('http://localhost:5000/api/admin/topics', { 
        headers: token ? { Authorization: `Bearer ${token}` } : {} 
      });
      const data = await res.json();
      setTopics(data);
    } catch (err) { console.error("Lỗi load topic:", err); }
  };

  const handleAddTopic = async () => {
    if (!newTopicName.trim()) return;
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch('http://localhost:5000/api/admin/topics', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newTopicName })
      });
      const data = await res.json();
      if (res.ok) {
        setTopics([...topics, { id: data.id, name: data.name }]); 
        setTopicId(data.id); 
        setIsAddingTopic(false);
        setNewTopicName('');
        toast.success("Đã thêm chủ đề mới!");
      }
    } catch (err) { toast.error("Lỗi kết nối"); }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const loadToast = toast.loading("Đang đọc file Excel...");
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch('http://localhost:5000/api/admin/preview-excel', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.data); 
        toast.success(`Đã nhận ${data.total} câu hỏi!`, { id: loadToast });
      }
    } catch (err) { toast.error("Lỗi server", { id: loadToast }); }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const loadToast = toast.loading("Đang tải audio...");
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch('http://localhost:5000/api/admin/upload-media', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setAudioUrl(data.url);
        toast.success("Tải audio thành công!", { id: loadToast });
      }
    } catch (err) { toast.error("Lỗi server", { id: loadToast }); }
  };

  const handleAIGenerate = async () => {
    if (skill !== 'reading' || !content) return toast.error("Thiếu nội dung bài đọc");
    setIsGenerating(true);
    const loadToast = toast.loading("AI đang soạn câu hỏi...");
    try {
      const res = await fetch('http://localhost:5000/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type: 'reading', level, count: questionCount })
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions || []);
        toast.success("AI đã soạn xong!", { id: loadToast });
      }
    } catch (err) { toast.error("Lỗi AI", { id: loadToast }); }
    finally { setIsGenerating(false); }
  };

  const handleSubmit = async () => {
    if (!title || !topicId) return toast.error("Thiếu Tiêu đề hoặc Chủ đề");
    setLoading(true);
    const payload = {
      title, level, topic_id: topicId, questions,
      content: (skill !== 'listening') ? content : null,
      script_content: skill === 'listening' ? scriptContent : null,
      audio_url: skill === 'listening' && listeningMode === 'mp3' ? audioUrl : null,
      task_type: skill === 'writing' ? taskType : null,
      part: skill === 'speaking' ? part : null,
    };
    const endpoint = `/create-${skill}`;
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch(`http://localhost:5000/api/admin${endpoint}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("Tạo đề thi thành công!");
        setTitle(''); setContent(''); setScriptContent(''); setQuestions([]); setAudioUrl(null);
      }
    } catch (err) { toast.error("Lỗi lưu đề"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6 bg-white min-h-screen font-sans animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Plus className="text-indigo-600" size={24} />
            Soạn Đề thi Mới
          </h1>
          <p className="text-sm text-slate-500 mt-1">Hệ thống khởi tạo nội dung luyện tập VSTEP AI</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => window.history.back()}
                className="px-4 py-2 border border-slate-200 rounded text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
                Hủy bỏ
            </button>
            <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded text-sm font-bold hover:bg-slate-800 transition-all shadow-sm disabled:bg-slate-300"
            >
                {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                Lưu Đề Thi
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR CẤU HÌNH (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Cấu hình cơ bản */}
          <div className="border border-slate-200 rounded p-5 space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Settings2 size={14}/> Thiết lập bài thi
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Kỹ năng mục tiêu</label>
                <select 
                  value={skill} onChange={(e) => setSkill(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="reading">Reading (Đọc hiểu)</option>
                  <option value="listening">Listening (Nghe hiểu)</option>
                  <option value="writing">Writing (Viết)</option>
                  <option value="speaking">Speaking (Nói)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Trình độ</label>
                  <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none font-medium">
                    <option value="B1">B1</option><option value="B2">B2</option><option value="C1">C1</option>
                  </select>
                </div>
                {skill === 'writing' && (
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Dạng bài</label>
                    <select value={taskType} onChange={(e) => setTaskType(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none font-medium">
                      <option value="task1">Task 1 (Thư)</option><option value="task2">Task 2 (Luận)</option>
                    </select>
                  </div>
                )}
                {skill === 'speaking' && (
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Phần thi</label>
                    <select value={part} onChange={(e) => setPart(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none font-medium">
                      <option value="1">Part 1</option><option value="2">Part 2</option><option value="3">Part 3</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Phân loại Chủ đề */}
          <div className="border border-slate-200 rounded p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Tag size={14}/> Phân loại chủ đề
              </h3>
              <button onClick={() => setIsAddingTopic(!isAddingTopic)} className="text-[10px] font-bold text-indigo-600 hover:underline uppercase">
                {isAddingTopic ? "Hủy" : "+ Thêm mới"}
              </button>
            </div>

            {isAddingTopic ? (
              <div className="flex gap-2 animate-in slide-in-from-top-1">
                <input 
                  type="text" placeholder="Tên chủ đề..." 
                  className="flex-1 p-2 bg-white border border-slate-300 rounded text-xs outline-none focus:border-indigo-500"
                  value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)}
                />
                <button onClick={handleAddTopic} className="p-2 bg-slate-900 text-white rounded"><Check size={14}/></button>
              </div>
            ) : (
              <select value={topicId} onChange={(e) => setTopicId(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none font-medium">
                <option value="">-- Chọn chủ đề --</option>
                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            )}
          </div>

          {/* AI Assistant (Chỉ Reading) */}
          {skill === 'reading' && (
            <div className="bg-slate-900 rounded p-6 text-white space-y-4 shadow-md relative overflow-hidden">
               <div className="absolute -bottom-4 -right-4 opacity-10"><Sparkles size={100}/></div>
               <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-indigo-400">
                 <Bot size={16}/> AI Assistant
               </h3>
               <div className="space-y-4">
                 <div>
                   <label className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Số lượng câu soạn: {questionCount}</label>
                   <input type="range" min="1" max="10" value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value))} className="w-full accent-indigo-500" />
                 </div>
                 <button 
                   onClick={handleAIGenerate} 
                   disabled={isGenerating}
                   className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20"
                 >
                   {isGenerating ? <Loader2 className="animate-spin" size={14}/> : <Bot size={14}/>} 
                   AI Tự động soạn câu hỏi
                 </button>
               </div>
            </div>
          )}
        </div>

        {/* MAIN CONTENT (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tiêu đề bài thi */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiêu đề hiển thị</label>
            <input 
              type="text" 
              className="w-full p-3 bg-white border border-slate-200 rounded text-lg font-bold outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300"
              placeholder={`VD: ${skill.toUpperCase()} Actual Test #01`}
              value={title} onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Nội dung chi tiết */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {skill === 'listening' ? "Kịch bản/Transcript" : "Nội dung đề bài"}
              </label>
              {skill === 'listening' && (
                <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200">
                  <button onClick={() => setListeningMode('ai')} className={`px-3 py-1 text-[10px] font-bold rounded ${listeningMode === 'ai' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>AI Voice</button>
                  <button onClick={() => setListeningMode('mp3')} className={`px-3 py-1 text-[10px] font-bold rounded ${listeningMode === 'mp3' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>File MP3</button>
                </div>
              )}
            </div>
            
            <textarea 
              rows={skill === 'listening' ? 6 : 14}
              className="w-full p-5 bg-slate-50/50 border border-slate-200 rounded outline-none focus:border-indigo-500 font-serif text-base leading-relaxed text-slate-700 shadow-inner"
              placeholder={skill === 'listening' ? "Dán transcript bài nghe vào đây..." : "Nhập nội dung bài đọc hoặc mô tả đề bài viết/nói..."}
              value={skill === 'listening' ? scriptContent : content}
              onChange={(e) => skill === 'listening' ? setScriptContent(e.target.value) : setContent(e.target.value)}
            />
          </div>

          {/* Listening: Audio Upload */}
          {skill === 'listening' && listeningMode === 'mp3' && (
            <div className="border border-dashed border-slate-200 bg-slate-50/50 p-10 rounded flex flex-col items-center justify-center relative group hover:border-blue-300 transition-all">
              <input type="file" accept="audio/*" onChange={handleAudioUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {audioUrl ? (
                <div className="text-blue-600 flex flex-col items-center gap-2">
                  <CheckCircle2 size={40} />
                  <span className="text-sm font-bold">Audio đã tải lên thành công</span>
                </div>
              ) : (
                <div className="text-slate-400 flex flex-col items-center gap-2 opacity-60 group-hover:opacity-100 transition-all">
                  <FileAudio size={48} strokeWidth={1.2} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Click hoặc Kéo thả file MP3</span>
                </div>
              )}
            </div>
          )}

          {/* Danh sách câu hỏi (Excel) */}
          {(skill === 'reading' || skill === 'listening') && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <ListChecks size={14}/> Danh sách câu hỏi trắc nghiệm
                </h3>
                <a href="/template.xlsx" className="text-[10px] font-bold text-indigo-600 hover:underline">Tải File Excel Mẫu</a>
              </div>

              {!questions.length ? (
                <div className="border border-dashed border-slate-200 p-12 rounded flex flex-col items-center justify-center relative group hover:bg-slate-50/50 transition-all">
                  <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <FileSpreadsheet className="text-slate-300 group-hover:text-indigo-400 transition-all mb-4" size={56} strokeWidth={1} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tải lên danh sách câu hỏi (.xlsx)</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded overflow-hidden shadow-sm">
                   <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      <span>Preview: {questions.length} câu hỏi được nhận diện</span>
                      <button onClick={() => setQuestions([])} className="text-rose-500 hover:bg-rose-50 p-1 rounded transition-colors"><X size={16}/></button>
                   </div>
                   <div className="max-h-64 overflow-y-auto">
                     <table className="w-full text-xs text-left border-collapse">
                        <thead className="bg-slate-50 sticky top-0">
                            <tr className="text-slate-400 font-bold border-b border-slate-100">
                                <th className="p-3 w-10">#</th>
                                <th className="p-3">Câu hỏi</th>
                                <th className="p-3 w-16 text-center">Đáp án</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {questions.map((q, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 w-8 text-slate-300 font-mono">#{i+1}</td>
                              <td className="p-3 font-medium text-slate-700">{q.Question || q.question_text}</td>
                              <td className="p-3 w-12 text-center">
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-black border border-emerald-100">{q.Correct || q.correct_answer}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                     </table>
                   </div>
                </div>
              )}
            </div>
          )}

          {/* Info Banner for Subjective Skills */}
          {(skill === 'writing' || skill === 'speaking') && (
            <div className="p-5 bg-slate-50 border border-slate-200 flex items-start gap-3 rounded">
              <AlertCircle size={18} className="text-slate-900 mt-0.5" />
              <div>
                <p className="text-xs text-slate-900 font-bold uppercase tracking-wider mb-1">Hướng dẫn soạn đề {skill.toUpperCase()}</p>
                <p className="text-xs text-slate-500 leading-relaxed italic">
                    Đối với các kỹ năng tự luận, hãy cung cấp yêu cầu đề bài chi tiết nhất có thể. Trợ lý Chinhlu sẽ dựa vào nội dung này để đưa ra các tiêu chí chấm điểm và phản hồi (Feedback) cho học viên sau khi nộp bài.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminPractice;