import React from "react";

interface Props {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const PageTemplate: React.FC<Props> = ({ title, description, children }) => (
  <main className="max-w-5xl mx-auto p-8 my-12 bg-white dark:bg-gray-900 rounded-lg shadow-lg transition-colors">
    <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-yellow-300">{title}</h1>
    {description && <p className="text-lg text-gray-700 dark:text-yellow-400 mb-8">{description}</p>}
    {children}
  </main>
);

export default PageTemplate;
