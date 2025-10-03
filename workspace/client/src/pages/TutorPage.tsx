import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Star, Heart } from "lucide-react";

interface Tutor {
  id: string;
  name: string;
  avatar?: string;
  subjects?: string[];
  rating?: number;
}

interface TutorCardProps {
  tutor: Tutor;
}

export default function TutorCard({ tutor }: TutorCardProps) {
  const { id, name, avatar, subjects, rating } = tutor;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);

  // Animate entrance when scrolling into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if(entry.isIntersecting){
          setVisible(true);
          observer.disconnect();
        }
      }, { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Toggle favorite state
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigation
    setFavorited((fav) => !fav);
  };

  return (
    <Link
      to={`/tutor-profile/${id}`}
      ref={cardRef}
      className={`group block bg-white dark:bg-gray-900 rounded-3xl shadow-lg hover:shadow-xl transform transition-all duration-500 ease-in-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } focus:outline-none focus:ring-4 focus:ring-yellow-400 relative overflow-hidden`}
      aria-label={`View profile of ${name}`}
      tabIndex={0}
    >
      <button
        type="button"
        onClick={toggleFavorite}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        className="absolute top-3 right-3 z-20 p-1 rounded-full bg-white dark:bg-gray-800 shadow-md text-red-600 hover:text-red-800 transition"
      >
        {favorited ? (
          <Heart className="w-6 h-6 fill-current" />
        ) : (
          <Heart className="w-6 h-6 stroke-current" />
        )}
      </button>

      <div className="p-6 flex flex-col items-center text-center space-y-4">
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-yellow-400 shadow-md">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-full" />
          )}
          <img
            src={avatar || "https://via.placeholder.com/120"}
            alt={`${name}'s avatar`}
            className={`w-28 h-28 object-cover rounded-full transition-opacity duration-500 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-yellow-300 truncate max-w-full">
          {name}
        </h3>
        <div className="flex flex-wrap justify-center gap-2 max-w-full">
          {subjects && subjects.length > 0 ? (
            subjects.map((subj) => (
              <span
                key={subj}
                className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-200"
              >
                {subj}
              </span>
            ))
          ) : (
            <span className="text-xs italic text-gray-400 dark:text-gray-500">
              No subjects specified
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 text-yellow-500 font-semibold text-lg">
          <Star className="w-5 h-5" />
          <span>{rating?.toFixed(1) ?? "No ratings"}</span>
        </div>
      </div>
    </Link>
  );
}
