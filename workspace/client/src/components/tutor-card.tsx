import { useState } from "react";
import { type Tutor } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import BookingModal from "./booking-modal";

interface TutorCardProps {
  tutor: Tutor;
}

export default function TutorCard({ tutor }: TutorCardProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <>
      <Card className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden tutor-card">
        <img 
          src={tutor.imageUrl} 
          alt={`${tutor.name} profile photo`}
          className="w-full h-48 object-cover"
        />
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{tutor.name}</h3>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">{tutor.rating}</span>
            </div>
          </div>
          <p className="text-gray-600 mb-3">{tutor.subjects.join(" • ")}</p>
          <p className="text-sm text-gray-500 mb-4">{tutor.experience}</p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary">₹{tutor.hourlyRate}</span>
              <span className="text-gray-500">/hour</span>
            </div>
            <Button 
              onClick={() => setIsBookingOpen(true)}
              className="bg-primary text-white font-medium hover:bg-primary/90"
            >
              Book Session
            </Button>
          </div>
        </CardContent>
      </Card>

      <BookingModal 
        tutor={tutor}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </>
  );
}
