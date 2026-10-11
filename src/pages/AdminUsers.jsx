import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CircleAlert, GraduationCap, Mail, Users } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('/api/admin/users', config);
        setUsers(response.data.users);
      } catch (err) {
        setError('Failed to fetch users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return <main className="cc-data-page">
    <header className="cc-data-heading"><div><span className="cc-kicker">ADMINISTRATION</span><h1>Learner directory</h1><p>Accounts enrolled in your courses and their saved learning records.</p></div><div className="cc-data-count"><Users size={17} />{loading ? 'Loading' : `${users.length} users`}</div></header>
    {error ? <section className="cc-state-card cc-state-card--error" role="alert"><CircleAlert /><h2>Couldn’t load learners</h2><p>{error}. Refresh the page to try again.</p></section>
      : loading ? <div className="cc-data-skeleton" aria-label="Loading users"><i /><i /><i /></div>
        : users.length === 0 ? <section className="cc-state-card"><Users /><h2>No enrolled learners</h2><p>Course enrolments will be listed here.</p></section>
          : <section className="cc-admin-user-list" aria-label="Learners">{users.map((user) => <article className="cc-admin-user" key={user._id}><span className="cc-admin-user__avatar">{(user.name || 'U').slice(0, 1).toUpperCase()}</span><div className="cc-admin-user__identity"><h2>{user.name || 'Learner'}</h2><p><Mail size={14} />{user.email}</p></div><div className="cc-admin-user__courses"><span><GraduationCap size={15} /> ENROLLED COURSES · {user.enrolledCourses?.length || 0}</span><p>{user.enrolledCourses?.length ? user.enrolledCourses.join(', ') : 'No enrolled courses'}</p></div></article>)}</section>}
    <Link to="/admin/courses" className="cc-back-link"><ArrowLeft size={15} /> Back to course library</Link>
  </main>;
};

export default AdminUsers;
