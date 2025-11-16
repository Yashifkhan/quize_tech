import React, { useState } from "react";

const Quizs = ({ quizs }) => {
    const [openMenuId, setOpenMenuId] = useState(null);
    const [playQuiz, setPlayQuiz] = useState(null)
    const [editQuiz, setEditQuize] = useState(null)

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    return (
        <div>

            {/* all quize  */}
            <div className="pt-20 px-8">
                <h1 className="text-4xl font-bold mb-10 text-blue-700">All Quizzes</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {quizs?.map((quiz) => (
                        <div
                            key={quiz.id}
                            className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl p-6 border border-gray-200"
                        >

                            {/* THREE DOT MENU ICON */}
                            <div className="absolute top-4 right-4 z-20">
                                <button
                                    onClick={() => toggleMenu(quiz.id)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-all"
                                >
                                    {/* CUSTOM SVG ICON */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-6 h-6 text-gray-700"
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
                                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 shadow-lg rounded-xl animate-fadeIn">
                                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                            onClick={() => setEditQuize(quiz)}
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
                                onClick={() => setPlayQuiz(quiz)}
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

            {/* play quize modal  */}
            {playQuiz && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative w-[95%] md:w-[70%] lg:w-[60%] h-[80vh] bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl shadow-2xl overflow-hidden">

                        {/* Close button */}
                        <button
                            onClick={() => setPlayQuiz(null)}
                            className="absolute top-5 right-5 z-20 w-6 h-10 flex items-center justify-center bg-white rounded-full text-gray-600 hover:text-red-500 hover:bg-red-50 transition-all shadow-md text-xl font-bold"
                        >
                            ✕
                        </button>

                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                            <h2 className="text-2xl font-bold mb-2">{playQuiz.title}</h2>
                            <p className="text-blue-100">
                                {playQuiz.category?.[0]?.category_name} • {playQuiz.category?.[0]?.topic_name}
                            </p>
                        </div>

                        {/* Scrollable content */}
                        <div className="p-2 overflow-y-auto h-[calc(80vh-120px)] space-y-6">
                            {playQuiz.questions?.map((q, idx) => (
                                <div key={q.id} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 hover:shadow-xl transition-shadow">

                                    {/* Question */}
                                    <div className="flex gap-4 mb-3">
                                        <span className="flex-shrink-0 w-10 h-8 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                                            {idx + 1}
                                        </span>
                                        <p className="font-semibold text-gray-900 text-lg pt-1">{q.question_text}</p>
                                    </div>

                                    {/* Options */}
                                    <div className="ml-14 space-y-3">
                                        {[q.option_1, q.option_2, q.option_3, q.option_4].filter(Boolean).map((option, optIdx) => (
                                            <div
                                                key={optIdx}
                                                className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="w-7 h-7 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center font-bold text-sm text-gray-600">
                                                        {String.fromCharCode(65 + optIdx)}
                                                    </span>
                                                    <span className="text-gray-800">{option}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Correct Answer */}
                                    <div className="ml-14 mt-5 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                                        <p className="text-green-800 font-medium">✓ Correct: {q.correct_answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* edit quize  */}{
                editQuiz && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="relative w-[95%] md:w-[70%] lg:w-[60%] h-[80vh] bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl shadow-2xl overflow-hidden">

{/* Close button */}
                        <button
                            onClick={() => setEditQuize(null)}
                            className="absolute top-5 right-5 z-20 w-6 h-10 flex items-center justify-center bg-white rounded-full text-gray-600 hover:text-red-500 hover:bg-red-50 transition-all shadow-md text-xl font-bold"
                        >
                            ✕
                        </button>

                        <h1>Edit quize</h1>
                        
                        <h3>{editQuiz.title}</h3>
                        </div>
                    </div>
                )
            }


        </div>
    );
};

export default Quizs;
