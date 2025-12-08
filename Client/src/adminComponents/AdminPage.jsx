import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useFetcher, useLocation, useNavigate } from 'react-router-dom';
import Quizs from './Quizs';
import TopHeader from '../components/TopHeader';
import AdminDashboard from './AdminDashboard';
// import { FaUserCircle } from "react-icons/fa";
const BASE_URL = import.meta.env.VITE_APP_BASE_URL;


const AdminPage = () => {
  const navigate=useNavigate()
  const location = useLocation()
  const user = location.state?.userData;
  const [createQuizeModal, setCreateQuizeModal] = useState(false)
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [quizs, setQuiz] = useState(null)
  const [activePage, setActivePage] = useState("quizzes");
  const [genrateQuizModal, setGenrateQuizModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiQuestions, setAiQuestions] = useState([])
  const [category, setCategory] = useState("")
  const [count, setCount] = useState(0)
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [instructions, setInstructions] = useState("")




  //  const genrateWithAi = () => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     const mockQuestions = Array.from({ length: parseInt(count) || 3 }, (_, i) => ({
  //       question: `Sample Question ${i + 1} about ${topic || 'General Knowledge'}?`,
  //       options: {
  //         a: 'Option A',
  //         b: 'Option B',
  //         c: 'Option C',
  //         d: 'Option D'
  //       },
  //       answer: 'a'
  //     }));
  //     setAiQuestions(mockQuestions);
  //     setLoading(false);
  //   }, 2000);
  // };

  const handleQuestionEdit = (index, field, value) => {
    const updated = [...aiQuestions];
    updated[index][field] = value;
    setAiQuestions(updated);
  };

  const handleOptionEdit = (qIndex, optionKey, value) => {
    const updated = [...aiQuestions];
    updated[qIndex].options[optionKey] = value;
    setAiQuestions(updated);
  };

  const deleteQuestion = (index) => {
    setAiQuestions(aiQuestions.filter((_, i) => i !== index));
  };

  const addNewQuestion = () => {
    setAiQuestions([
      ...aiQuestions,
      {
        question: 'New Question',
        options: { a: 'Option A', b: 'Option B', c: 'Option C', d: 'Option D' },
        answer: 'a'
      }
    ]);
  };

  const saveQuiz =async () => {
    
    // Category Data
    const catagoryData = {
      category_name: category,
      topic_name: topic,
      description: instructions || `${topic} quiz with ${difficulty} difficulty`
    };

    // Questions Data
    const questionsData = aiQuestions.map(q => ({
      question_text: q.question,
      option_1: q.options.a,
      option_2: q.options.b,
      option_3: q.options.c,
      option_4: q.options.d,
      correct_option: q.answer.toUpperCase(),
      difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    }));

    const quizeData = {
      title: `${topic} - ${difficulty} level`,
      category: category,
      difficulty: difficulty,
      created_by:user.id
    };

    // console.log('categoryData:', categoryData);
    // console.log('questionsData:', questionsData);
    // console.log('quizData:', quizData);

      // try {
      const quize = { catagoryData, quizeData, questionsData }
      console.log("quize data", quize);
      const resp = await axios.post(`${BASE_URL}/create-quiz`, quize)
      console.log("resp",resp);
      
      if (resp.data.success) {
        alert("Quiz is created successfully")
        // reset form (optional)
        setCreateQuizeModal(false)
        setcatagoryData({ category_name: '', topic_name: '', description: '' })
        setQuizeData({ title: '', difficulty: '' })
        setQuestionsData([{ ...blankQuestion }])
        setActiveQuestionIndex(0)
      } else {
        alert('Failed to create quiz')
      }
    // } 
    // catch (error) {
    //   console.error("quize not create", error);
    //   alert('Error creating quiz')
    // }

  //   console.log('Complete Quiz Data:', JSON.stringify(finalData, null, 2));
  //   alert('Quiz saved! Check console for complete data.');
  };

  // if (!genrateQuizModal) return null;


  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "quizzes", label: "Quizzes" },
    { id: "history", label: "History" },
    { id: "requests", label: "Requests" },
    { id: "activities", label: "Activities" }
  ];

  const [catagoryData, setcatagoryData] = useState({
    category_name: '', topic_name: '', description: ''
  })
  const [quizeData, setQuizeData] = useState({
    title: '', difficulty: '', created_by: user?.id
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
  const [questionsData, setQuestionsData] = useState([{ ...blankQuestion }])


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

      console.log("quize data", quize);

      const resp = await axios.post(`${BASE_URL}/create-quiz`, quize)
      if (resp.data.success) {
        alert("Quiz is created successfully")
        // reset form (optional)
        setCreateQuizeModal(false)
        setcatagoryData({ category_name: '', topic_name: '', description: '' })
        setQuizeData({ title: '', difficulty: '' })
        setQuestionsData([{ ...blankQuestion }])
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
  const fetchQuizs = async () => {
    try {
            
      const  selectedDiff ="all"
      const resp = await axios.get(`${BASE_URL}/get-quizs-all`,{params:{selectedDiff:selectedDiff}})
      console.log("resp", resp);

      if (resp.data.success) {
        console.log("success if block");
        setQuiz(resp.data.data)
      }
    } catch (error) {
      console.log("quiz are not get");
    }
  }
  useEffect(() => {
    fetchQuizs()
  }, [])


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
      setQuestionsData(prev => ([...prev, { ...blankQuestion }]))
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


  // console.log("user", user);
  const addAIQuizfunction = () => {
    setGenrateQuizModal(true)

  }

  const genrateWithAi = async () => {
    setLoading(true)
    if (!category || !count || count >50 || !topic || !difficulty || !instructions) {
      return alert("all filds are required and count less then 50 ")
    } else {
      console.log("api call safly ");
      const quizData={category , count ,topic ,difficulty ,instructions}
      const resp = await axios.post(`${BASE_URL}/genrate-quize`,quizData)
      console.log("respi of ai quize genrate", resp);
      if (resp.data.success === true) {
        setAiQuestions(resp.data.data)
      }
      setLoading(false)
    }
    setLoading(false)
  }

console.log("aiQuestions",aiQuestions);


  return (
    <>

      {/* top header  */}
      <div
        className="
        w-full h-16 bg-white shadow-md 
        flex items-center justify-between 
        px-6 fixed top-0 left-0 z-50
      "
      >
        {/* LOGO / TITLE */}
        <h1 className="text-2xl font-bold text-gray-800">
          Quiz Tech
        </h1>

        {/* RIGHT SIDE BUTTONS */}
        <div className="flex items-center gap-4">

          {/* Logout Button */}
          <button
          onClick={()=> navigate('/login')}
            className="
            bg-red-500 text-white px-4 py-2
            rounded-xl font-semibold
            shadow-md hover:shadow-lg 
            transition-all duration-200
            hover:scale-105 active:scale-95
          "
          >
            Logout
          </button>

          {/* Profile Icon */}
          <button
            className="
            bg-blue-500 text-white p-2 
            rounded-full shadow-md 
            hover:shadow-lg transition-all 
            hover:scale-105 active:scale-95
          "
          >
            {/* <FaUserCircle size={26} /> */}
          </button>
        </div>
      </div>

      <div className=" fixed top-16 left-0 h-full w-56  bg-white shadow-lg border-r flex flex-col py-4 " >
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`
            text-left px-5 py-2 text-[16px] font-semibold 
            transition-all duration-200
            ${activePage === item.id
                ? "bg-blue-600 text-white rounded-r-xl"
                : "text-gray-700 hover:bg-gray-100"
              }
          `}
          >
            {item.label}
          </button>
        ))}
      </div>
      {
        activePage === "dashboard" && 
         <AdminDashboard></AdminDashboard>
        
      }

      {
        activePage === "quizzes" && (
         <div>
           <div className='text-md text-bold pl-60 py-20'>
{/* Quiz Management Header with Filters */}
<div className="bg-white shadow rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
  <h1 className="text-xl font-semibold">Quiz Management</h1>

  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
    <input
      type="text"
      placeholder="Search user..."
      className="border px-3 py-1 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
    />
    <select className="border px-3 py-1 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none">
      <option>Select category</option>
      <option>AI Quiz</option>
      <option>Simple Quiz</option>
    </select>
    <input
      type="date"
      className="border px-3 py-1 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
    />
  </div>
</div>

{/* Action Buttons */}
<div className="relative ">
  <div className="flex flex-wrap gap-4 justify-start md:justify-end items-center">
    {/* Create Quiz Simple */}
    <button
      className="bg-green-600 text-white px-4 py-1 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 flex items-center gap-2"
      onClick={() => addQuizfunction()}
    >
      <span className="text-sm font-bold">＋</span>
      <span>Create Quiz</span>
    </button>

    {/* Create Quiz with AI */}
    <button
      className="bg-green-600 text-white px-4 py-1 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 flex items-center gap-2"
      onClick={() => addAIQuizfunction()}
    >
      <span className="text-sm font-bold">🤖</span>
      <span>Create Quiz with AI</span>
    </button>

    {/* Import Excel */}
    <button
      className="bg-green-600 text-white px-4 py-1 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 flex items-center gap-2"
      onClick={() => alert("This Feature is coming soon")}
    >
      Import in Excel
    </button>

    {/* Create Quiz for Live */}
    <button
      className="bg-green-600 text-white px-4 py-1 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 flex items-center gap-2"
      onClick={() => alert("This Feature is coming soon")}
    >
      Quiz Create for Live
    </button>
  </div>
</div>



           

            {/* create quize simple  */}
            {createQuizeModal && (
              <div className="fixed inset-0 flex items-center justify-center  from-black/60 via-purple-900/40 to-black/60 backdrop-blur-md z-50 p-4 animate-fadeIn">
                <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative max-h-[95vh] overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 opacity-10"></div>
                  <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-blue-600 to-purple-600 opacity-5"></div>

                  <button
                    onClick={() => setCreateQuizeModal(false)}
                    className="absolute top-6 right-6 z-20 text-gray-500 hover:text-red-600 
             bg-white px-3 py-1 text-xl font-bold rounded-lg  transition"
                  >
                    X
                  </button>


                  <div className="relative z-10 p-4 max-h-[95vh] overflow-y-auto text-sm">
                    <div className="text-center">
                      {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
                      </div> */}
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-2">
                        Create New Quiz
                      </h2>
                      <p className="text-gray-500">Design an engaging quiz experience</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-3 flex items-center gap-2">
                          <span className="text-xl">🎨</span>
                          <span>Select Category</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {categories.map((cat) => (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => catagoryDataFunction("category_name", cat.value)}
                              className={`
                          relative p-3 rounded-2xl border-2 transition-all duration-300 hover:scale-105 
                          ${catagoryData.category_name === cat.value ? "bg-red-600 text-white" : "bg-amber-100"}
                        `}
                            >
                              {cat.value}
                            </button>
                          ))}

                        </div>
                      </div>

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

                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <span className="text-2xl">❓</span>
                          <span>Questions</span>
                        </h3>

                        {questionsData.map((q, idx) => (
                          <div key={idx} className="border-2 rounded-2xl overflow-hidden">
                            <div className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                              onClick={() => openQuestion(idx)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center font-bold">
                                  Q{idx + 1}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-800">{q.question_text ? q.question_text.slice(0, 80) : `Untitled question ${idx + 1}`}</div>
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

            {genrateQuizModal && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        
        {/* Left Panel - Form */}
        <div className="w-full md:w-2/5 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-r border-gray-200 text-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Create Quiz</h2>
            <button
              onClick={() => setGenrateQuizModal(false)}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <h1>X</h1>
              {/* < className="w-5 h-5" /> */}
            </button>
          </div>

          <div className="flex flex-col gap-4 ">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0">Category</label>
              <input
                type="text"
                placeholder="e.g., Science, History"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0">Topic</label>
              <input
                type="text"
                placeholder="e.g., World War II"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 ">Difficulty</label>
              <select
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="">Select Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 ">Number of Questions</label>
              <input
                type="number"
                placeholder="e.g., 10"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                min="1"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 ">AI Instructions</label>
              <textarea
                placeholder="Special instructions for AI..."
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows="3"
              />
            </div>

            <button
              type="button"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={genrateWithAi}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Quiz with AI'}
            </button>
          </div>
        </div>

        {/* Right Panel - Generated Questions */}
        <div className="w-full md:w-3/5 flex flex-col bg-white">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Generated Quiz
                {aiQuestions.length > 0 && (
                  <span className="ml-3 text-sm font-normal text-gray-500">
                    ({aiQuestions.length} questions)
                  </span>
                )}
              </h2>
              {aiQuestions.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={addNewQuestion}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    {/* <Plus className="w-4 h-4" /> */}
                    Add Question
                  </button>
                  <button
                    onClick={saveQuiz}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-lg"
                  >
                    {/* <Save className="w-4 h-4" /> */}
                    Save Quiz
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-medium">AI is preparing your questions...</p>
              </div>
            ) : aiQuestions.length > 0 ? (
              <div className="space-y-6">
                {aiQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group text-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full text-sm">
                        {idx + 1}
                      </span>
                      <button
                        onClick={() => deleteQuestion(idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {/* <Trash2 className="w-4 h-4" /> */}
                      </button>
                    </div>

                    {/* Question Input */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Question
                      </label>
                      <textarea
                        value={q.question}
                        onChange={(e) => handleQuestionEdit(idx, 'question', e.target.value)}
                        className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-medium text-gray-800"
                        rows="2"
                      />
                    </div>

                    {/* Options */}
                    <div className="mb-4 space-y-3">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Options
                      </label>
                      {Object.entries(q.options).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm flex-shrink-0">
                            {key.toUpperCase()}
                          </span>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleOptionEdit(idx, key, e.target.value)}
                            className="flex-1 border-2 border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Correct Answer */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Correct Answer
                      </label>
                      <select
                        value={q.answer}
                        onChange={(e) => handleQuestionEdit(idx, 'answer', e.target.value)}
                        className="w-full border-2 border-green-200 bg-green-50 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-medium text-green-700"
                      >
                        {Object.keys(q.options).map((key) => (
                          <option key={key} value={key}>
                            {key.toUpperCase()} - {q.options[key]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                {/* <Edit2 className="w-16 h-16 mb-4" /> */}
                <p className="text-lg font-medium">No quiz generated yet</p>
                <p className="text-sm mt-2">Fill the form and click "Generate Quiz with AI"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
            )}

            {/* show all quize  */}
              {
                quizs?.length > 0 && <Quizs quizs={quizs} fetchQuizs={fetchQuizs}></Quizs>
              }
          </div>
         </div>

          
        )
      }
      {
        activePage === "history" && (
          <div>
            <h1>history</h1>
          </div>
        )
      }
      {
        activePage === "requests" && (
          <div>
            <h1>requests related to quize</h1>
          </div>
        )
      }
      {
        activePage === "activities" && (
          <div>
            <h1>activities of quize</h1>
          </div>
        )
      }
    </>

  )
}

export default AdminPage
