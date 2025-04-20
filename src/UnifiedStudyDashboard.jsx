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
export default function UnifiedStudyDashboard() {
  const [showInfo, setShowInfo] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  return (
    <DashboardProvider>
      <div className="p-6 bg-gray-100 min-h-screen">
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
