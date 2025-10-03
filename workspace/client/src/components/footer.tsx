import React from "react";
import {
  GraduationCap,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Phone,
  Mail,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-primary text-background py-16 font-sans rounded-t-xl shadow-inner select-none">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand & Description */}
        <div className="md:col-span-2">
          <div className="flex items-center mb-6">
            <GraduationCap
              className="text-accent h-12 w-12 mr-4 drop-shadow-lg"
              aria-hidden="true"
            />
            <span className="font-heading font-extrabold text-4xl tracking-wide">
              TutorMitra
            </span>
          </div>
          <p className="text-neutral/90 max-w-lg text-lg leading-relaxed tracking-wide">
            Connecting students with expert tutors for personalized learning
            experiences. Master any subject with one-on-one guidance and unlock
            your true potential.
          </p>
          <div className="flex space-x-8 mt-8 text-neutral/90">
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-accent transition-colors duration-300"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Facebook className="h-7 w-7" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="hover:text-accent transition-colors duration-300"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Twitter className="h-7 w-7" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="hover:text-accent transition-colors duration-300"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Instagram className="h-7 w-7" />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="hover:text-accent transition-colors duration-300"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Linkedin className="h-7 w-7" />
            </a>
          </div>
        </div>

        {/* For Students Links */}
        <nav aria-label="Footer navigation for students">
          <h4 className="font-heading text-xl font-semibold text-accent mb-6 border-b border-accent/70 pb-2">
            For Students
          </h4>
          <ul className="space-y-4 text-neutral/90 text-lg">
            <li>
              <Link
                to="/find-tutors"
                className="hover:text-accent hover:underline transition"
              >
                Find Tutors
              </Link>
            </li>
            <li>
              <Link
                to="/subjects"
                className="hover:text-accent hover:underline transition"
              >
                Browse Subjects
              </Link>
            </li>
            <li>
              <Link
                to="/pricing"
                className="hover:text-accent hover:underline transition"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                to="/student-reviews"
                className="hover:text-accent hover:underline transition"
              >
                Student Reviews
              </Link>
            </li>
            <li>
              <Link
                to="/faq"
                className="hover:text-accent hover:underline transition"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                to="/policies"
                className="hover:text-accent hover:underline transition"
              >
                Policies
              </Link>
            </li>
          </ul>
        </nav>

        {/* For Tutors Links */}
        <nav aria-label="Footer navigation for tutors">
          <h4 className="font-heading text-xl font-semibold text-accent mb-6 border-b border-accent/70 pb-2">
            For Tutors
          </h4>
          <ul className="space-y-4 text-neutral/90 text-lg">
            <li>
              <Link
                to="/become-a-tutor"
                className="hover:text-accent hover:underline transition"
              >
                Become a Tutor
              </Link>
            </li>
            <li>
              <Link
                to="/tutor-resources"
                className="hover:text-accent hover:underline transition"
              >
                Tutor Resources
              </Link>
            </li>
            <li>
              <Link
                to="/tutor-guidelines"
                className="hover:text-accent hover:underline transition"
              >
                Tutor Guidelines
              </Link>
            </li>
            <li>
              <Link
                to="/success-stories"
                className="hover:text-accent hover:underline transition"
              >
                Success Stories
              </Link>
            </li>
            <li>
              <Link
                to="/faq"
                className="hover:text-accent hover:underline transition"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                to="/policies"
                className="hover:text-accent hover:underline transition"
              >
                Policies
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Contact Info */}
      <div className="border-t border-neutral/40 mt-16 pt-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col md:flex-row md:justify-between md:items-center gap-8 text-neutral/90 text-md font-medium select-text">
          <div className="flex flex-col md:flex-row md:space-x-10 items-center justify-center md:justify-start space-y-4 md:space-y-0">
            {/* Phone */}
            <a
              href="tel:+917068003894"
              className="flex items-center space-x-3 hover:text-accent transition font-semibold"
              aria-label="Phone number"
            >
              <Phone className="h-6 w-6" />
              <span>+91 7068003894</span>
            </a>

            {/* Email */}
            <a
              href="mailto:bmadityas@gmail.com"
              className="flex items-center space-x-3 hover:text-accent transition font-semibold"
              aria-label="Email address"
            >
              <Mail className="h-6 w-6" />
              <span>bmadityas@gmail.com</span>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/917068003894"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 hover:text-accent transition font-semibold"
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={22} />
              <span>WhatsApp</span>
            </a>
          </div>

          <p className="text-center md:text-right text-white/90 text-sm font-light select-text">
            © {new Date().getFullYear()} Aditya Singh. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
