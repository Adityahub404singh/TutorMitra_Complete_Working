import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useTheme } from "./context/ThemeContext";
import { AuthProvider } from "./store/AuthProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from "./components/PrivateRoute";

// Lazy loaded components
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
const BecomeTutor = lazy(() => import("./pages/BecomeTutor"));
const SuccessStories = lazy(() => import("./pages/SuccessStories"));
const TutorGuidelines = lazy(() => import("./pages/TutorGuidelines"));
const TutorResources = lazy(() => import("./pages/TutorResources"));
const StudentReviewsPage = lazy(() => import("./pages/StudentReviews"));
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
const KycUpload = lazy(() => import("./pages/KycUpload"));
const KycStatus = lazy(() => import("./pages/KycStatus"));

import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

const Loader = () => (
  <div className="flex justify-center items-center h-32 text-accent text-xl font-semibold">
    Loading...
  </div>
);

const DarkModeToggle = () => {
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
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/tutor-registration" element={<TutorRegistration />} />
                <Route path="/tutors" element={<Tutors />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/policies" element={<Policies />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/findTutors" element={<FindTutors />} />
                <Route path="/becomeTutor" element={<BecomeTutor />} />
                <Route path="/successStories" element={<SuccessStories />} />
                <Route path="/tutorGuidelines" element={<TutorGuidelines />} />
                <Route path="/tutorResources" element={<TutorResources />} />
                <Route path="/studentReviews" element={<StudentReviewsPage />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<div className="text-center text-3xl font-semibold py-20">404 - Page Not Found</div>} />

                {/* Dynamic tutor profile */}
                <Route path="/tutors/:id" element={<TutorProfile />} />

                {/* Chat */}
                <Route path="/chat/:studentId/:tutorId" element={
                  <PrivateRoute allowedRoles={["student", "tutor"]}>
                    <ChatPage />
                  </PrivateRoute>
                } />

                {/* Protected student routes */}
                <Route path="/book/:courseId" element={
                  <PrivateRoute allowedRoles={["student"]}>
                    <Booking />
                  </PrivateRoute>
                } />
                <Route path="/payment/:bookingId" element={
                  <PrivateRoute allowedRoles={["student"]}>
                    <PaymentPage />
                  </PrivateRoute>
                } />
                <Route path="/bookingConfirmation" element={
                  <PrivateRoute allowedRoles={["student"]}>
                    <BookingConfirmation />
                  </PrivateRoute>
                } />
                <Route path="/studentHome" element={
                  <PrivateRoute allowedRoles={["student"]}>
                    <StudentHome />
                  </PrivateRoute>
                } />

                {/* Protected tutor routes */}
                <Route path="/tutorHome" element={
                  <PrivateRoute allowedRoles={["tutor"]}>
                    <TutorHome />
                  </PrivateRoute>
                } />
                <Route path="/tutorProfile" element={
                  <PrivateRoute allowedRoles={["tutor"]}>
                    <TutorProfile />
                  </PrivateRoute>
                } />
                <Route path="/editProfile" element={
                  <PrivateRoute allowedRoles={["tutor"]}>
                    <EditProfile />
                  </PrivateRoute>
                } />
                <Route path="/addCourse" element={
                  <PrivateRoute allowedRoles={["tutor"]}>
                    <AddCourse />
                  </PrivateRoute>
                } />

                {/* Shared protected routes */}
                <Route path="/myBookings" element={
                  <PrivateRoute allowedRoles={["student", "tutor"]}>
                    <MyBookings />
                  </PrivateRoute>
                } />
                <Route path="/dashboard" element={
                  <PrivateRoute allowedRoles={["student", "tutor"]}>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/profile" element={
                  <PrivateRoute allowedRoles={["student", "tutor"]}>
                    <Profile />
                  </PrivateRoute>
                } />

                {/* KYC routes for tutors */}
                <Route path="/kyc/upload" element={
                  <PrivateRoute allowedRoles={["tutor"]}>
                    <KycUpload />
                  </PrivateRoute>
                } />
                <Route path="/kyc/status" element={
                  <PrivateRoute allowedRoles={["tutor"]}>
                    <KycStatus />
                  </PrivateRoute>
                } />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
