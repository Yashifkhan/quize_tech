import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import TopHeader from "../components/TopHeader";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const UserPage = () => {

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
  const [categoryTopic,setCategoryTopic]=useState(null)
  const [selectedDiff,setSelectedDiff]=useState("all")




  const getQuizs = async () => {
    try {
      console.log("setSelectedDiff",selectedDiff);
      
      const resp = await axios.get(`${BASE_URL}/get-quiz/${selectedDiff}`)
      console.log("getquize resp", resp?.data?.data);
      if (resp?.data?.success) {
        setQuizes(resp.data.data)
      }
    } catch (error) {
      console.log("quize is not get");


    }
  }
  useEffect(() => {
    getQuizs()
  }, [selectedDiff])


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


  const fetchCategoryTopic=async()=>{
  try {
      const resp=await axios.get(`${BASE_URL}/getQuizCategoryTopicname`)
      console.log("resp of get cat topic ",resp);
      if(resp.data.success){
        setCategoryTopic(resp.data.data)
      }
  } catch (error) {
    console.log("cat or topic is not get ");
  }
    
  }

  useEffect(()=>{
    fetchCategoryTopic()
  },[])

  const playQuizFunction = (quiz) => {
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    console.log("play quize button");
    setModalPlayQuiz(true)
    setSelectedQuiz(quiz || [])

  }

  const selectedAnswer = (opt, idx, questionId) => {
    setSelectedOption(opt)
    const time = formatTime(timePassed)
    const userAns = opt === "option_1" ? "a" : opt === "option_2" ? "b" : opt === "option_3" ? "c" : "d"
    console.log("userAns", userAns);

    setAttemptQuiz((prev) => ({
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

  // console.log("startTime",startTime);
  console.log("selectedOption", selectedQuiz);
  console.log("attemptQuize-->>>", attemptQuize);



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

  const gradeInfo = getGrade(scoreData.percentage);


console.log("categoryTopic",categoryTopic);

  return (
    <>
      {/* HEADER */}
      <div className="p-4 shadow-lg bg-white flex items-center justify-between">

  {/* Logo / Title */}
  <h1 className="font-bold text-lg">Quize Tech</h1>

  {/* Right Section */}
  <div className="flex items-center gap-4">

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
              onClick={() => setOpenProfile(false)}
              className="mt-6 bg-gray-900 text-white w-full py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}



      {/* all quize  */}
      <div className="pt-10 px-8">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold mb-3 text-blue-700">All Quizzes</h1>
                {/* Filter for search quiz */}
<div className="flex items-center gap-3 p-2">

  {/* Difficulty */}
  <select 
    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
     onChange={(e) => setSelectedDiff(e.target.value)}
  >
    <option value="all">Select Difficulty</option>
    <option value="easy">Easy</option>
    <option value="medium">Medium</option>
    <option value="hard">Hard</option>
  </select>

  {/* Category (data will come from loop) */}
  <select
    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Select Category</option>
    {/* Example dynamic */}
    {categoryTopic?.map((t) => (
        <option key={t.id} value={t.category_name}>{t.category_name}</option>
      ))}
  </select>

  {/* Topic (data will come from loop) */}
  <select
    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Select Topic</option>
    {/* Example dynamic */}
    {categoryTopic?.map((cat) => (
        <option key={cat.id} value={cat.topic_name}>{cat.topic_name}</option>
      ))}
    
  </select>

</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-2xl ">
          {quizs?.map((quiz) => (
            <div
              key={quiz.id}
              className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl p-6 border border-gray-200"
            >

              {/* QUIZ HEADER */}
              <div className="flex justify-between items-center mb-4 pr-10">
                <h2 className="text-2xl font-bold text-gray-900">
                  {quiz.title}
                </h2>

                <span
                  className={`px-4 py-1 rounded-full text-sm text-white font-semibold shadow-md ${quiz.difficulty === "easy"
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
                  <span className="font-semibold">Category:</span>{" "}
                  {quiz.category?.[0]?.category_name}
                </p>

                <p>
                  <span className="font-semibold">Topic:</span>{" "}
                  {quiz.category?.[0]?.topic_name}
                </p>
              </div>

              {/* PLAY BUTTON */}
              <button
                className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-all shadow-md"
                onClick={() => playQuizFunction(quiz)}
              >
                ▶ Play Quiz
              </button>

            </div>
          ))}
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

              <div className="text-right text-md font-bold">
                ⏱ {formatTime(timePassed)}
              </div>


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

              {/* Save & Next Button */}
              <button
                onClick={() => submitPlayQuiz()}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
              >
                {currentIndex === selectedQuiz?.questions?.length - 1 ? "Submit" : "Save & Next"}
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
                  <h2 className="text-3xl font-bold mb-2">{getPerformanceMessage(scoreData.percentage)}</h2>
                  <p className="text-blue-100">Quiz Completed Successfully</p>
                </div>
              </div>

              {/* Score Overview */}
              <div className="p-8">
                {/* Main Score Display */}
                <div className="flex items-center justify-center mb-8">
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
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {/* Accuracy */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      {/* <Target className="w-5 h-5 text-purple-600" /> */}
                      <span className="text-xs font-semibold text-purple-600 uppercase">Accuracy</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-700">{scoreData.accuracy}%</div>
                  </div>

                  {/* Time Taken */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      {/* <Clock className="w-5 h-5 text-blue-600" /> */}
                      <span className="text-xs font-semibold text-blue-600 uppercase">Time</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{scoreData.time}</div>
                  </div>

                  {/* Rank */}
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      {/* <Award className="w-5 h-5 text-yellow-600" /> */}
                      <span className="text-xs font-semibold text-yellow-600 uppercase">Rank</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-700">#{scoreData.rank}</div>
                  </div>

                  {/* Coins Earned */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      {/* <TrendingUp className="w-5 h-5 text-green-600" /> */}
                      <span className="text-xs font-semibold text-green-600 uppercase">Coins</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">+{scoreData.coin}</div>
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

                {/* Save & Next / Submit */}
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



    </>
  );
};

export default UserPage;
