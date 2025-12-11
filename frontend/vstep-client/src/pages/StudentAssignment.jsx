import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Link as LinkIcon, Send, CheckCircle, AlertCircle, 
  UploadCloud, FileText, X, Loader2, Calendar, HardDrive, FileType, Info
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// === KHAI BÁO CẤU HÌNH ===
const CLOUD_NAME = "dmaeuom2i";
const UPLOAD_PRESET = "vstep_upload"; 

const StudentAssignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null); 
  const [submission, setSubmission] = useState(null); 
  
  const [activeTab, setActiveTab] = useState('file'); 
  const [textAnswer, setTextAnswer] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('vstep_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const resAssign = await fetch(`http://localhost:5000/api/assignments/${id}`, { headers });
      if (resAssign.ok) {
          const data = await resAssign.json();
          setAssignment(data);
          if (data.kieu_nop === 'text') setActiveTab('text');
      }

      const resSub = await fetch(`http://localhost:5000/api/assignments/${id}/my-submission`, { headers });
      const subData = await resSub.json();
      setSubmission(subData);
      
      if (subData) {
          if (subData.link_nop_bai && subData.link_nop_bai.includes('cloudinary')) {
              setFileUrl(subData.link_nop_bai);
              setFileName("File bài làm đã nộp"); 
              setActiveTab('file');
          } else {
              setTextAnswer(subData.link_nop_bai || '');
              setActiveTab('text');
          }
      }
    } catch (err) { console.error(err); }
  }, [id]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // 2. Xử lý Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = (assignment?.gioi_han_dung_luong || 5) * 1024 * 1024;
    if (file.size > maxSize) {
        alert(`File quá lớn! Tối đa ${assignment?.gioi_han_dung_luong || 5}MB.`);
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET); 

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: "POST", body: formData });
        const data = await res.json();
        if (data.secure_url) {
            setFileUrl(data.secure_url);
            setFileName(file.name);
            setTextAnswer(''); 
        } else { alert("Lỗi upload file: " + (data.error?.message || "Unknown")); }
    } catch (err) { alert("Lỗi kết nối upload."); } 
    finally { setIsUploading(false); }
  };

  // 3. Xử lý Nộp
  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalContent = activeTab === 'file' ? fileUrl : textAnswer;

    if (!finalContent) {
        alert("Vui lòng nhập nội dung hoặc đính kèm file!");
        return;
    }

    const token = localStorage.getItem('vstep_token');
    try {
        const res = await fetch(`http://localhost:5000/api/assignments/${id}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ link_nop_bai: finalContent })
        });
        if (res.ok) {
            alert("Nộp bài thành công!");
            fetchData();
        } else {
            alert("Lỗi nộp bài.");
        }
    } catch (err) { alert("Lỗi kết nối server."); }
  };

  if (!assignment) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-indigo-600"/></div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Header />
      
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-bold transition">
            <ArrowLeft size={20} className="mr-2"/> Quay lại
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-indigo-600 p-6 text-white">
                        <h1 className="text-2xl font-bold mb-2">{assignment.tieu_de}</h1>
                        <div className="flex items-center gap-4 text-indigo-100 text-sm">
                            <span className="flex items-center gap-1"><Calendar size={14}/> Hạn nộp: {new Date(assignment.han_nop).toLocaleDateString('vi-VN')}</span>
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs uppercase font-bold">{assignment.kieu_nop === 'both' ? 'File & Text' : assignment.kieu_nop}</span>
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="font-bold text-gray-800 mb-2">Đề bài / Hướng dẫn:</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{assignment.mo_ta || "Không có mô tả chi tiết."}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Send size={18} className="text-indigo-600"/> Bài làm của bạn
                    </h3>

                    <div className="flex gap-2 mb-6 bg-gray-50 p-1 rounded-xl w-fit">
                        {(assignment.kieu_nop === 'file' || assignment.kieu_nop === 'both') && (
                            <button 
                                onClick={() => setActiveTab('file')}
                                disabled={!!submission?.diem}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'file' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <UploadCloud size={16}/> Tải file lên
                            </button>
                        )}
                        {(assignment.kieu_nop === 'text' || assignment.kieu_nop === 'both') && (
                            <button 
                                onClick={() => setActiveTab('text')}
                                disabled={!!submission?.diem}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'text' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <FileText size={16}/> Văn bản / Link
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        {activeTab === 'file' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex items-center gap-4 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <span className="flex items-center gap-1"><HardDrive size={14}/> Max: {assignment.gioi_han_dung_luong || 5}MB</span>
                                    <span className="flex items-center gap-1"><FileType size={14}/> PDF, Word, Ảnh</span>
                                </div>

                                {fileUrl ? (
                                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg text-green-600"><FileText size={24}/></div>
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-green-900 text-sm truncate max-w-[200px]">{fileName}</p>
                                                <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs text-green-700 hover:underline">Xem file đã tải</a>
                                            </div>
                                        </div>
                                        {!submission?.diem && (
                                            <button type="button" onClick={() => { setFileUrl(''); setFileName(''); }} className="p-2 hover:bg-green-100 rounded-full text-green-600">
                                                <X size={20}/>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition-colors group cursor-pointer">
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={!!submission?.diem || isUploading} />
                                        {isUploading ? (
                                            <div className="text-indigo-600"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/><span className="text-sm font-bold">Đang tải lên...</span></div>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-12 h-12 text-gray-300 mx-auto mb-3 group-hover:text-indigo-500 transition-colors"/>
                                                <p className="text-sm font-bold text-gray-600 group-hover:text-indigo-600">Kéo thả hoặc bấm để chọn file</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'text' && (
                            <div className="animate-fade-in">
                                <div className="relative">
                                    <div className="absolute top-3 left-3 text-gray-400"><LinkIcon size={20}/></div>
                                    <textarea 
                                        className="w-full pl-10 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[200px] text-sm leading-relaxed"
                                        placeholder="Nhập câu trả lời hoặc dán đường link Google Drive/Docs tại đây..."
                                        value={textAnswer}
                                        onChange={(e) => setTextAnswer(e.target.value)}
                                        disabled={!!submission?.diem}
                                    />
                                </div>
                            </div>
                        )}

                        {!submission?.diem && (
                            <div className="flex justify-end pt-6">
                                <button type="submit" disabled={isUploading} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50">
                                    <Send size={18}/> {submission ? "Cập nhật bài nộp" : "Nộp bài ngay"}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Trạng thái bài làm</h3>
                    
                    <div className={`p-4 rounded-xl flex items-center gap-3 mb-4 ${submission ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                        {submission ? <CheckCircle size={24}/> : <AlertCircle size={24}/>}
                        <div>
                            <p className="font-bold text-sm">{submission ? "Đã nộp bài" : "Chưa nộp bài"}</p>
                            {submission && <p className="text-xs opacity-80">{new Date(submission.ngay_nop).toLocaleString('vi-VN')}</p>}
                        </div>
                    </div>

                    {submission && (
                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-2">Điểm số</p>
                            {submission.trang_thai_cham === 'da_cham' ? (
                                <div>
                                    <p className="text-4xl font-black text-indigo-600">{submission.diem}<span className="text-lg text-gray-400 font-normal">/10</span></p>
                                    <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                        <p className="text-xs font-bold text-yellow-700 mb-1 flex items-center gap-1"><Info size={12}/> Nhận xét:</p>
                                        <p className="text-sm text-yellow-800 italic">"{submission.nhan_xet}"</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Đang chờ giáo viên chấm...</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentAssignment;