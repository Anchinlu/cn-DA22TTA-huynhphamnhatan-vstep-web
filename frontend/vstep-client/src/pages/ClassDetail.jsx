import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  School, Users, BookOpen, Calendar, Clock, User, ChevronRight, 
  PenTool, Headphones, Mic, Plus, FileText, Check, X 
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [classInfo, setClassInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('assignments');
  const [currentUser, setCurrentUser] = useState(null);

  // State Modal Giao Bài
  const [showModal, setShowModal] = useState(false);
  const [newAssign, setNewAssign] = useState({ tieu_de: '', mo_ta: '', han_nop: '', kieu_nop: 'file' });

  // Fetch dữ liệu
  const fetchData = async () => {
    const token = localStorage.getItem('vstep_token');
    const userStr = localStorage.getItem('vstep_user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
    
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const resInfo = await fetch(`http://localhost:5000/api/classes/${id}`, { headers });
      setClassInfo(await resInfo.json());

      const resAss = await fetch(`http://localhost:5000/api/classes/${id}/assignments`, { headers });
      setAssignments(await resAss.json());

      const resMem = await fetch(`http://localhost:5000/api/classes/${id}/members`, { headers });
      setMembers(await resMem.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [id]);

  // Xử lý Giao bài
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
            alert("Đã giao bài tập!");
            setShowModal(false);
            setNewAssign({ tieu_de: '', mo_ta: '', han_nop: '', kieu_nop: 'file' });
            fetchData();
        }
    } catch (err) { alert("Lỗi giao bài."); }
  };

  // === XỬ LÝ DUYỆT THÀNH VIÊN (MỚI) ===
  const handleApprove = async (studentId, action) => {
    try {
      const token = localStorage.getItem('vstep_token');
      await fetch('http://localhost:5000/api/classes/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ class_id: id, student_id: studentId, action })
      });
      
      // Cập nhật UI ngay lập tức
      if (action === 'reject') {
        setMembers(members.filter(m => m.user_id !== studentId));
      } else {
        setMembers(members.map(m => m.user_id === studentId ? { ...m, trang_thai: 'approved' } : m));
      }
    } catch (err) { alert("Lỗi xử lý."); }
  };
  // ====================================

  const isTeacher = currentUser?.vaiTroId === 2; 

  const getIcon = (type) => {
    if (type === 'reading') return BookOpen;
    if (type === 'writing') return PenTool;
    if (type === 'listening') return Headphones;
    return FileText;
  };

  if (!classInfo) return <div className="h-screen flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />

      <main className="flex-grow pt-20 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Lớp */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
            <div className="relative z-10">
               <div className="flex items-start justify-between mb-4">
                 <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl inline-flex"><School size={32} /></div>
                 <span className="px-4 py-1.5 bg-green-100 text-green-700 font-bold rounded-full text-sm border border-green-200">CODE: {classInfo.ma_lop}</span>
               </div>
               <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{classInfo.ten_lop}</h1>
               <p className="text-gray-600 mb-4">{classInfo.mo_ta}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-between items-center border-b border-gray-200 mb-8">
            <div className="flex gap-6">
                <button onClick={() => setActiveTab('assignments')} className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'assignments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Bài tập ({assignments.length})</button>
                <button onClick={() => setActiveTab('members')} className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'members' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Thành viên ({members.length})</button>
            </div>
            {isTeacher && activeTab === 'assignments' && (
                <button onClick={() => setShowModal(true)} className="mb-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-md">
                    <Plus size={18} /> Giao bài tập
                </button>
            )}
          </div>

          {/* Nội dung Tab */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              {assignments.map((assign) => {
                  const Icon = getIcon(assign.loai_ky_nang);
                  return (
                    <div key={assign.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between">
                      <div className="flex items-start gap-4">
                         <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Icon size={24} /></div>
                         <div>
                           <h4 className="text-lg font-bold text-gray-900">{assign.tieu_de}</h4>
                           <p className="text-sm text-gray-500">{assign.mo_ta}</p>
                         </div>
                      </div>
                      <button 
                         onClick={() => isTeacher ? navigate(`/admin/assignment/${assign.id}`) : alert('Tính năng làm bài trong lớp đang phát triển')}
                         className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center gap-2"
                      >
                          {isTeacher ? 'Xem bài nộp' : 'Nộp bài'} <ChevronRight size={18} />
                      </button>
                    </div>
                  );
              })}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               {members.map((mem) => (
                 <div key={mem.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${mem.trang_thai === 'pending' ? 'bg-orange-400' : 'bg-blue-500'}`}>
                          {mem.ho_ten.charAt(0)}
                       </div>
                       <div>
                          <p className="font-bold text-gray-900">{mem.ho_ten}</p>
                          <p className="text-xs text-gray-500">{mem.email}</p>
                       </div>
                    </div>
                    
                    {/* NÚT DUYỆT CHO GIÁO VIÊN */}
                    {isTeacher && mem.trang_thai === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleApprove(mem.user_id, 'approve')} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 flex items-center gap-1"><Check size={14}/> Duyệt</button>
                          <button onClick={() => handleApprove(mem.user_id, 'reject')} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 flex items-center gap-1"><X size={14}/> Xóa</button>
                        </div>
                    ) : (
                        <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${mem.trang_thai === 'approved' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{mem.trang_thai}</span>
                    )}
                 </div>
               ))}
            </div>
          )}

        </div>
      </main>
      
      <Footer />

      {/* MODAL GIAO BÀI */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Giao bài tập mới</h2>
                <form onSubmit={handleCreateAssignment} className="space-y-4">
                    <input type="text" className="w-full p-3 border rounded-xl" placeholder="Tiêu đề" value={newAssign.tieu_de} onChange={e => setNewAssign({...newAssign, tieu_de: e.target.value})} required />
                    <textarea className="w-full p-3 border rounded-xl" placeholder="Mô tả" value={newAssign.mo_ta} onChange={e => setNewAssign({...newAssign, mo_ta: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" className="w-full p-3 border rounded-xl" value={newAssign.han_nop} onChange={e => setNewAssign({...newAssign, han_nop: e.target.value})} />
                        <select className="w-full p-3 border rounded-xl" value={newAssign.kieu_nop} onChange={e => setNewAssign({...newAssign, kieu_nop: e.target.value})}>
                            <option value="file">Nộp File</option><option value="link">Nộp Link</option><option value="text">Nhập Text</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-gray-100 font-bold">Hủy</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetail;