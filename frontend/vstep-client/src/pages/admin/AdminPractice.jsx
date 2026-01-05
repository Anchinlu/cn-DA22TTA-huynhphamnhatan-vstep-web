import React, { useState, useEffect } from 'react';
import { 
  Upload, FileSpreadsheet, FileAudio, Save, 
  Plus, Check, X, Layers, AlertCircle, Eye, Loader2, FileText, Bot 
} from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../../components/Header'; 

const AdminPractice = () => {
  // --- STATE CẤU HÌNH ---
  const [skill, setSkill] = useState('reading');
  const [level, setLevel] = useState('B1');
  const [topicId, setTopicId] = useState('');
  const [taskType, setTaskType] = useState('task1'); 
  const [part, setPart] = useState('1'); 
  
  // --- STATE DỮ LIỆU ---
  const [title, setTitle] = useState('');

  const [content, setContent] = useState(''); 
  const [scriptContent, setScriptContent] = useState(''); 
  
  // Upload Excel (Câu hỏi)
  const [excelFile, setExcelFile] = useState(null);
  const [questions, setQuestions] = useState([]); 

  // --- STATE DỮ LIỆU BỔ SUNG ---
  const [audioUrl, setAudioUrl] = useState(null); 
  const [listeningMode, setListeningMode] = useState('ai'); 
  
  // --- STATE AI SOẠN CÂU HỎI (Chỉ cho Reading) ---
  const [questionCount, setQuestionCount] = useState(5); 
  const [isGenerating, setIsGenerating] = useState(false);
  
  // --- STATE HỖ TRỢ ---
  const [topics, setTopics] = useState([]);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Load danh sách Chủ đề
  useEffect(() => {
    const token = localStorage.getItem('vstep_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch('http://localhost:5000/api/admin/topics', { headers })
      .then(res => res.json())
      .then(data => setTopics(data))
      .catch(err => console.error("Lỗi load topic:", err));
  }, []);

  // 2. Thêm chủ đề mới
  const handleAddTopic = async () => {
    if (!newTopicName.trim()) return;
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch('http://localhost:5000/api/admin/topics', {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: `Bearer ${token}` } : {}),
        body: JSON.stringify({ name: newTopicName })
      });
      const data = await res.json();
      if (res.ok) {
        setTopics([...topics, { id: data.id, name: data.name }]); 
        setTopicId(data.id); 
        setIsAddingTopic(false);
        setNewTopicName('');
        toast.success("Đã thêm chủ đề mới!");
      } else {
        toast.error(data.message);
      }
    } catch (err) { toast.error("Lỗi kết nối"); }
  };

  // 3. Xử lý Upload Excel & Preview
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setExcelFile(file);
    const formData = new FormData();
    formData.append('file', file);
    const loadToast = toast.loading("Đang đọc file Excel...");
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch('http://localhost:5000/api/admin/preview-excel', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();

      if (res.ok) {
        setQuestions(data.data); 
        toast.success(`Đã đọc được ${data.total} câu hỏi!`, { id: loadToast });
      } else {
        toast.error("Lỗi đọc file: " + data.message, { id: loadToast });
      }
    } catch (err) { toast.error("Lỗi server", { id: loadToast }); }
  };

  // 1. Tải file MP3 lên Cloudinary
  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    const loadToast = toast.loading("Đang tải file âm thanh...");

    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch('http://localhost:5000/api/admin/upload-media', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setAudioUrl(data.url);
        toast.success("Đã tải audio thành công!", { id: loadToast });
      } else {
        toast.error(data.message || 'Lỗi xác thực', { id: loadToast });
      }
    } catch (err) { toast.error("Lỗi kết nối server", { id: loadToast }); }
  };

  // 2. AI Soạn câu hỏi (Chỉ áp dụng cho Reading)
  const handleAIGenerate = async () => {
    if (skill !== 'reading') return;
    if (!content || content.length < 100) return toast.error("Nội dung bài đọc quá ngắn để AI soạn đề.");

    setIsGenerating(true);
    const loadToast = toast.loading(`AI đang soạn ${questionCount} câu hỏi Reading...`);

    try {
      const res = await fetch('http://localhost:5000/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type: 'reading', level, count: questionCount })
      });
      const data = await res.json();

      if (res.status === 422) { // Logic nội dung không đủ
        toast.error(data.message, { id: loadToast, duration: 5000 });
      } else if (res.ok) {
        // backend returns { questions: [...] }
        setQuestions(data.questions || []);
        toast.success("Đã hoàn thành soạn đề!", { id: loadToast });
      } else {
        toast.error(data.message || 'Lỗi Hệ thống', { id: loadToast });
      }
    } catch (err) { toast.error("Lỗi kết nối Hệ thống", { id: loadToast }); }
    finally { setIsGenerating(false); }
  };

  // 4. LƯU ĐỀ THI (Submit Form)
  const handleSubmit = async () => {
    if (!title || !topicId) return toast.error("Vui lòng nhập tiêu đề và chọn chủ đề");
    
    // Validate riêng từng kỹ năng
    if (skill === 'reading' && !content) return toast.error("Chưa nhập nội dung bài đọc!");
    if (skill === 'writing' && !content) return toast.error("Chưa nhập đề bài chi tiết!");
    if (skill === 'speaking' && !content) return toast.error("Chưa nhập câu hỏi nói!"); 
    
    if (skill === 'listening') {
      if (listeningMode === 'ai' && !scriptContent) return toast.error("Chưa nhập kịch bản Script");
      if (listeningMode === 'mp3' && !audioUrl) return toast.error("Chưa tải file MP3 lên hoặc chưa chọn file!");
    }
    
    if ((skill === 'reading' || skill === 'listening') && questions.length === 0) return toast.error("Chưa có câu hỏi trắc nghiệm!");

    setLoading(true);
    
    const payload = {
      title, level, topic_id: topicId,
      questions,
      
      // Mapping dữ liệu
      content: (skill === 'reading' || skill === 'writing' || skill === 'speaking') ? content : null,
      script_content: skill === 'listening' && listeningMode === 'ai' ? scriptContent : null,
      audio_url: skill === 'listening' && listeningMode === 'mp3' ? audioUrl : null,
      
      task_type: skill === 'writing' ? taskType : null,
      part: skill === 'speaking' ? part : null,
    };

    const endpoint = skill === 'listening' ? '/create-listening' : 
                     skill === 'reading' ? '/create-reading' : 
                     skill === 'writing' ? '/create-writing' : '/create-speaking';

    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch(`http://localhost:5000/api/admin${endpoint}`, {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: `Bearer ${token}` } : {}),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Tạo đề ${skill.toUpperCase()} thành công!`);
        // Reset form
        setQuestions([]); setTitle(''); setContent(''); setScriptContent(''); setExcelFile(null); setAudioUrl(null);
      } else {
        toast.error("Lỗi: " + (data.message || data.error));
      }
    } catch (err) { toast.error("Lỗi kết nối server"); }
    finally { setLoading(false); }
  };

  // Helper text cho placeholder
  const getPlaceholder = () => {
      if (skill === 'reading') return "Nhập nội dung bài đọc";
      if (skill === 'writing') return "Nội dung đề bài viết chi tiết ";
      if (skill === 'speaking') return "Nhập câu hỏi Speaking vào đây ";
      return "";
  };

  const getLabel = () => {
      if (skill === 'reading') return "Nội dung bài đọc";
      if (skill === 'writing') return "Nội dung đề bài (Chi tiết)";
      if (skill === 'speaking') return "Câu hỏi Speaking";
      return "Nội dung";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      
      <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
        
        {/* HEADER TRANG */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Quản lý Đề thi</h1>
            <p className="text-slate-500">Tạo đề luyện tập cho Reading, Listening, Writing & Speaking</p>
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 transition disabled:bg-slate-400"
          >
            {loading ? <><Loader2 className="animate-spin"/> Đang lưu...</> : <><Save size={20}/> Lưu Đề Thi</>}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: CẤU HÌNH (1/3) */}
          <div className="space-y-6">
            
            {/* Card 1: Loại bài thi */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Layers size={18}/> Cấu hình</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Kỹ năng</label>
                  <select 
                    value={skill} onChange={(e) => setSkill(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  >
                    <option value="reading">Reading (Đọc)</option>
                    <option value="listening">Listening (Nghe)</option>
                    <option value="writing">Writing (Viết)</option>
                    <option value="speaking">Speaking (Nói)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Trình độ</label>
                    <select 
                      value={level} onChange={(e) => setLevel(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                    >
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                      <option value="C1">C1</option>
                    </select>
                  </div>
                  
                  {/* Dropdown thay đổi theo Skill */}
                  {skill === 'writing' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-1">Dạng bài</label>
                      <select value={taskType} onChange={(e) => setTaskType(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none">
                        <option value="task1">Task 1 (Thư)</option>
                        <option value="task2">Task 2 (Luận)</option>
                      </select>
                    </div>
                  )}
                  {skill === 'speaking' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-1">Phần thi</label>
                      <select value={part} onChange={(e) => setPart(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none">
                        <option value="1">Part 1</option>
                        <option value="2">Part 2</option>
                        <option value="3">Part 3</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Chủ đề */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Chủ đề</h3>
                <button onClick={() => setIsAddingTopic(!isAddingTopic)} className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
                  {isAddingTopic ? "Hủy" : "+ Thêm mới"}
                </button>
              </div>

              {isAddingTopic ? (
                <div className="flex gap-2 mb-4 animate-fade-in">
                  <input 
                    type="text" placeholder="Tên chủ đề..." 
                    className="flex-1 p-2 border border-indigo-300 rounded-lg text-sm focus:outline-none"
                    value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)}
                  />
                  <button onClick={handleAddTopic} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Check size={16}/></button>
                </div>
              ) : (
                <select 
                  value={topicId} onChange={(e) => setTopicId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none mb-2"
                >
                  <option value="">-- Chọn chủ đề --</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}
            </div>

            {/* Card 3:Chỉ hiện khi chọn Reading) */}
            {skill === 'reading' && (
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl text-white shadow-lg">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Bot size={20}/> Trợ lý soạn đề AI</h3>
                <label className="block text-xs font-bold uppercase opacity-80 mb-2">Số lượng câu: {questionCount}</label>
                <input type="range" min="1" max="10" value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value))} className="w-full accent-white mb-6" />
                <button 
                  onClick={handleAIGenerate} 
                  disabled={isGenerating}
                  className="w-full py-3 bg-white text-indigo-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Bot size={18}/>} AI Tự soạn câu hỏi
                </button>
              </div>
            )}

          </div>
          <div className="lg:col-span-2 space-y-6">
            
            {/* Input Tiêu đề */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-600 mb-2">Tiêu đề bài thi (Tên gọi)</label>
              <input 
                type="text" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder={`VD: ${skill === 'listening' ? 'Listening Test 01' : 'Writing Task 1 - Email...'}`}
                value={title} onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* KHU VỰC NỘI DUNG CHÍNH */}
            
            {/* 1. LISTENING: Linh hoạt Script hoặc MP3 */}
            {skill === 'listening' && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 w-fit">
                   <button 
                     onClick={() => setListeningMode('ai')} 
                     className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${listeningMode === 'ai' ? 'bg-white text-indigo-600 shadow' : 'text-gray-400'}`}
                   >
                     AI Script
                   </button>
                   <button 
                     onClick={() => setListeningMode('mp3')} 
                     className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${listeningMode === 'mp3' ? 'bg-white text-indigo-600 shadow' : 'text-gray-400'}`}
                   >
                     File MP3
                   </button>
                </div>
                
                <div className="space-y-4">
                  {/* Ô nhập kịch bản: Luôn hiển thị để phục vụ AI giải thích */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      {listeningMode === 'ai' ? "Kịch bản để AI đọc (AI Voice)" : "Kịch bản để AI giải thích (Transcript)"}
                    </label>
                    <textarea 
                      rows="6" 
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-medium focus:ring-2 ring-indigo-500 transition-all" 
                      placeholder="Dán nội dung bài nghe vào đây..." 
                      value={scriptContent} 
                      onChange={(e) => setScriptContent(e.target.value)} 
                    />
                  </div>

                  {/* Khu vực tải file MP3: Chỉ hiện khi chọn chế độ MP3 */}
                  {listeningMode === 'mp3' && (
                    <div className="border-2 border-dashed border-gray-200 rounded-3xl p-6 text-center relative group hover:border-indigo-300 transition-colors">
                      <input 
                        type="file" 
                        accept="audio/*" 
                        onChange={handleAudioUpload} 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      />
                      {audioUrl ? (
                        <div className="text-green-600 font-bold flex flex-col items-center gap-2">
                          <Check size={32}/> Đã tải file lên thành công
                        </div>
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center gap-2">
                          <FileAudio size={32}/> Nhấn hoặc kéo thả file MP3
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. READING / WRITING / SPEAKING: Nội dung văn bản */}
            {(skill === 'reading' || skill === 'writing' || skill === 'speaking') && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText size={18}/> {getLabel()}</h3>
                <textarea 
                  rows="10"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-serif leading-relaxed"
                  placeholder={getPlaceholder()}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
              </div>
            )}

            {/* 3. CÂU HỎI TRẮC NGHIỆM: Chỉ cho Reading/Listening */}
            {(skill === 'reading' || skill === 'listening') && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2"><FileSpreadsheet size={18}/> Danh sách câu hỏi</h3>
                  <a href="/template.xlsx" className="text-xs text-indigo-600 hover:underline font-medium">Tải file mẫu</a>
                </div>

                {!questions.length ? (
                  <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl p-8 text-center relative group hover:bg-indigo-50 transition">
                    <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <FileSpreadsheet className="w-10 h-10 text-indigo-400 mx-auto mb-3 group-hover:scale-110 transition"/>
                    <p className="text-indigo-800 font-bold">Upload file Excel câu hỏi</p>
                    <p className="text-indigo-500 text-xs mt-1">Hỗ trợ .xlsx, .xls</p>
                  </div>
                ) : (
                  <div className="overflow-hidden border border-gray-200 rounded-xl">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-600">Đã nhận {questions.length} câu hỏi</span>
                      <button onClick={() => setQuestions([])} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><X size={16}/></button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-500 font-bold sticky top-0">
                          <tr>
                            <th className="p-3 w-10">#</th>
                            <th className="p-3">Câu hỏi</th>
                            <th className="p-3 w-20 text-center">Đ.Án</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {questions.map((q, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="p-3 text-gray-400">{i + 1}</td>
                              <td className="p-3 font-medium text-gray-800 truncate max-w-xs" title={q.Question || q.question_text}>
                                {q.Question || q.question_text}
                              </td>
                              <td className="p-3 font-bold text-green-600 text-center">{q.Correct || q.correct_answer}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. WRITING / SPEAKING NOTE */}
            {(skill === 'writing' || skill === 'speaking') && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 flex items-start gap-3">
                <AlertCircle className="text-blue-600 w-5 h-5 flex-shrink-0 mt-0.5"/>
                <div>
                  <p className="text-blue-800 font-bold text-sm">Lưu ý</p>
                  <p className="text-blue-700 text-sm mt-1">
                    Nhập đầy đủ thông tin cần thiết. Với Writing, hãy cung cấp đề bài chi tiết để học viên hiểu rõ yêu cầu. Với Speaking, nhập câu hỏi cụ thể cho từng phần thi.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPractice;