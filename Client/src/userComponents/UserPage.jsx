import axios from "axios";
import React, { useEffect, useState } from "react";
import { data, useLocation, useNavigate } from "react-router-dom";
import TopHeader from "../components/TopHeader";
import Pagination from "../components/Pagination";
import { io } from "socket.io-client";
import Chatpage from "../components/Chatpage";

const socket = io("http://localhost:8000")
const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const UserPage = () => {
  const naviagat = useNavigate()

  // states 
  const location = useLocation();
  const user = location?.state?.userData;
  const [openProfile, setOpenProfile] = useState(false);
  const [quizs, setQuizes] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null);
  const [modalPlayQuiz, setModalPlayQuiz] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [timePassed, setTimePassed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [attemptQuize, setAttemptQuiz] = useState(null)
  const [scoreModal, setScoreModal] = useState(false)
  const [scoreData, setScoreData] = useState([])
  const [reviewModal, setReviewModal] = useState(false)
  const [reviewquizData, setReviewquizData] = useState(null)
  const [categoryTopic, setCategoryTopic] = useState(null)
  const [selectedDiff, setSelectedDiff] = useState("all")
  const [reAttemptModal, setReAttemptModal] = useState(false)
  const [reAttemptQuizeData, setReAttemptQuizeData] = useState(null)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [selectCat, setSelectCat] = useState("all")
  const [selectedTopic, setSelectedTopic] = useState("all")
  const [playOneVsOneModal, setPlayOneVsOneModal] = useState(false)
  const [liveAttemptModal, setLiveAttemptModal] = useState(false)
  const [mode, setMode] = useState("simple");
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);
  const [totalPages, setTotalPages] = useState(1);
  const [showWaitingModal, setShowWaitingModal] = useState(false)
  const [showTimeoutModal, setShowTimeoutModal] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const [matchId, setMatchId] = useState(null)
  const [waitResult, setWaitResult] = useState(false)
  const [results, setResults] = useState(null);
  const [showResult, setShowResult] = useState(false)
  const [startChat, setStartChat] = useState(false)



  useEffect(() => {
    // Listen for match completion
    socket.on('match_completed', (data) => {
      console.log('Match completed!', data);
      if (data) {
        setResults(data);
        setWaitResult(false)
        setShowResult(true);
      }
      setWaitResult(false);
      alert("match complete sucesfully")
    });

    return () => socket.off('match_completed');
  }, []);


  const handleSelect = (selected) => {
    if (mode === "simple") {
      setMode("ai");
      recommendationQuiz();    // load AI quizzes
    } else {
      setMode("simple");
      getQuizs();              // load simple quizzes
    }
  };

  // (Starting point of recommendation system)
  const recommendationQuiz = async () => {
    const userId = user.id
    if (!userId) {
      alert("id is required")
    } else {
      const resp = await axios.get(`${BASE_URL}/recommendation-quiz/${userId}`);
      // console.log("resp of recommendation quiz:", resp);
      console.log("mode value:", mode);
      if (resp?.data?.success === true) {
        if (mode === "ai") {
          console.log("AI mode active");
          const list = resp?.data?.data;
          if (Array.isArray(list) && list.length > 0) {
            setQuizes(list);
          } else {
            alert("No attempted quizzes. Attempt at least 10.");
          }
        }
      }
    }

  }
  useEffect(() => {
    recommendationQuiz()
  }, [user, mode])


  const getQuizs = async () => {
    try {
      const userId = user.id
      const resp = await axios.get(`${BASE_URL}/get-quiz/${selectedDiff}/${userId}`,
        { params: { category: selectCat, topic: selectedTopic, search: debouncedSearch, page, limit } })
      // console.log("getquize resp", resp?.data?.data);
      const result = resp?.data?.data
      if (resp?.data?.success) {
        setQuizes(resp.data.data)
        setTotalPages(resp.data.totalPages);
      }
      else if (mode === "simple") {
        setQuizes(resp.data.data)
      }
    } catch (error) {
      console.log("quize is not get");
    }
  }

  useEffect(() => {
    if (!isRunning || !startTime) return;

    const timer = setInterval(() => {
      setTimePassed(Math.floor((new Date() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, startTime]);


  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSubmitQuiz = () => {
    clearInterval();  // React auto cleanup
    alert(`Quiz completed in ${formatTime(timePassed)}`);
  };


  const fetchCategoryTopic = async () => {
    try {
      const resp = await axios.get(`${BASE_URL}/getQuizCategoryTopicname`)
      // console.log("resp of get cat topic ", resp);
      if (resp.data.success) {
        setCategoryTopic(resp.data.data)
      }
    } catch (error) {
      console.log("cat or topic is not get ");
    }

  }

  useEffect(() => {
    fetchCategoryTopic()
  }, [])

  const playQuizFunction = (quiz) => {
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    console.log("play quize button");
    setModalPlayQuiz(true)
    // setSelectedQuiz(quiz)

  }

  const selectedAnswer = (opt, idx, questionId) => {
    setSelectedOption(opt)
    const time = formatTime(timePassed)
    const userAns = opt === "option_1" ? "a" : opt === "option_2" ? "b" : opt === "option_3" ? "c" : "d"
    console.log("userAns", userAns);

    setAttemptQuiz((prev) => ({
      matchId: matchId,
      quizId: selectedQuiz?.id,
      userId: user?.id,
      time: time,
      quize_type: selectedQuiz?.difficulty,
      questions: [
        ...(prev?.questions || []),
        {
          questionId: questionId,
          userAns: userAns
        }
      ]
    }));

    // console.log("selected ans",opt);
    // console.log("question index of",idx);
    // console.log("question",questionId);
    console.log("selectedQuiz.id", selectedQuiz);





  }

  const reviewFunction = async (quizData) => {
    const quizId = quizData?.quizId || 7
    const userId = quizData?.userId || 5
    if (userId && quizId) {
      const resp = await axios.get(`${BASE_URL}/reviewQuiz/${quizId}/${userId}`)
      setReviewquizData(resp.data.data)
      console.log("resp of quiz review", resp);

    }

    setReviewModal(true);
    setScoreModal(false)

  }

  const reAttemptQuizFunction = async (quizId, quizeNumber) => {
    setReAttemptModal(true)
    console.log("quizeId", quizId);
    // console.log("selectedReAtteQuiz",selectedReAtteQuiz);

    const userId = user.id
    if (quizId && userId) {
      try {
        const selectedReAtteQuiz = quizeNumber || null
        const resp = await axios.get(`${BASE_URL}/re-attempt-quiz/${userId}/${quizId}/${selectedReAtteQuiz}`)
        console.log("resp of get re-attempt quize", resp);
        if (resp.data.success) {
          setReAttemptQuizeData(resp.data.data)
        }
      } catch (error) {
        console.log("re-attempt quize are not found");
      }
    }

  }

  const totalAttmpt = []
  for (let i = 1; i <= reAttemptQuizeData?.totalAttempt; i++) {
    totalAttmpt.push(i)
  }



  const playOneVsOneFunction = () => {
    setPlayOneVsOneModal(true)
    console.log("server is call func");

  }

  useEffect(() => {
    socket.on("start_match", (data) => {
      setShowWaitingModal(false);
      setMatchId(data.roomId)
      alert("Match Found! Quiz is starting");
      playQuizFunction(selectedQuiz);
      const quizTimeSecond = data?.quiz_time ||
        console.log("quiz time ", quizTimeSecond);
      setTimeLeft(quizTimeSecond)
      console.log("Match started:", data);
    });
    return () => {
      socket.off("start_match");
    };
  }, []);


  const joinQuizFunction = (quiz) => {
    setPlayOneVsOneModal(false)
    setSelectedQuiz(quiz)
    socket.emit("join_1v1", {
      user_id: user?.id,
      quiz_id: quiz?.id
    });
    setShowWaitingModal(true)

  }

  // LISTEN EVENTS
  socket.on("waiting_for_opponent", () => {
    console.log("Waiting for opponent...");
  });

  useEffect(() => {
    if (showWaitingModal) {
      const timeout = setTimeout(() => {
        handleOpponentNotFound();
      }, 1 * 60 * 1000); // 4 minutes

      return () => clearTimeout(timeout);
    }
  }, [showWaitingModal]);

  const handleOpponentNotFound = () => {
    setShowWaitingModal(false);

    setTimeout(() => {
      setShowTimeoutModal(true);
    }, 300);
  };

  const tryAgain = () => {
    setShowTimeoutModal(false);
    socket.emit("join_1v1", { user_id, quiz_id });
    setShowWaitingModal(true);
  };

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      alert("Time up! Quiz submitted automatically.");
      setModalPlayQuiz(false)
      setLiveAttemptModal(false)
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const playAttemptFunction = () => {
    setLiveAttemptModal(true)
  }

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    getQuizs();   // call API only when debounced value changes
  }, [debouncedSearch, selectedDiff, selectCat, selectedTopic, page]);


  // ove vs one quize result save 
  const submitOneVsOneQuiz = async () => {
    console.log("one vs one submit fun executed");

    // Case 1: Move to next question
    if (currentIndex < selectedQuiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      return;  // Return here to stop execution
    }

    // Case 2: Last question -> Submit quiz
    if (currentIndex === selectedQuiz.questions.length - 1) {
      setIsRunning(false);
      handleSubmitQuiz();

      try {
        const resp = await axios.post(
          `${BASE_URL}/submit-oneVsone-quiz/${user?.id}`,
          attemptQuize
        );

        console.log("resp of submit quiz", resp);

        const result = resp?.data?.data;
        const success = resp?.data?.success;

        if (!success) {
          alert("Something went wrong");
          return;
        }

        // CASE A: MATCH IS DRAW
        if (result?.isDraw === true) {
          setShowResult(true);        // Show draw result screen
          return;
        }

        // CASE B: NORMAL RESULT (WIN/LOSE)
        setModalPlayQuiz(false);
        setWaitResult(true);
        setScoreData(result);
        return;

      } catch (error) {
        console.log(error);
        alert("Quiz is not submitted");
      }
    }

    // Case 3: Should not reach here
    alert("Quiz Finished!");
  };





  // regular quize result  save 
  const submitPlayQuiz = async () => {
    if (currentIndex < selectedQuiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else if (currentIndex === selectedQuiz.questions.length - 1) {
      handleSubmitQuiz()
      setIsRunning(false);
      try {
        const resp = await axios.post(`${BASE_URL}/submit-quiz`, attemptQuize)
        console.log("resp of submit quiz", resp);
        if (resp?.data?.success) {
          setModalPlayQuiz(false)
          setScoreModal(true)
          setScoreData(resp.data.data)
        }
      } catch (error) {
        alert("quize is not submit")

      }
    }
    else {
      alert("Quiz Finished!");
    }
  }

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-500', bg: 'bg-green-50' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage === 100) return "Perfect Score! 🎉";
    if (percentage >= 80) return "Excellent Work! 🌟";
    if (percentage >= 60) return "Good Job! 👍";
    return "Keep Practicing! 💪";
  };

  const selectedReAttFunction = (quizeNumber, quizId) => {
    console.log("quize number", quizeNumber);

    // setSelectedReAtteQuiz(quizeNumber)
    reAttemptQuizFunction(quizId, quizeNumber)



  }
  const gradeInfo = getGrade(scoreData?.percentage);







  return (
    <>
      {/* HEADER */}
      <div className="p-4 shadow-lg bg-white flex items-center justify-between">

        {/* Logo / Title */}
        <h1 className="font-bold text-lg">Quize Tech</h1>


        {/* Right Section */}
        <div className="flex items-center gap-4">

          <button
            onClick={() => setStartChat(true)}
            className="
    flex items-center justify-center gap-2 
    bg-gradient-to-r from-purple-600 to-indigo-600
    text-white font-semibold px-4 py-2 
    rounded-xl shadow-lg 
    transition-all duration-200 
    hover:shadow-xl hover:scale-105 
    active:scale-95
  "
          >
            {/* <span className="text-sm tracking-wide">DocTalkAi</span> */}
            <span className="text-sm tracking-wide" >StudyBot</span>


          </button>

          <button
            className="
    flex items-center justify-center gap-2 
    bg-gradient-to-r from-purple-600 to-indigo-600
    text-white font-semibold px-4 py-2 
    rounded-xl shadow-lg 
    transition-all duration-200 
    hover:shadow-xl hover:scale-105 
    active:scale-95
  "
            onClick={() => playOneVsOneFunction()}
          >
            <span className="text-sm tracking-wide">Play 1 V/S 1</span>

          </button>

          {/* Coins */}
          <div className="leading-tight text-right">
            <p className="text-[11px] font-medium">Winning Coins</p>
            <h1 className="text-2xl font-extrabold">{user?.coins || 0}</h1>
          </div>

          {/* Profile Button */}
          <button
            onClick={() => setOpenProfile(true)}
            className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center 
      text-lg font-bold shadow-xl hover:bg-gray-700 transition active:scale-95"
          >
            {user?.name?.[0]?.toUpperCase() || "U"}
          </button>

        </div>
      </div>

      {/* user profile CONTENT */}
      {openProfile && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-80 rounded-xl p-6 shadow-lg animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-center">User Profile</h2>

            <div className="space-y-2">
              <p>
                <span className="font-semibold">Name:</span> {user?.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {user?.email}
              </p>
              <p>
                <span className="font-semibold">Role:</span>{" "}
                {user?.role || "User"}
              </p>
            </div>


            <button
              onClick={() => { naviagat('/login') }}
              className="mt-6 bg-gray-900 text-white w-full py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Logout
            </button>

            <button
              onClick={() => setOpenProfile(false)}
              className="mt-2 bg-gray-900 text-white w-full py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}


      {/* all quize  */}
      <div className="pt-6 px-8">
        <div className="flex justify-between items-center p-3 border-amber-50 shadow-sm mb-4">
          <h1 className="text-xl font-bold text-black">All Quizzes</h1>
          {/* Filter for search quiz */}
          <div className="flex items-center gap-3 p-2">
            {/* search bar  */}
            <div className="flex items-center ">
              <input type="text" className=" border p-1  text-sm shadow-xs border-gray-100 rounded-lg w-40" placeholder="search quize"
                onChange={(e) => handleSearch(e)}
              />
            </div>

            {/* Difficulty */}
            <select
              className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSelectedDiff(e.target.value)}
            >
              <option value="all">Select Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Category (data will come from loop) */}
            <select
              className="px-3 py-1 border rounded-lg focus:outline-none w-40 focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSelectCat(e.target.value)}
            >
              <option value="">Select Category</option>
              {/* Example dynamic */}
              {categoryTopic?.map((t) => (
                <option key={t.id} value={t.category_name}>{t.category_name}</option>
              ))}

            </select>

            {/* Topic (data will come from loop) */}
            <select
              className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              <option value="">Select Topic</option>

              {
                quizs?.length > 0 && quizs?.map((t) => (
                  <option key={t.id} value={t?.category?.[0]?.topic_name}>
                    {t?.category?.[0]?.topic_name}
                  </option>
                ))}


            </select>



            <div className="flex justify-center">
              <div className="bg-gray-200 p-1 rounded-full flex gap-1 shadow-inner">

                {/* SIMPLE */}
                <button
                  onClick={() => handleSelect("simple")}
                  className={`
                        px-5 py-1 rounded-full text-sm font-medium transition-all
                        ${mode === "simple"
                      ? "bg-white shadow text-blue-600"
                      : "text-gray-600"}
                    `}
                >
                  Simple
                </button>

                {/* AI RECOMMENDED */}
                <button
                  onClick={() => handleSelect("ai")}
                  className={`
                        px-5 py-1 rounded-full text-sm font-medium transition-all
                        ${mode === "ai"
                      ? "bg-white shadow text-purple-600"
                      : "text-gray-600"}
                    `}
                >
                  AI Recommended
                </button>

              </div>
            </div>

          </div>
        </div>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 ">
            {quizs?.length > 0 ?
              quizs?.map((quiz) => (
                <div
                  key={quiz.id}
                  className="relative bg-white shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl p-6
            "
                >

                  {/* QUIZ HEADER */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-md font-bold text-gray-900">
                      {quiz.title}
                    </h2>

                    <span
                      className={`px-4 py-.5 rounded-full text-sm text-white font-semibold shadow-md ${quiz.difficulty === "easy"
                        ? "bg-green-600"
                        : quiz.difficulty === "medium"
                          ? "bg-yellow-600"
                          : "bg-red-600"
                        }`}
                    >
                      {quiz.difficulty}
                    </span>
                  </div>

                  {/* CATEGORY INFO */}
                  <div className="text-gray-700 mb-5">
                    <p>
                      <span className="font-semibold text-sm">Category:</span>{" "}
                      {quiz.category?.[0]?.category_name}
                    </p>

                    <p>
                      <span className="font-semibold text-sm">Topic:</span>{" "}
                      {quiz.category?.[0]?.topic_name}
                    </p>
                  </div>

                  {/*Action BUTTON */}
                  <div className=" flex gap-2">
                    {
                      quiz.isAttempted === true ?
                        <button className="w-full mt-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md"
                          onClick={() => reAttemptQuizFunction(quiz.id)}
                        >
                          Re-Attempt
                        </button>
                        : ""
                    }
                    <button
                      className="w-full mt-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md"
                      onClick={() => { playQuizFunction(quiz); setSelectedQuiz(quiz) }}
                    >
                      ▶ Play Quiz
                    </button>

                  </div>



                </div>



              ))

              : <h1 className="text-red-500">
                No Data Found
              </h1>
            }
          </div>

          <div className="fixed bottom-6 right-6 z-50">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            ></Pagination>
          </div>
        </div>


        {/* SIMPLE CSS ANIMATION */}
        <style>
          {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
        `}
        </style>
      </div>

      {/* quize play modal  */}
      {modalPlayQuiz && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">

          <div className="bg-white w-11/12 max-w-xl rounded-2xl p-6 shadow-xl
                    animate-fadeIn max-h-[80vh] overflow-auto">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Play Quiz</h2>

              {/* Current Question / Total */}
              <div className="text-sm font-semibold bg-gray-100 px-3 py-1 rounded-lg">
                {currentIndex + 1}/{selectedQuiz?.questions?.length}
              </div>

              {/* default time  */}

              <div className="text-right text-md font-bold">
                ⏱ {formatTime(timePassed)}
              </div>

              {/* for one vs one quize real time fetch in db  */}
              {timeLeft !== null && (
                <div className="text-right text-md font-bold text-black">
                  Time Left:
                  {Math.floor(timeLeft / 60)}:
                  {String(timeLeft % 60).padStart(2, "0")}
                </div>
              )}




              <button
                onClick={() => { setModalPlayQuiz(false); setSelectedOption(null); setCurrentIndex(0); handleSubmitQuiz() }}
                className="text-xl font-bold hover:text-red-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Current Question */}
            <div className="mt-3 space-y-4">

              <p className="font-semibold text-lg">
                {currentIndex + 1}.{" "}
                {selectedQuiz?.questions?.[currentIndex]?.question_text}
              </p>

              {/* Options */}
              <div className="space-y-2">
                {["option_1", "option_2", "option_3", "option_4"]
                  .filter((opt) => selectedQuiz?.questions?.[currentIndex]?.[opt])
                  .map((opt, idx) => {
                    const value =
                      selectedQuiz?.questions?.[currentIndex]?.[opt];

                    const questionId = selectedQuiz?.questions?.[currentIndex]?.id;

                    return (
                      <div
                        key={idx}
                        onClick={() => selectedAnswer(opt, idx, questionId)}
                        className={`border p-3 rounded-lg cursor-pointer transition 
                    ${selectedOption === opt
                            ? "bg-green-100 border-green-600"
                            : "hover:bg-gray-100"
                          }`}
                      >
                        <span className="font-semibold mr-2">
                          {["A", "B", "C", "D"][idx]}.
                        </span>
                        {value}
                      </div>
                    );
                  })}
              </div>

            </div>

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-between">

              {/* Prev Button */}
              <button
                disabled={currentIndex === 0}
                onClick={() => {
                  setCurrentIndex((prev) => prev - 1);
                  setSelectedOption(null);
                }}
                className={`px-4 py-2 rounded-lg border transition
            ${currentIndex === 0
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-gray-100"
                  }`}
              >
                Prev
              </button>

              {/* Save & Next Button for one vs one  */}
              <button
                // onClick={() => playOneVsOneModal === true ? submitOneVsOneQuiz() :submitPlayQuiz() }
                onClick={() => playOneVsOneModal === true ? submitOneVsOneQuiz() : submitOneVsOneQuiz()}

                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
              >
                {currentIndex === selectedQuiz?.questions?.length - 1 ? "Submit socket io" : "Save & Next"}
                {/* Save & Next */}
              </button>
            </div>
            {
              currentIndex === selectedQuiz?.questions?.length - 1 ? "" :

                <div className="flex w-full">
                  <button
                    disabled={!selectedOption}   // disable when no option selected
                    onClick={() => {
                      handleSubmitQuiz()
                      setIsRunning(false);


                      selectedOption
                        ? ""
                        : "";
                    }}
                    className={`
      relative mt-3 bg-green-600 w-full py-2 text-white text-xl rounded-md
      ${!selectedOption
                        ? "opacity-40 cursor-not-allowed group"
                        : "hover:bg-green-700"
                      }
    `}
                  >
                    Save Quiz
                  </button>
                </div>

            }

          </div>
        </div>
      )}

      {/* quize scorere result  */}
      {
        scoreModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header with Rank Badge */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-t-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-16 -mb-16"></div>

                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
                    {/* <Trophy className="w-10 h-10 text-yellow-500" /> */}
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{getPerformanceMessage(scoreData?.percentage)}</h2>
                  <p className="text-blue-100">Quiz Completed Successfully</p>
                </div>
              </div>

              {/* Score Overview */}
              <div className="p-8">
                {/* Main Score Display */}
                {/* <div className="flex items-center justify-center mb-8">
                  <div className={`${gradeInfo.bg} rounded-3xl p-8 text-center min-w-[200px]`}>
                    <div className={`text-6xl font-bold ${gradeInfo.color} mb-2`}>
                      {scoreData.score}/{scoreData.total_question}
                    </div>
                    <div className={`text-2xl font-semibold ${gradeInfo.color}`}>
                      Grade: {gradeInfo.grade}
                    </div>
                    <div className="text-gray-600 mt-2 text-lg">
                      {scoreData.percentage}% Score
                    </div>
                  </div>
                </div> */}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {/* Accuracy */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      {/* <Target className="w-5 h-5 text-purple-600" /> */}
                      <span className="text-xs font-semibold text-purple-600 uppercase">Accuracy</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-700">{scoreData?.accuracy}%</div>
                  </div>

                  {/* Time Taken */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      {/* <Clock className="w-5 h-5 text-blue-600" /> */}
                      <span className="text-xs font-semibold text-blue-600 uppercase">Time</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{scoreData?.time}</div>
                  </div>

                  {/* Rank */}
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      {/* <Award className="w-5 h-5 text-yellow-600" /> */}
                      <span className="text-xs font-semibold text-yellow-600 uppercase">Rank</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-700">#{scoreData?.rank}</div>
                  </div>

                  {/* Coins Earned */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      {/* <TrendingUp className="w-5 h-5 text-green-600" /> */}
                      <span className="text-xs font-semibold text-green-600 uppercase">Coins</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">+{scoreData?.coin}</div>
                  </div>
                </div>

                {/* Question Breakdown */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    {/* <CheckCircle className="w-5 h-5 mr-2 text-green-600" /> */}
                    Question Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">Correct Answers</span>
                      </div>
                      <span className="font-bold text-green-600">{scoreData.score}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">Wrong Answers</span>
                      </div>
                      <span className="font-bold text-red-600">{scoreData.attempt - scoreData.score}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                        <span className="text-gray-700">Unattempted</span>
                      </div>
                      <span className="font-bold text-gray-600">{scoreData.unattempt}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${scoreData.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => reviewFunction(scoreData)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Review Answers
                  </button>
                  <button
                    onClick={() => setScoreModal(false)}
                    className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>

        )
      }


      {/* Review score  modal  */}
      {reviewModal && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center p-4 z-50">

          <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

            <div className="bg-white w-11/12 max-w-xl rounded-2xl p-6 shadow-xl animate-fadeIn max-h-[80vh] overflow-auto mx-auto">

              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Review Quiz</h2>

                {/* Current Question / Total */}
                <div className="text-sm font-semibold bg-gray-100 px-3 py-1 rounded-lg">
                  {currentIndex + 1}/{selectedQuiz?.questions?.length}
                </div>

                <button
                  onClick={() => setReviewModal(false)}
                  className="text-xl font-bold hover:text-red-600 transition"
                >
                  ✕
                </button>
              </div>

              {/* Current Question */}
              <div className="mt-3 space-y-4">
                <p className="font-semibold text-lg">
                  {currentIndex + 1}.{" "}
                  {selectedQuiz?.questions?.[currentIndex]?.question_text}
                </p>

                {/* Options */}
                <div className="space-y-4 mt-4">

                  {["option_1", "option_2", "option_3", "option_4"]
                    .filter((opt) => selectedQuiz?.questions?.[currentIndex]?.[opt])
                    .map((opt, idx) => {
                      const question = selectedQuiz?.questions?.[currentIndex];
                      const questionId = question?.id;
                      const value = question?.[opt];

                      const attempt = reviewquizData?.find(
                        (q) => q.question_id === questionId
                      );

                      const correct = attempt?.correct_answer;
                      const userAns = attempt?.user_answer;

                      const optionKey = ["a", "b", "c", "d"][idx];

                      // UI colors
                      let wrapperClass =
                        "border rounded-xl p-4 shadow-sm transition-all duration-300 bg-white/60 backdrop-blur";

                      // Correct answer UI
                      if (correct === optionKey) {
                        wrapperClass += " border-green-600 bg-green-50 shadow-green-100";
                      }

                      // Wrong user selected answer UI
                      if (userAns === optionKey && userAns !== correct) {
                        wrapperClass += " border-red-600 bg-red-50 shadow-red-100";
                      }

                      return (
                        <div key={idx} className={wrapperClass}>
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-gray-700 opacity-90 w-6">
                              {["A", "B", "C", "D"][idx]}.
                            </div>

                            <div className="text-gray-900 font-medium text-base">
                              {value}
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="mt-3 flex flex-wrap gap-2">

                            {/* Correct Answer Badge */}
                            {correct === optionKey && (
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-600 text-white shadow">
                                Correct Answer
                              </span>
                            )}

                            {/* User Answer Badge */}
                            {userAns === optionKey && (
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full shadow
                  ${userAns === correct
                                    ? "bg-green-500 text-white"
                                    : "bg-red-500 text-white"
                                  }
                `}
                              >
                                Your Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>


              </div>

              {/* Navigation Buttons */}
              <div className="mt-6 flex justify-between">
                {/* Prev Button */}
                <button
                  disabled={currentIndex === 0}
                  onClick={() => {
                    setCurrentIndex((prev) => prev - 1);
                    setSelectedOption(null);
                  }}
                  className={`px-4 py-2 rounded-lg border transition
              ${currentIndex === 0
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-gray-100"
                    }`}
                >
                  Prev
                </button>

                {/* Save & Next / Submit for review quiz data */}
                <button
                  onClick={() => submitPlayQuiz()}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                >
                  {currentIndex === selectedQuiz?.questions?.length - 1
                    ? "Submit"
                    : "Save & Next"}
                </button>
              </div>

              {/* Save Quiz Button (only if not last question) */}
              {currentIndex !== selectedQuiz?.questions?.length - 1 && (
                <div className="flex w-full">
                  <button
                    disabled={!selectedOption}
                    onClick={() => {
                      handleSubmitQuiz();
                      setIsRunning(false);
                    }}
                    className={`
                relative mt-3 bg-green-600 w-full py-2 text-white text-xl rounded-md
                ${!selectedOption
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-green-700"
                      }
              `}
                  >
                    Save Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* re-attempt-modal  */}
      {reAttemptModal === true && reAttemptQuizeData ?
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md relative">

            {/* Close Button */}
            <button
              onClick={() => setReAttemptModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              ✕
            </button>

            <h1 className="text-xl font-semibold mb-4">
              Attempted Quiz Review
            </h1>

            {/* Total Attempt */}
            <div className="space-y-3">
              <h4 className="font-medium">
                Total Attempt: {reAttemptQuizeData.totalAttempt}
              </h4>

              {/* Attempt Buttons */}
              <div className="flex flex-wrap gap-2">
                {totalAttmpt.map((q, index) => (
                  <button
                    key={index}
                    className="px-3 py-1 bg-green-500 text-white rounded-md"
                    onClick={() => selectedReAttFunction(q, reAttemptQuizeData.quiz_id)}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Score Overview */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <h2 className="text-lg font-semibold mb-2 cursor-pointer" onClick={() => setShowQuestionModal(false)}>Score Overview</h2>
                  <h2 className="text-red-500 font-bold cursor-pointer" onClick={() => setShowQuestionModal(true)}>Show Questions</h2>
                </div>

                {
                  showQuestionModal === true ?
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">

                      {reAttemptQuizeData.questions?.map((q, i) => {
                        const attempt = reAttemptQuizeData.quizAns?.find(
                          (a) => a.question_id === q.id
                        );

                        const userAns = attempt?.user_answer || null;
                        const correct = attempt?.correct_answer || q.correct_option;

                        return (
                          <div key={q.id} className="border p-4 rounded-md space-y-2">
                            <p className="font-medium">{i + 1}. {q.question_text}</p>

                            {/* OPTIONS */}
                            <div className="space-y-1">
                              {["a", "b", "c", "d"].map((opt) => {
                                const optionText =
                                  q[`option_${opt === "a" ? 1 : opt === "b" ? 2 : opt === "c" ? 3 : 4}`];

                                if (!optionText) return null;

                                const isCorrect = opt === correct;
                                const isUserWrong = userAns === opt && opt !== correct;

                                return (
                                  <div
                                    key={opt}
                                    className={`p-2 rounded-md 
                  ${isCorrect ? "bg-green-200" : ""}
                  ${isUserWrong ? "bg-red-200" : ""}
                `}
                                  >
                                    {opt}) {optionText}
                                  </div>
                                );
                              })}
                            </div>

                            {/* ANSWER SUMMARY */}
                            <div className="text-sm font-semibold">
                              <p>Your Answer: {userAns ? userAns.toUpperCase() : "Not Attempted"}</p>
                              <p>Correct Answer: {correct.toUpperCase()}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    :
                    <div className="grid grid-cols-2 gap-3 text-sm">

                      <div className="p-3 bg-gray-100 rounded-md">
                        <p className="font-medium">Score</p>
                        <p>{reAttemptQuizeData.score} / {reAttemptQuizeData.total_questions}</p>
                      </div>

                      <div className="p-3 bg-gray-100 rounded-md">
                        <p className="font-medium">Correct</p>
                        <p>{reAttemptQuizeData.correct_answers}</p>
                      </div>

                      <div className="p-3 bg-gray-100 rounded-md">
                        <p className="font-medium">Wrong</p>
                        <p>{reAttemptQuizeData.wrong_answers}</p>
                      </div>

                      <div className="p-3 bg-gray-100 rounded-md">
                        <p className="font-medium">Unattempted</p>
                        <p>{reAttemptQuizeData.total_unattempted}</p>
                      </div>

                      <div className="p-3 bg-gray-100 rounded-md">
                        <p className="font-medium">Accuracy</p>
                        <p>{reAttemptQuizeData.accuracy}%</p>
                      </div>

                      <div className="p-3 bg-gray-100 rounded-md">
                        <p className="font-medium">Percentage</p>
                        <p>{reAttemptQuizeData.percentage}%</p>
                      </div>

                      <div className="p-3 bg-gray-100 rounded-md">
                        <p className="font-medium">Rank</p>
                        <p>{reAttemptQuizeData.rank}</p>
                      </div>

                      <div className="p-3 bg-gray-100 rounded-md">
                        <p className="font-medium">Time Taken</p>
                        <p>{reAttemptQuizeData.time_taken}</p>
                      </div>

                    </div>
                }

              </div>
            </div>

          </div>
        </div>
        : ""
      }

      {/* playOneVsOneModal  */}
      {playOneVsOneModal === true && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex h-full items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-4xl h-140 relative">

            {/* Close Button */}
            <button onClick={() => setPlayOneVsOneModal(false)} className="absolute top-3 right-3 text-gray-600 hover:text-black" > ✕ </button>

            <div className="">
              <h1 className="font-bold" >Play One V/s One </h1>
            </div>

            <div className="flex gap-2 justify-end items-center mt-3">
              <select className="px-3 py-1 shadow-sm border border-gray-300  rounded-lg focus:outline-none w-40 focus:ring-2 focus:ring-blue-500" onChange={(e) => setSelectCat(e.target.value)} >
                <option value="">Select Category</option>
                {categoryTopic?.map((t) => (<option key={t.id} value={t.category_name}>{t.category_name}</option>))}
              </select>

              {/* Topic (data will come from loop) */}
              <select className="px-3 py-1  shadow-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" onChange={(e) => setSelectedTopic(e.target.value)} >
                <option value="">Select Topic</option>
                {quizs?.length > 0 && quizs?.map((t) => (<option key={t.id} value={t?.category?.[0]?.topic_name}>   {t?.category?.[0]?.topic_name} </option>))}
              </select>

              <select className="px-3 py-1  shadow-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setSelectedDiff(e.target.value)} >
                <option value="all">Select Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

            </div>

            {/* quizes  */}{
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto  max-h-auto mt-8 overflow-auto scrollbar-hide ">
                {quizs?.length > 0 ?
                  quizs?.map((quiz) => (
                    <div key={quiz.id} className=" bg-white shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 rounded-xl p-2 h-40 max-h-50 " >

                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-md font-bold text-gray-900"> {quiz.title} </h2>
                        <span
                          className={`px-4 py-.5 rounded-full text-sm text-white font-semibold shadow-md ${quiz.difficulty === "easy"
                            ? "bg-green-600"
                            : quiz.difficulty === "medium"
                              ? "bg-yellow-600"
                              : "bg-red-600"
                            }`}
                        >
                          {quiz.difficulty}
                        </span>
                      </div>

                      {/* CATEGORY INFO */}
                      <div className="text-gray-700 mb-2">
                        <p> <span className="font-semibold text-sm">Category:</span>{" "} {quiz.category?.[0]?.category_name} </p>
                        <p> <span className="font-semibold text-sm">Topic:</span>{" "} {quiz.category?.[0]?.topic_name} </p>
                      </div>

                      {/*Action BUTTON */}
                      <div className=" flex gap-2">
                        <button className="w-full mt-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md" onClick={() => joinQuizFunction(quiz)} > ▶ Play Quiz </button>
                      </div>
                    </div>
                  )) : <h1 className="text-red-500"> No Data Found </h1>
                }
              </div>
            }
            {/* <button className="px-6 py-1 bg-green-500 text-white rounded-lg mt-4 mx-3" onClick={(}>Join</button> */}
          </div>
        </div>
      )
      }

      {showWaitingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl text-center">
            <h2 className="text-lg font-semibold">Waiting for Opponent...</h2>
            <p className="text-gray-600 mt-2">Searching for another players in this quiz</p>
            <div className="loader mt-4" />
            <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded" onClick={() => setShowWaitingModal(false)} > Cancel </button>
          </div>
        </div>
      )}

      {showTimeoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl text-center w-[90%] md:w-[350px]">
            <h2 className="text-lg font-semibold">Opponent Not Found</h2>
            <p className="text-gray-600 mt-2">No player joined your quiz section</p>
            <div className="mt-4 flex flex-col gap-2">
              <button onClick={tryAgain} className="bg-blue-600 text-white py-2 rounded" >Try Again</button>
              <button onClick={() => { setShowTimeoutModal(false); setPlayOneVsOneModal(false) }} className="bg-blue-600 text-white py-2 rounded" > Attempt Later </button>
            </div>
          </div>
        </div>
      )}

      {liveAttemptModal === true && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md relative">

            {/* Close Button */}
            <button
              onClick={() => setLiveAttemptModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              ✕
            </button>

            <div>
              <h1>Attempt Live Quiz </h1>
              <p>This feature are Comming Soon</p>
            </div>

          </div>

        </div>

      )
      }

      {
        waitResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl text-center">
              <h2 className="text-lg font-semibold">Waiting for Result</h2>
              <p className="text-gray-600 mt-2">Wait for another players submit this quiz</p>
              <div className="loader mt-4" />
              <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded" onClick={() => setWaitResult(false)} > Cancel </button>
            </div>
          </div>

        )
      }

      {showResult && results && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl w-[380px] p-6 shadow-2xl animate-fadeIn">

            {/* Winner / Draw Title */}
            <div className="text-center">
              {results.isDraw ? (
                <h2 className="text-2xl font-bold text-blue-300 drop-shadow-md">
                  Match Draw
                </h2>
              ) : (
                <h2
                  className={`text-2xl font-bold drop-shadow-md ${results.winnerId === user?.id ? "text-green-300" : "text-red-300"
                    }`}
                >
                  {results.winnerId === user?.id ? "Victory!" : "Defeat"}
                </h2>
              )}

              {/* Subtitles */}
              {!results.isDraw ? (
                <p className="text-white/80 text-sm mt-1">
                  {results.winnerId === user?.id
                    ? "You outperformed your opponent."
                    : "Try again to claim victory."}
                </p>
              ) : (
                <p className="text-white/80 text-sm mt-1">Both players performed equally well.</p>
              )}
            </div>

            {/* Trophy Animation */}
            <div className="flex justify-center mt-4">
              {!results.isDraw ? (
                <div className="bg-yellow-400 w-24 h-24 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  🏆
                </div>
              ) : (
                <div className="bg-blue-400 w-24 h-24 rounded-full flex items-center justify-center shadow-lg">
                  🤝
                </div>
              )}
            </div>

            {/* Players Section */}
            <div className="mt-6 grid grid-cols-2 gap-4">

              {/* Player 1 */}
              <div
                className={`p-4 rounded-xl text-center transition-all ${results.winnerId === results.results.player1.userId
                  ? "bg-green-200/20 border border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  : "bg-white/10 border border-white/20"
                  }`}
              >
                <p className="font-semibold text-white text-sm">
                  {results.results.player1.user?.name}
                </p>
                <p className="font-semibold text-white text-sm">
                  {results.results.player1.user?.email}
                </p>
                <p className="text-white/80 text-xs mt-1">
                  Score: {results.results.player1.score}
                </p>
                <p className="text-white/80 text-xs">
                  Correct: {results.results.player1.correctAnswers}
                </p>
                <p className="text-white/80 text-xs">
                  Wrong: {results.results.player1.wrongAnswers}
                </p>
                <p className="text-white/80 text-xs">
                  Coins: {results.results.player1.user.coins}
                </p>
              </div>

              {/* Player 2 */}
              <div
                className={`p-4 rounded-xl text-center transition-all ${results.winnerId === results.results.player2.userId
                  ? "bg-green-200/20 border border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  : "bg-white/10 border border-white/20"
                  }`}
              >
                <p className="font-semibold text-white text-sm">
                  {results.results.player2.user?.name}
                </p>
                <p className="font-semibold text-white text-sm">
                  {results.results.player2.user?.email}
                </p>
                <p className="text-white/80 text-xs mt-1">
                  Score: {results.results.player2.score}
                </p>
                <p className="text-white/80 text-xs">
                  Correct: {results.results.player2.correctAnswers}
                </p>
                <p className="text-white/80 text-xs">
                  Wrong: {results.results.player2.wrongAnswers}
                </p>
                <p className="text-white/80 text-xs">
                  Coins: {results.results.player2.user.coins}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 text-center">
              <button
                className="px-6 py-2 rounded-xl bg-red-500 text-white font-medium shadow-lg hover:bg-red-600 transition"
                onClick={() => setShowResult(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {startChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          {/* Modal Box */}
          <div className="relative w-[90%] h-[100] bg-white rounded-lg shadow-lg">
            {/* Close Button */}
            <button
              onClick={() => setStartChat(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>

            {/* Chat Content */}
            <Chatpage />
          </div>
        </div>
      )}


    </>
  );
};

export default UserPage;
