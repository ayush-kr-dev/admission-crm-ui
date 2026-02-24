import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const ApplicantForm = () => {
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    mobile: '',
    email: '',
    address: '',
    category: '',
    entry_type: '',
    quota_type: '',
    qualifying_exam: '',
    marks_obtained: '',
    max_marks: '',
    allotment_number: '',
    program_id: '',
    academic_year_id: '',
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [prog, year] = await Promise.all([
          API.get('/masters/programs'),
          API.get('/masters/academic-years'),
        ]);
        setPrograms(prog.data.data);
        setAcademicYears(year.data.data);
      } catch {
        toast.error('Failed to load dropdown data');
      }
    };
    fetchDropdowns();
  }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const validate = () => {
    if (!form.full_name.trim()) {
      toast.error('Full name is required'); return false;
    }
    if (!form.date_of_birth) {
      toast.error('Date of birth is required'); return false;
    }
    if (!form.gender) {
      toast.error('Gender is required'); return false;
    }
    if (!form.mobile.trim()) {
      toast.error('Mobile number is required'); return false;
    }
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      toast.error('Enter a valid 10-digit Indian mobile number'); return false;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('Enter a valid email address'); return false;
    }
    if (!form.category) {
      toast.error('Category is required'); return false;
    }
    if (!form.entry_type) {
      toast.error('Entry type is required'); return false;
    }
    if (!form.quota_type) {
      toast.error('Quota type is required'); return false;
    }
    if ((form.quota_type === 'KCET' || form.quota_type === 'COMEDK') && !form.allotment_number.trim()) {
      toast.error(`Allotment number is required for ${form.quota_type}`); return false;
    }
    if (!form.program_id) {
      toast.error('Program is required'); return false;
    }
    if (!form.academic_year_id) {
      toast.error('Academic year is required'); return false;
    }
    if (form.marks_obtained && form.max_marks) {
      if (parseFloat(form.marks_obtained) > parseFloat(form.max_marks)) {
        toast.error('Marks obtained cannot exceed max marks'); return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await API.post('/applicants', form);
      toast.success('Applicant created successfully!');
      navigate('/applicants');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create applicant');
    } finally {
      setLoading(false);
    }
  };

  const isGovtFlow = form.quota_type === 'KCET' || form.quota_type === 'COMEDK';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/applicants')}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">New Applicant</h1>
          <p className="text-sm text-gray-500">Fill in the applicant details (max 15 fields)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">

          {/* ── PERSONAL DETAILS ── */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
              Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* 1. Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.full_name} onChange={set('full_name')}
                  placeholder="Rahul Sharma" required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* 2. Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                <input type="date" value={form.date_of_birth} onChange={set('date_of_birth')}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* 3. Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
                <select value={form.gender} onChange={set('gender')} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Select --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* 4. Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile <span className="text-red-500">*</span></label>
                <input type="text" value={form.mobile} onChange={set('mobile')}
                  placeholder="9876543210" required maxLength={15}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* 5. Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={set('email')}
                  placeholder="rahul@gmail.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* 6. Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" value={form.address} onChange={set('address')}
                  placeholder="Bengaluru, Karnataka"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

            </div>
          </div>

          {/* ── ADMISSION DETAILS ── */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
              Admission Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* 7. Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                <select value={form.category} onChange={set('category')} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Select --</option>
                  {['GM', 'SC', 'ST', 'OBC', 'EWS', 'Other'].map(c =>
                    <option key={c} value={c}>{c}</option>
                  )}
                </select>
              </div>

              {/* 8. Entry Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry Type <span className="text-red-500">*</span></label>
                <select value={form.entry_type} onChange={set('entry_type')} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Select --</option>
                  <option value="Regular">Regular</option>
                  <option value="Lateral">Lateral</option>
                </select>
              </div>

              {/* 9. Quota Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quota Type <span className="text-red-500">*</span></label>
                <select value={form.quota_type} onChange={set('quota_type')} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Select --</option>
                  <option value="KCET">KCET</option>
                  <option value="COMEDK">COMEDK</option>
                  <option value="Management">Management</option>
                  <option value="Supernumerary">Supernumerary</option>
                </select>
              </div>

              {/* 13. Allotment Number — only for Govt flow */}
              {isGovtFlow && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allotment Number <span className="text-red-500">*</span>
                    <span className="ml-1 text-xs text-blue-500">(Required for {form.quota_type})</span>
                  </label>
                  <input type="text" value={form.allotment_number} onChange={set('allotment_number')}
                    placeholder="KCET2026/CSE/00123" required={isGovtFlow}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}

              {/* 14. Program */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program <span className="text-red-500">*</span></label>
                <select value={form.program_id} onChange={set('program_id')} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Select Program --</option>
                  {programs.map(p =>
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  )}
                </select>
              </div>

              {/* 15. Academic Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year <span className="text-red-500">*</span></label>
                <select value={form.academic_year_id} onChange={set('academic_year_id')} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Select Year --</option>
                  {academicYears.map(y =>
                    <option key={y.id} value={y.id}>{y.year_label}</option>
                  )}
                </select>
              </div>

            </div>
          </div>

          {/* ── ACADEMIC DETAILS ── */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
              Academic Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* 10. Qualifying Exam */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualifying Exam</label>
                <input type="text" value={form.qualifying_exam} onChange={set('qualifying_exam')}
                  placeholder="PUC / 12th / Diploma"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* 11. Marks Obtained */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marks Obtained</label>
                <input type="number" value={form.marks_obtained} onChange={set('marks_obtained')}
                  placeholder="540"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* 12. Max Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                <input type="number" value={form.max_marks} onChange={set('max_marks')}
                  placeholder="600"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2 border-t">
            <button
              type="submit" disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-6 py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : 'Create Applicant'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/applicants')}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5"
            >
              Cancel
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};

export default ApplicantForm;
