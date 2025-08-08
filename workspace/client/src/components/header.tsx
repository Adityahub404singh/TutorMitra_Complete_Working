import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();
  const isMobile = useIsMobile();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/tutors?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
              <GraduationCap className="text-primary text-2xl mr-2" />
              <span className="font-bold text-xl text-gray-900">TutorMitra</span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          {!isMobile && (
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 h-4 w-4 top-1/2 transform -translate-y-1/2 left-3" />
                <Input
                  type="text"
                  placeholder="Search subjects, tutors, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </form>
            </div>
          )}

          {/* Navigation - Desktop */}
          {!isMobile && (
            <nav className="flex items-center space-x-8">
              <Link 
                href="/tutors" 
                className={`font-medium transition-colors ${
                  location === '/tutors' 
                    ? 'text-primary' 
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                Find Tutors
              </Link>
              <a 
                href="#" 
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                Become a Tutor
              </a>
              <a 
                href="#" 
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                How it Works
              </a>
            </nav>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {!isMobile && (
              <>
                <Button variant="ghost" className="text-gray-700 hover:text-primary font-medium">
                  Sign In
                </Button>
                <Button className="bg-primary text-white font-medium hover:bg-primary/90">
                  Get Started
                </Button>
              </>
            )}
            
            {/* Mobile menu button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && isMenuOpen && (
          <div className="border-t border-gray-200 py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search subjects, tutors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
            </form>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link 
                href="/tutors" 
                className="block py-2 text-gray-700 hover:text-primary font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Tutors
              </Link>
              <a 
                href="#" 
                className="block py-2 text-gray-700 hover:text-primary font-medium"
              >
                Become a Tutor
              </a>
              <a 
                href="#" 
                className="block py-2 text-gray-700 hover:text-primary font-medium"
              >
                How it Works
              </a>
            </nav>

            {/* Mobile Actions */}
            <div className="flex space-x-4 pt-4 border-t border-gray-200">
              <Button variant="outline" className="flex-1">
                Sign In
              </Button>
              <Button className="flex-1 bg-primary text-white hover:bg-primary/90">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
