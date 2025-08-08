import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">TutorMitra</h1>
      <div className="space-x-4">
        <Link to="/" className="text-blue-600 hover:underline">Home</Link>
        <Link to="/tutors" className="text-blue-600 hover:underline">Tutors</Link>
        <Link to="/mentor" className="text-blue-600 hover:underline">Mentor</Link>
      </div>
    </nav>
  );
}
