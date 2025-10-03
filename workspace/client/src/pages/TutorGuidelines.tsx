import React from "react";
import PageTemplate from "./PageTemplate";

const TutorGuidelines: React.FC = () => (
  <PageTemplate
    title="Tutor Guidelines"
    description="Essential standards and best practices to ensure a rewarding teaching experience on TutorMitra."
  >
    <section className="space-y-6 text-gray-700 dark:text-yellow-400 text-lg leading-relaxed">
      <p>
        Welcome to TutorMitra! As a valued tutor on our platform, adherence to the following guidelines helps maintain quality education and trust for students and tutors alike.
      </p>
      <ul className="list-disc list-inside space-y-4">
        <li>
          <strong>Professionalism & Punctuality:</strong> Always be on time for your sessions and communicate proactively about any delays or reschedules.
        </li>
        <li>
          <strong>Preparation and Engagement:</strong> Prepare well in advance for each session and engage actively with your student to ensure effective learning.
        </li>
        <li>
          <strong>Respect and Inclusivity:</strong> Treat all students with respect and create a welcoming atmosphere regardless of background or skill level.
        </li>
        <li>
          <strong>Confidentiality:</strong> Protect your student’s privacy by handling all personal information with strict confidentiality.
        </li>
        <li>
          <strong>Clear Communication:</strong> Maintain open lines of communication regarding session details, expectations, and feedback.
        </li>
        <li>
          <strong>Commitment to Quality:</strong> Strive to deliver accurate, up-to-date content aligned with student goals and curriculum.
        </li>
        <li>
          <strong>Ethics and Integrity:</strong> Follow all TutorMitra policies, avoid conflicts of interest, and provide genuine support to foster student success.
        </li>
      </ul>
      <p className="italic text-sm text-gray-600 dark:text-yellow-300">
        Following these guidelines ensures a rewarding and trusted tutoring partnership through TutorMitra. We are committed to supporting you every step of the way.
      </p>
    </section>
  </PageTemplate>
);

export default TutorGuidelines;
