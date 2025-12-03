import axios from "axios";
import React, { useState } from "react";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;
const Quizs = ({ quizs ,fetchQuizs }) => {
    const [openMenuId, setOpenMenuId] = useState(null);
    const [playQuiz, setPlayQuiz] = useState(null)
    const [editQuiz, setEditQuize] = useState(null)
    const [selectedQuiz, setSelectedQuiz] = useState(null)

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };


    const updateQuestion = (index, field, value) => {
        setEditQuize((prev) => {
            const updated = { ...prev };
            updated.questions[index][field] = value;
            return updated;
        });
    };

    const getChangedQuestions = () => {
        const changed = []

        editQuiz.questions.forEach((q, index) => {
            const original = selectedQuiz.questions[index]

            if (!original) return
            // Check each field
            if (
                console.log("if block is executed"),
                console.log("q.question", q),
                console.log("original.question", original),

                q.question_text !== original.question_text ||
                q.option_1 !== original.option_1 ||
                q.option_2 !== original.option_2 ||
                q.option_3 !== original.option_3 ||
                q.option_4 !== original.option_4 ||
                q.correct_answer !== original.correct_answer
            ) {
                console.log("q", q);

                changed.push(q); // This question has changed
            }
        })
        return changed
    }

    const saveChange = async() => {
        const changedQuestions = getChangedQuestions();
        console.log("edit quize",editQuiz);
        
        try {
            const quiz_id=selectedQuiz.id
            const quizeData={
                title:editQuiz?.title,
                difficulty:editQuiz?.difficulty
            }
            const catagoryData=editQuiz.category[0]
            const questionsData=changedQuestions

            const resp=await axios.post(`${BASE_URL}/update-quiz`, {quiz_id,quizeData,catagoryData,questionsData})
            if(resp.data.success){
              alert("quize is updated succesully")
              setEditQuize(null)
              fetchQuizs()

            }
            
        } catch (error) {
            
        }
    }


    return (
        <div className=" w-[1000px]">

          {/* All Quizzes */}
<div className="pt-5">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {quizs?.map((quiz) => (
      <div
        key={quiz.id}
        className="relative bg-white shadow-md hover:shadow-xl transition-shadow duration-300 rounded-3xl p-5 border border-gray-100 flex flex-col justify-between"
      >
        {/* THREE DOT MENU ICON */}
        <div className="absolute topy-1 right-3 z-20">
          <button
            onClick={() => toggleMenu(quiz.id)}
            className="p-2 rounded-full hover:bg-gray-100 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <circle cx="10" cy="3.5" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="10" cy="16.5" r="1.5" />
            </svg>
          </button>

          {/* DROPDOWN MENU */}
          {openMenuId === quiz.id && (
            <div className="absolute right-0 mt-2 w-24 text-sm bg-white border border-gray-200 shadow-lg rounded-xl animate-fadeIn z-10">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setEditQuize(JSON.parse(JSON.stringify(quiz)));
                  setSelectedQuiz(JSON.parse(JSON.stringify(quiz)));
                }}
              >
                Edit
              </button>
              <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">
                Delete
              </button>
            </div>
          )}
        </div>

        {/* QUIZ HEADER */}
        <div className="flex justify-between items-start mb-4 pr-10">
          <h2 className="text-lg font-bold text-gray-900">{quiz.title}</h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold shadow-md text-white ${
              quiz.difficulty === "easy"
                ? "bg-gradient-to-r from-green-500 to-green-600"
                : quiz.difficulty === "medium"
                ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                : "bg-gradient-to-r from-red-500 to-red-600"
            }`}
          >
            {quiz.difficulty}
          </span>
        </div>

        {/* CATEGORY INFO */}
        <div className="text-gray-700 mb-5 space-y-1">
          <p className="text-sm font-semibold">
            <span className="font-bold">Category:</span>{" "}
            {quiz.category?.[0]?.category_name || "N/A"}
          </p>
          <p className="text-sm font-semibold">
            <span className="font-bold">Topic:</span>{" "}
            {quiz.category?.[0]?.topic_name || "N/A"}
          </p>
        </div>

        {/* VIEW BUTTON */}
        <button
          className="w-full py-2 mt-auto text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow-md transition-all"
          onClick={() => setPlayQuiz(quiz)}
        >
          View
        </button>
      </div>
    ))}
  </div>

  {/* SIMPLE FADE-IN ANIMATION */}
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


           {/* Play Quiz Modal */}
{playQuiz && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div className="relative w-full max-w-4xl h-[80vh] bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-2xl overflow-hidden">

      {/* Close Button */}
      <button
        onClick={() => setPlayQuiz(null)}
        className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white rounded-full text-gray-600 hover:text-red-500 hover:bg-red-50 transition-all shadow-md text-lg font-bold"
      >
        ✕
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <h2 className="text-xl md:text-2xl font-bold mb-1">{playQuiz.title}</h2>
        <p className="text-blue-100 text-sm md:text-base">
          {playQuiz.category?.[0]?.category_name || "N/A"} • {playQuiz.category?.[0]?.topic_name || "N/A"}
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="py-1 md:p-4 overflow-y-auto h-[calc(80vh-80px)] space-y-4 md:space-y-6">

        {playQuiz.questions?.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white rounded-2xl py-1 md:p-4 shadow-sm hover:shadow-md border border-gray-100 transition-shadow"
          >
            {/* Question */}
            <div className="flex gapy-1 mb-2 md:mb-3 items-start">
              <span className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-lg">
                {idx + 1}
              </span>
              <p className="font-semibold text-gray-900 text-sm md:text-base">{q.question_text}</p>
            </div>

            {/* Options */}
            <div className="ml-11 md:ml-14 space-y-2 md:space-y-3">
              {[q.option_1, q.option_2, q.option_3, q.option_4]
                .filter(Boolean)
                .map((option, optIdx) => (
                  <div
                    key={optIdx}
                    className="p-2 md:py-1 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer flex items-center gap-2 md:gapy-1"
                  >
                    <span className="w-6 h-6 md:w-7 md:h-7 bg-white border border-gray-300 rounded-full flex items-center justify-center font-bold text-xs md:text-sm text-gray-600">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="text-gray-800 text-sm md:text-base">{option}</span>
                  </div>
                ))}
            </div>

            {/* Correct Answer */}
            <div className="ml-11 md:ml-14 mt-3 md:mt-4 py-1 md:p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <p className="text-green-800 font-medium text-sm md:text-base">
                ✓ Correct: {q.correct_answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

 {/* EDIT QUIZ MODAL */}
{editQuiz && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm text-sm">
    <div className="relative w-[95%] md:w-[70%] lg:w-[60%] h-[80vh] bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-2xl overflow-hidden">

      {/* Close button */}
      <button
        onClick={() => setEditQuize(null)}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white rounded-full text-gray-600 hover:text-red-500 hover:bg-red-50 shadow transition-all text-xl font-bold"
      >
        ✕
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <h2 className="text-xl md:text-2xl font-bold">{editQuiz.title || "Edit Quiz"}</h2>
        <p className="text-blue-100 text-sm mt-1">
          {editQuiz.category?.[0]?.category_name} • {editQuiz.category?.[0]?.topic_name}
        </p>
      </div>

      {/* Scrollable Editing Area */}
      <div className="p-4 overflow-y-auto h-[calc(80vh-96px)] space-y-4">

        {/* CATEGORY NAME & TOPIC NAME */}
        {["category_name", "topic_name"].map((field) => (
          <div key={field} className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <label className="font-semibold text-gray-800 block mb-1">
              {field === "category_name" ? "Category Name" : "Topic Name"}
            </label>
            <input
              value={editQuiz.category?.[0]?.[field]}
              onChange={(e) =>
                setEditQuize((prev) => ({
                  ...prev,
                  category: [{ ...prev.category[0], [field]: e.target.value }]
                }))
              }
              className="w-full py-1 px-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        ))}

        {/* DESCRIPTION */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <label className="font-semibold text-gray-800 block mb-1">Description</label>
          <textarea
            rows="3"
            value={editQuiz.category?.[0]?.description}
            onChange={(e) =>
              setEditQuize((prev) => ({
                ...prev,
                category: [{ ...prev.category[0], description: e.target.value }]
              }))
            }
            className="w-full py-1 px-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />
        </div>

        {/* QUIZ DIFFICULTY */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <label className="font-semibold text-gray-800 block mb-1">Quiz Difficulty</label>
          <select
            value={editQuiz.difficulty}
            onChange={(e) => setEditQuize((prev) => ({ ...prev, difficulty: e.target.value }))}
            className="w-full py-1 px-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* QUESTIONS */}
        {editQuiz.questions?.map((q, idx) => (
          <div key={q.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-3">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold mr-2">
                {idx + 1}
              </span>
              <h3 className="text-md md:text-lg font-semibold text-gray-900">Edit Question</h3>
            </div>

            {/* QUESTION */}
            <label className="font-medium text-gray-800">Question</label>
            <input
              value={q.question_text}
              onChange={(e) => updateQuestion(idx, "question_text", e.target.value)}
              className="w-full mt-1 mb-3 py-1 px-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-400"
            />

            {/* OPTIONS */}
            <div className="space-y-2">
              {["option_1", "option_2", "option_3", "option_4"].map((optKey, optIdx) => (
                <div key={optKey}>
                  <label className="font-medium text-gray-800">Option {String.fromCharCode(65 + optIdx)}</label>
                  <input
                    value={q[optKey] || ""}
                    onChange={(e) => updateQuestion(idx, optKey, e.target.value)}
                    className="w-full mt-1 py-1 px-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>

            {/* CORRECT ANSWER */}
            <div className="mt-3">
              <label className="font-medium text-gray-800">Correct Answer</label>
              <input
                value={q.correct_answer}
                onChange={(e) => updateQuestion(idx, "correct_answer", e.target.value)}
                className="w-full mt-1 py-1 px-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>
        ))}

        {/* SAVE BUTTON */}
        <button
          onClick={() => saveChange()}
          className="w-full mt-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl font-bold shadow hover:shadow-lg transition-all text-lg"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}



        </div>
    );
};

export default Quizs;
