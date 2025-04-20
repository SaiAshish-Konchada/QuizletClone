import useEmblaCarousel from "embla-carousel-react";
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
import qrcode from "../src/assets/qrcode.png";
import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { v4 as uuidv4 } from "uuid";
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
} from "react-flow-renderer";
import dagre from "dagre";
import { useTimer } from "react-timer-hook";
const cards = [
  { title: "Learn", color: "#98e3ff", img: learn },
  { title: "Study Guides", color: "#eeaaff", img: study },
  { title: "FlashCards", color: "#483cdc", img: flashcards },
  { title: "Practice Tests", color: "#ffc48c", img: practice },
  { title: "Expert Solutions", color: "#9cf4d4", img: expert },
];

// --- Context & Provider -------------------------------------------------
const DashboardContext = createContext();
function DashboardProvider({ children }) {
  const [flashcards, setFlashcards] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [heatmap, setHeatmap] = useState(() =>
    JSON.parse(localStorage.getItem("heatmap") || "{}")
  );

  useEffect(() => {
    localStorage.setItem("heatmap", JSON.stringify(heatmap));
  }, [heatmap]);

  return (
    <DashboardContext.Provider
      value={{
        flashcards,
        setFlashcards,
        nodes,
        setNodes,
        edges,
        setEdges,
        heatmap,
        setHeatmap,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

// --- Auto‑layout with dagre ---------------------------------------------
const nodeWidth = 180;
const nodeHeight = 60;
function getLayoutedElements(nodes, edges, direction = "TB") {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction });

  nodes.forEach((n) =>
    g.setNode(n.id, { width: nodeWidth, height: nodeHeight })
  );
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return [
    nodes.map((n) => {
      const { x, y } = g.node(n.id);
      return {
        ...n,
        position: { x: x - nodeWidth / 2, y: y - nodeHeight / 2 },
        style: { width: nodeWidth, height: nodeHeight },
      };
    }),
    edges,
  ];
}

// --- Streaming Parser ---------------------------------------------------
function parseNotes(notes) {
  const lines = notes
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let currentTitleId = null;
  const nodes = [];
  const edges = [];
  const flashcards = [];
  let row = 0;

  const emojiSet = ["🧠", "📘", "💡", "🎯", "🚀", "🔍", "🛠️", "🌟"];
  const getEmoji = () => emojiSet[Math.floor(Math.random() * emojiSet.length)];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^Node Title:/i.test(line)) {
      const title = line.replace(/^Node Title:\s*/i, "").trim();
      currentTitleId = `node-${uuidv4()}`;
      nodes.push({
        id: currentTitleId,
        data: { label: `${getEmoji()} ${title}` },
        position: { x: 0, y: row * 100 },
      });
      row++;
    } else if (/^Node Description:/i.test(line) && currentTitleId) {
      const desc = line.replace(/^Node Description:\s*/i, "").trim();
      const descId = `desc-${uuidv4()}`;
      nodes.push({
        id: descId,
        data: { label: `${getEmoji()} ${desc}` },
        position: { x: 300, y: row * 100 },
      });
      edges.push({
        id: `e-${currentTitleId}-${descId}`,
        source: currentTitleId,
        target: descId,
      });
      row++;
    } else if (/^Question:/i.test(line)) {
      const question = line.replace(/^Question:\s*/i, "").trim();
      const qId = `q-${uuidv4()}`;
      const answerLine = lines[i + 1] || "";
      let answer = "";

      if (/^Answer:/i.test(answerLine)) {
        answer = answerLine.replace(/^Answer:\s*/i, "").trim();
        i++; // Skip next line since it’s the answer
      }

      nodes.push({
        id: qId,
        data: { label: `❓ ${question}` },
        position: { x: 600, y: row * 100 },
      });

      if (currentTitleId) {
        edges.push({
          id: `e-${currentTitleId}-${qId}`,
          source: currentTitleId,
          target: qId,
        });
      }

      flashcards.push({ id: qId, question, answer });
      row++;
    }
  }

  if (!nodes.length) {
    throw new Error(
      "No valid nodes found. Check if your notes include 'Node Title:' and 'Question:'."
    );
  }

  const [layoutedNodes, layoutedEdges] = getLayoutedElements(nodes, edges);
  return { flashcards, nodes: layoutedNodes, edges: layoutedEdges };
}

