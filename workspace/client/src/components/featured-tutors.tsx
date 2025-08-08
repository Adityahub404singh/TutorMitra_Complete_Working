import { useQuery } from "@tanstack/react-query";
import { type Tutor } from "@shared/schema";
import TutorCard from "./tutor-card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function FeaturedTutors() {
  const [, setLocation] = useLocation();
  const { data: tutors = [], isLoading } = useQuery<Tutor[]>({
    queryKey: ["/api/tutors/featured"],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Tutors</h2>
            <p className="text-lg text-gray-600">Meet our top-rated and most experienced tutors</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Tutors</h2>
          <p className="text-lg text-gray-600">Meet our top-rated and most experienced tutors</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline"
            onClick={() => setLocation("/tutors")}
            className="bg-white border border-gray-300 text-gray-700 px-8 py-3 font-medium hover:bg-gray-50"
          >
            View All Tutors
          </Button>
        </div>
      </div>
    </section>
  );
}
