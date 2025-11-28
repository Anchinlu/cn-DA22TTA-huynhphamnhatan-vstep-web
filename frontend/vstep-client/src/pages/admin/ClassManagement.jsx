import React, { useState, useEffect } from 'react';
import { 
  School, Plus, Users, Search, 
  Check, X, Loader2, Calendar, Copy
} from 'lucide-react';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // Modal tạo lớp
  const [selectedClass, setSelectedClass] = useState(null); // Lớp đang xem chi tiết
  const [members, setMembers] = useState([]); // Danh sách hv của lớp đang xem

  // Form tạo lớp
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');

  // 1. Lấy danh sách lớp của Giáo viên
  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch('http://localhost:5000/api/teacher/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setClasses(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  // 2. Lấy danh sách thành viên của 1 lớp
  const fetchMembers = async (classId) => {
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch(`http://localhost:5000/api/classes/${classId}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Khi bấm vào 1 lớp -> Hiện chi tiết
  const handleViewClass = (cls) => {
    setSelectedClass(cls);
    fetchMembers(cls.id);
  };

  // 3. Tạo lớp mới
  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch('http://localhost:5000/api/classes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ten_lop: newClassName, mo_ta: newClassDesc })
      });
      
      if (res.ok) {
        alert("Tạo lớp thành công!");
        setShowModal(false);
        setNewClassName('');
        setNewClassDesc('');
        fetchClasses(); // Load lại danh sách
      }
    } catch (err) {
      alert("Lỗi tạo lớp.");
    }
  };

  // 4. Duyệt / Từ chối học viên
  const handleApprove = async (studentId, action) => { // action: 'approve' | 'reject'
    try {
      const token = localStorage.getItem('vstep_token');
      await fetch('http://localhost:5000/api/classes/approve', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          class_id: selectedClass.id, 
          student_id: studentId, 
          action 
        })
      });
      
      // Cập nhật UI ngay lập tức
      if (action === 'reject') {
        setMembers(members.filter(m => m.user_id !== studentId));
      } else {
        setMembers(members.map(m => m.user_id === studentId ? { ...m, trang_thai: 'approved' } : m));
      }
    } catch (err) {
      alert("Lỗi xử lý.");
    }
  };

  // Copy mã lớp
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã copy mã lớp: ${code}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Lớp học</h1>
          <p className="text-gray-500 text-sm">Tạo lớp và duyệt học viên tham gia</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-md flex items-center gap-2"
        >
          <Plus size={20} /> Tạo lớp mới
        </button>
      </div>

      {/* GRID DANH SÁCH LỚP */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <School size={24} />
                  </div>
                  <button 
                    onClick={() => copyCode(cls.ma_lop)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg flex items-center gap-1"
                    title="Click để copy"
                  >
                    {cls.ma_lop} <Copy size={12}/>
                  </button>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{cls.ten_lop}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cls.mo_ta}</p>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                  <Users size={16} /> {cls.so_hoc_vien || 0} học viên
                </div>

                <button 
                  onClick={() => handleViewClass(cls)}
                  className="w-full py-2.5 border border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Quản lý & Duyệt TV
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL TẠO LỚP */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Tạo lớp học mới</h2>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên lớp</label>
                <input 
                  type="text" required 
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: Luyện thi B1 K24"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (Tùy chọn)</label>
                <textarea 
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Mô tả ngắn về lớp học..."
                  rows={3}
                  value={newClassDesc}
                  onChange={e => setNewClassDesc(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Tạo ngay</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT LỚP & DUYỆT HỌC VIÊN */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl animate-fade-in">
            
            {/* Header Modal */}
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedClass.ten_lop}</h2>
                <p className="text-sm text-gray-500">Danh sách thành viên</p>
              </div>
              <button onClick={() => setSelectedClass(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            {/* Danh sách học viên */}
            <div className="flex-1 overflow-y-auto p-6">
              {members.length === 0 ? (
                <div className="text-center text-gray-400 py-10">Chưa có học viên nào tham gia.</div>
              ) : (
                <div className="space-y-4">
                  {members.map((mem) => (
                    <div key={mem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${mem.trang_thai === 'pending' ? 'bg-orange-400' : 'bg-blue-500'}`}>
                          {mem.ho_ten.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{mem.ho_ten}</h4>
                          <p className="text-xs text-gray-500">{mem.email}</p>
                        </div>
                      </div>

                      {/* Hành động Duyệt */}
                      {mem.trang_thai === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleApprove(mem.user_id, 'approve')}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 flex items-center gap-1"
                          >
                            <Check size={14} /> Duyệt
                          </button>
                          <button 
                            onClick={() => handleApprove(mem.user_id, 'reject')}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 flex items-center gap-1"
                          >
                            <X size={14} /> Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold">
                          Đã tham gia
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClassManagement;