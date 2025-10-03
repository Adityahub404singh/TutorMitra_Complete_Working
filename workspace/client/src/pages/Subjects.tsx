import React from "react";
import PageTemplate from "./PageTemplate";

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "Economics",
  "History",
  "Geography",
];

const BrowseSubjects: React.FC = () => (
  <PageTemplate title="Browse Subjects" description="Explore all subjects offered on TutorMitra.">
    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-gray-800 dark:text-yellow-300">
      {subjects.map((subject) => (
        <li
          key={subject}
          className="p-4 cursor-pointer rounded border hover:bg-primary hover:text-white transition"
          tabIndex={0}      // Accessibility: Make list items focusable
          role="button"     // Accessibility: Button role for interactivity
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              // Implement subject click logic here if needed
            }
          }}
          onClick={() => {
            // Implement subject click logic here if needed
          }}
        >
          {subject}
        </li>
      ))}
    </ul>
  </PageTemplate>
);

export default BrowseSubjects;
