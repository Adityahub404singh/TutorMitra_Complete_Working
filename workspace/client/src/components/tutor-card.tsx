import { Star, MapPin, Video, Users, Clock, Award, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import type { Tutor } from "../types/tutor"; 

interface TutorCardProps {
  tutor: Tutor;
  onBook?: (tutor: Tutor) => void;
}

export default function TutorCard({ tutor, onBook }: TutorCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={tutor.imageUrl || "https://randomuser.me/api/portraits/men/1.jpg"}
            alt={tutor.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-2xl"
          />
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Badge className="bg-green-500 text-white font-bold px-3 py-1">
              ₹{tutor.hourlyRate}/hr
            </Badge>
            {tutor.isVerified && (
              <Badge className="bg-blue-500 text-white font-semibold flex gap-1 items-center">
                <ShieldCheck className="w-3 h-3" /> Verified
              </Badge>
            )}
          </div>
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-full px-3 py-1 flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="font-bold text-sm">{tutor.rating?.toFixed(1) || "4.8"}</span>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-xl font-bold text-gray-900">{tutor.name}</h3>
            {tutor.experience && (
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {tutor.experience} Exp
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{tutor.location}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {tutor.subjects?.map(subject => (
              <Badge 
                key={subject} 
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                variant="secondary"
              >
                {subject}
              </Badge>
            ))}
          </div>
          <div className="flex gap-5 mb-4">
            {tutor.sessionTypes?.includes("online") && (
              <div className="flex items-center gap-1">
                <Video className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-gray-700">Online Classes</span>
              </div>
            )}
            {tutor.sessionTypes?.includes("offline") && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-gray-700">Offline Classes</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{tutor.bio}</p>
          <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Avail. {tutor.availability?.timeSlots?.length || 4} slots</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>{tutor.totalSessions || 50}+ sessions</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => navigate(`/tutors/${tutor.id}`)}
            >
              View Profile
            </Button>
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              onClick={() => onBook ? onBook(tutor) : navigate(`/book/${tutor.id}`)}
            >
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