// --- Flashcard Generator & Example --------------------------------------
function FlashcardGenerator({ setIsGenerated }) {
  const { setFlashcards, setNodes, setEdges } = useContext(DashboardContext);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const exampleSets = [
    `Node Title: JavaScript Basics
Node Description: JS is a high-level, versatile language for the web.

Question: What is JavaScript?
Answer: A language for interactive web pages.

Question: Is JavaScript synchronous or asynchronous?
Answer: Single-threaded but can do async via callbacks, promises, async/await.

Node Title: Promises in JS
Node Description: A Promise represents the eventual result of an async operation.

Question: What is a Promise?
Answer: An object representing eventual completion or failure.

Question: How do you handle a rejected Promise?
Answer: By using .catch() or try/catch in async functions.
`,
    `Node Title: Python Basics
Node Description: Python is an interpreted, high-level programming language.

Question: What is Python?
Answer: Known for simplicity and readability.

Question: Key features?
Answer: Multi-paradigm, large standard library, easy to learn.

Node Title: Functions in Python
Node Description: Defined with \`def\`.

Question: How define a function?
Answer: \`def func_name():\`.

Question: Return values?
Answer: Yes, with \`return\`.
`,
    `Node Title: AWS Fundamentals
Node Description: AWS provides scalable cloud services.

Question: What is EC2?
Answer: Elastic Compute Cloud (virtual servers).

Question: What is S3?
Answer: Simple Storage Service.

Node Title: IAM in AWS
Node Description: Manage user access.

Question: What does IAM stand for?
Answer: Identity and Access Management.

Question: Why use IAM?
Answer: Securely control AWS access.
`,
  ];

  const handleExample = () => {
    const rand = exampleSets[Math.floor(Math.random() * exampleSets.length)];
    setNotes(rand);
    setError("");
  };
  const handleGenerate = () => {
    try {
      const { flashcards, nodes, edges } = parseNotes(notes);
      if (!flashcards.length) throw new Error("No Q/A pairs found.");
      setFlashcards(flashcards);
      setNodes(nodes);
      setIsGenerated(true);
      setEdges(edges);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section className="mb-6 p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-2xl font-semibold">
          Generate Flashcards &amp; Map
        </h3>
        <button
          onClick={handleExample}
          className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-black rounded text-sm"
        >
          Try Random Example
        </button>
      </div>
      <textarea
        className="w-full h-44 p-2 border rounded font-mono text-sm"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Paste your notes here..."
      />
      {error && (
        <div className="mt-2 text-red-700 bg-red-100 p-2 rounded text-sm">
          ⚠️ {error}
        </div>
      )}
      <button
        onClick={handleGenerate}
        className="mt-3 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
      >
        Generate
      </button>
    </section>
  );
}

// --- Pomodoro Timer ------------------------------------------------------
function PomodoroTimer() {
  const now = new Date();
  const expiry = new Date(now.getTime() + 25 * 60 * 1000);
  const { seconds, minutes, isRunning, start, pause, reset } = useTimer({
    expiryTimestamp: expiry,
    autoStart: false,
  });

  return (
    <section className="mb-6 p-4 bg-white rounded shadow">
      <h3 className="text-2xl font-semibold mb-2">Pomodoro Timer</h3>
      <div className="text-5xl font-bold mb-4">
        {`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0"
        )}`}
      </div>
      <div className="flex justify-center gap-4 flex-wrap">
        {!isRunning ? (
          <button
            onClick={start}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Start
          </button>
        ) : (
          <button
            onClick={pause}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Pause
          </button>
        )}
        <button
          onClick={reset}
          className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
        >
          Reset
        </button>
      </div>
    </section>
  );
}

// --- Flashcard Deck (with flip animation & reset) ----------------------
function FlashcardDeck() {
  const { flashcards, heatmap, setHeatmap } = useContext(DashboardContext);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!flashcards.length) {
    return <div className="text-gray-500">No flashcards generated.</div>;
  }

  const card = flashcards[idx];

  const handleResponse = (correct) => {
    setHeatmap((h) => {
      const prev = h[card.id] || { correct: 0, incorrect: 0, visits: 0 };
      return {
        ...h,
        [card.id]: {
          correct: prev.correct + (correct ? 1 : 0),
          incorrect: prev.incorrect + (correct ? 0 : 1),
          visits: prev.visits + 1,
        },
      };
    });
    setIdx((idx + 1) % flashcards.length);
    setFlipped(false);
  };

  return (
    <section className="mb-6 p-4 bg-white rounded shadow text-center">
      <h3 className="text-2xl font-semibold mb-4">Flashcard Viewer</h3>
      <div
        className="card w-full h-48 mx-auto cursor-pointer"
        onClick={() => setFlipped(!flipped)}
        title="Click to flip"
      >
        <div className={`card-inner ${flipped ? "flipped" : ""}`}>
          <div className="card-front flex items-center justify-center p-6 bg-gray-50 rounded-lg text-lg font-semibold text-gray-800">
            {card.question}
          </div>
          <div className="card-back flex items-center justify-center p-6 bg-yellow-100 rounded-lg text-lg font-semibold text-gray-900">
            {card.answer}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-4 flex-wrap">
        <button
          onClick={() => handleResponse(true)}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium"
        >
          Correct
        </button>
        <button
          onClick={() => handleResponse(false)}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium"
        >
          Incorrect
        </button>
        <button
          onClick={() => {
            setIdx(0);
            setFlipped(false);
            setHeatmap(() => {
              const reset = {};
              flashcards.forEach((card) => {
                reset[card.id] = { correct: 0, incorrect: 0, visits: 0 };
              });
              return reset;
            });
          }}
          className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded font-medium"
        >
          Reset Deck
        </button>
      </div>
    </section>
  );
}

