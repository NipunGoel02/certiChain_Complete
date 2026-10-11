import { ArrowUpRight, BookOpen, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Coursecard = ({ course }) => (
  <article className="cc-course-card">
    <Link className="cc-course-card__media" to={`/courses/${course._id || course.id}`} aria-label={`View ${course.title}`}>
      <img src={course.thumbnail || './th.jpeg'} alt="" loading="lazy" />
      <span>{course.category || 'Learning path'}</span>
    </Link>
    <div className="cc-course-card__body">
      <div className="cc-course-card__eyebrow"><BookOpen size={14} aria-hidden="true" /> Course</div>
      <h2><Link to={`/courses/${course._id || course.id}`}>{course.title}</Link></h2>
      <p>{course.description}</p>
      {(course.lessonCount != null || course.duration) && <div className="cc-course-card__meta">{course.lessonCount != null && <span><BookOpen size={15} aria-hidden="true" />{course.lessonCount} lessons</span>}{course.duration && <span><Clock3 size={15} aria-hidden="true" />{course.duration}</span>}</div>}
      <Link to={`/courses/${course._id || course.id}`} className="cc-course-card__action">Explore course <ArrowUpRight size={16} aria-hidden="true" /></Link>
    </div>
  </article>
);

export default Coursecard;
