import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import TopHeader from "../components/TopHeader";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;


const UserPage = () => {
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
const [attemptQuize,setAttemptQuiz]=useState(null)




  const getQuizs = async () => {
    try {
      const resp = await axios.get(`${BASE_URL}/get-quiz`)
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
  }, [])


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


  const playQuizFunction = (quiz) => {
    const now = new Date();
  setStartTime(now);
   setIsRunning(true);
    console.log("play quize button");
    setModalPlayQuiz(true)
    setSelectedQuiz(quiz || [])

  }

  const selectedAnswer=(opt,idx,questionId)=>{
    setSelectedOption(opt)
     const time=formatTime(timePassed)
    const userAns = opt=== "option_1" ? "a" : opt === "option_2" ? "b" : opt === "option_3" ? "c" : "d"
    console.log("userAns",userAns);
    
    setAttemptQuiz((prev) => ({
  quizId: selectedQuiz?.id,
  userId: user?.id,
  time:time,
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
    // console.log("selectedQuiz.id",selectedQuiz.id);
    
    
    
    

  }

  const submitPlayQuiz = async() => {
    if (currentIndex < selectedQuiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else if(currentIndex === selectedQuiz.questions.length - 1){
      handleSubmitQuiz()
      setIsRunning(false); 
      try {
        const resp=await axios.post(`${BASE_URL}/submit-quiz`,attemptQuize)
        console.log("resp of submit quiz",resp);
        if(resp?.data?.success){
          alert("quize  submit succesfully")
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
console.log("selectedOption",selectedOption);
console.log("attemptQuize-->>>",attemptQuize);

  return (
    <>
      {/* HEADER */}
      <TopHeader></TopHeader>
      <div className="w-full px-6 py-3 bg-gray-900 text-white flex justify-between items-center shadow">
        <h2 className="text-xl font-semibold">Quiz tech</h2>

        {/* PROFILE ICON */}
        <div

          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center cursor-pointer font-bold text-lg hover:scale-105 transition"
        >
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
      </div>

      {/* PAGE CONTENT */}

      {/* MODAL */}
      {openProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
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
      <div className="pt-20 px-8">
        <h1 className="text-2xl font-bold mb-3 text-blue-700">All Quizzes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                onClick={() => { setModalPlayQuiz(false); setSelectedOption(null); setCurrentIndex(0);handleSubmitQuiz() }}
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
                        onClick={() => selectedAnswer(opt,idx,questionId)}
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
      handleSubmitQuiz ()
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



    </>
  );
};

export default UserPage;
