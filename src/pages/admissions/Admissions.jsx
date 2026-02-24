import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Lock, BadgeCheck, CreditCard } from 'lucide-react';

const Admissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allocModal, setAllocModal] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [feeLoading, setFeeLoading] = useState(null);
  const [confirmLoad, setConfirmLoad] = useState(null);
  const [allocForm, setAllocForm] = useState({
    applicant_id: '',
    program_id: '',
    quota_type: '',
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [adm, app, prog] = await Promise.all([
        API.get('/admissions'),
        API.get('/applicants'),
        API.get('/masters/programs'),
      ]);
      setAdmissions(adm.data.data);
      setApplicants(app.data.data);
      setPrograms(prog.data.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!allocForm.applicant_id) { toast.error('Please select an applicant'); return; }
    if (!allocForm.program_id) { toast.error('Please select a program'); return; }
    if (!allocForm.quota_type) { toast.error('Please select a quota'); return; }

    setAllocating(true);
    try {
      await API.post('/admissions/allocate', {
        applicant_id: parseInt(allocForm.applicant_id),
        program_id: parseInt(allocForm.program_id),
        quota_type: allocForm.quota_type,
      });
      toast.success('Seat locked successfully!');
      setAllocModal(false);
      setAllocForm({ applicant_id: '', program_id: '', quota_type: '' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Allocation failed');
    } finally {
      setAllocating(false);
    }
  };

  const handleFeePaid = async (id) => {
    if (!window.confirm('Mark fee as Paid for this admission?')) return;
    setFeeLoading(id);
    try {
      await API.patch(`/admissions/${id}/fee`);
      toast.success('Fee marked as Paid!');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update fee status');
    } finally {
      setFeeLoading(null);
    }
  };

  const handleConfirm = async (id) => {
    if (!window.confirm('Confirm this admission? Admission number will be generated.')) return;
    setConfirmLoad(id);
    try {
      const res = await API.patch(`/admissions/${id}/confirm`);
      toast.success(`✅ ${res.data.message}`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm admission');
    } finally {
      setConfirmLoad(null);
    }
  };

  const closeModal = () => {
    setAllocModal(false);
    setAllocForm({ applicant_id: '', program_id: '', quota_type: '' });
  };

  const unallocatedApplicants = applicants.filter(
    a => !admissions.find(adm => adm.applicant_id === a.id)
  );

  const getStepBadge = (adm) => {
    if (adm.is_confirmed) return (
      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
        <BadgeCheck size={12} /> Confirmed
      </span>
    );
    if (adm.fee_status === 'Paid') return (
      <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
        <CreditCard size={12} /> Fee Paid
      </span>
    );
    if (adm.seat_locked) return (
      <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
        <Lock size={12} /> Seat Locked
      </span>
    );
    return <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">Pending</span>;
  };

  const getQuotaBadge = (quota) => {
    const styles = {
      KCET: 'bg-blue-100 text-blue-700',
      COMEDK: 'bg-purple-100 text-purple-700',
      Management: 'bg-orange-100 text-orange-700',
      Supernumerary: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[quota] || 'bg-gray-100 text-gray-600'}`}>
        {quota}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-sm">Loading admissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admissions</h1>
          <p className="text-sm text-gray-500 mt-1">{admissions.length} total admission records</p>
        </div>
        <button
          onClick={() => setAllocModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          <Lock size={16} /> Allocate Seat
        </button>
      </div>

      {/* ── Step Counter Cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            step: '01', label: 'Seat Locked',
            color: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700',
            count: admissions.filter(a => a.seat_locked && a.fee_status === 'Pending').length
          },
          {
            step: '02', label: 'Fee Paid',
            color: 'bg-blue-50 border-blue-200', text: 'text-blue-700',
            count: admissions.filter(a => a.fee_status === 'Paid' && !a.is_confirmed).length
          },
          {
            step: '03', label: 'Confirmed',
            color: 'bg-green-50 border-green-200', text: 'text-green-700',
            count: admissions.filter(a => a.is_confirmed).length
          },
        ].map(s => (
          <div key={s.step} className={`border rounded-xl p-4 ${s.color}`}>
            <p className={`text-xs font-semibold ${s.text}`}>STEP {s.step}</p>
            <p className={`text-lg font-bold mt-1 ${s.text}`}>{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.text}`}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* ── Admissions Table ── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {admissions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No admissions yet.</p>
            <button
              onClick={() => setAllocModal(true)}
              className="mt-3 text-blue-600 text-sm hover:underline"
            >
              Allocate first seat →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">#</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Applicant</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Program</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Quota</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Admission No.</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admissions.map((adm, i) => (
                  <tr key={adm.id} className="border-t hover:bg-gray-50 transition-colors">

                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>

                    {/* Applicant */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{adm.full_name}</p>
                      <p className="text-xs text-gray-400">{adm.mobile}</p>
                    </td>

                    {/* Program */}
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{adm.program_name}</p>
                      <p className="text-xs text-gray-400">{adm.academic_year}</p>
                    </td>

                    {/* Quota */}
                    <td className="px-4 py-3">{getQuotaBadge(adm.quota_type)}</td>

                    {/* Status */}
                    <td className="px-4 py-3">{getStepBadge(adm)}</td>

                    {/* Admission Number */}
                    <td className="px-4 py-3">
                      {adm.admission_number ? (
                        <span className="font-mono text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                          {adm.admission_number}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Not generated</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">

                        {/* Step 2 — Mark Fee Paid */}
                        {adm.seat_locked && adm.fee_status === 'Pending' && (
                          <button
                            onClick={() => handleFeePaid(adm.id)}
                            disabled={feeLoading === adm.id}
                            className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-blue-700 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            {feeLoading === adm.id ? (
                              <>
                                <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Saving...
                              </>
                            ) : (
                              <><CreditCard size={12} /> Mark Paid</>
                            )}
                          </button>
                        )}

                        {/* Step 3 — Confirm Admission */}
                        {adm.fee_status === 'Paid' && !adm.is_confirmed && (
                          <button
                            onClick={() => handleConfirm(adm.id)}
                            disabled={confirmLoad === adm.id}
                            className="flex items-center gap-1 bg-green-50 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed text-green-700 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            {confirmLoad === adm.id ? (
                              <>
                                <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Confirming...
                              </>
                            ) : (
                              <><BadgeCheck size={12} /> Confirm</>
                            )}
                          </button>
                        )}

                        {/* Final state */}
                        {adm.is_confirmed && (
                          <span className="text-xs text-green-600 font-medium">✅ Admitted</span>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── ALLOCATE SEAT MODAL ── */}
      {allocModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="font-semibold text-gray-800">Allocate Seat</h3>
                <p className="text-xs text-gray-500 mt-0.5">Lock a seat for an applicant</p>
              </div>
              <button
                onClick={closeModal}
                disabled={allocating}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold disabled:opacity-50"
              >✕</button>
            </div>

            <form onSubmit={handleAllocate} className="p-5 space-y-4">

              {/* Applicant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Applicant <span className="text-red-500">*</span>
                </label>
                <select
                  value={allocForm.applicant_id}
                  onChange={e => {
                    const app = applicants.find(a => a.id === parseInt(e.target.value));
                    setAllocForm({
                      ...allocForm,
                      applicant_id: e.target.value,
                      program_id: app?.program_id ? String(app.program_id) : '',
                      quota_type: app?.quota_type || '',
                    });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Applicant --</option>
                  {unallocatedApplicants.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.full_name} — {a.quota_type}
                    </option>
                  ))}
                </select>
                {unallocatedApplicants.length === 0 && (
                  <p className="text-xs text-orange-500 mt-1">
                    All applicants already have seats allocated.
                  </p>
                )}
              </div>

              {/* Program */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program <span className="text-red-500">*</span>
                </label>
                <select
                  value={allocForm.program_id}
                  onChange={e => setAllocForm({ ...allocForm, program_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Program --</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quota */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quota <span className="text-red-500">*</span>
                </label>
                <select
                  value={allocForm.quota_type}
                  onChange={e => setAllocForm({ ...allocForm, quota_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Quota --</option>
                  <option value="KCET">KCET</option>
                  <option value="COMEDK">COMEDK</option>
                  <option value="Management">Management</option>
                  <option value="Supernumerary">Supernumerary</option>
                </select>
              </div>

              {/* Info Banner */}
              {allocForm.quota_type && allocForm.program_id && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700">
                  ℹ️ System will check seat availability in{' '}
                  <strong>{allocForm.quota_type}</strong> quota before locking.
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={allocating}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm py-2.5 rounded-lg font-medium transition-colors"
                >
                  {allocating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Locking Seat...
                    </>
                  ) : (
                    <><Lock size={14} /> Lock Seat</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={allocating}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admissions;
