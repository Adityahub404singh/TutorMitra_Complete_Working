import React from "react";
import PageTemplate from "./PageTemplate";

const TutorResources = () => (
  <PageTemplate title="Tutor Resources" description="Helpful resources and guides for tutors.">
    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-yellow-400">
      <li>Best Practices for Online Tutoring</li>
      <li>Setting Up Your Teaching Environment</li>
      <li>Managing Feedback and Reviews</li>
      <li>Payment and Withdrawal Procedures</li>
      <li>Continuing Professional Development</li>
    </ul>
  </PageTemplate>
);

export default TutorResources;
