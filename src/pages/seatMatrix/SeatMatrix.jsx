import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

const SeatMatrix = () => {
  const [programs, setPrograms] = useState([]);
  const [matrices, setMatrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    program_id: '',
    total_intake: '',
    kcet_seats: '',
    comedk_seats: '',
    management_seats: '',
    supernumerary_seats: '0',
  });

  const quotaSum =
    (parseInt(form.kcet_seats) || 0) +
    (parseInt(form.comedk_seats) || 0) +
    (parseInt(form.management_seats) || 0);

  const intakeMatch = parseInt(form.total_intake) === quotaSum;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [prog, mat] = await Promise.all([
        API.get('/masters/programs'),
        API.get('/seat-matrix'),
      ]);
      setPrograms(prog.data.data);
      setMatrices(mat.data.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!intakeMatch) {
      toast.error(`Quota sum (${quotaSum}) must equal total intake (${form.total_intake})`);
      return;
    }
    if (!form.program_id) { toast.error('Please select a program'); return; }
    if (!form.total_intake || form.total_intake <= 0) { toast.error('Total intake must be greater than 0'); return; }
    if (parseInt(form.kcet_seats) < 0 || parseInt(form.comedk_seats) < 0 || parseInt(form.management_seats) < 0) {
      toast.error('Seat values cannot be negative'); return;
    }
    if (!intakeMatch) {
      toast.error(`Quota sum (${quotaSum}) must equal total intake (${form.total_intake})`); return;
    }
    try {
      await API.post('/seat-matrix', {
        ...form,
        total_intake: parseInt(form.total_intake),
        kcet_seats: parseInt(form.kcet_seats),
        comedk_seats: parseInt(form.comedk_seats),
        management_seats: parseInt(form.management_seats),
        supernumerary_seats: parseInt(form.supernumerary_seats) || 0,
      });
      toast.success('Seat matrix created successfully!');
      setForm({
        program_id: '', total_intake: '', kcet_seats: '',
        comedk_seats: '', management_seats: '', supernumerary_seats: '0'
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create seat matrix');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Seat Matrix</h1>

      {/* ── CREATE FORM ── */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Configure Seat Matrix</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Program Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
            <select
              value={form.program_id}
              onChange={e => setForm({ ...form, program_id: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Program --</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code}) — {p.academic_year}
                </option>
              ))}
            </select>
          </div>

          {/* Total Intake */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Intake</label>
            <input
              type="number" min="1"
              value={form.total_intake}
              onChange={e => setForm({ ...form, total_intake: e.target.value })}
              placeholder="e.g. 100"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quota Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">KCET Seats</label>
              <input
                type="number" min="0"
                value={form.kcet_seats}
                onChange={e => setForm({ ...form, kcet_seats: e.target.value })}
                placeholder="e.g. 60"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">COMEDK Seats</label>
              <input
                type="number" min="0"
                value={form.comedk_seats}
                onChange={e => setForm({ ...form, comedk_seats: e.target.value })}
                placeholder="e.g. 20"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Management Seats</label>
              <input
                type="number" min="0"
                value={form.management_seats}
                onChange={e => setForm({ ...form, management_seats: e.target.value })}
                placeholder="e.g. 20"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Supernumerary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supernumerary Seats
              <span className="ml-1 text-xs text-gray-400">(Optional — extra seats outside intake)</span>
            </label>
            <input
              type="number" min="0"
              value={form.supernumerary_seats}
              onChange={e => setForm({ ...form, supernumerary_seats: e.target.value })}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Live Quota Validation Banner */}
          {form.total_intake && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${intakeMatch
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
              {intakeMatch ? '✅' : '❌'}
              Quota Sum: <strong>{quotaSum}</strong>
              &nbsp;/&nbsp;
              Total Intake: <strong>{form.total_intake || 0}</strong>
              &nbsp;—&nbsp;
              {intakeMatch ? 'Looks good!' : 'Must be equal!'}
            </div>
          )}

          <button
            type="submit"
            disabled={!intakeMatch && !!form.total_intake}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Create Seat Matrix
          </button>

        </form>
      </div>

      {/* ── SEAT MATRIX LIST ── */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          All Seat Matrices
          <span className="ml-2 text-sm text-gray-400">({matrices.length})</span>
        </h2>

        {matrices.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No seat matrices configured yet.</p>
        ) : (
          <div className="space-y-4">
            {matrices.map(matrix => (
              <div key={matrix.id} className="border border-gray-200 rounded-xl p-4">

                {/* Program Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{matrix.program_name}</h3>
                    <p className="text-xs text-gray-500">{matrix.department_name} • {matrix.academic_year} • {matrix.course_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Intake</p>
                    <p className="text-2xl font-bold text-gray-800">{matrix.total_intake}</p>
                  </div>
                </div>

                {/* Quota Counters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {matrix.quota_counters
                    .filter(q => q.total_seats > 0)
                    .map(q => {
                      const fillPercent = Math.round((q.allocated / q.total_seats) * 100);
                      const isFull = q.remaining === 0;
                      return (
                        <div key={q.quota_type} className={`p-3 rounded-lg border ${isFull ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                          <p className="text-xs font-medium text-gray-600 mb-1">{q.quota_type}</p>
                          <p className="text-lg font-bold text-gray-800">{q.remaining}<span className="text-sm text-gray-400">/{q.total_seats}</span></p>
                          <p className="text-xs text-gray-500 mb-2">remaining</p>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-blue-500'}`}
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{fillPercent}% filled</p>
                        </div>
                      );
                    })
                  }
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default SeatMatrix;
