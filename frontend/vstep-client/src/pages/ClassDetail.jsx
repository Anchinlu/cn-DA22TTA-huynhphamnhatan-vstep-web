import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  School, Users, Clock, User, 
  PenTool, Plus, FileText, Check, X, ArrowLeft,
  Edit2, Save, UploadCloud, Trash2, Download, FolderOpen, File,
  Loader2, Copy, QrCode, Info, MessageSquare
} from 'lucide-react';
import ClassDiscussion from '../components/ClassDiscussion';

// === CẤU HÌNH CLOUDINARY ===
const CLOUD_NAME = "dmaeuom2i";
const UPLOAD_PRESET = "vstep_upload";

const ClassDetail = () => {
  // Đổi id thành classId để khớp với App.js route "/class/:classId" hoặc "/admin/classes/:classId"
  // Tuy nhiên, nếu route của bạn là "/class/:id", hãy giữ nguyên id.
  // Dựa vào code cũ của bạn dùng { id }, nhưng App.js router lại dùng :classId
  // Để an toàn, mình sẽ lấy cả hai.
  const params = useParams();
  const id = params.id || params.classId; 
  
  const navigate = useNavigate();
  
  // Data State
  const [classInfo, setClassInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [members, setMembers] = useState([]);
  const [documents, setDocuments] = useState([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState('about');
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ten_lop: '', mo_ta: '' });
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [newAssign, setNewAssign] = useState({ tieu_de: '', mo_ta: '', han_nop: '', kieu_nop: 'file' });

  // 1. Fetch Data
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('vstep_token');
    const userStr = localStorage.getItem('vstep_user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
    
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const resInfo = await fetch(`http://localhost:5000/api/classes/${id}`, { headers });
      if (!resInfo.ok) throw new Error("Lỗi tải lớp");
      const infoData = await resInfo.json();
      setClassInfo(infoData);
      
      // Chỉ cập nhật form edit khi chưa ở chế độ edit để tránh ghi đè dữ liệu đang nhập
      setEditForm(prev => {
          if (!isEditing) return { ten_lop: infoData.ten_lop, mo_ta: infoData.mo_ta || '' };
          return prev;
      });

      const resAss = await fetch(`http://localhost:5000/api/classes/${id}/assignments`, { headers });
      setAssignments(await resAss.json());

      const resMem = await fetch(`http://localhost:5000/api/classes/${id}/members`, { headers });
      setMembers(await resMem.json());

      const resDocs = await fetch(`http://localhost:5000/api/classes/${id}/documents`, { headers });
      setDocuments(await resDocs.json());

    } catch (err) { console.error(err); }
  }, [id, isEditing]); // Thêm isEditing vào dependency để logic setEditForm chuẩn xác

  useEffect(() => { 
    if(id) fetchData(); 
  }, [fetchData, id]);

  const isTeacher = currentUser?.vaiTroId === 2; 

  // --- ACTIONS ---

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classInfo.ma_lop);
    alert(`Đã sao chép mã lớp: ${classInfo.ma_lop}`);
  };

  const handleUpdateClass = async () => {
    try {
        const token = localStorage.getItem('vstep_token');
        await fetch(`http://localhost:5000/api/classes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(editForm)
        });
        setIsEditing(false);
        fetchData();
        alert("Cập nhật thành công!");
    } catch (err) { alert("Lỗi cập nhật."); }
  };

  const handleApprove = async (studentId, action) => {
    try {
      const token = localStorage.getItem('vstep_token');
      await fetch('http://localhost:5000/api/classes/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ class_id: id, student_id: studentId, action })
      });
      fetchData(); 
    } catch (err) { alert("Lỗi xử lý."); }
  };

  const handleUploadDocument = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingDoc(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET); 
    try {
        const resCloud = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: "POST", body: formData });
        const dataCloud = await resCloud.json();
        if (dataCloud.secure_url) {
            const token = localStorage.getItem('vstep_token');
            await fetch(`http://localhost:5000/api/classes/${id}/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ten_tai_lieu: file.name, duong_dan: dataCloud.secure_url, loai_file: dataCloud.format || 'file' })
            });
            fetchData();
        } else { alert("Lỗi upload Cloudinary"); }
    } catch (err) { alert("Lỗi kết nối upload."); } 
    finally { setIsUploadingDoc(false); }
  };

  const handleDeleteDocument = async (docId) => {
      if(!window.confirm("Xóa tài liệu này?")) return;
      try {
        await fetch(`http://localhost:5000/api/documents/${docId}`, { method: 'DELETE' });
        setDocuments(documents.filter(d => d.id !== docId));
      } catch (err) { alert("Lỗi xóa."); }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('vstep_token');
        const res = await fetch(`http://localhost:5000/api/classes/${id}/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(newAssign)
        });
        if (res.ok) {
            alert("Đã giao bài!");
            setShowModal(false);
            fetchData();
        }
    } catch (err) { alert("Lỗi kết nối."); }
  };

  const handleBack = () => {
    if (currentUser?.vaiTroId === 1) navigate('/my-courses');
    else navigate('/admin/classes');
  };

  if (!classInfo) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600"/></div>;

  const pendingMembers = members.filter(m => m.trang_thai === 'pending');
  const approvedMembers = members.filter(m => m.trang_thai === 'approved');

  return (
    <div className="space-y-6 pb-10">
      
      {/* 1. HEADER */}
      <div className="relative bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="flex-1">
                <button onClick={handleBack} className="flex items-center gap-2 text-blue-200 hover:text-white mb-4 font-bold transition">
                    <ArrowLeft size={20}/> Quay lại
                </button>
                
                {isEditing ? (
                    <div className="flex gap-2 items-center">
                        <input className="bg-white/10 border-b border-white text-3xl font-bold text-white w-full focus:outline-none px-2 py-1" 
                            value={editForm.ten_lop} onChange={e => setEditForm({...editForm, ten_lop: e.target.value})} />
                        <button onClick={handleUpdateClass} className="p-2 bg-white text-blue-700 rounded"><Save size={18}/></button>
                        <button onClick={() => setIsEditing(false)} className="p-2 bg-red-500 text-white rounded"><X size={18}/></button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">{classInfo.ten_lop}</h1>
                        {isTeacher && <button onClick={() => setIsEditing(true)} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition"><Edit2 size={16}/></button>}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-4 text-blue-100 text-sm font-medium">
                    <div className="flex items-center gap-2 bg-blue-900/40 px-3 py-1.5 rounded-lg border border-blue-500/30">
                        <User size={16}/> GV: {classInfo.giao_vien}
                    </div>
                    <div className="flex items-center gap-2 bg-blue-900/40 px-3 py-1.5 rounded-lg border border-blue-500/30 group relative">
                        <School size={16}/> Mã: <span className="font-mono text-white tracking-widest">{classInfo.ma_lop}</span>
                        <button onClick={handleCopyCode} className="ml-2 p-1 hover:bg-white/20 rounded transition" title="Sao chép mã">
                            <Copy size={14}/>
                        </button>
                    </div>
                    <button onClick={() => setShowQR(true)} className="flex items-center gap-2 bg-white text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-50 transition shadow-sm">
                        <QrCode size={16}/> Mã QR
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
                <div className="text-center bg-white/10 p-3 rounded-xl border border-white/10 min-w-[80px]">
                    <div className="text-2xl font-bold">{members.length}</div>
                    <div className="text-[10px] uppercase opacity-70">Thành viên</div>
                </div>
                <div className="text-center bg-white/10 p-3 rounded-xl border border-white/10 min-w-[80px]">
                    <div className="text-2xl font-bold">{assignments.length}</div>
                    <div className="text-[10px] uppercase opacity-70">Bài tập</div>
                </div>
            </div>
         </div>
      </div>

      {/* 2. TABS */}
      <div className="flex border-b border-gray-200 bg-white px-4 rounded-t-xl sticky top-0 z-10 shadow-sm overflow-x-auto">
          {[
            { id: 'about', label: 'Giới thiệu', icon: Info },
            { id: 'discussion', label: 'Thảo luận', icon: MessageSquare }, // Tab mới thêm
            { id: 'assignments', label: 'Bài tập', icon: PenTool },
            { id: 'documents', label: 'Tài liệu', icon: FolderOpen },
            { id: 'members', label: 'Thành viên', icon: Users },
          ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                  <tab.icon size={18}/> 
                  {tab.label}
                  {tab.id === 'members' && pendingMembers.length > 0 && isTeacher && (
                      <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingMembers.length}</span>
                  )}
              </button>
          ))}
      </div>

      {/* 3. CONTENT */}
      <div className="min-h-[400px]">
        
        {/* --- TAB GIỚI THIỆU --- */}
        {activeTab === 'about' && (
            <div className="bg-white p-8 rounded-b-xl shadow-sm border border-gray-100 min-h-[300px]">
                {isEditing ? (
                    <div className="space-y-4">
                        <label className="font-bold text-gray-700">Chỉnh sửa mô tả chi tiết:</label>
                        <textarea 
                            className="w-full p-4 border rounded-xl h-64 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={editForm.mo_ta} 
                            onChange={e => setEditForm({...editForm, mo_ta: e.target.value})}
                            placeholder="Nhập nội dung giới thiệu lớp học, mục tiêu, lộ trình..."
                        />
                        <button onClick={handleUpdateClass} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">Lưu thay đổi</button>
                    </div>
                ) : (
                    <div className="prose prose-blue max-w-none">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Info className="text-blue-500"/> Thông tin lớp học
                        </h3>
                        {classInfo.mo_ta ? (
                            <div className="whitespace-pre-wrap text-gray-600 leading-relaxed text-base">
                                {classInfo.mo_ta}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                Chưa có mô tả. Giáo viên vui lòng cập nhật thêm thông tin.
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

        {/* --- TAB THẢO LUẬN (MỚI) --- */}
        {activeTab === 'discussion' && (
            <div className="pt-2">
                <ClassDiscussion classId={id} />
            </div>
        )}

        {/* --- TAB BÀI TẬP --- */}
        {activeTab === 'assignments' && (
            <div className="space-y-4 pt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800">Danh sách bài tập ({assignments.length})</h3>
                    {isTeacher && (
                        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm">
                            <Plus size={16}/> Tạo bài mới
                        </button>
                    )}
                </div>
                {assignments.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                        <p className="text-gray-400 font-medium">Chưa có bài tập nào.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {assignments.map(a => (
                            <div key={a.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FileText size={20}/></div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">{a.tieu_de}</h4>
                                        <p className="text-xs text-gray-500 mt-1">Hạn: {new Date(a.han_nop).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                                <button onClick={() => isTeacher ? navigate(`/admin/assignments/${a.id}`) : navigate(`/assignment/${a.id}`)} className="px-4 py-2 bg-gray-50 text-gray-600 text-sm font-bold rounded-lg hover:bg-blue-600 hover:text-white transition">
                                    {isTeacher ? 'Chấm bài' : 'Chi tiết'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* --- TAB TÀI LIỆU --- */}
        {activeTab === 'documents' && (
            <div className="pt-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800">Kho tài liệu ({documents.length})</h3>
                    {isTeacher && (
                        <div className="relative overflow-hidden">
                            <button className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-lg hover:bg-indigo-100 flex items-center gap-2 border border-indigo-200">
                                {isUploadingDoc ? <Loader2 className="animate-spin" size={16}/> : <UploadCloud size={16}/>}
                                {isUploadingDoc ? "Đang tải lên..." : "Tải tài liệu lên"}
                            </button>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUploadDocument} disabled={isUploadingDoc}/>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map(doc => (
                        <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition relative">
                            <div className="flex items-start gap-3">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><File size={20}/></div>
                                <div className="flex-1 overflow-hidden">
                                    <h4 className="font-bold text-gray-800 text-sm truncate" title={doc.ten_tai_lieu}>{doc.ten_tai_lieu}</h4>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(doc.ngay_tao).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                                <a href={doc.duong_dan} target="_blank" rel="noreferrer" className="flex-1 py-1.5 text-center bg-gray-50 hover:bg-blue-50 text-blue-600 text-xs font-bold rounded-md flex items-center justify-center gap-1">
                                    <Download size={14}/> Tải về
                                </a>
                                {isTeacher && (
                                    <button onClick={() => handleDeleteDocument(doc.id)} className="p-1.5 bg-red-50 text-red-500 rounded-md hover:bg-red-100"><Trash2 size={14}/></button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- TAB THÀNH VIÊN --- */}
        {activeTab === 'members' && (
            <div className="pt-6 space-y-8">
                
                {/* 1. Phần Duyệt Học Viên */}
                {isTeacher && pendingMembers.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl overflow-hidden animate-fade-in">
                        <div className="bg-orange-100 px-6 py-3 border-b border-orange-200 flex justify-between items-center">
                            <h3 className="font-bold text-orange-800 flex items-center gap-2">
                                <Clock size={18}/> Yêu cầu tham gia ({pendingMembers.length})
                            </h3>
                        </div>
                        <div className="divide-y divide-orange-100">
                            {pendingMembers.map(mem => (
                                <div key={mem.id} className="p-4 flex items-center justify-between hover:bg-orange-100/50 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white border border-orange-200 flex items-center justify-center text-orange-600 font-bold">{mem.ho_ten.charAt(0)}</div>
                                        <div>
                                            <p className="font-bold text-gray-800">{mem.ho_ten}</p>
                                            <p className="text-xs text-gray-500">{mem.email}</p>
                                            <p className="text-[10px] text-orange-600 mt-0.5">Yêu cầu lúc: {new Date(mem.ngay_tham_gia).toLocaleString('vi-VN')}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleApprove(mem.user_id, 'approve')} className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 shadow-sm flex items-center gap-1"><Check size={14}/> Duyệt</button>
                                        <button onClick={() => handleApprove(mem.user_id, 'reject')} className="px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 flex items-center gap-1"><X size={14}/> Từ chối</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Danh sách chính thức */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-blue-600"/> Danh sách lớp học ({approvedMembers.length})
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {approvedMembers.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">Chưa có thành viên chính thức nào.</div>
                        ) : (
                            approvedMembers.map((mem, i) => (
                                <div key={mem.id} className={`flex items-center justify-between p-4 ${i !== approvedMembers.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">{mem.ho_ten.charAt(0)}</div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{mem.ho_ten}</p>
                                            <p className="text-xs text-gray-500">{mem.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-gray-400">{new Date(mem.ngay_tham_gia).toLocaleDateString('vi-VN')}</span>
                                        {isTeacher && <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"><Trash2 size={16}/></button>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}

      </div>

      {/* MODAL GIAO BÀI */}
      {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
             <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-scale-up">
                <h2 className="font-bold text-lg mb-4 text-gray-800">Giao bài tập mới</h2>
                <form onSubmit={handleCreateAssignment} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Tiêu đề bài tập</label>
                        <input className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ví dụ: Bài tập Writing Task 1..." value={newAssign.tieu_de} onChange={e=>setNewAssign({...newAssign, tieu_de: e.target.value})} required/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Mô tả / Yêu cầu</label>
                        <textarea className="w-full border border-gray-300 p-2.5 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Nhập hướng dẫn làm bài..." value={newAssign.mo_ta} onChange={e=>setNewAssign({...newAssign, mo_ta: e.target.value})}/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Hạn nộp</label>
                        <input type="date" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newAssign.han_nop} onChange={e => setNewAssign({...newAssign, han_nop: e.target.value})} required/>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium">Hủy</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md">Tạo bài tập</button>
                    </div>
                </form>
             </div>
          </div>
      )}

      {/* MODAL QR CODE */}
      {showQR && classInfo && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowQR(false)}>
             <div className="bg-white p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X/></button>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{classInfo.ten_lop}</h3>
                <p className="text-gray-500 text-sm mb-6">Quét mã để tham gia lớp học</p>
                <div className="bg-white p-2 rounded-xl border-2 border-gray-100 inline-block mb-4">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${classInfo.ma_lop}`} 
                        alt="QR Code" 
                        className="w-48 h-48"
                    />
                </div>
                <div className="bg-blue-50 py-3 px-6 rounded-xl flex items-center justify-between border border-blue-100">
                    <span className="font-mono font-bold text-xl text-blue-700 tracking-widest">{classInfo.ma_lop}</span>
                    <button onClick={handleCopyCode} className="text-blue-500 hover:text-blue-700"><Copy size={20}/></button>
                </div>
             </div>
          </div>
      )}

    </div>
  );
};

export default ClassDetail;