// --- Concept Map ---------------------------------------------------------
function ConceptMap() {
  const { nodes, edges, setEdges } = useContext(DashboardContext);
  const onConnect = useCallback(
    (params) => setEdges((es) => addEdge(params, es)),
    [setEdges]
  );

  return (
    <section
      className="mb-6 p-4 bg-white rounded shadow"
      style={{ height: 450 }}
    >
      <h3 className="text-2xl font-semibold mb-2">Concept Map</h3>
      <ReactFlow nodes={nodes} edges={edges} onConnect={onConnect} fitView>
        <MiniMap />
        <Controls />
        <Background gap={16} color="#ddd" />
      </ReactFlow>
    </section>
  );
}

// --- Heatmap Viewer ------------------------------------------------------
function HeatmapViewer() {
  const { flashcards, heatmap } = useContext(DashboardContext);

  const getColorClass = (stats) => {
    if (stats.correct > stats.incorrect) return "bg-green-400 text-white";
    if (stats.incorrect > stats.correct) return "bg-red-400 text-white";
    if (stats.visits > 0) return "bg-yellow-400";
    return "bg-gray-200";
  };

  return (
    <section className="mb-6 p-4 bg-white rounded shadow">
      <h3 className="text-2xl font-semibold mb-2">Performance Heatmap</h3>
      {flashcards.length ? (
        <ul className="space-y-2 font-mono">
          {flashcards.map((c) => {
            const stats = heatmap[c.id] || {
              correct: 0,
              incorrect: 0,
              visits: 0,
            };
            return (
              <li
                key={c.id}
                className={`flex justify-between items-center px-3 py-2 rounded ${getColorClass(
                  stats
                )}`}
              >
                <span className="text-sm truncate">{c.question}</span>
                <span className="font-bold text-sm">
                  ✅ {stats.correct} &nbsp; ❌ {stats.incorrect}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-gray-500">No flashcards generated.</div>
      )}
    </section>
  );
}

// --- Unified Dashboard ---------------------------------------------------
function UnifiedStudyDashboard() {
  const [showInfo, setShowInfo] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  return (
    <DashboardProvider>
      <div className="p-6 min-h-screen">
        <div className="flex justify-between items-center mb-4 relative">
          <h1 className="text-3xl font-bold">
            New Feature - Unified Study Dashboard!
          </h1>

          <div className="relative inline-block text-left">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-xl bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 flex items-center justify-center"
              title="How to use"
            >
              ?
            </button>

            {showInfo && (
              <div className="absolute right-0 mt-2 w-80 p-4 bg-white border border-gray-300 shadow-xl rounded-lg text-sm text-gray-800 z-10 tooltip-bubble">
                <p>1. Use “Try Example” to load JS/Python/AWS sample notes.</p>
                <p>2. Click “Generate” to create flashcards & a concept map.</p>
                <p>3. Start the Pomodoro timer before you begin studying.</p>
                <p>4. Click flashcards to flip, mark as Correct/Incorrect.</p>
                <p>5. Track your performance in the heatmap below.</p>
                <p className="mt-2 italic text-blue-600">
                  Tip: You can use the template and paste your own notes!
                </p>
              </div>
            )}
          </div>
        </div>

        <FlashcardGenerator setIsGenerated={setIsGenerated} />

        {isGenerated && (
          <>
            <PomodoroTimer />
            <FlashcardDeck />
            <ConceptMap />
            <HeatmapViewer />
          </>
        )}
      </div>

      {/* Flip card CSS */}
      <style>{`
      .tooltip-bubble::before {
    content: "";
    position: absolute;
    top: 0.75rem;
    left: -0.5rem;
    border-width: 8px;
    border-style: solid;
    border-color: transparent white transparent transparent;}
    
  .card {
    perspective: 1000px;
    width: 100%;
    max-width: 500px;
    height: 200px;
    margin: 0 auto;
  }

  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;
  }

  .card-inner.flipped {
    transform: rotateX(180deg);
  }

  .card-front,
  .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  .card-back {
    transform: rotateX(180deg);
  }
`}</style>
    </DashboardProvider>
  );
}

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
          <section></section>
        </main>

        <footer className="px-4 md:px-6 lg:px-8 py-12">
          <div className="max-w-[1280px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {/* About Us */}
              <div>
                <h3 className="ml-[30px] font-bold text-[#282e3e] font-bold text-[16px] mb-4">
                  About us
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      to="#"
                      className="text-[#282e3e] ml-[30px] font-medium text-sm hover:text-[#423ed8]"
                    >
                      About Quizlet
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      className="text-[#282e3e] ml-[30px] font-medium text-sm hover:text-[#423ed8]"
                    >
                      How Quizlet works
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      className="text-[#282e3e] ml-[30px] font-medium text-sm hover:text-[#423ed8]"
                    >
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      className="text-[#282e3e] ml-[30px] font-medium text-sm hover:text-[#423ed8]"
                    >
                      Advertise with us
                    </Link>
                  </li>
                </ul>
              </div>

              {/* For Students */}
              <div>
                <h3 className="ml-[30px] font-bold text-[#282e3e] font-bold text-[16px] mb-4">
                  For students
                </h3>
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
                        className="text-[#282e3e] ml-[30px] font-medium text-sm hover:text-[#423ed8]"
                      >
                        {text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* For Teachers */}
              <div>
                <h3 className="ml-[30px] font-bold text-[#282e3e] font-bold text-[16px] mb-4">
                  For teachers
                </h3>
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
                        className="text-[#282e3e] ml-[30px] font-medium text-sm hover:text-[#423ed8]"
                      >
                        {text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="ml-[30px] font-bold text-[#282e3e] font-bold text-[16px] mb-4">
                  Resources
                </h3>
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
                        className="text-[#282e3e] ml-[30px] font-medium text-sm hover:text-[#423ed8]"
                      >
                        {text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Language + QR */}
              <div>
                <h3 className="ml-[30px] font-bold text-[#282e3e] font-bold text-[16px] mb-4">
                  Language
                </h3>
                <div className="flex items-center gap-2 mb-8">
                  <div className="text-[#282e3e] ml-[30px] font-medium text-sm hover:text-[#423ed8]">
                    English (USA)
                  </div>
                  <ChevronDown className="h-4 w-4 text-[#282e3e] ml-[30px] font-medium text-sm hover:text-[#423ed8]" />
                </div>
                <div className="bg-white p-[5px] ml-[30px] rounded-lg shadow-sm inline-block">
                  <img
                    src={qrcode}
                    alt="QR Code"
                    width={100}
                    height={100}
                    className="w-25 h-30"
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
}

export default App;
