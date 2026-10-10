import { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('user');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      const user = await signup(email, password, name, role, phoneNumber);
      navigate(user?.role === 'recruiter' ? '/recruiter' : user?.role === 'internship' ? '/internships' : user?.role === 'hackathon organizer' ? '/organizer' : '/profile');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label>Name</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label>Email</label>
          <input
            type="email"
            required
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label>Mobile Number</label>
          <input
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            pattern="[+0-9() -]{10,20}"
            title="Enter a valid mobile number, including country code if outside India"
            placeholder="+91 98765 43210"
            className="w-full p-2 border rounded"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <small className="text-gray-500">Used for internship certificate request calls.</small>
        </div>
        <div className="mb-4">
          <label>Password</label>
          <input
            type="password"
            required
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label>Confirm Password</label>
          <input
            type="password"
            required
            className="w-full p-2 border rounded"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label>Account type</label>
          <select className="w-full rounded border p-2" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">Learner</option>
            <option value="recruiter">Recruiter</option>
            <option value="internship">Internship Organizer</option>
            <option value="hackathon organizer">Hackathon Organizer</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
        >
          Sign Up
        </button>
      </form>
      <div className="mt-4 text-center">
      </div>
      <div className="mt-4 text-center">
        Already have an account? <Link to="/login" className="text-purple-500">Login</Link>
      </div>
    </div>
  );
}
