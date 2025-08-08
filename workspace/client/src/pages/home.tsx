import Header from "../components/header";
import Hero from "../components/hero";
import SubjectCategories from "../components/subject-categories";
import FeaturedTutors from "../components/featured-tutors";
import HowItWorks from "../components/how-it-works";
import Footer from "../components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <SubjectCategories />
      <FeaturedTutors />
      <HowItWorks />
      <Footer />
    </div>
  );
}
