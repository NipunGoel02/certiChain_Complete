import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Award, CalendarDays, Check, CircleHelp, Mail, PhoneCall, ShieldCheck, Sparkles } from 'lucide-react';

const CreateInternship = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    participantEmail: '',
    certificateType: 'participation',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/internships', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoading(false);
      const callStatus = response.data?.callStatus;
      if (callStatus === 'started') {
        alert('Internship request created and the participant call was started.');
      } else if (callStatus === 'failed') {
        alert('Internship request was created, but the participant call could not be started.');
      } else {
        alert('Internship request was created. No call was made because the participant account has no saved mobile number.');
      }
      navigate('/internships/my-internships');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to create internship');
    }
  };

  const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100';

  return (
    <div className="mx-auto max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-primary-600"><Sparkles size={14} /> New opportunity</div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Create an internship</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Add the opportunity details and choose the participant who should receive a certificate request.</p>
        </div>
        <button type="button" onClick={() => navigate('/internships/my-internships')} className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"><ArrowLeft size={14} /> Back to internships</button>
      </motion.div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-card">
          <div className="flex items-center gap-3 border-b border-primary-100 px-5 py-4 sm:px-7"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-700"><Award size={19} /></span><div><h3 className="text-sm font-bold text-gray-800">Internship details</h3><p className="mt-0.5 text-[11px] text-gray-500">Fields marked with * are required</p></div><span className="ml-auto rounded-full bg-primary-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-primary-700">Step 1 of 1</span></div>

          <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
            <div><label htmlFor="internship-title" className="mb-1.5 block text-xs font-semibold text-gray-700">Internship title <span className="text-primary-600">*</span></label><input id="internship-title" type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Frontend Development Internship" className={inputClass} required /></div>

            <div><label htmlFor="internship-description" className="mb-1.5 block text-xs font-semibold text-gray-700">Description <span className="text-primary-600">*</span></label><textarea id="internship-description" rows="4" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the work, learning goals, or responsibilities…" className={`${inputClass} resize-y leading-6`} required /><p className="mt-1.5 text-[10px] text-gray-500">A concise description helps the participant understand this record.</p></div>

            <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="internship-start" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700"><CalendarDays size={13} className="text-gray-400" />Start date <span className="text-primary-600">*</span></label><input id="internship-start" type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} className={inputClass} required /></div><div><label htmlFor="internship-end" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700"><CalendarDays size={13} className="text-gray-400" />End date <span className="text-primary-600">*</span></label><input id="internship-end" type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} className={inputClass} required /></div></div>

            <div><label htmlFor="participant-email" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700"><Mail size={13} className="text-gray-400" />Participant email <span className="text-primary-600">*</span></label><input id="participant-email" type="email" name="participantEmail" value={formData.participantEmail} onChange={handleChange} placeholder="participant@example.com" className={inputClass} required /><p className="mt-1.5 text-[10px] text-gray-500">Use the email associated with their CertiChain account.</p></div>

            <div><label htmlFor="certificate-type" className="mb-1.5 block text-xs font-semibold text-gray-700">Certificate type</label><select id="certificate-type" name="certificateType" value={formData.certificateType} onChange={handleChange} className={inputClass}><option value="participation">Participation</option><option value="completion">Completion</option></select></div>

            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">{error}</div>}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-primary-100 bg-primary-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7"><p className="flex items-start gap-2 text-[10px] leading-4 text-gray-600"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-primary-600" />Review the details before sending the certificate request.</p><motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-certi-gradient-purple px-5 py-3 text-xs font-bold text-white shadow-button transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Creating internship…' : 'Create & send request'}{!loading && <ArrowUpRight size={15} />}</motion.button></div>
        </motion.form>

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white p-5 shadow-card"><div className="mb-4 h-1 w-14 rounded-full bg-certi-gradient-purple" /><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-700"><Sparkles size={18} /></span><h3 className="mt-4 text-sm font-bold text-gray-800">What happens next?</h3><p className="mt-1.5 text-[11px] leading-5 text-gray-600">The internship record is created and a certificate request is associated with the participant’s account.</p><div className="mt-5 space-y-3"><div className="flex gap-2.5"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600"><Check size={12} /></span><p className="text-[10px] leading-4 text-gray-600">Participant is matched by their CertiChain email</p></div><div className="flex gap-2.5"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600"><Mail size={11} /></span><p className="text-[10px] leading-4 text-gray-600">They can review the request after signing in</p></div><div className="flex gap-2.5"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600"><PhoneCall size={11} /></span><p className="text-[10px] leading-4 text-gray-600">A call is attempted when their account has a saved mobile number and calling is configured</p></div></div></div>
          <div className="flex gap-2.5 rounded-2xl border border-primary-100 bg-white p-4 shadow-sm"><CircleHelp size={15} className="mt-0.5 shrink-0 text-primary-500" /><p className="text-[10px] leading-4 text-gray-600">If the participant cannot be found, double-check that the email matches their registered account.</p></div>
        </aside>
      </div>
    </div>
  );
};

export default CreateInternship;
