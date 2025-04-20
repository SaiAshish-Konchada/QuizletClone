import React, { useCallback, useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import UnifiedStudyDashboard from "./UnifiedStudyDashboard";
import { Link } from "react-router-dom";
import {
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import quizletLogo from "../src/assets/quizletlogoheader.png";
import searchicon from "../src/assets/image.png";
import learn from "../src/assets/learn.png";
import practice from "../src/assets/practice.png";
import study from "../src/assets/study.png";
import expert from "../src/assets/expert.png";
import flashcards from "../src/assets/flashcards.png";
import worldmap from "../src/assets/worldmap.png";
import applelogo from "../src/assets/download-on-the-app-store-apple-logo.svg";
import googleplaylogo from "../src/assets/google-play-badge-logo.svg";
import biology from "../src/assets/biology.png";
import testprep from "../src/assets/testprep.png";
import teacher from "../src/assets/teacher.png";
import qrcode from "../src/assets/qrcode.png"
const cards = [
  { title: "Learn", color: "#98e3ff", img: learn },
  { title: "Study Guides", color: "#eeaaff", img: study },
  { title: "FlashCards", color: "#483cdc", img: flashcards },
  { title: "Practice Tests", color: "#ffc48c", img: practice },
  { title: "Expert Solutions", color: "#9cf4d4", img: expert },
];

function App() {
  const placeholderTexts = [
    "Find It faster with a search",
    "Search for a question",
    "Search for practice tests",
    "Flashcard sets, textbooks, questions",
    "Search for flashcards",
  ];
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    setPlaceholder(
      placeholderTexts[Math.floor(Math.random() * placeholderTexts.length)]
    );
  }, []);

  const [viewportRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: true,
    speed: 10, // tweak between ~5–15
    align: "start",
    containScroll: "keepSnaps",
  });

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 md:px-6 lg:px-8 h-16 flex items-center bg-white fixed top-0 left-0 w-full z-50">
        <div className="max-w-[1280px] w-full mx-auto flex items-center justify-start">
          {/* Align to start horizontally */}
          <div className="flex items-center gap-6 ml-[-9px]">
            {/* Remove any margin to move the logo left */}
            <Link to="/" className="flex items-center">
              <img
                src={quizletLogo}
                alt="Quizlet Logo"
                className="h-[54px] w-auto"
              />
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <button className="flex items-center mt-1 mr-3 font-medium text-black-700 text-[13px] px-1.5 py-0.5 hover:bg-gray-100 rounded">
                Study tools
                <ChevronDown className="ml-2 mb-[2px] h-4 w-4" />
              </button>
              <button className="flex items-center mt-1 ml-[8px] font-medium text-black-700 text-[13px] px-1.5 py-0.5 hover:bg-gray-100 rounded">
                Subjects
                <ChevronDown className="ml-2 mb-[2px] h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 ml-9">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <img
                  src={searchicon}
                  alt="Search Icon"
                  className="h-[26px] w-[26px] ml-3"
                />
              </div>
              <input
                type="text"
                placeholder={placeholder}
                className="focus:bg-white ml-4 w-[610px] bg-[#f6f7fb] text-[15px] text-[#939bb4] font-semibold border border-transparent rounded-md pt-1 h-[40px] pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#a8b1ff] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Added gap between buttons */}
            <button className="hidden text-sm md:flex items-center text-[#4255ff] font-semibold text-[14px]">
              <Plus
                className="mr-[6px] h-[18px] w-5"
                style={{ strokeWidth: 1.5 }}
              />
              Create
            </button>
            <button className="h-10 ml-3 bg-[#4255ff] text-white font-bold py-1.5 px-4 rounded-full hover:bg-[#3a4ce0] text-[14px]">
              Log in
            </button>
          </div>
        </div>
      </header>
      <div className="pt-16">
        {/* This is to ensure content does not get hidden under the fixed header */}
        <main className="flex-grow">
          <section className="py-12 text-center px-4">
            <h1 className="text-[42px] font-bold mt-[15px] mb-4">
              How do you want to study?
            </h1>
            <p className="text-[19px] mt-[-4px] max-w-[800px] mx-auto mb-8">
              Master whatever you're learning with Quizlet's interactive
              flashcards, practice tests, and study activities.
            </p>
            <div className="flex flex-col items-center gap-4">
              <button className="ml-[-15px] h-[48px] bg-[#4255ff] text-white font-bold mt-[-17px] py-3 px-6 rounded-full hover:bg-[#3a4ce0] text-[15px]">
                Sign up for free
              </button>
              <Link
                to="#"
                className="ml-[-15px] text-[#4255ff] mt-[14px] text-[15px] font-semibold hover:underline"
              >
                I'm a teacher
              </Link>
            </div>
          </section>

          <section className="mt-[-35px] mb-[80px] px-4 md:px-6 lg:px-8 mb-16">
            <div className="max-w-[1280px] mx-auto relative">
              {/* Embla viewport */}
              <div className="overflow-hidden" ref={viewportRef}>
                {/* Flex container with uniform spacing */}
                <div className="flex space-x-8 px-4">
                  {cards.map(({ title, color, img }, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 w-[300px] h-[380px] mt-[50px] rounded-2xl"
                      style={{ backgroundColor: color }}
                    >
                      <div className="py-6 px-8">
                        <h2 className="text-2xl font-bold">{title}</h2>
                      </div>
                      <img
                        src={img}
                        alt={title}
                        className="object-cover w-full h-[300px] rounded-b-2xl"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Left Button */}
              {/* Left Button */}
              <button
                className="mt-[20px] absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-4 rounded-full shadow-lg border hover:bg-[#edeff4] transition duration-200"
                onClick={scrollPrev}
                style={{ borderColor: "#d9dde8" }}
              >
                <ChevronLeft className="w-7 h-7 text-[#586380]" />
              </button>

              {/* Right Button */}
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-4 rounded-full shadow-lg border hover:bg-[#edeff4] transition duration-200"
                onClick={scrollNext}
                style={{ borderColor: "#d9dde8" }}
              >
                <ChevronRight className="w-7 h-7 text-[#586380]" />
              </button>
            </div>
          </section>

          <section className="bg-white h-[1390px] px-4 md:px-6 lg:px-8 py-16">
            <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="ml-2 mt-4 pl-28 text-[#282e3e] text-4xl md:text-3xl font-bold mb-6">
                  Every class, every test, one ultimate study app
                </h2>
                <p className="ml-2 mt-[55px] w-[530px] pl-28 text-lg text-[#28364c]">
                  Create your own flashcards or find sets made by teachers,
                  students, and experts. Study them anytime, anywhere with our
                  free app.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="#"
                    className="flex items-center justify-center mt[-80px] ml-[120px]"
                  >
                    <img
                      src={applelogo}
                      alt="Download on the App Store"
                      width={140}
                      height={100}
                      className="h-[130px] w-auto"
                    />
                  </a>
                  <a href="#" className="flex items-center justify-center">
                    <img
                      src={googleplaylogo}
                      alt="Get it on Google Play"
                      width={140}
                      height={120}
                      className="h-[130px] w-auto"
                    />
                  </a>
                </div>
              </div>
              <div className="mt-[-17px]">
                <img
                  src={worldmap}
                  alt="Quizlet app preview"
                  width={468}
                  height={397}
                  className="w-400 h-auto"
                />
              </div>
            </div>

            <section className="px-4 md:px-6 lg:px-8 py-16">
              <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="ml-[85px] mt-6 order-2 md:order-1">
                  <img
                    src={biology}
                    alt="Study guide example"
                    width={500}
                    height={400}
                    className="w-300 h-auto"
                  />
                </div>
                <div className="order-1 md:order-2">
                  <h2 className="mt-[25px] ml-12 text-[#282e3e] w-[400px] text-3xl md:text-3xl font-bold mb-6">
                    Make class material instantly studiable
                  </h2>
                  <p className="ml-12 mt-[50px] w-[400px] text-[#282e42] text-[18px]  mb-8">
                    Turn your slides, videos, and notes into flashcard sets,
                    practice tests, and study guides.
                  </p>
                  <button className="h-[70px] ml-12 mt-[10px] bg-[#4255ff] text-white font-bold py-3 px-8 rounded-full hover:bg-[#3a4ce0]">
                    Try it out
                  </button>
                </div>
              </div>
            </section>

            <section className="px-4 md:px-6 lg:px-8 py-16">
              <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="ml-[85px] mt-[-20px] text-[#282e3e] text-2xl md:text-3xl font-bold mb-6">
                    Test prep for any subject
                  </h2>
                  <p className="ml-[85px] mt-[50px] w-[400px] text-[#2a2e52] text-lg mb-8">
                    Memorize anything with personalized practice tests and study
                    sessions in Learn. 98% of students say Quizlet has improved
                    their understanding.
                  </p>
                  <button className="ml-[85px] mt-[20px] h-[65px]  bg-[#4255ff] text-white font-bold py-3 px-8 rounded-full hover:bg-[#3a4ce0]">
                    Get started
                  </button>
                </div>
                <div className="mt-[-25px]">
                  {" "}
                  <img
                    src={testprep}
                    alt="Test Prep"
                    width={468}
                    height={397}
                    className="w-400 h-auto"
                  />
                </div>
              </div>
            </section>
          </section>

          <section className="px-4 md:px-6 lg:px-8 py-16 bg-[#dbdfff]">
            <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="ml-[120px] mt-[-10px] text-[#282e3e] text-[20px] font-bold mb-2">
                  TEACHERS
                </div>
                <h2 className="ml-[120px] mt-[-5px] text-2xl md:text-3xl text-[#282e3e]  font-bold mb-6">
                  Empower your students
                </h2>
                <p className="ml-[120px] mt-[50px] text-[#282e3e] w-[400px] text-lg mb-8">
                  Help every student confidently learn anything. With free
                  flashcard sets, study modes, and in-class games like Quizlet
                  Live, you can instantly create a more engaged classroom.
                </p>
                <div className="ml-[120px] mt-[-10px] flex flex-col gap-4">
                  <button className="mt-[20px] w-[220px] text-[15px] h-[60px] bg-[#4255ff] text-white font-bold py-3 px-8 rounded-full hover:bg-[#3a4ce0]">
                    Sign up as a teacher
                  </button>
                  <a
                    href="#"
                    className="w-[300px] mt-[20px] text-[#4255ff] font-bold hover:text-[#3a4ce0] text-[18px]"
                  >
                    See how teachers use Quizlet
                  </a>
                </div>
              </div>
              <div>
                <img
                  src={teacher}
                  alt="Teacher"
                  width={450}
                  height={450}
                  className="w-600 h-600 rounded-lg"
                />
              </div>
            </div>
          </section>
          <UnifiedStudyDashboard></UnifiedStudyDashboard>
<section>
</section>
        </main>

        <footer className="px-4 md:px-6 lg:px-8 py-12 border-t border-gray-200">
          <div className="max-w-[1280px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {/* About Us */}
              <div>
                <h3 className="font-bold text-[#282e3e] font-bold text-base text-lg mb-4">About us</h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="#" className="text-[#282e3e] font-medium text-sm hover:text-[#423ed8] hover:text-gray-900">
                      About Quizlet
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="text-[#282e3e] font-medium text-sm hover:text-[#423ed8] hover:text-gray-900">
                      How Quizlet works
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="text-[#282e3e] font-medium text-sm hover:text-[#423ed8] hover:text-gray-900">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="text-[#282e3e] font-medium text-sm hover:text-[#423ed8] hover:text-gray-900">
                      Advertise with us
                    </Link>
                  </li>
                </ul>
              </div>

              {/* For Students */}
              <div>
                <h3 className="font-bold text-base text-lg mb-4">For students</h3>
                <ul className="space-y-3">
                  {[
                    "Flashcards",
                    "Test",
                    "Learn",
                    "Solutions",
                    "Modern Learning Lab",
                    "Quizlet Plus",
                    "Study Guides",
                    "Pomodoro timer",
                  ].map((text) => (
                    <li key={text}>
                      <Link
                        to="#"
                        className="text-[#282e3e] font-medium text-sm hover:text-[#423ed8] hover:text-gray-900"
                      >
                        {text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* For Teachers */}
              <div>
                <h3 className="font-bold text-base text-lg mb-4">For teachers</h3>
                <ul className="space-y-3">
                  {[
                    "Live",
                    "Blog",
                    "Be the Change",
                    "Quizlet Plus for teachers",
                  ].map((text) => (
                    <li key={text}>
                      <Link
                        to="#"
                        className="text-[#282e3e] font-medium text-sm hover:text-[#423ed8] hover:text-gray-900"
                      >
                        {text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="font-bold text-base text-lg mb-4">Resources</h3>
                <ul className="space-y-3">
                  {[
                    "Help center",
                    "Sign up",
                    "Honor code",
                    "Community guidelines",
                    "Privacy",
                    "Terms",
                    "Ad and Cookie Policy",
                    "Quizlet for Schools",
                    "Parents",
                  ].map((text) => (
                    <li key={text}>
                      <Link
                        to="#"
                        className="text-[#282e3e] font-medium text-sm hover:text-[#423ed8] hover:text-gray-900"
                      >
                        {text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Language + QR */}
              <div>
                <h3 className="font-bold text-base text-lg mb-4">Language</h3>
                <div className="flex items-center gap-2 mb-8">
                  <div className="text-[#282e3e] font-medium text-sm hover:text-[#423ed8]">English (USA)</div>
                  <ChevronDown className="h-4 w-4 text-[#282e3e] font-medium text-sm hover:text-[#423ed8]" />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm inline-block">
                  <img
                    src={qrcode} 
                    alt="QR Code"
                    width={120}
                    height={120}
                    className="w-full h-auto"
                  />
                  <div className="text-center mt-2 text-sm font-medium">
                    Get the app
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );

  //           {/* Countries */}
  //           <div className="mt-12 pt-8 border-t border-gray-200">
  //             <h3 className="font-medium text-lg mb-4">Country</h3>
  //             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-y-3">
  //               {[
  //                 "United States",
  //                 "Canada",
  //                 "United Kingdom",
  //                 "Australia",
  //                 "New Zealand",
  //                 "Germany",
  //                 "France",
  //                 "Spain",
  //                 "Italy",
  //                 "Japan",
  //                 "South Korea",
  //                 "India",
  //                 "China",
  //                 "Mexico",
  //               ].map((country) => (
  //                 <Link
  //                   key={country}
  //                   to="#"
  //                   className="text-[#282e3e] font-medium text-sm hover:text-[#423ed8] hover:text-gray-900"
  //                 >
  //                   {country}
  //                 </Link>
  //               ))}
  //             </div>
  //             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-y-3 mt-4">
  //               {[
  //                 "Sweden",
  //                 "Netherlands",
  //                 "Switzerland",
  //                 "Brazil",
  //                 "Poland",
  //                 "Turkey",
  //                 "Ukraine",
  //                 "Taiwan",
  //                 "Vietnam",
  //                 "Indonesia",
  //                 "Philippines",
  //                 "Russia",
  //               ].map((country) => (
  //                 <Link
  //                   key={country}
  //                   to="#"
  //                   className="text-[#282e3e] font-medium text-sm hover:text-[#423ed8] hover:text-gray-900"
  //                 >
  //                   {country}
  //                 </Link>
  //               ))}
  //             </div>
  //           </div>

  //     </div>
}

export default App;
