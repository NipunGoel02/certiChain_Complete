import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const CreateInternship = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
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

  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      await axios.post('/api/internships', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoading(false);
      alert('Internship created and notification sent to participant');
      navigate('/internships/my');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to create internship');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* subtle gradient background + dots */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50 to-white" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_400px_at_10%_-10%,rgba(139,92,246,0.15),transparent_60%),radial-gradient(900px_500px_at_110%_120%,rgba(236,72,153,0.12),transparent_60%)]" />

      <div className="relative container mx-auto px-4 py-12">
        {/* page heading */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center mb-8"
        >
          <div className="mx-auto w-12 h-12 rounded-2xl bg-violet-500/90 text-white grid place-items-center shadow-lg shadow-violet-500/25">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M6 11h12m-9 4h6M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
            </svg>
          </div>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500">
            Create Internship
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Generate internship entries with verification and automatically notify participants via email
          </p>
        </motion.div>

        {/* glassy card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto max-w-3xl rounded-2xl border border-white/60 bg-white/60 backdrop-blur-md shadow-[0_20px_60px_-20px_rgba(59,130,246,0.25)]"
        >
          {/* card header bar */}
          <div className="rounded-t-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-white">
            <div className="mx-auto max-w-2xl text-center">
              <div className="font-semibold">Internship Details</div>
              <div className="text-[11px] opacity-90">Please fill in all the required information</div>
            </div>
          </div>

          {/* form body */}
          <div className="px-5 py-6 md:px-8 md:py-8">
            {/* title */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">Internship Title</label>
              <div className="relative">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Frontend Development Internship"
                  className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                  required
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-violet-500">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 6l-2 4-4 .5 3 3-.7 4L12 15l3.7 2.5-.7-4 3-3-4-.5-2-4z" />
                  </svg>
                </span>
              </div>
            </div>

            {/* description */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows="4"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add a clear description of responsibilities and expectations"
                className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                required
              />
            </div>

            {/* dates */}
            <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                  required
                />
              </div>
            </div>

            {/* email */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">Participant Email</label>
              <input
                type="email"
                name="participantEmail"
                value={formData.participantEmail}
                onChange={handleChange}
                placeholder="participant@domain.com"
                className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                required
              />
              <p className="mt-1 text-[11px] text-gray-500">
                The participant will be notified at this email address.
              </p>
            </div>

            {/* type */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">Certificate Type</label>
              <select
                name="certificateType"
                value={formData.certificateType}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
              >
                <option value="participation">Participation</option>
                <option value="completion">Completion</option>
              </select>
            </div>

            {/* actions */}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 font-semibold text-white shadow-[0_10px_30px_-10px_rgba(147,51,234,0.6)] hover:from-violet-700 hover:to-fuchsia-600 disabled:opacity-70"
              >
                {loading ? 'Creating...' : 'Create Internship ✨'}
              </motion.button>
            </div>

            {error && <div className="mt-4 text-sm font-medium text-rose-600">{error}</div>}
          </div>
        </motion.form>

        {/* feature chips */}
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: '⚡', title: 'Instant Verification', text: 'Entries are quickly verifiable through the system' },
            { icon: '📬', title: 'Auto Notification', text: 'Participants receive automatic email notifications' },
            { icon: '🔒', title: 'Secure Storage', text: 'Tamper‑resistant storage for internship records' },
          ].map((it, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/70 bg-white/70 p-4 text-center shadow-sm backdrop-blur-md"
            >
              <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                <span className="text-lg">{it.icon}</span>
              </div>
              <div className="text-sm font-semibold text-gray-800">{it.title}</div>
              <div className="mt-1 text-xs text-gray-500">{it.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateInternship;
