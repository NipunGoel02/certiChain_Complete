/** -------------- COMPLETE FINAL Quiz.jsx ---------------- */

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

// Mediapipe imports (NO window.FaceMesh errors)
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

const Quiz = () => {
  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const { courseId } = useParams();
  const navigate = useNavigate();

  // QUIZ STATES (Your original)
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 min
  const [courseName, setCourseName] = useState("");
  const [user, setUser] = useState(null);
  const [markingCompleted, setMarkingCompleted] = useState(false);
  const [cheatWarning, setCheatWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const timerRef = useRef(null);

  // FACE/VOICE TRACKING refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const cheatStats = useRef({
    noFaceSeconds: 0,
    noFaceTotal: 0,
    longestNoFace: 0,
    noFaceSessions: 0,

    multiFaceCurrent: 0,
    multiFaceTotal: 0,

    speaking: false,

    headPoseAvg: 0,
    headPoseMax: 0,

    eyeGazeAvg: 0,
    eyeGazeMax: 0,

    microMoveAvg: 0,
    microMoveMax: 0,

    focusLost: 0,
  });

  // Question time tracking
  const timeSpentPerQuestion = useRef([]);
  const answerChangesPerQuestion = useRef([]);
  const lastQuestionViewTime = useRef(Date.now());

  // ---------------- FETCH USER --------------------
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch {}
    };
    loadUser();
  }, []);

  // ---------------- FETCH QUIZ QUESTIONS --------------------
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_BASE_URL}/api/courses/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (
          !res.data.quizQuestions ||
          res.data.quizQuestions.length === 0
        ) {
          setError("This course does not have any quiz questions yet.");
        } else {
          setQuestions(res.data.quizQuestions);
          setAnswers(
            new Array(res.data.quizQuestions.length).fill(null)
          );
          timeSpentPerQuestion.current = new Array(
            res.data.quizQuestions.length
          ).fill(0);
          answerChangesPerQuestion.current = new Array(
            res.data.quizQuestions.length
          ).fill(0);
        }

        setCourseName(res.data.title);
        setLoading(false);
      } catch (e) {
        console.log(e);
        setError("Failed to load quiz");
        setLoading(false);
      }
    };
    loadQuiz();
  }, []);

  // ---------------- TIMER LOGIC --------------------
  useEffect(() => {
    if (
      !loading &&
      !error &&
      questions.length > 0 &&
      !quizComplete
    ) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleQuizComplete();
            return 0;
          }

          const now = Date.now();
          const diff =
            (now - lastQuestionViewTime.current) / 1000;
          timeSpentPerQuestion.current[currentQuestion] += diff;

          lastQuestionViewTime.current = now;

          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [loading, error, questions, quizComplete, currentQuestion]);

  // ---------------- TAB SWITCH CHEAT --------------------
  useEffect(() => {
    const blur = () => {
      cheatStats.current.focusLost++;
      setTabSwitchCount((c) => c + 1);
    };
    window.addEventListener("blur", blur);
    return () => window.removeEventListener("blur", blur);
  }, []);

  // ---------------- CAMERA + FACEMESH + AUDIO --------------------
  useEffect(() => {
    let stream;
    let facemesh;
    let camera;
    let lastFaceTime = Date.now();
    let noFaceSessionActive = false;
    let analyser;
    let audioCtx;

    let headArr = [],
      eyeArr = [],
      microArr = [];
    let lastLandmarks = null;

    let canceled = false;

    async function start() {
      try {
        // 1. Get camera + mic
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 720, height: 540 },
          audio: true,
        });

        if (canceled) return;

        videoRef.current.srcObject = stream;

        // Wait until video is ready
        await new Promise((resolve) => {
          if (videoRef.current.readyState >= 2) return resolve();
          const loaded = () => {
            videoRef.current.removeEventListener(
              "loadedmetadata",
              loaded
            );
            resolve();
          };
          videoRef.current.addEventListener(
            "loadedmetadata",
            loaded
          );
        });

        try {
          await videoRef.current.play();
        } catch (err) {
          if (err?.name !== "AbortError")
            console.error("Video play error:", err);
        }

        canvasRef.current.width =
          videoRef.current.videoWidth || 720;
        canvasRef.current.height =
          videoRef.current.videoHeight || 540;

        // AUDIO ANALYSER
        audioCtx = new AudioContext();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        const src = audioCtx.createMediaStreamSource(stream);
        src.connect(analyser);

        // 2. FaceMesh INIT
        facemesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`,
        });

        facemesh.setOptions({
          maxNumFaces: 5,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        facemesh.onResults((results) => {
          const ctx = canvasRef.current.getContext("2d");
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );

          const faces = results.multiFaceLandmarks || [];

          if (faces.length > 0) {
            const face = faces[0];

            lastFaceTime = Date.now();
            cheatStats.current.noFaceSeconds = 0;
            noFaceSessionActive = false;

            // MULTI FACE
            cheatStats.current.multiFaceCurrent =
              Math.max(0, faces.length - 1);
            if (faces.length > 1)
              cheatStats.current.multiFaceTotal++;

            // HEAD POSE
            const L = face[33],
              R = face[263];
            const tilt = Math.abs(L.y - R.y);
            headArr.push(tilt);
            cheatStats.current.headPoseAvg =
              headArr.reduce((a, b) => a + b, 0) /
              headArr.length;
            cheatStats.current.headPoseMax = Math.max(
              ...headArr
            );

            // EYE GAZE
            const L1 = face[33],
              L2 = face[133],
              R1 = face[362],
              R2 = face[263];
            const lx = (L1.x + L2.x) / 2;
            const rx = (R1.x + R2.x) / 2;
            const gaze = Math.abs(lx - rx);
            eyeArr.push(gaze);
            cheatStats.current.eyeGazeAvg =
              eyeArr.reduce((a, b) => a + b, 0) /
              eyeArr.length;
            cheatStats.current.eyeGazeMax = Math.max(
              ...eyeArr
            );

            // MICRO MOVEMENT
            if (!lastLandmarks) lastLandmarks = face;
            let sum = 0;
            for (let i = 0; i < face.length; i++) {
              const dx =
                (face[i].x - lastLandmarks[i].x) *
                canvasRef.current.width;
              const dy =
                (face[i].y - lastLandmarks[i].y) *
                canvasRef.current.height;
              sum += Math.sqrt(dx * dx + dy * dy);
            }
            const micro = sum / face.length;
            microArr.push(micro);
            cheatStats.current.microMoveAvg =
              microArr.reduce((a, b) => a + b, 0) /
              microArr.length;
            cheatStats.current.microMoveMax = Math.max(
              ...microArr
            );

            lastLandmarks =
              face.map((p) => ({
                x: p.x,
                y: p.y,
              })) || face;

            // DRAW FACE BOX
            const xs = face.map(
              (p) => p.x * canvasRef.current.width
            );
            const ys = face.map(
              (p) => p.y * canvasRef.current.height
            );
            ctx.strokeStyle = "lime";
            ctx.lineWidth = 2;
            ctx.strokeRect(
              Math.min(...xs),
              Math.min(...ys),
              Math.max(...xs) - Math.min(...xs),
              Math.max(...ys) - Math.min(...ys)
            );
          } else {
            // NO FACE
            const diff = (Date.now() - lastFaceTime) / 1000;
            if (diff >= 1) {
              cheatStats.current.noFaceSeconds =
                Math.floor(diff);
              cheatStats.current.noFaceTotal++;

              if (!noFaceSessionActive) {
                cheatStats.current.noFaceSessions++;
                noFaceSessionActive = true;
              }

              if (
                cheatStats.current.noFaceSeconds >
                cheatStats.current.longestNoFace
              ) {
                cheatStats.current.longestNoFace =
                  cheatStats.current.noFaceSeconds;
              }
            }
          }
        });

        // 3. CAMERA helper loop
        camera = new Camera(videoRef.current, {
          onFrame: async () => {
            await facemesh.send({ image: videoRef.current });
          },
          width: canvasRef.current.width,
          height: canvasRef.current.height,
        });

        camera.start();

        // AUDIO LOOP
        const audioLoop = () => {
          if (!analyser) return;
          const data = new Uint8Array(
            analyser.frequencyBinCount
          );
          analyser.getByteFrequencyData(data);
          const avg =
            data.reduce((a, b) => a + b, 0) / data.length;
          cheatStats.current.speaking = avg > 8;

          if (!canceled) requestAnimationFrame(audioLoop);
        };
        audioLoop();
      } catch (err) {
        console.error("Camera init error:", err);
      }
    }

    start();

    return () => {
      canceled = true;
      try {
        if (camera) camera.stop();
      } catch {}
      try {
        if (stream) stream.getTracks().forEach((t) => t.stop());
      } catch {}
      try {
        if (audioCtx) audioCtx.close();
      } catch {}
    };
  }, []);

  // ------------------ QUIZ LOGIC ------------------

  const handleAnswer = (option) => {
    const newAns = [...answers];
    if (newAns[currentQuestion] !== option)
      answerChangesPerQuestion.current[currentQuestion]++;
    newAns[currentQuestion] = option;
    setAnswers(newAns);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1)
      setCurrentQuestion(currentQuestion + 1);
    else handleQuizComplete();
  };

  const handlePrevious = () => {
    if (currentQuestion > 0)
      setCurrentQuestion(currentQuestion - 1);
  };

  const handleQuizComplete = async () => {
    clearInterval(timerRef.current);
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.options[q.correctAnswer])
        correct++;
    });
    const finalScore = Math.round(
      (correct / questions.length) * 100
    );
    setScore(finalScore);

    // Cheat detection UI only (no backend)
    setCheatWarning(false);

    setQuizComplete(true);
  };

  const markCourseCompleted = async () => {
    setMarkingCompleted(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/userCompletion/complete-course",
        { courseId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (user) {
        setUser({
          ...user,
          completedCourses: [
            ...(user.completedCourses || []),
            courseId,
          ],
        });
      }
    } catch {}
    setMarkingCompleted(false);
  };

  const handleClaimCertificate = async () => {
    if (cheatWarning) {
      alert(
        "Cheating suspected. You cannot claim the certificate."
      );
      return;
    }
    await markCourseCompleted();
    navigate(`/certificates/${courseId}`);
  };

  const handleRetakeQuiz = () => {
    setQuizComplete(false);
    setCurrentQuestion(0);
    setAnswers(new Array(questions.length).fill(null));
    setTimeLeft(600);
    setCheatWarning(false);
    setTabSwitchCount(0);
  };

  const isCompleted = user?.completedCourses
    ?.map((a) => a.toString())
    .includes(courseId);

  // ------------------ UI STATES ------------------

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
        {error}
      </div>
    );

  if (isCompleted)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow text-center">
          <h2 className="text-2xl font-bold mb-4">
            Course Completed
          </h2>
          <p className="mb-4">
            You have already completed this course and
            claimed the certificate.
          </p>
          <button
            onClick={() =>
              navigate(`/courses/${courseId}`)
            }
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Return to Course
          </button>
        </div>
      </div>
    );

  // ------------- YOUR ORIGINAL QUIZ RESULT BLOCK (restored 100%) --------------
  if (quizComplete) {
    const passed = score >= 70;
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow">
          <div className="text-center mb-8">
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 ${
                passed
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {passed ? (
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              )}
            </div>

            <h2 className="text-3xl font-bold mb-2">
              {passed ? "Congratulations!" : "Quiz Failed"}
            </h2>

            <p className="text-gray-600 text-lg mb-4">
              {passed
                ? `You've successfully completed the ${courseName} assessment.`
                : `You didn't meet the passing criteria for the ${courseName} assessment.`}
            </p>

            {cheatWarning && (
              <p className="text-red-600 font-semibold mb-4">
                Cheating suspected. You cannot claim the
                certificate.
              </p>
            )}

            <div className="inline-block bg-gray-100 rounded-full px-6 py-3 mb-6">
              <span className="text-gray-700 font-medium">
                Your Score:
              </span>
              <span
                className={`text-xl font-bold ${
                  passed ? "text-green-600" : "text-red-600"
                }`}
              >
                {" "}
                {score}%
              </span>
              <span className="text-gray-500">
                {" "}
                (Passing: 70%)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {!isCompleted && (
              <button
                onClick={handleRetakeQuiz}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                disabled={markingCompleted}
              >
                Retake Quiz
              </button>
            )}

            {passed && (
              <button
                onClick={handleClaimCertificate}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                disabled={markingCompleted || cheatWarning}
              >
                {markingCompleted
                  ? "Marking Completed..."
                  : "Claim Your Certificate"}
              </button>
            )}

            <button
              onClick={() =>
                navigate(`/courses/${courseId}`)
              }
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Return to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- ACTIVE QUIZ SCREEN ----------------

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">

      {/* ========== TOP CAMERA WITH OVERLAY ========== */}
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-xl font-bold mb-3">
          {courseName} – Proctored Assessment
        </h1>

        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="rounded-lg w-[720px] h-[540px]"
          />
          <canvas
            ref={canvasRef}
            className="rounded-lg w-[720px] h-[540px] absolute top-0 left-0"
          />
        </div>
      </div>

      {/* ========== QUIZ UI ========== */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 mb-10">

        {/* Header */}
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">
              {question.question}
            </h2>
            <p className="text-gray-500 text-sm">
              Question {currentQuestion + 1} of{" "}
              {questions.length}
            </p>
          </div>

          <div
            className={`px-4 py-2 rounded-lg font-medium ${
              timeLeft < 60
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            ⏳ {Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, "0")}
          </div>
        </div>

        {/* Options */}
        <div className="mt-6 space-y-3">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(option)}
              className={`w-full p-4 text-left border rounded-lg transition ${
                answers[currentQuestion] === option
                  ? "bg-purple-50 border-purple-500 shadow"
                  : "hover:bg-gray-50"
              }`}
            >
              {String.fromCharCode(65 + i)}. {option}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={answers[currentQuestion] === null}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg"
          >
            {currentQuestion === questions.length - 1
              ? "Submit Quiz"
              : "Next"}
          </button>
        </div>
      </div>

      {/* ========== LIVE MONITORING PANEL (BOTTOM ONLY DURING QUIZ) ========== */}
      <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">
          🔍 Live Monitoring (Proctoring)
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">

          <div className="p-4 bg-gray-100 rounded-lg">
            <b>Face Missing (Current):</b>
            <div>{cheatStats.current.noFaceSeconds}s</div>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <b>Total Face Missing:</b>
            <div>{cheatStats.current.noFaceTotal}s</div>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <b>Longest Missing:</b>
            <div>{cheatStats.current.longestNoFace}s</div>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <b>Face Missing Sessions:</b>
            <div>{cheatStats.current.noFaceSessions}</div>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <b>Multi-Face:</b>
            <div>{cheatStats.current.multiFaceCurrent}</div>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <b>Total Multi-Face:</b>
            <div>{cheatStats.current.multiFaceTotal}</div>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <b>Speaking:</b>
            <div>
              {cheatStats.current.speaking ? "Yes 🎤" : "No"}
            </div>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <b>Head Pose Avg:</b>
            <div>
              {cheatStats.current.headPoseAvg.toFixed(3)}
            </div>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <b>Head Pose Max:</b>
            <div>
              {cheatStats.current.headPoseMax.toFixed(3)}
            </div>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <b>Eye Gaze Avg:</b>
            <div>
              {cheatStats.current.eyeGazeAvg.toFixed(3)}
            </div>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <b>Eye Gaze Max:</b>
            <div>
              {cheatStats.current.eyeGazeMax.toFixed(3)}
            </div>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <b>Micro Move Avg:</b>
            <div>
              {cheatStats.current.microMoveAvg.toFixed(3)}
            </div>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <b>Micro Move Max:</b>
            <div>
              {cheatStats.current.microMoveMax.toFixed(3)}
            </div>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <b>Tab Switch:</b>
            <div>{cheatStats.current.focusLost}</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Quiz;

/** -------------- END FINAL Quiz.jsx ---------------- */
