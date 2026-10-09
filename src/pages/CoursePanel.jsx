import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// Assuming addCourse service exists and works as intended
// import { addCourse } from '../services/courseService';

const CoursePanel = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    category: '',
    lessonCount: 0,
    duration: '',
    level: '',
    sections: [],
    outcomes: [],
    requirements: [],
    instructor: {
      name: '',
      title: '',
      bio: '',
      avatar: ''
    }
  });

  const [sectionInput, setSectionInput] = useState({ title: '', duration: '', lessons: [] });
  const [lessonInput, setLessonInput] = useState({ title: '', duration: '', type: '' });
  const [outcomeInput, setOutcomeInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('instructor.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        instructor: {
          ...prev.instructor,
          [key]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddLesson = () => {
    if (lessonInput.title && lessonInput.duration && lessonInput.type) {
      setSectionInput(prev => ({
        ...prev,
        lessons: [...prev.lessons, lessonInput]
      }));
      setLessonInput({ title: '', duration: '', type: '' });
    }
  };

  const handleAddSection = () => {
    if (sectionInput.title && sectionInput.duration && sectionInput.lessons.length > 0) {
      setFormData(prev => ({
        ...prev,
        sections: [...prev.sections, sectionInput]
      }));
      setSectionInput({ title: '', duration: '', lessons: [] });
    }
  };

  const handleRemoveLesson = (secIndex, lessonIndex) => {
    const updatedSections = [...formData.sections];
    updatedSections[secIndex].lessons.splice(lessonIndex, 1);
    setFormData(prev => ({ ...prev, sections: updatedSections }));
  };

  const handleRemoveSection = (index) => {
    const updatedSections = [...formData.sections];
    updatedSections.splice(index, 1);
    setFormData(prev => ({ ...prev, sections: updatedSections }));
  };


  const handleAddOutcome = () => {
    if (outcomeInput) {
      setFormData(prev => ({
        ...prev,
        outcomes: [...prev.outcomes, outcomeInput]
      }));
      setOutcomeInput('');
    }
  };

  const handleRemoveOutcome = (index) => {
    const updatedOutcomes = [...formData.outcomes];
    updatedOutcomes.splice(index, 1);
    setFormData(prev => ({ ...prev, outcomes: updatedOutcomes }));
  };

  const handleAddRequirement = () => {
    if (requirementInput) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput]
      }));
      setRequirementInput('');
    }
  };

  const handleRemoveRequirement = (index) => {
    const updatedRequirements = [...formData.requirements];
    updatedRequirements.splice(index, 1);
    setFormData(prev => ({ ...prev, requirements: updatedRequirements }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    setMessageType('');

    try {
      // Assuming token is stored in localStorage after login
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in to add a course.');
        setMessageType('error');
        return;
      }
      // Simulate API call
      // await addCourse(formData, token);
      console.log('Form Data Submitted:', formData); // Log data for testing
      setMessage('Course added successfully!');
      setMessageType('success');
      // navigate('/courses'); // Uncomment to navigate after successful submission
    } catch (error) {
      setMessage('Failed to add course: ' + error.message);
      setMessageType('error');
    }
  };

  // Animation variants for form sections
  const formSectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  // Animation variants for message box
  const messageBoxVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 font-sans text-secondary-100 p-8 md:p-12"
    >
      <div className="container mx-auto max-w-4xl bg-white p-8 md:p-12 rounded-3xl shadow-4xl border border-primary-200">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl md:text-5xl font-extrabold mb-10 text-center text-secondary-900 leading-tight"
        >
          Add New <span className="bg-clip-text text-transparent bg-certi-gradient-purple">Course</span>
        </motion.h1>

        <AnimatePresence>
          {message && (
            <motion.div
              variants={messageBoxVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`mb-6 p-4 rounded-xl text-center font-medium ${
                messageType === 'success' ? 'bg-primary-100 text-primary-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Course Details */}
          <motion.div
            variants={formSectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="bg-primary-50 p-8 rounded-2xl shadow-lg border border-primary-100"
          >
            <h2 className="text-2xl font-bold mb-6 text-secondary-800">Course Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" name="title" placeholder="Course Title" value={formData.title} onChange={handleChange} required className="input-field" />
              <input type="text" name="category" placeholder="Category (e.g., Blockchain, AI)" value={formData.category} onChange={handleChange} required className="input-field" />
              <textarea name="description" placeholder="Course Description" value={formData.description} onChange={handleChange} required className="input-field md:col-span-2 min-h-[100px]" />
              <input type="text" name="thumbnail" placeholder="Thumbnail Image URL" value={formData.thumbnail} onChange={handleChange} className="input-field" />
              <input type="number" name="lessonCount" placeholder="Total Lesson Count" value={formData.lessonCount} onChange={handleChange} className="input-field" />
              <input type="text" name="duration" placeholder="Total Duration (e.g., 10 hours)" value={formData.duration} onChange={handleChange} className="input-field" />
              <input type="text" name="level" placeholder="Level (e.g., Beginner, Advanced)" value={formData.level} onChange={handleChange} className="input-field" />
            </div>
          </motion.div>

          {/* Sections and Lessons */}
          <motion.div
            variants={formSectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="bg-primary-50 p-8 rounded-2xl shadow-lg border border-primary-100"
          >
            <h2 className="text-2xl font-bold mb-6 text-secondary-800">Course Curriculum</h2>
            <div className="space-y-6">
              {formData.sections.map((section, secIndex) => (
                <motion.div
                  key={secIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-6 rounded-xl shadow-md border border-primary-100 relative"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(secIndex)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <h3 className="font-semibold text-lg mb-3 text-secondary-700">{section.title} ({section.duration})</h3>
                  <h4 className="font-medium mb-2 text-secondary-600">Lessons:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <li key={lessonIndex} className="flex justify-between items-center text-secondary-500">
                        <span>{lesson.title} - {lesson.duration} ({lesson.type})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLesson(secIndex, lessonIndex)}
                          className="text-red-400 hover:text-red-600 ml-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}

              <div className="bg-white p-6 rounded-xl shadow-md border border-primary-100">
                <h3 className="font-bold text-xl mb-4 text-secondary-800">Add New Section</h3>
                <input type="text" placeholder="Section Title" value={sectionInput.title} onChange={e => setSectionInput(prev => ({ ...prev, title: e.target.value }))} className="input-field mb-3" />
                <input type="text" placeholder="Section Duration (e.g., 2 hours)" value={sectionInput.duration} onChange={e => setSectionInput(prev => ({ ...prev, duration: e.target.value }))} className="input-field mb-4" />

                <h4 className="font-semibold text-lg mb-3 text-secondary-700">Add Lesson to Current Section</h4>
                <input type="text" placeholder="Lesson Title" value={lessonInput.title} onChange={e => setLessonInput(prev => ({ ...prev, title: e.target.value }))} className="input-field mb-2" />
                <input type="text" placeholder="Lesson Duration (e.g., 15 min)" value={lessonInput.duration} onChange={e => setLessonInput(prev => ({ ...prev, duration: e.target.value }))} className="input-field mb-2" />
                <input type="text" placeholder="Lesson Type (e.g., Video, Quiz)" value={lessonInput.type} onChange={e => setLessonInput(prev => ({ ...prev, type: e.target.value }))} className="input-field mb-3" />
                <motion.button
                  type="button"
                  onClick={handleAddLesson}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-primary-500 text-white font-medium rounded-lg shadow-md hover:bg-primary-600 transition-colors duration-200"
                >
                  Add Lesson
                </motion.button>
                <div className="mt-4">
                  <h4 className="font-semibold text-secondary-600">Lessons in current section:</h4>
                  <ul className="list-disc list-inside text-secondary-500 text-sm mt-2 space-y-1">
                    {sectionInput.lessons.length > 0 ? (
                      sectionInput.lessons.map((lesson, index) => (
                        <li key={index}>{lesson.title} - {lesson.duration} ({lesson.type})</li>
                      ))
                    ) : (
                      <li className="text-secondary-400">No lessons added yet.</li>
                    )}
                  </ul>
                </div>
                <motion.button
                  type="button"
                  onClick={handleAddSection}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 px-6 py-3 bg-certi-gradient-purple text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Add Section to Course
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Outcomes */}
          <motion.div
            variants={formSectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="bg-primary-50 p-8 rounded-2xl shadow-lg border border-primary-100"
          >
            <h2 className="text-2xl font-bold mb-6 text-secondary-800">Course Outcomes</h2>
            <div className="flex items-center gap-4 mb-4">
              <input type="text" placeholder="Add a key outcome" value={outcomeInput} onChange={e => setOutcomeInput(e.target.value)} className="input-field flex-grow" />
              <motion.button
                type="button"
                onClick={handleAddOutcome}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg shadow-md hover:bg-primary-600 transition-colors duration-200"
              >
                Add
              </motion.button>
            </div>
            <ul className="list-disc list-inside space-y-2">
              {formData.outcomes.length > 0 ? (
                formData.outcomes.map((outcome, index) => (
                  <li key={index} className="flex justify-between items-center text-secondary-600">
                    <span>{outcome}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOutcome(index)}
                      className="text-red-400 hover:text-red-600 ml-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-secondary-400">No outcomes added yet.</li>
              )}
            </ul>
          </motion.div>

          {/* Requirements */}
          <motion.div
            variants={formSectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="bg-primary-50 p-8 rounded-2xl shadow-lg border border-primary-100"
          >
            <h2 className="text-2xl font-bold mb-6 text-secondary-800">Course Requirements</h2>
            <div className="flex items-center gap-4 mb-4">
              <input type="text" placeholder="Add a requirement" value={requirementInput} onChange={e => setRequirementInput(e.target.value)} className="input-field flex-grow" />
              <motion.button
                type="button"
                onClick={handleAddRequirement}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg shadow-md hover:bg-primary-600 transition-colors duration-200"
              >
                Add
              </motion.button>
            </div>
            <ul className="list-disc list-inside space-y-2">
              {formData.requirements.length > 0 ? (
                formData.requirements.map((req, index) => (
                  <li key={index} className="flex justify-between items-center text-secondary-600">
                    <span>{req}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(index)}
                      className="text-red-400 hover:text-red-600 ml-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-secondary-400">No requirements added yet.</li>
              )}
            </ul>
          </motion.div>

          {/* Instructor Details */}
          <motion.div
            variants={formSectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="bg-primary-50 p-8 rounded-2xl shadow-lg border border-primary-100"
          >
            <h2 className="text-2xl font-bold mb-6 text-secondary-800">Instructor Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" name="instructor.name" placeholder="Instructor Name" value={formData.instructor.name} onChange={handleChange} className="input-field" />
              <input type="text" name="instructor.title" placeholder="Instructor Title (e.g., Lead Dev)" value={formData.instructor.title} onChange={handleChange} className="input-field" />
              <textarea name="instructor.bio" placeholder="Instructor Bio" value={formData.instructor.bio} onChange={handleChange} className="input-field md:col-span-2 min-h-[100px]" />
              <input type="text" name="instructor.avatar" placeholder="Instructor Avatar URL" value={formData.instructor.avatar} onChange={handleChange} className="input-field" />
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)' }}
            whileTap={{ scale: 0.97 }}
            className="w-full px-10 py-5 bg-certi-gradient-purple text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-xl tracking-wide uppercase"
          >
            Add Course to CertiChain
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default CoursePanel;
