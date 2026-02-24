import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';


const Input = ({ label, value, onChange, placeholder, type = 'text', required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const Select = ({ label, value, onChange, options, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">-- Select --</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const Section = ({ title, children, isOpen, onToggle }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-6 py-4 text-left"
    >
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
    </button>
    {isOpen && (
      <div className="px-6 pb-6 border-t border-gray-100">
        {children}
      </div>
    )}
  </div>
);

const SubmitBtn = ({ submitting, label }) => (
  <button
    type="submit"
    disabled={submitting}
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-lg transition-colors"
  >
    {submitting
      ? <>
          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Saving...
        </>
      : <><Plus size={16} />{label}</>
    }
  </button>
);

const Masters = () => {
  const [openSection, setOpenSection] = useState('institution');

  const [institutions,  setInstitutions]  = useState([]);
  const [campuses,      setCampuses]      = useState([]);
  const [departments,   setDepartments]   = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [programs,      setPrograms]      = useState([]);

  const [submittingInst,  setSubmittingInst]  = useState(false);
  const [submittingCamp,  setSubmittingCamp]  = useState(false);
  const [submittingDept,  setSubmittingDept]  = useState(false);
  const [submittingYear,  setSubmittingYear]  = useState(false);
  const [submittingProg,  setSubmittingProg]  = useState(false);

  const [instForm, setInstForm] = useState({ name: '', code: '', address: '' });
  const [campForm, setCampForm] = useState({ institution_id: '', name: '', location: '' });
  const [deptForm, setDeptForm] = useState({ campus_id: '', name: '', code: '' });
  const [yearForm, setYearForm] = useState({ year_label: '', year_value: '' });
  const [progForm, setProgForm] = useState({
    department_id: '', academic_year_id: '', name: '',
    code: '', course_type: '', entry_type: '', admission_mode: ''
  });

  const [selectedInstId, setSelectedInstId] = useState('');
  const [selectedCampId, setSelectedCampId] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [i, ay, p] = await Promise.all([
        API.get('/masters/institutions'),
        API.get('/masters/academic-years'),
        API.get('/masters/programs'),
      ]);
      setInstitutions(i.data.data);
      setAcademicYears(ay.data.data);
      setPrograms(p.data.data);
    } catch {
      toast.error('Failed to load data');
    }
  };

  const fetchCampuses = async (institution_id) => {
    if (!institution_id) { setCampuses([]); return; }
    try {
      const res = await API.get(`/masters/campuses/${institution_id}`);
      setCampuses(res.data.data);
    } catch {
      toast.error('Failed to load campuses');
    }
  };

  const fetchDepartments = async (campus_id) => {
    if (!campus_id) { setDepartments([]); return; }
    try {
      const res = await API.get(`/masters/departments/${campus_id}`);
      setDepartments(res.data.data);
    } catch {
      toast.error('Failed to load departments');
    }
  };

  const toggle = (section) =>
    setOpenSection(prev => prev === section ? '' : section);

  const handleInstitution = async (e) => {
    e.preventDefault();
    if (!instForm.name.trim()) { toast.error('Institution name is required'); return; }
    if (!instForm.code.trim()) { toast.error('Institution code is required'); return; }
    if (instForm.code.length > 20) { toast.error('Code must be under 20 characters'); return; }

    setSubmittingInst(true);
    try {
      await API.post('/masters/institutions', instForm);
      toast.success('Institution created successfully!');
      setInstForm({ name: '', code: '', address: '' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create institution');
    } finally {
      setSubmittingInst(false);
    }
  };

  const handleCampus = async (e) => {
    e.preventDefault();
    if (!campForm.institution_id) { toast.error('Please select an institution'); return; }
    if (!campForm.name.trim())    { toast.error('Campus name is required'); return; }

    setSubmittingCamp(true);
    try {
      await API.post('/masters/campuses', campForm);
      toast.success('Campus created successfully!');
      setCampForm({ institution_id: campForm.institution_id, name: '', location: '' });
      fetchCampuses(campForm.institution_id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create campus');
    } finally {
      setSubmittingCamp(false);
    }
  };

  const handleDepartment = async (e) => {
    e.preventDefault();
    if (!deptForm.campus_id)    { toast.error('Please select a campus'); return; }
    if (!deptForm.name.trim())  { toast.error('Department name is required'); return; }
    if (!deptForm.code.trim())  { toast.error('Department code is required'); return; }
    if (deptForm.code.length > 20) { toast.error('Code must be under 20 characters'); return; }

    setSubmittingDept(true);
    try {
      await API.post('/masters/departments', deptForm);
      toast.success('Department created successfully!');
      setDeptForm({ campus_id: deptForm.campus_id, name: '', code: '' });
      fetchDepartments(deptForm.campus_id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create department');
    } finally {
      setSubmittingDept(false);
    }
  };

  const handleAcademicYear = async (e) => {
    e.preventDefault();
    if (!yearForm.year_label.trim()) { toast.error('Year label is required'); return; }
    if (!yearForm.year_value)        { toast.error('Year value is required'); return; }
    if (yearForm.year_value < 2000 || yearForm.year_value > 2100) {
      toast.error('Enter a valid year between 2000 and 2100'); return;
    }

    setSubmittingYear(true);
    try {
      await API.post('/masters/academic-years', yearForm);
      toast.success('Academic year created successfully!');
      setYearForm({ year_label: '', year_value: '' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create academic year');
    } finally {
      setSubmittingYear(false);
    }
  };

  const handleProgram = async (e) => {
    e.preventDefault();
    if (!progForm.department_id)    { toast.error('Please select a department'); return; }
    if (!progForm.academic_year_id) { toast.error('Please select an academic year'); return; }
    if (!progForm.name.trim())      { toast.error('Program name is required'); return; }
    if (!progForm.code.trim())      { toast.error('Program code is required'); return; }
    if (!progForm.course_type)      { toast.error('Please select course type'); return; }
    if (!progForm.entry_type)       { toast.error('Please select entry type'); return; }
    if (!progForm.admission_mode)   { toast.error('Please select admission mode'); return; }

    setSubmittingProg(true);
    try {
      await API.post('/masters/programs', progForm);
      toast.success('Program created successfully!');
      setProgForm({
        department_id: '', academic_year_id: '', name: '',
        code: '', course_type: '', entry_type: '', admission_mode: ''
      });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create program');
    } finally {
      setSubmittingProg(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Masters Setup</h1>
      <p className="text-sm text-gray-500">Configure the institution hierarchy from top to bottom.</p>

      {/* ── 1. INSTITUTION ── */}
      <Section title="1. Institution" isOpen={openSection === 'institution'} onToggle={() => toggle('institution')}>
        <form onSubmit={handleInstitution} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Input label="Institution Name *" value={instForm.name}    onChange={e => setInstForm({...instForm, name: e.target.value})}    placeholder="RV College of Engineering" />
          <Input label="Code *"             value={instForm.code}    onChange={e => setInstForm({...instForm, code: e.target.value.toUpperCase()})}    placeholder="RVCE" />
          <Input label="Address"            value={instForm.address} onChange={e => setInstForm({...instForm, address: e.target.value})} placeholder="Bengaluru, Karnataka" />
          <div className="md:col-span-3">
            <SubmitBtn submitting={submittingInst} label="Add Institution" />
          </div>
        </form>
        {institutions.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-gray-600">Name</th>
                <th className="px-4 py-2 text-left text-gray-600">Code</th>
                <th className="px-4 py-2 text-left text-gray-600">Address</th>
              </tr></thead>
              <tbody>
                {institutions.map(i => (
                  <tr key={i.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800">{i.name}</td>
                    <td className="px-4 py-2 text-gray-600">{i.code}</td>
                    <td className="px-4 py-2 text-gray-500">{i.address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ── 2. CAMPUS ── */}
      <Section title="2. Campus" isOpen={openSection === 'campus'} onToggle={() => toggle('campus')}>
        <form onSubmit={handleCampus} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Select
            label="Institution *" value={campForm.institution_id}
            onChange={e => {
              setCampForm({...campForm, institution_id: e.target.value});
              fetchCampuses(e.target.value);
            }}
            options={institutions.map(i => ({ value: i.id, label: i.name }))}
          />
          <Input label="Campus Name *" value={campForm.name}     onChange={e => setCampForm({...campForm, name: e.target.value})}     placeholder="Main Campus" />
          <Input label="Location"      value={campForm.location} onChange={e => setCampForm({...campForm, location: e.target.value})} placeholder="Mysore Road, Bengaluru" />
          <div className="md:col-span-3">
            <SubmitBtn submitting={submittingCamp} label="Add Campus" />
          </div>
        </form>
        {campuses.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-gray-600">Campus Name</th>
                <th className="px-4 py-2 text-left text-gray-600">Location</th>
              </tr></thead>
              <tbody>
                {campuses.map(c => (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800">{c.name}</td>
                    <td className="px-4 py-2 text-gray-500">{c.location || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ── 3. DEPARTMENT ── */}
      <Section title="3. Department" isOpen={openSection === 'department'} onToggle={() => toggle('department')}>
        <form onSubmit={handleDepartment} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Select
            label="Institution *" value={selectedInstId}
            onChange={e => {
              setSelectedInstId(e.target.value);
              setSelectedCampId('');
              fetchCampuses(e.target.value);
            }}
            options={institutions.map(i => ({ value: i.id, label: i.name }))}
          />
          <Select
            label="Campus *" value={selectedCampId}
            onChange={e => {
              setSelectedCampId(e.target.value);
              setDeptForm({...deptForm, campus_id: e.target.value});
              fetchDepartments(e.target.value);
            }}
            options={campuses.map(c => ({ value: c.id, label: c.name }))}
          />
          <Input label="Department Name *" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} placeholder="Computer Science & Engineering" />
          <Input label="Code *"            value={deptForm.code} onChange={e => setDeptForm({...deptForm, code: e.target.value.toUpperCase()})} placeholder="CSE" />
          <div className="md:col-span-3">
            <SubmitBtn submitting={submittingDept} label="Add Department" />
          </div>
        </form>
        {departments.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-gray-600">Department</th>
                <th className="px-4 py-2 text-left text-gray-600">Code</th>
              </tr></thead>
              <tbody>
                {departments.map(d => (
                  <tr key={d.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800">{d.name}</td>
                    <td className="px-4 py-2 text-gray-600">{d.code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ── 4. ACADEMIC YEAR ── */}
      <Section title="4. Academic Year" isOpen={openSection === 'academicYear'} onToggle={() => toggle('academicYear')}>
        <form onSubmit={handleAcademicYear} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Input label="Year Label *" value={yearForm.year_label} onChange={e => setYearForm({...yearForm, year_label: e.target.value})} placeholder="2026-27" />
          <Input label="Year Value *" value={yearForm.year_value} onChange={e => setYearForm({...yearForm, year_value: e.target.value})} placeholder="2026" type="number" />
          <div className="flex items-end">
            <SubmitBtn submitting={submittingYear} label="Add Year" />
          </div>
        </form>
        {academicYears.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-gray-600">Label</th>
                <th className="px-4 py-2 text-left text-gray-600">Year</th>
                <th className="px-4 py-2 text-left text-gray-600">Status</th>
              </tr></thead>
              <tbody>
                {academicYears.map(y => (
                  <tr key={y.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800">{y.year_label}</td>
                    <td className="px-4 py-2 text-gray-600">{y.year_value}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${y.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {y.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ── 5. PROGRAM ── */}
      <Section title="5. Program / Branch" isOpen={openSection === 'program'} onToggle={() => toggle('program')}>
        <form onSubmit={handleProgram} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Select
            label="Institution *" value={selectedInstId}
            onChange={e => {
              setSelectedInstId(e.target.value);
              setSelectedCampId('');
              setCampuses([]);
              setDepartments([]);
              fetchCampuses(e.target.value);
            }}
            options={institutions.map(i => ({ value: i.id, label: i.name }))}
          />
          <Select
            label="Campus *" value={selectedCampId}
            onChange={e => {
              setSelectedCampId(e.target.value);
              setDepartments([]);
              fetchDepartments(e.target.value);
            }}
            options={campuses.map(c => ({ value: c.id, label: c.name }))}
          />
          <Select
            label="Department *" value={progForm.department_id}
            onChange={e => setProgForm({...progForm, department_id: e.target.value})}
            options={departments.map(d => ({ value: d.id, label: d.name }))}
          />
          <Select
            label="Academic Year *" value={progForm.academic_year_id}
            onChange={e => setProgForm({...progForm, academic_year_id: e.target.value})}
            options={academicYears.map(y => ({ value: y.id, label: y.year_label }))}
          />
          <Input label="Program Name *" value={progForm.name} onChange={e => setProgForm({...progForm, name: e.target.value})} placeholder="B.E. Computer Science" />
          <Input label="Code *"         value={progForm.code} onChange={e => setProgForm({...progForm, code: e.target.value.toUpperCase()})} placeholder="CSE" />
          <Select
            label="Course Type *" value={progForm.course_type}
            onChange={e => setProgForm({...progForm, course_type: e.target.value})}
            options={[{ value: 'UG', label: 'UG' }, { value: 'PG', label: 'PG' }]}
          />
          <Select
            label="Entry Type *" value={progForm.entry_type}
            onChange={e => setProgForm({...progForm, entry_type: e.target.value})}
            options={[{ value: 'Regular', label: 'Regular' }, { value: 'Lateral', label: 'Lateral' }]}
          />
          <Select
            label="Admission Mode *" value={progForm.admission_mode}
            onChange={e => setProgForm({...progForm, admission_mode: e.target.value})}
            options={[{ value: 'Government', label: 'Government' }, { value: 'Management', label: 'Management' }]}
          />
          <div className="md:col-span-3">
            <SubmitBtn submitting={submittingProg} label="Add Program" />
          </div>
        </form>
        {programs.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-gray-600">Program</th>
                <th className="px-4 py-2 text-left text-gray-600">Code</th>
                <th className="px-4 py-2 text-left text-gray-600">Department</th>
                <th className="px-4 py-2 text-left text-gray-600">Year</th>
                <th className="px-4 py-2 text-left text-gray-600">Type</th>
                <th className="px-4 py-2 text-left text-gray-600">Entry</th>
                <th className="px-4 py-2 text-left text-gray-600">Mode</th>
              </tr></thead>
              <tbody>
                {programs.map(p => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-2 text-gray-600">{p.code}</td>
                    <td className="px-4 py-2 text-gray-500">{p.department_name}</td>
                    <td className="px-4 py-2 text-gray-500">{p.academic_year}</td>
                    <td className="px-4 py-2"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{p.course_type}</span></td>
                    <td className="px-4 py-2"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">{p.entry_type}</span></td>
                    <td className="px-4 py-2"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">{p.admission_mode}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

    </div>
  );
};

export default Masters;
