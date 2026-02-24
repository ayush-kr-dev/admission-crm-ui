import { useEffect, useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Users, GraduationCap, BadgeCheck, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/dashboard');
        setData(res.data.data);
      } catch (err) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, intake_vs_admitted, quota_wise_seats, fee_pending_list, pending_documents } = data;

  return (
    <div className="space-y-6">

      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Applicants" value={summary.total_applicants} icon={<Users size={20} className="text-blue-600" />} color="bg-blue-100" />
        <StatCard title="Seats Locked" value={summary.total_seats_locked} icon={<GraduationCap size={20} className="text-purple-600" />} color="bg-purple-100" />
        <StatCard title="Confirmed" value={summary.total_confirmed} icon={<BadgeCheck size={20} className="text-green-600" />} color="bg-green-100" />
        <StatCard title="Fee Pending" value={summary.total_fee_pending} icon={<AlertCircle size={20} className="text-red-600" />} color="bg-red-100" />
      </div>

      {/* Intake vs Admitted */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Intake vs Admitted</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2 text-gray-600">Program</th>
                <th className="px-4 py-2 text-gray-600">Department</th>
                <th className="px-4 py-2 text-gray-600">Year</th>
                <th className="px-4 py-2 text-gray-600">Total Intake</th>
                <th className="px-4 py-2 text-gray-600">Admitted</th>
                <th className="px-4 py-2 text-gray-600">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {intake_vs_admitted.map((row, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-800">{row.program_name}</td>
                  <td className="px-4 py-2 text-gray-600">{row.department_name}</td>
                  <td className="px-4 py-2 text-gray-600">{row.academic_year}</td>
                  <td className="px-4 py-2 text-center">{row.total_intake}</td>
                  <td className="px-4 py-2 text-center text-green-600 font-medium">{row.total_admitted}</td>
                  <td className="px-4 py-2 text-center text-blue-600 font-medium">{row.total_remaining}</td>
                </tr>
              ))}
              {intake_vs_admitted.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-4 text-center text-gray-400">No data found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quota Wise Seats */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Quota-wise Seat Status</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2 text-gray-600">Program</th>
                <th className="px-4 py-2 text-gray-600">Quota</th>
                <th className="px-4 py-2 text-gray-600">Total</th>
                <th className="px-4 py-2 text-gray-600">Filled</th>
                <th className="px-4 py-2 text-gray-600">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {quota_wise_seats.map((row, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-800">{row.program_name}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {row.quota_type}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">{row.total_seats}</td>
                  <td className="px-4 py-2 text-center text-orange-600 font-medium">{row.filled_seats}</td>
                  <td className="px-4 py-2 text-center text-green-600 font-medium">{row.remaining_seats}</td>
                </tr>
              ))}
              {quota_wise_seats.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-400">No data found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fee Pending List */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Fee Pending List
          <span className="ml-2 text-sm text-red-500">({fee_pending_list.length})</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2 text-gray-600">Name</th>
                <th className="px-4 py-2 text-gray-600">Mobile</th>
                <th className="px-4 py-2 text-gray-600">Program</th>
                <th className="px-4 py-2 text-gray-600">Quota</th>
                <th className="px-4 py-2 text-gray-600">Locked At</th>
              </tr>
            </thead>
            <tbody>
              {fee_pending_list.map((row, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-800">{row.full_name}</td>
                  <td className="px-4 py-2 text-gray-600">{row.mobile}</td>
                  <td className="px-4 py-2 text-gray-600">{row.program_name}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                      {row.quota_type}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(row.locked_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {fee_pending_list.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-400">No pending fees</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Documents */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Pending Documents
          <span className="ml-2 text-sm text-orange-500">({pending_documents.length})</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2 text-gray-600">Name</th>
                <th className="px-4 py-2 text-gray-600">Mobile</th>
                <th className="px-4 py-2 text-gray-600">Program</th>
                <th className="px-4 py-2 text-gray-600">Pending</th>
                <th className="px-4 py-2 text-gray-600">Submitted</th>
                <th className="px-4 py-2 text-gray-600">Verified</th>
              </tr>
            </thead>
            <tbody>
              {pending_documents.map((row, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-800">{row.full_name}</td>
                  <td className="px-4 py-2 text-gray-600">{row.mobile}</td>
                  <td className="px-4 py-2 text-gray-600">{row.program_name}</td>
                  <td className="px-4 py-2 text-center text-red-500 font-medium">{row.pending_count}</td>
                  <td className="px-4 py-2 text-center text-yellow-500 font-medium">{row.submitted_count}</td>
                  <td className="px-4 py-2 text-center text-green-500 font-medium">{row.verified_count}</td>
                </tr>
              ))}
              {pending_documents.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-4 text-center text-gray-400">No pending documents</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
