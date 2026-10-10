const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Internship = require('../models/Internship');
const { auth, isRecruiter } = require('../middleware/auth');

// Recruiters search learner records already stored in MongoDB. This endpoint
// deliberately does not query wallets or the blockchain.
router.get('/candidates', auth, isRecruiter, async (req, res) => {
  try {
    const { q = '', courseId = '', category = '', internship = '', certificateStatus = '' } = req.query;
    const users = await User.find({ role: 'user' })
      .select('name profilePicture enrolledCourses completedCourses')
      .sort({ name: 1 })
      .lean();

    if (users.length === 0) return res.json({ candidates: [], total: 0 });

    const userIds = users.map((user) => user._id);
    const courseIds = [...new Set(users.flatMap((user) => [
      ...(user.enrolledCourses || []),
      ...(user.completedCourses || [])
    ]).map(String))];

    const [courses, internships] = await Promise.all([
      courseIds.length ? Course.find({ _id: { $in: courseIds } }).select('title category description thumbnail').lean() : [],
      Internship.find({ participants: { $in: userIds } })
        .select('title description startDate endDate participants certificateRequests')
        .lean()
    ]);

    const courseById = new Map(courses.map((course) => [String(course._id), course]));
    const internshipsByUser = new Map(userIds.map((id) => [String(id), []]));
    for (const internshipRecord of internships) {
      for (const participantId of internshipRecord.participants || []) {
        const list = internshipsByUser.get(String(participantId));
        if (!list) continue;
        const requests = (internshipRecord.certificateRequests || []).filter(
          (request) => String(request.participant) === String(participantId)
        );
        list.push({
          _id: internshipRecord._id,
          title: internshipRecord.title,
          description: internshipRecord.description,
          startDate: internshipRecord.startDate,
          endDate: internshipRecord.endDate,
          certificateRequests: requests.map((request) => ({
            status: request.status,
            certificateType: request.certificateType,
            requestedAt: request.requestedAt
          }))
        });
      }
    }

    const candidates = users.map((user) => {
      const enrolled = new Set((user.enrolledCourses || []).map(String));
      const completed = new Set((user.completedCourses || []).map(String));
      const allCourseIds = new Set([...enrolled, ...completed]);
      const userCourses = [...allCourseIds].map((id) => {
        const course = courseById.get(id);
        if (!course) return null;
        return {
          _id: course._id,
          title: course.title,
          category: course.category,
          description: course.description,
          thumbnail: course.thumbnail,
          status: completed.has(id) ? 'completed' : 'enrolled'
        };
      }).filter(Boolean);

      const userInternships = internshipsByUser.get(String(user._id)) || [];
      const certificateRequests = userInternships.flatMap((record) =>
        record.certificateRequests.map((request) => ({
          internshipTitle: record.title,
          status: request.status,
          certificateType: request.certificateType,
          requestedAt: request.requestedAt
        }))
      );

      return {
        _id: user._id,
        name: user.name,
        profilePicture: user.profilePicture,
        courses: userCourses,
        internships: userInternships,
        certificateRequests
      };
    });

    const normalizedQuery = String(q).trim().toLowerCase();
    const normalizedInternship = String(internship).trim().toLowerCase();
    const filtered = candidates.filter((candidate) => {
      const hasCourse = !courseId || candidate.courses.some((course) => String(course._id) === String(courseId));
      const hasCategory = !category || candidate.courses.some((course) => course.category === category);
      const hasInternship = !normalizedInternship || candidate.internships.some((record) =>
        `${record.title || ''} ${record.description || ''}`.toLowerCase().includes(normalizedInternship)
      );
      const hasCertificateStatus = !certificateStatus || candidate.certificateRequests.some(
        (request) => request.status === certificateStatus
      );
      const searchable = [candidate.name,
        ...candidate.courses.flatMap((course) => [course.title, course.category]),
        ...candidate.internships.flatMap((record) => [record.title, record.description])
      ].join(' ').toLowerCase();
      return hasCourse && hasCategory && hasInternship && hasCertificateStatus &&
        (!normalizedQuery || searchable.includes(normalizedQuery));
    });

    res.json({ candidates: filtered, total: filtered.length });
  } catch (error) {
    console.error('Recruiter candidate search failed:', error);
    res.status(500).json({ message: 'Could not load candidate records' });
  }
});

module.exports = router;
