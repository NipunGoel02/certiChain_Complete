import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CourseCard from '../components/courses/Coursecard';
import CourseFilter from '../components/courses/Coursefilter';
import { getCourses } from '../services/courseService';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([
    { id: 'blockchain', name: 'Blockchain' },
    { id: 'web-development', name: 'Web Development' },
    { id: 'design', name: 'Design' },
    { id: 'data-science', name: 'Data Science' },
  ]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
        setFilteredCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('We could not load courses right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(course => {
      const matchesCategory = category === 'all' || (course.category && course.category.toLowerCase() === category.toLowerCase());
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    setFilteredCourses(filtered);
  }, [category, searchTerm, courses]);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
  };

  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  };

  return (
    <main className="cc-catalogue">
      <div className="cc-catalogue__inner">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="cc-catalogue__heading"
        >
          <span className="cc-kicker">CERTICHAIN LEARNING</span>
          <h1>Build skills.<br /><span>Earn credentials.</span></h1>
          <p>Find a learning path, follow your progress, and keep completed course credentials together.</p>
        </motion.div>

        <CourseFilter
          categories={categories}
          selectedCategory={category}
          onCategoryChange={handleCategoryChange}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        <div className="cc-catalogue__count" aria-live="polite">{loading ? 'Loading available courses…' : `${filteredCourses.length} ${filteredCourses.length === 1 ? 'course' : 'courses'} available`}</div>
        {loading ? (
          <div className="cc-course-grid" aria-label="Loading courses">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="cc-course-skeleton" aria-hidden="true">
                <div className="animate-pulse">
                  <div className="bg-gray-200 h-40 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="cc-empty-state" role="alert"><h2>Courses are unavailable</h2><p>{error}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></div>
        ) : filteredCourses.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="cc-course-grid"
          >
{filteredCourses.map(course => (
  <CourseCard key={course._id || course.id} course={course} />
))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="cc-empty-state"
          >
            <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filter to find what you're looking for.</p>
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default Courses;
