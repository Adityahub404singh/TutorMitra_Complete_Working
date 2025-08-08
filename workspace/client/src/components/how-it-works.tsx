export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Search & Browse",
      description: "Find tutors by subject, experience level, and availability. Browse profiles and read reviews from other students.",
      color: "bg-primary text-white",
    },
    {
      number: "2",
      title: "Book a Session",
      description: "Schedule a session that fits your calendar. Choose between online or in-person tutoring based on your preference.",
      color: "bg-green-500 text-white",
    },
    {
      number: "3",
      title: "Start Learning",
      description: "Connect with your tutor and begin your personalized learning journey. Track progress and book follow-up sessions.",
      color: "bg-yellow-500 text-white",
    },
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How TutorMitra Works</h2>
          <p className="text-lg text-gray-600">Get started in just 3 simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <span className="text-2xl font-bold">{step.number}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
