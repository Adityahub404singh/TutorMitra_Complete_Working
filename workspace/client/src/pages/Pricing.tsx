import React from "react";
import PageTemplate from "./PageTemplate";

const Pricing: React.FC = () => (
  <PageTemplate
    title="Pricing"
    description="Pricing depends on individual tutors. Rates are transparent and reasonable."
  >
    <div className="max-w-3xl mx-auto space-y-6">
      <p className="text-lg text-gray-700 dark:text-yellow-400">
        Each tutor sets their own hourly rate based on expertise and experience. Typical fees range from ₹300 to ₹1500 per hour.
      </p>
      <p className="text-lg text-gray-700 dark:text-yellow-400">
        You can view the fee details on each tutor’s profile before booking a session.
      </p>
      <p className="text-lg text-gray-700 dark:text-yellow-400">
        We ensure secure payment processing and transparent billing.
      </p>
    </div>
  </PageTemplate>
);

export default Pricing;
