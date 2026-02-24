import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Eye, FileText } from 'lucide-react';

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [docModal, setDocModal] = useState(false);
  const [newDoc, setNewDoc] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchApplicants(); }, []);

  const fetchApplicants = async () => {
    try {
      const res = await API.get('/applicants');
      setApplicants(res.data.data);
    } catch {
      toast.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const openDocModal = async (applicant) => {
    try {
      const res = await API.get(`/applicants/${applicant.id}`);
      setSelected(res.data.data);
      setDocModal(true);
    } catch {
      toast.error('Failed to load applicant details');
    }
  };

  const handleAddDoc = async (e) => {
    e.preventDefault();
    if (!newDoc.trim()) return;
    try {
      await API.post(`/applicants/${selected.id}/documents`, { document_name: newDoc });
      toast.success('Document added!');
      setNewDoc('');
      openDocModal(selected);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDocStatus = async (docId, status) => {
    try {
      await API.patch(`/applicants/${selected.id}/documents/${docId}`, { status });
      toast.success(`Status updated to ${status}`);
      openDocModal(selected); // refresh
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-red-100 text-red-600',
      Submitted: 'bg-yellow-100 text-yellow-700',
      Verified: 'bg-green-100 text-green-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getQuotaBadge = (quota) => {
    const styles = {
      KCET: 'bg-blue-100 text-blue-700',
      COMEDK: 'bg-purple-100 text-purple-700',
      Management: 'bg-orange-100 text-orange-700',
      Supernumerary: 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[quota] || 'bg-gray-100'}`}>
        {quota}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-sm">Loading applicants...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Applicants</h1>
          <p className="text-sm text-gray-500 mt-1">{applicants.length} total applicants</p>
        </div>
        <button
          onClick={() => navigate('/applicants/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} /> New Applicant
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {applicants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No applicants found.</p>
            <button
              onClick={() => navigate('/applicants/new')}
              className="mt-3 text-blue-600 text-sm hover:underline"
            >
              Create your first applicant →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">#</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Mobile</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Category</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Quota</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Entry Type</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Program</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Allotment No.</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((a, i) => (
                  <tr key={a.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{a.full_name}</p>
                      <p className="text-xs text-gray-400">{a.email || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.mobile}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {a.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getQuotaBadge(a.quota_type)}</td>
                    <td className="px-4 py-3 text-gray-600">{a.entry_type}</td>
                    <td className="px-4 py-3 text-gray-600">{a.program_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{a.allotment_number || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDocModal(a)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        <FileText size={14} /> Documents
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DOCUMENT MODAL ── */}
      {docModal && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="font-semibold text-gray-800">{selected.full_name}</h3>
                <p className="text-xs text-gray-500">{selected.program_name} • {selected.quota_type}</p>
              </div>
              <button
                onClick={() => { setDocModal(false); setSelected(null); }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >✕</button>
            </div>

            {/* Document List */}
            <div className="p-5 space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Documents</h4>

              {selected.documents?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No documents added yet.</p>
              )}

              {selected.documents?.map(doc => (
                <div key={doc.id} className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{doc.document_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(doc.status)}
                    {/* Status action buttons */}
                    {doc.status === 'Pending' && (
                      <button
                        onClick={() => handleDocStatus(doc.id, 'Submitted')}
                        className="text-xs text-yellow-600 hover:underline"
                      >
                        Mark Submitted
                      </button>
                    )}
                    {doc.status === 'Submitted' && (
                      <button
                        onClick={() => handleDocStatus(doc.id, 'Verified')}
                        className="text-xs text-green-600 hover:underline"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add New Document */}
              <form onSubmit={handleAddDoc} className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={newDoc}
                  onChange={e => setNewDoc(e.target.value)}
                  placeholder="e.g. 10th Marksheet, Aadhar Card..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
                >
                  Add
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Applicants;
