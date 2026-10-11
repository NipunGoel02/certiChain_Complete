import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, CircleAlert, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios.get('/api/courses/admin/courses', config)
      .then((res) => setCourses(res.data))
      .catch(() => setError('Unable to load courses. Please refresh and try again.'))
      .finally(() => setLoading(false));
  }, []);

  const deleteCourse = async (id) => {
    if (window.confirm('Are you sure?')) {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/courses/admin/courses/${id}`, config);
      setCourses(courses.filter((course) => course._id !== id));
    }
  };

  return <main className="cc-data-page">
    <header className="cc-data-heading"><div><span className="cc-kicker">ADMINISTRATION</span><h1>Course library</h1><p>Create and maintain the learning paths available on CertiChain.</p></div><Link to="/admin/courses/new" className="cc-admin-primary"><Plus size={16} /> Add course</Link></header>
    {error ? <section className="cc-state-card cc-state-card--error" role="alert"><CircleAlert /><h2>Course library unavailable</h2><p>{error}</p></section>
      : loading ? <div className="cc-data-skeleton" aria-label="Loading courses"><i /><i /><i /></div>
        : courses.length === 0 ? <section className="cc-state-card"><BookOpen /><h2>No courses yet</h2><p>Create the first course to add it to the library.</p><Link to="/admin/courses/new">Add a course</Link></section>
          : <section className="cc-admin-course-list" aria-label="Course library">{courses.map((course) => <article className="cc-admin-course" key={course._id}><div className="cc-admin-course__cover">{course.thumbnail ? <img src={course.thumbnail} alt="" loading="lazy" /> : <BookOpen size={23} />}</div><div className="cc-admin-course__body"><span>{course.category || 'Course'}</span><h2>{course.title}</h2><p>{course.instructor?.name || 'Instructor not assigned'}</p></div><div className="cc-admin-course__actions"><Link to={`/admin/courses/edit/${course._id}`}>Edit <ArrowUpRight size={14} /></Link><button type="button" onClick={() => deleteCourse(course._id)} aria-label={`Delete ${course.title}`}><Trash2 size={15} /> Delete</button></div></article>)}</section>}
  </main>;
}
