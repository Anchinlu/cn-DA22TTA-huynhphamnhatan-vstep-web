import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  School, Users, BookOpen, Calendar, 
  Clock, User, ChevronRight, PenTool, Headphones, Mic 
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ClassDetail = () => {
  const { id } = useParams(); // Lấy ID lớp từ URL
  const navigate = useNavigate();
  
  const [classInfo, setClassInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('assignments'); // assignments, members

  // Fetch dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('vstep_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        // 1. Lấy thông tin lớp
        const resInfo = await fetch(`http://localhost:5000/api/classes/${id}`, { headers });
        const dataInfo = await resInfo.json();
        setClassInfo(dataInfo);

        // 2. Lấy bài tập
        const resAss = await fetch(`http://localhost:5000/api/classes/${id}/assignments`, { headers });
        const dataAss = await resAss.json();
        setAssignments(dataAss);

        // 3. Lấy thành viên
        const resMem = await fetch(`http://localhost:5000/api/classes/${id}/members`, { headers });
        const dataMem = await resMem.json();
        setMembers(dataMem);
      } catch (err) {
        console.error("Lỗi tải dữ liệu lớp:", err);
      }
    };
    fetchData();
  }, [id]);

  const getIcon = (type) => {
    switch(type) {
      case 'reading': return BookOpen;
      case 'writing': return PenTool;
      case 'listening': return Headphones;
      case 'speaking': return Mic;
      default: return BookOpen;
    }
  };

  // Hàm xử lý khi làm bài tập
  const handleDoAssignment = (assign) => {
    // Chuyển hướng đến trang làm bài tương ứng với dữ liệu đề bài
    // VD: /practice/reading/test?id=1 (Cần nâng cấp trang làm bài để nhận ID bài thi cụ thể sau này)
    // Hiện tại ta chuyển hướng tạm về trang làm bài chung với tham số giả lập
    navigate(`/practice/${assign.loai_ky_nang}/test`, { 
      state: { topic: 'education', level: 'B1' } // Tạm thời hardcode, sau này sẽ lấy từ assign.bai_thi_id
    });
  };

  if (!classInfo) return <div className="h-screen flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />

      <main className="flex-grow pt-20 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* --- HEADER LỚP HỌC --- */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10">
               <div className="flex items-start justify-between mb-4">
                 <div className="p-3 bg-blue-100 text-blue-700 rounded-xl inline-flex">
                   <School size={32} />
                 </div>
                 <span className="px-4 py-1.5 bg-green-100 text-green-700 font-bold rounded-full text-sm">
                    Mã lớp: {classInfo.ma_lop}
                 </span>
               </div>
               
               <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{classInfo.ten_lop}</h1>
               <div className="flex items-center gap-6 text-gray-500 text-sm mb-6">
                 <span className="flex items-center gap-2"><User size={16}/> GV: {classInfo.giao_vien}</span>
                 <span className="flex items-center gap-2"><Users size={16}/> {members.length} thành viên</span>
                 <span className="flex items-center gap-2"><Calendar size={16}/> {new Date(classInfo.ngay_tao).toLocaleDateString('vi-VN')}</span>
               </div>
               
               <p className="text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                 {classInfo.mo_ta || "Không có mô tả."}
               </p>
            </div>
          </div>

          {/* --- TABS --- */}
          <div className="flex gap-6 border-b border-gray-200 mb-8">
            <button 
              onClick={() => setActiveTab('assignments')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'assignments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              Bài tập ({assignments.length})
            </button>
            <button 
              onClick={() => setActiveTab('members')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'members' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              Thành viên ({members.length})
            </button>
          </div>

          {/* --- CONTENT --- */}
          
          {/* TAB 1: BÀI TẬP */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="text-center py-10 text-gray-400">Chưa có bài tập nào.</div>
              ) : (
                assignments.map((assign) => {
                  const Icon = getIcon(assign.loai_ky_nang);
                  return (
                    <div key={assign.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-100 transition-colors">
                           <Icon size={24} />
                         </div>
                         <div>
                           <h4 className="text-lg font-bold text-gray-900 mb-1">{assign.tieu_de}</h4>
                           <p className="text-sm text-gray-500 mb-1">{assign.mo_ta}</p>
                           <div className="flex items-center gap-2 text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded w-fit">
                              <Clock size={12} /> Hạn nộp: {new Date(assign.han_nop).toLocaleDateString('vi-VN')}
                           </div>
                         </div>
                      </div>
                      
                      <button 
                        onClick={() => handleDoAssignment(assign)}
                        className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                      >
                        Làm bài <ChevronRight size={18} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: THÀNH VIÊN */}
          {activeTab === 'members' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               {members.map((mem, idx) => (
                 <div key={mem.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center font-bold">
                          {mem.ho_ten.charAt(0)}
                       </div>
                       <div>
                          <p className="font-bold text-gray-900">{mem.ho_ten}</p>
                          <p className="text-xs text-gray-500">{mem.email}</p>
                       </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${mem.trang_thai === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {mem.trang_thai}
                    </span>
                 </div>
               ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ClassDetail;