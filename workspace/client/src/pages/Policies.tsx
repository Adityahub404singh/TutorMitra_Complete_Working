import React from "react";

export default function Policies() {
  return (
    <main className="max-w-4xl mx-auto p-10 font-sans text-gray-900 dark:text-gray-100 space-y-10">
      <h1 className="text-5xl font-extrabold text-center mb-8">Policies</h1>

      <section className="space-y-4">
        <h2 className="text-3xl font-bold border-b border-yellow-400 pb-2">
          Privacy Policy
        </h2>
        <p className="text-gray-800 dark:text-gray-300 leading-relaxed">
          At TutorMitra, your privacy is paramount. We protect your personal data
          and use it only to improve your tutoring experience. This policy outlines
          what information we collect, how it is stored securely, and how we use it.
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-400 space-y-2">
          <li>We collect minimal personal information such as your name and email.</li>
          <li>Data is encrypted and stored securely following best industry practices.</li>
          <li>Your information is never sold or shared without explicit consent.</li>
          <li>Cookies are used only to enhance functionality and user experience.</li>
          <li>You have right to access or delete your data by contacting support.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-bold border-b border-yellow-400 pb-2">
          Terms & Conditions
        </h2>
        <p className="text-gray-800 dark:text-gray-300 leading-relaxed">
          By using TutorMitra, you agree to comply with our platform rules and policies:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-400 space-y-2">
          <li>Provide accurate and truthful information during sign-up.</li>
          <li>Treat all tutors and students respectfully and professionally.</li>
          <li>Payments and refunds shall follow the platform’s payment policy.</li>
          <li>Disputes are to be resolved through the support channels.</li>
          <li>We may update these terms at any time. Continued use implies acceptance.</li>
        </ul>
      </section>
    </main>
  );
}
