import React, { useState } from "react";

const faqs = [
  {
    question: "What is TutorMitra?",
    answer:
      "TutorMitra is an offline tutoring platform connecting students directly with expert tutors for personalized learning.",
  },
  {
    question: "How do I become a tutor?",
    answer:
      "Sign up by choosing the tutor role, complete your profile with credentials and availability, and start receiving student requests.",
  },
  {
    question: "How can I book a session?",
    answer:
      "Browse tutors, check their schedule, and book a time slot that fits your availability through your dashboard.",
  },
  {
    question: "How to cancel or reschedule a booking?",
    answer:
      "Go to the 'My Bookings' section to cancel or reschedule. Please make changes at least 24 hours in advance to avoid penalties.",
  },
  {
    question: "Is online coaching supported?",
    answer:
      "While TutorMitra focuses on offline coaching, many tutors offer hybrid sessions; check availability individually.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggleIndex = (idx: number) =>
    setOpenIndex(openIndex === idx ? null : idx);

  return (
    <main className="max-w-4xl mx-auto p-10 font-sans text-gray-900 dark:text-gray-100">
      <h1 className="text-5xl font-extrabold mb-10 text-center">
        Frequently Asked Questions
      </h1>
      <div className="space-y-6">
        {faqs.map(({ question, answer }, i) => (
          <section
            key={i}
            className="border border-yellow-400 rounded-xl shadow-md overflow-hidden"
          >
            <button
              className="w-full p-6 text-left font-semibold text-lg bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition focus:outline-none focus:ring-4 focus:ring-yellow-400 dark:focus:ring-yellow-700"
              onClick={() => toggleIndex(i)}
              aria-expanded={openIndex === i}
              aria-controls={`faq-panel-${i}`}
              id={`faq-header-${i}`}
            >
              {question}
            </button>
            <div
              id={`faq-panel-${i}`}
              aria-labelledby={`faq-header-${i}`}
              role="region"
              className={`bg-white dark:bg-gray-800 px-6 py-4 text-gray-800 dark:text-gray-300 text-base leading-relaxed transition-max-height duration-300 ${
                openIndex === i ? "max-h-screen" : "max-h-0 overflow-hidden"
              }`}
            >
              {answer}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
