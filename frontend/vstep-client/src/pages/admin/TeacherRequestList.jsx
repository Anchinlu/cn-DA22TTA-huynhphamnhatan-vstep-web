import React, { useState, useEffect } from 'react';
import { Check, X, ExternalLink, UserCheck } from 'lucide-react';

const TeacherRequestList = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/dashboard/admin/teacher-requests');
      if(res.ok) setRequests(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleProcess = async (id, action) => {
    if(!window.confirm(`Bạn chắc chắn muốn ${action === 'approve' ? 'DUYỆT' : 'TỪ CHỐI'} yêu cầu này?`)) return;
    try {
        await fetch(`http://localhost:5000/api/dashboard/admin/teacher-requests/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        fetchRequests(); // Reload list
    } catch (err) { alert("Lỗi xử lý"); }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <UserCheck className="text-blue-600"/> Yêu cầu nâng cấp Giáo viên
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
              <th className="p-4 rounded-tl-xl">Họ tên / Email</th>
              <th className="p-4">Thông tin chuyên môn</th>
              <th className="p-4">Kinh nghiệm</th>
              <th className="p-4">CV</th>
              <th className="p-4 rounded-tr-xl text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.length > 0 ? requests.map(req => (
              <tr key={req.id} className="hover:bg-gray-50 transition">
                <td className="p-4">
                    <p className="font-bold text-gray-800">{req.ho_ten}</p>
                    <p className="text-sm text-gray-500">{req.email}</p>
                    <p className="text-xs text-gray-400 mt-1">{req.so_dien_thoai}</p>
                </td>
                <td className="p-4 text-sm font-medium text-blue-600">{req.trinh_do}</td>
                <td className="p-4 text-sm text-gray-600 max-w-xs">{req.kinh_nghiem}</td>
                <td className="p-4">
                    <a href={req.link_cv} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 hover:underline">
                        Xem CV <ExternalLink size={12}/>
                    </a>
                </td>
                <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleProcess(req.id, 'approve')} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" title="Duyệt">
                            <Check size={18}/>
                        </button>
                        <button onClick={() => handleProcess(req.id, 'reject')} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Từ chối">
                            <X size={18}/>
                        </button>
                    </div>
                </td>
              </tr>
            )) : (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Không có yêu cầu nào đang chờ.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherRequestList;