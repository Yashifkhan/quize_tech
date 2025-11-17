import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useFetcher, useLocation } from 'react-router-dom';
import Quizs from './Quizs';
const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const AdminPage = () => {
  const location=useLocation()
  const user = location.state?.userData;
  const [createQuizeModal, setCreateQuizeModal] = useState(false)
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [quizs,setQuiz]=useState(null)

  const [catagoryData, setcatagoryData] = useState({
    category_name: '', topic_name: '', description: ''
  })
  const [quizeData, setQuizeData] = useState({
    title: '', difficulty: '',created_by:user?.id
  })
  const blankQuestion = {
    question_text: '',
    option_1: '',
    option_2: '',
    option_3: '',
    option_4: '',
    correct_option: '',
    difficulty: 'Easy'
  }
  const [questionsData, setQuestionsData] = useState([ { ...blankQuestion } ])


  const catagoryDataFunction = (name, value) => {
    setcatagoryData(prev => ({ ...prev, [name]: value }));
  }

  const quizeDataFunction = (name, value) => {
    setQuizeData(prev => ({ ...prev, [name]: value }))
  }

  const updateQuestionData = (index, field, value) => {
    setQuestionsData(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addQuizfunction = () => {
    setCreateQuizeModal(true)
    // ensure first question is open when modal opens
    setActiveQuestionIndex(0)
  }

  // Validate a single question object (returns { ok: boolean, message })
  const validateQuestion = (q) => {
    if (!q.question_text?.trim()) return { ok: false, message: 'Question text is required' }
    if (!q.option_1?.trim()) return { ok: false, message: 'Option 1 is required' }
    if (!q.option_2?.trim()) return { ok: false, message: 'Option 2 is required' }
    if (!q.option_3?.trim()) return { ok: false, message: 'Option 3 is required' }
    if (!q.option_4?.trim()) return { ok: false, message: 'Option 4 is required' }
    if (!q.correct_option?.trim()) return { ok: false, message: 'Select correct option' }
    if (!q.difficulty?.trim()) return { ok: false, message: 'Select difficulty' }
    return { ok: true }
  }

  // submit quize data 
  const handleSubmit = async () => {
    // validate category & quiz-level fields first
    if (!catagoryData.category_name || !catagoryData.topic_name || !catagoryData.description || !quizeData.difficulty || !quizeData.title) {
      alert("All quiz fields are required")
      return
    }

    // validate each question
    for (let i = 0; i < questionsData.length; i++) {
      const res = validateQuestion(questionsData[i])
      if (!res.ok) {
        alert(`Question ${i + 1} error: ${res.message}`)
        setActiveQuestionIndex(i) // open that question
        return
      }
    }

    // proceed to submit
    try {
      const quize = { catagoryData, quizeData, questionsData }

      console.log("quize data",quize);
      
      const resp = await axios.post(`${BASE_URL}/create-quiz`, quize)
      if (resp.data.success) {
        alert("Quiz is created successfully")
        // reset form (optional)
        setCreateQuizeModal(false)
        setcatagoryData({ category_name: '', topic_name: '', description: '' })
        setQuizeData({ title: '', difficulty: '' })
        setQuestionsData([ { ...blankQuestion } ])
        setActiveQuestionIndex(0)
      } else {
        alert('Failed to create quiz')
      }
    } catch (error) {
      console.error("quize not create", error);
      alert('Error creating quiz')
    }
  };


  // get the quiz data 
  const fetchQuizs=async()=>{
    try {
      const resp=await axios.get(`${BASE_URL}/get-quiz`)
      if(resp.data.success){
        console.log("success if block");
        setQuiz(resp.data.data)
      }
    } catch (error) {
      console.log("quiz are not get"); 
    }
  }
useEffect(()=>{
  fetchQuizs()
},[])


  const difficulties = [
    { value: 'Easy', emoji: '🟢', color: 'from-green-400 to-emerald-500' },
    { value: 'Medium', emoji: '🟡', color: 'from-yellow-400 to-orange-500' },
    { value: 'Hard', emoji: '🔴', color: 'from-red-400 to-pink-500' }
  ];
  const categories = [
    { value: 'Programming Language', icon: '💻', color: 'from-blue-500 to-cyan-500' },
    { value: 'Computer Science', icon: '🖥️', color: 'from-purple-500 to-pink-500' },
    { value: 'ML', icon: '🤖', color: 'from-green-500 to-emerald-500' },
    { value: 'Maths', icon: '🔢', color: 'from-orange-500 to-red-500' },
    { value: 'DSA', icon: '🎯', color: 'from-indigo-500 to-violet-500' }
  ];

  // Called when user clicks "Next Question"
  const handleNextQuestion = () => {
    const currentIndex = activeQuestionIndex
    const currentQuestion = questionsData[currentIndex]
    const res = validateQuestion(currentQuestion)
    if (!res.ok) {
      alert(res.message)
      return
    }

    // If current is last, push a new blank and open it
    if (currentIndex === questionsData.length - 1) {
      setQuestionsData(prev => ([ ...prev, { ...blankQuestion } ]))
      setActiveQuestionIndex(currentIndex + 1)
    } else {
      // there are later questions (user might be editing older one). Move focus to next
      setActiveQuestionIndex(currentIndex + 1)
    }
  }

  const handlePrevQuestion = () => {
    setActiveQuestionIndex(prev => Math.max(0, prev - 1))
  }

  const openQuestion = (index) => {
    setActiveQuestionIndex(index)
  }

  const removeQuestion = (index) => {
    if (!confirm('Delete this question?')) return
    setQuestionsData(prev => {
      const updated = prev.filter((_, i) => i !== index)
      return updated.length ? updated : [{ ...blankQuestion }]
    })
    // adjust active index
    setActiveQuestionIndex(prev => {
      if (index < prev) return prev - 1
      if (index === prev) return Math.max(0, prev - 1)
      return prev
    })
  }


  console.log("user",user);


  
  return (
    <div className="relative min-h-screen  from-gray-50 to-green-50 ">
      {/* Add Quiz Button */}
      <div
        className="fixed top-25 right-20 bg-green-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-green-700 cursor-pointer transition-all duration-300 flex items-center gap-2"
        onClick={() => addQuizfunction()}
      >
        <span className="text-xl font-semibold">＋</span>
        <span>Add Quiz</span>
      </div>


      {createQuizeModal && (
        <div className="fixed inset-0 flex items-center justify-center  from-black/60 via-purple-900/40 to-black/60 backdrop-blur-md z-50 p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative max-h-[95vh] overflow-hidden">
            {/* Decorative Header Background */}
            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 opacity-10"></div>
            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-blue-600 to-purple-600 opacity-5"></div>

            {/* Close Button */}
            <button
              onClick={() => setCreateQuizeModal(false)}
              className="absolute top-6 right-6 z-20 text-gray-500 hover:text-red-600 
             bg-white px-3 py-1 text-xl font-bold rounded-lg  transition"
            >
              X
            </button>


            {/* Modal Content */}
            <div className="relative z-10 p-8 max-h-[95vh] overflow-y-auto">
              {/* Title Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  Create New Quiz
                </h2>
                <p className="text-gray-500">Design an engaging quiz experience</p>
              </div>

              <div className="space-y-6">
                {/* Category Selection - Modern Cards */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-3 flex items-center gap-2">
                    <span className="text-xl">🎨</span>
                    <span>Select Category</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => catagoryDataFunction("category_name", cat.value)}
                        className={`
                          relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 
                          ${catagoryData.category_name === cat.value ? "bg-red-600 text-white" : "bg-amber-100"}
                        `}
                      >
                        {cat.value}
                      </button>
                    ))}

                  </div>
                </div>

                {/* Topic & Title - Side by Side */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <span>📚</span>
                      <span>Topic</span>
                    </label>
                    <input
                      type="text"
                      value={catagoryData.topic_name}
                      onChange={(e) => { catagoryDataFunction("topic_name", e.target.value) }}
                      placeholder="e.g., React Hooks"
                      className="w-full border-2 border-gray-200 rounded-xl p-3.5 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-gradient-to-br from-white to-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <span>✨</span>
                      <span>Quiz Title</span>
                    </label>
                    <input
                      type="text"
                      value={quizeData.title}
                      onChange={(e) => quizeDataFunction("title", e.target.value)}
                      placeholder="e.g., Master React Hooks"
                      className="w-full border-2 border-gray-200 rounded-xl p-3.5 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-gradient-to-br from-white to-gray-50"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <span>📝</span>
                    <span>Description</span>
                  </label>
                  <textarea
                    value={catagoryData.description}
                    onChange={(e) => catagoryDataFunction("description", e.target.value)}
                    placeholder="Describe your quiz in a few words..."
                    rows="3"
                    className="w-full border-2 border-gray-200 rounded-xl p-3.5 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all resize-none bg-gradient-to-br from-white to-gray-50"
                  />
                </div>

                {/* Quiz Difficulty - Modern Toggle Style */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-3 flex items-center gap-2">
                    <span>⚡</span>
                    <span>Quiz Difficulty</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3 p-2 bg-gray-100 rounded-2xl">
                    {difficulties.map((diff) => (
                      <button
                        key={diff.value}
                        type="button"
                        onClick={() => quizeDataFunction("difficulty", diff.value)}
                        className={`relative p-4 rounded-xl font-semibold transition-all duration-300 ${quizeData.difficulty === diff.value
                          ? `bg-gradient-to-br ${diff.color} text-white shadow-lg scale-105`
                          : 'bg-white text-gray-600 hover:scale-102'
                          }`}
                      >
                        <div className="text-2xl mb-1">{diff.emoji}</div>
                        <div className="text-sm">{diff.value}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Questions List - collapsible sections */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="text-2xl">❓</span>
                    <span>Questions</span>
                  </h3>

                  {questionsData.map((q, idx) => (
                    <div key={idx} className="border-2 rounded-2xl overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                        onClick={() => openQuestion(idx)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center font-bold">
                            Q{idx + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{ q.question_text ? q.question_text.slice(0, 80) : `Untitled question ${idx + 1}` }</div>
                            <div className="text-sm text-gray-500">{q.difficulty} • {q.correct_option ? `Answer: ${q.correct_option}` : 'No answer'}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openQuestion(idx); }}
                            className="px-3 py-1 rounded-md bg-white border text-sm"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeQuestion(idx); }}
                            className="px-3 py-1 rounded-md bg-red-50 border text-sm text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Body: show if activeQuestionIndex === idx */}
                      {activeQuestionIndex === idx && (
                        <div className="p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
                          <div className="space-y-4">
                            <div>
                              <input
                                type="text"
                                value={q.question_text}
                                onChange={(e) => updateQuestionData(idx, "question_text", e.target.value)}
                                placeholder="Enter your question..."
                                className="w-full border-2 border-purple-200 rounded-xl p-4 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-white font-medium"
                              />
                            </div>

                            <div className="grid gap-3">
                              {/* Option A */}
                              <div className="flex items-center gap-3 group">
                                <div>A</div>
                                <input
                                  type="text"
                                  value={q.option_1}
                                  onChange={(e) => updateQuestionData(idx, "option_1", e.target.value)}
                                  placeholder="Option 1"
                                  className="flex-1 border-2 border-purple-200 rounded-xl p-3 bg-white"
                                />
                              </div>

                              {/* Option B */}
                              <div className="flex items-center gap-3 group">
                                <div>B</div>
                                <input
                                  type="text"
                                  value={q.option_2}
                                  onChange={(e) => updateQuestionData(idx, "option_2", e.target.value)}
                                  placeholder="Option 2"
                                  className="flex-1 border-2 border-purple-200 rounded-xl p-3 bg-white"
                                />
                              </div>

                              {/* Option C */}
                              <div className="flex items-center gap-3 group">
                                <div>C</div>
                                <input
                                  type="text"
                                  value={q.option_3}
                                  onChange={(e) => updateQuestionData(idx, "option_3", e.target.value)}
                                  placeholder="Option 3"
                                  className="flex-1 border-2 border-purple-200 rounded-xl p-3 bg-white"
                                />
                              </div>

                              {/* Option D */}
                              <div className="flex items-center gap-3 group">
                                <div>D</div>
                                <input
                                  type="text"
                                  value={q.option_4}
                                  onChange={(e) => updateQuestionData(idx, "option_4", e.target.value)}
                                  placeholder="Option 4"
                                  className="flex-1 border-2 border-purple-200 rounded-xl p-3 bg-white"
                                />
                              </div>
                            </div>

                            {/* Correct Answer & Question Difficulty */}
                            <div className="grid md:grid-cols-2 gap-4 pt-2">
                              <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                  ✅ Correct Answer
                                </label>
                                <div className="relative">
                                  <select
                                    value={q.correct_option}
                                    onChange={(e) => updateQuestionData(idx, "correct_option", e.target.value)}
                                    className="w-full border-2 border-purple-200 rounded-xl p-3 pr-10 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-white appearance-none cursor-pointer"
                                  >
                                    <option value="">Select correct option</option>
                                    <option value="A">Option A</option>
                                    <option value="B">Option B</option>
                                    <option value="C">Option C</option>
                                    <option value="D">Option D</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                  🎯 Question Difficulty
                                </label>
                                <div className="relative">
                                  <select
                                    value={q.difficulty}
                                    onChange={(e) => updateQuestionData(idx, "difficulty", e.target.value)}
                                    className="w-full border-2 border-purple-200 rounded-xl p-3 pr-10 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-white appearance-none cursor-pointer"
                                  >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Controls for question navigation */}
                            <div className="flex items-center gap-3 pt-4">
                              <button
                                type="button"
                                onClick={handlePrevQuestion}
                                disabled={idx === 0}
                                className="px-4 py-2 rounded-xl bg-white border"
                              >
                                Prev
                              </button>

                              <button
                                type="button"
                                onClick={handleNextQuestion}
                                className="px-4 py-2 rounded-xl bg-green-600 text-white"
                              >
                                Next Question
                              </button>

                              <div className="text-sm text-gray-500 ml-auto">
                                {idx + 1} / {questionsData.length}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                </div>

                {/* Action Buttons - Enhanced */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setCreateQuizeModal(false)}
                    className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 px-6 py-4 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white px-6 py-4 rounded-xl hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 font-semibold hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <span>Create Quiz</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* show quize moda  */}
      {
        quizs?.length > 0 && <Quizs quizs={quizs}></Quizs>
          
        
      }
    </div>

  )
}

export default AdminPage
