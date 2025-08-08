import { useQuery } from "@tanstack/react-query";
import { type Subject } from "@shared/schema";
import { useLocation } from "wouter";
import { Calculator, Atom, FlaskConical, BookOpen, Code, Languages } from "lucide-react";

const iconMap = {
  "fas fa-calculator": Calculator,
  "fas fa-atom": Atom,
  "fas fa-flask": FlaskConical,
  "fas fa-book": BookOpen,
  "fas fa-code": Code,
  "fas fa-language": Languages,
};

const colorMap = {
  blue: "bg-blue-100 group-hover:bg-blue-200 text-blue-600",
  green: "bg-green-100 group-hover:bg-green-200 text-green-600",
  purple: "bg-purple-100 group-hover:bg-purple-200 text-purple-600",
  red: "bg-red-100 group-hover:bg-red-200 text-red-600",
  yellow: "bg-yellow-100 group-hover:bg-yellow-200 text-yellow-600",
  indigo: "bg-indigo-100 group-hover:bg-indigo-200 text-indigo-600",
};

export default function SubjectCategories() {
  const [, setLocation] = useLocation();
  const { data: subjects = [], isLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const handleSubjectClick = (subjectName: string) => {
    setLocation(`/tutors?subject=${encodeURIComponent(subjectName)}`);
  };

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Subjects</h2>
            <p className="text-lg text-gray-600">Explore our most sought-after subjects</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 text-center animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Subjects</h2>
          <p className="text-lg text-gray-600">Explore our most sought-after subjects</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {subjects.map((subject) => {
            const IconComponent = iconMap[subject.icon as keyof typeof iconMap] || BookOpen;
            const colorClass = colorMap[subject.color as keyof typeof colorMap] || "bg-gray-100 text-gray-600";
            
            return (
              <div
                key={subject.id}
                onClick={() => handleSubjectClick(subject.name)}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow cursor-pointer group subject-card"
              >
                <div className={`w-16 h-16 ${colorClass} rounded-full flex items-center justify-center mx-auto mb-4 transition-colors`}>
                  <IconComponent className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {subject.tutorCount.toLocaleString()} tutors
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
