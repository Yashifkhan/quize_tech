import axios from "axios";
import { Edit, MoreVertical, Trash2, X } from "lucide-react";
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
      <div className="w-full max-w-6xl mx-auto p-4">
      
      {/* Quiz Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {quizs?.map((quiz) => (
          <div
            key={quiz.id}
            className="relative bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg p-3 border border-gray-200 flex flex-col"
          >
            {/* Menu Button */}
            <div className="absolute top-2 right-2 z-20">
              <button
                onClick={() => toggleMenu(quiz.id)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-all"
              >
                <MoreVertical size={16} className="text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {openMenuId === quiz.id && (
                <div className="absolute right-0 mt-1 w-24 text-xs bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden z-10">
                  <button
                    className="block w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-1.5"
                    onClick={() => {
                      setEditQuize(JSON.parse(JSON.stringify(quiz)));
                      setSelectedQuiz(JSON.parse(JSON.stringify(quiz)));
                      setOpenMenuId(null);
                    }}
                  >
                    <Edit size={12} />
                    Edit
                  </button>
                  <button className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-1.5">
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Quiz Header */}
            <div className="mb-2 pr-8">
              <h2 className="text-sm font-bold text-gray-900 mb-1">{quiz.title}</h2>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${
                  quiz.difficulty === "easy"
                    ? "bg-green-600"
                    : quiz.difficulty === "medium"
                    ? "bg-yellow-500"
                    : "bg-red-600"
                }`}
              >
                {quiz.difficulty}
              </span>
            </div>

            {/* Category Info */}
            <div className="text-gray-700 mb-3 space-y-0.5 flex-1">
              <p className="text-xs">
                <span className="font-semibold">Category:</span>{" "}
                {quiz.category?.[0]?.category_name || "N/A"}
              </p>
              <p className="text-xs">
                <span className="font-semibold">Topic:</span>{" "}
                {quiz.category?.[0]?.topic_name || "N/A"}
              </p>
            </div>

            {/* View Button */}
            <button
              className="w-full py-1.5 text-xs border border-red-600 hover:bg-red-700  text-red-600 hover:text-white rounded font-semibold transition-all"
              onClick={() => setPlayQuiz(quiz)}
            >
              View Quiz
            </button>
          </div>
        ))}
      </div>

      {/* Play Quiz Modal */}
      {playQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-3">
          <div className="relative w-full max-w-3xl h-[85vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">

            {/* Header */}
            <div className="bg-red-600 p-4 text-white border-b border-red-700">
              <button
                onClick={() => setPlayQuiz(null)}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center bg-white rounded-full text-gray-600 hover:text-red-600 hover:bg-gray-100 transition-all"
              >
                <X size={16} />
              </button>
              <h2 className="text-lg font-bold mb-0.5 pr-8">{playQuiz.title}</h2>
              <p className="text-red-100 text-xs">
                {playQuiz.category?.[0]?.category_name || "N/A"} • {playQuiz.category?.[0]?.topic_name || "N/A"}
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {playQuiz.questions?.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                >
                  {/* Question */}
                  <div className="flex gap-2 mb-2 items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <p className="font-semibold text-gray-900 text-sm">{q.question_text}</p>
                  </div>

                  {/* Options */}
                  <div className="ml-8 space-y-1.5">
                    {[q.option_1, q.option_2, q.option_3, q.option_4]
                      .filter(Boolean)
                      .map((option, optIdx) => (
                        <div
                          key={optIdx}
                          className="p-2 bg-white rounded-lg border border-gray-200 hover:border-red-300 transition-all flex items-center gap-2"
                        >
                          <span className="w-5 h-5 bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center font-semibold text-[10px] text-gray-600">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="text-gray-800 text-xs">{option}</span>
                        </div>
                      ))}
                  </div>

                  {/* Correct Answer */}
                  <div className="ml-8 mt-2 p-2 bg-green-50 border-l-2 border-green-600 rounded">
                    <p className="text-green-800 font-semibold text-xs">
                      ✓ Correct: {q.correct_answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Quiz Modal */}
      {editQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-3">
          <div className="relative w-full max-w-3xl h-[85vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">

            {/* Header */}
            <div className="bg-red-600 p-4 text-white border-b border-red-700">
              <button
                onClick={() => setEditQuize(null)}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center bg-white rounded-full text-gray-600 hover:text-red-600 hover:bg-gray-100 transition-all"
              >
                <X size={16} />
              </button>
              <h2 className="text-lg font-bold mb-0.5 pr-8">{editQuiz.title || "Edit Quiz"}</h2>
              <p className="text-red-100 text-xs">
                {editQuiz.category?.[0]?.category_name} • {editQuiz.category?.[0]?.topic_name}
              </p>
            </div>

            {/* Scrollable Editing Area */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">

              {/* Category & Topic */}
              <div className="grid grid-cols-2 gap-2">
                {["category_name", "topic_name"].map((field) => (
                  <div key={field} className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <label className="font-semibold text-gray-800 block mb-1 text-xs">
                      {field === "category_name" ? "Category" : "Topic"}
                    </label>
                    <input
                      value={editQuiz.category?.[0]?.[field]}
                      onChange={(e) =>
                        setEditQuize((prev) => ({
                          ...prev,
                          category: [{ ...prev.category[0], [field]: e.target.value }]
                        }))
                      }
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                <label className="font-semibold text-gray-800 block mb-1 text-xs">Description</label>
                <input
                  value={editQuiz.category?.[0]?.description}
                  onChange={(e) =>
                    setEditQuize((prev) => ({
                      ...prev,
                      category: [{ ...prev.category[0], description: e.target.value }]
                    }))
                  }
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Difficulty */}
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                <label className="font-semibold text-gray-800 block mb-1 text-xs">Difficulty</label>
                <select
                  value={editQuiz.difficulty}
                  onChange={(e) => setEditQuize((prev) => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Questions */}
              {editQuiz.questions?.map((q, idx) => (
                <div key={q.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-600 text-white font-bold text-xs">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-gray-900">Question</h3>
                  </div>

                  {/* Question Text */}
                  <input
                    value={q.question_text}
                    onChange={(e) => updateQuestion(idx, "question_text", e.target.value)}
                    placeholder="Question text"
                    className="w-full mb-2 px-2.5 py-1.5 border border-gray-300 rounded text-xs outline-none focus:ring-1 focus:ring-red-500"
                  />

                  {/* Options */}
                  <div className="space-y-1.5">
                    {["option_1", "option_2", "option_3", "option_4"].map((optKey, optIdx) => (
                      <div key={optKey} className="flex items-center gap-1.5">
                        <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center font-semibold text-[10px] text-gray-700">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <input
                          value={q[optKey] || ""}
                          onChange={(e) => updateQuestion(idx, optKey, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-xs outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Correct Answer */}
                  <div className="mt-2">
                    <label className="font-semibold text-gray-700 block mb-1 text-[10px]">CORRECT ANSWER</label>
                    <input
                      value={q.correct_answer}
                      onChange={(e) => updateQuestion(idx, "correct_answer", e.target.value)}
                      placeholder="A, B, C, or D"
                      className="w-full px-2.5 py-1.5 border border-green-300 bg-green-50 rounded text-xs outline-none focus:ring-1 focus:ring-green-500 font-medium text-green-700"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => saveChange()}
                className="w-full py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 transition-all text-sm"
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
