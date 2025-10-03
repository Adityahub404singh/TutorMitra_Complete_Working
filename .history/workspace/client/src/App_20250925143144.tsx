
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useTheme } from "./context/ThemeContext";
import PrivateRoute from "./components/PrivateRoute";
import PaymentPageWrapper from "./pages/PaymentPageWrapper";
import { AuthProvider } from "./store/AuthProvider";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


// Lazy imports
const Splash = lazy(() => import("./pages/Splash"));
const Home = lazy(() => import("./pages/Home"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const Tutors = lazy(() => import("./pages/Tutors"));
const Courses = lazy(() => import("./pages/Courses"));
const Reviews = lazy(() => import("./pages/StudentReviews"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Policies = lazy(() => import("./pages/Policies"));
const Pricing = lazy(() => import("./pages/Pricing"));
const TutorRegistration = lazy(() => import("./pages/TutorRegistration"));
const FindTutors = lazy(() => import("./pages/FindTutors"));
const BecomeATutor = lazy(() => import("./pages/BecomeTutor"));
const SuccessStories = lazy(() => import("./pages/SuccessStories"));
const TutorGuidelines = lazy(() => import("./pages/TutorGuidelines"));
const TutorResources = lazy(() => import("./pages/TutorResources"));
const StudentReviews = lazy(() => import("./pages/StudentReviews"));
const TutorHome = lazy(() => import("./pages/TutorHome"));
const StudentHome = lazy(() => import("./pages/StudentHome"));
const TutorProfile = lazy(() => import("./pages/TutorProfile"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const AddCourse = lazy(() => import("./pages/addCourse"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const Booking = lazy(() => import("./pages/Booking"));
const PaymentPage = lazy(() => import("./pages/Payment"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));

const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));


const Loader: React.FC = () => (
  <div className="flex justify-center items-center h-32 text-accent text-xl font-semibold">
    Loading...
  </div>
);

const DarkModeToggle: React.FC = () => {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="fixed top-4 right-4 p-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow transition focus:outline-none ring-yellow-500 z-50"
    >
      {dark ? "🌞" : "🌙"}
    </button>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-background dark:bg-darkBackground font-sans text-neutral-900 dark:text-neutral-200 transition-colors">
          <DarkModeToggle />
          <Header />
          <ToastContainer position="top-right" autoClose={5000} />
          <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto rounded-lg bg-white dark:bg-darkBackground border border-primary shadow-lg">
            <Suspense fallback={<Loader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/splash" element={<Splash />} />
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />

                <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />

                <Route path="/login" element={<Login />} />
                <Route path="/tutor-registration" element={<TutorRegistration />} />
                <Route path="/tutors" element={<Tutors />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/policies" element={<Policies />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/find-tutors" element={<FindTutors />} />
                <Route path="/become-a-tutor" element={<BecomeATutor />} />
                <Route path="/success-stories" element={<SuccessStories />} />
                <Route path="/tutor-guidelines" element={<TutorGuidelines />} />
                <Route path="/tutor-resources" element={<TutorResources />} />
                <Route path="/student-reviews" element={<StudentReviews />} />
                <Route path="/subjects" element={<StudentReviews />} />

                {/* Single tutor profile */}
                <Route path="/tutors/:id" element={<TutorProfile />} />

                {/* Fixed Chat Route to include both studentId and tutorId */}
                <Route
                  path="/chat/:studentId/:tutorId"
                  element={
                    <PrivateRoute allowedRoles={["student", "tutor"]}>
                      <ChatPage />
                    </PrivateRoute>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/book/:courseId"
                  element={
                    <PrivateRoute allowedRoles={["student"]}>
                      <Booking />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/payment/:bookingId"
                  element={
                    <PrivateRoute allowedRoles={["student"]}>
                      <PaymentPageWrapper />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/booking-confirmation"
                  element={
                    <PrivateRoute allowedRoles={["student"]}>
                      <BookingConfirmation />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/student-home"
                  element={
                    <PrivateRoute allowedRoles={["student"]}>
                      <StudentHome />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/tutor-home"
                  element={
                    <PrivateRoute allowedRoles={["tutor"]}>
                      <TutorHome />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/tutor-profile/:id"
                  element={
                    <PrivateRoute allowedRoles={["tutor"]}>
                      <TutorProfile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/edit-profile"
                  element={
                    <PrivateRoute allowedRoles={["tutor"]}>
                      <EditProfile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/add-course"
                  element={
                    <PrivateRoute allowedRoles={["tutor"]}>
                      <AddCourse />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-bookings"
                  element={
                    <PrivateRoute allowedRoles={["student", "tutor"]}>
                      <MyBookings />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute allowedRoles={["student", "tutor"]}>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute allowedRoles={["student", "tutor"]}>
                      <Profile />
                    </PrivateRoute>
                  }
                />

                {/* Other routes */}
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* 404 not found */}
                <Route
                  path="*"
                  element={
                    <main className="text-center py-16 text-3xl font-semibold text-primary bg-accent rounded-lg">
                      404 - Page Not Found
                    </main>
                  }
                />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
