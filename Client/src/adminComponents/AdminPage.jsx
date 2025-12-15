import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useFetcher, useLocation, useNavigate } from 'react-router-dom';
import Quizs from './Quizs';
import AdminDashboard from './AdminDashboard';
import { User } from 'lucide-react';
// import { FaUserCircle } from "react-icons/fa";
const BASE_URL = import.meta.env.VITE_APP_BASE_URL;


const AdminPage = () => {
  const navigate=useNavigate()
  const location = useLocation()
  const user = location.state?.userData;
  const [createQuizeModal, setCreateQuizeModal] = useState(false)
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [quizs, setQuiz] = useState([])
    const [openProfile, setOpenProfile] = useState(false);

  const [activePage, setActivePage] = useState("quizzes");
  const [genrateQuizModal, setGenrateQuizModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiQuestions, setAiQuestions] = useState([])
  const [category, setCategory] = useState("")
  const [count, setCount] = useState(0)
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [instructions, setInstructions] = useState("")
  const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("");
    
const [selectedCategory, setSelectedCategory] = useState("");





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
      const resp = await axios.get(`${BASE_URL}/get-quizs-all`,{params:{selectedDiff:selectedDiff,search:debouncedSearch}})
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
  }, [search,debouncedSearch])


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

    const handleSearch = (e) => {
    setSearch(e.target.value);
  };

   useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

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


 useEffect(() => {
  if (selectedCategory) {
    const catFilter = quizs.filter(
      q => q.category[0].category_name === selectedCategory
    );
    setQuiz(catFilter);
  } else {
    setQuiz([]);
  }
}, [selectedCategory]);

   const uniqueCategories = [
  ...new Set(
    quizs?.map(q => q.category[0].category_name)
  )
];

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
           onClick={() => setOpenProfile(true)}
            className="
            bg-green-500 text-white p-2 
            rounded-full shadow-md 
            hover:shadow-lg transition-all 
            hover:scale-105 active:scale-95
          "
          >
            <User size={26} />
          </button>
        </div>
      </div>


  <div className="fixed top-16 left-0 h-full w-56 bg-white border-r shadow-sm flex flex-col py-2 z-20">
  {menuItems.map((item) => {
    const isActive = activePage === item.id;

    return (
      <button
        key={item.id}
        onClick={() => setActivePage(item.id)}
        className={`group flex items-center gap-3 mx-2 my-1 px-3 py-2 rounded-lg text-sm font-medium
          transition-all duration-200
          ${
            isActive
              ? "bg-green-600 text-white shadow"
              : "text-gray-700 hover:bg-red-50 hover:text-red-600"
          }`}
      >
        <span
          className={`text-base transition-colors
            ${
              isActive
                ? "text-white"
                : "text-gray-400 group-hover:text-red-600"
            }`}
        >
          {item.icon}
        </span>

        <span className="truncate">{item.label}</span>
      </button>
    );
  })}
</div>

      {
        activePage === "dashboard" && 
         <AdminDashboard></AdminDashboard>
        
      }

      {
        activePage === "quizzes" && (
         <div className=' h-screen'>
           <div className='text-md text-bold pl-60 py-20'>
{/* Quiz Management Header with Filters */}
<div className="bg-white  shadow rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
  <h1 className="text-xl font-semibold">Quiz Management</h1>

 <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
  {/* Search Input */}
  <input
   onChange={(e) => handleSearch(e)}
    type="text"
    placeholder="Search user..."
    className="border border-gray-300 px-4 text-sm rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
  />

  {/* Category Select */}
  <select 
   onChange={(e) => setSelectedCategory(e.target.value)}
  className="px-4 rounded-lg text-sm py-1 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none border border-green-500 text-green-600 bg-white transition-all duration-200">
    <option value="" disabled selected>Select category</option>
    

    {uniqueCategories.map((cat, index) => (
      <option key={index} value={cat}>{cat}</option>
    ))}
  

  </select>
 
</div>
</div>

{/* Action Buttons */}
<div className="relative ">
  {/* <div className="flex flex-wrap gap-4 justify-start md:justify-end items-center">
    <button
      className="bg-green-600 text-white px-4 py-1 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 flex items-center gap-2"
      onClick={() => addQuizfunction()}
    >
      <span className="text-sm font-bold">＋</span>
      <span>Create Quiz</span>
    </button>

    <button
      className="bg-green-600 text-white px-4 py-1 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 flex items-center gap-2"
      onClick={() => addAIQuizfunction()}
    >
      <span className="text-sm font-bold">🤖</span>
      <span>Create Quiz with AI</span>
    </button>

    <button
      className="bg-green-600 text-white px-4 py-1 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 flex items-center gap-2"
      onClick={() => alert("This Feature is coming soon")}
    >
      Import in Excel
    </button>

   
  </div> */}
   <div className="relative">
      <div className="flex flex-wrap gap-2 justify-start md:justify-end items-center">
        {/* Create Quiz - Green Primary Button */}
        <button 
          className="bg-white hover:bg-gray-50 text-green-500 border border-green-500 px-3 py-1 rounded-full shadow-sm transition-all duration-200 flex items-center gap-2 text-sm"
          onClick={() => addQuizfunction()}
        >
          <i className="fas fa-plus text-xs"></i>
          <span>Create Quiz</span>
        </button>

        {/* Create Quiz with AI - Red Secondary Button */}
        <button 
          className="bg-white hover:bg-gray-50 text-green-500 border border-green-500 px-3 py-1 rounded-full shadow-sm transition-all duration-200 flex items-center gap-2 text-sm"

         onClick={() => addAIQuizfunction()}
        >
          <i className="fas fa-robot text-xs"></i>
          <span>Create Quiz with AI</span>
        </button>

        {/* Import Excel - White Outline Button */}
        <button 
          className="bg-white hover:bg-gray-50 text-green-500 border border-green-500 px-3 py-1 rounded-full shadow-sm transition-all duration-200 flex items-center gap-2 text-sm"
          onClick={() => alert("This Feature is coming soon")}
        >
          <i className="fas fa-file-excel text-xs"></i>
          <span>Import in Excel</span>
        </button>
      </div>
    </div>

  
</div>

{/* user profile CONTENT */}
   {/* User Profile Modal */}
{openProfile && (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white w-80 rounded-2xl px-5 py-4 shadow-xl animate-fadeIn">
      
      <h2 className="text-base font-semibold text-gray-800 text-center mb-4">
        User Profile
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Name</span>
          <span className="font-medium text-gray-800 truncate">
            {user?.name}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Email</span>
          <span className="font-medium text-gray-800 truncate">
            {user?.email}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Role</span>
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
            {user?.role || "User"}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <button
          onClick={() => navigate("/login")}
          className="w-full py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition"
        >
          Logout
        </button>

        <button
          onClick={() => setOpenProfile(false)}
          className="w-full py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}



           

            {/* create quize simple  */}
            {createQuizeModal && (
               <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl relative max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create Quiz</h2>
            <p className="text-xs text-gray-500 mt-0.5">Design your quiz</p>
          </div>
          <button
            onClick={() => setCreateQuizeModal(false)}
            className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-600"
          >
            {/* <X size={18} /> */}X
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <div className="space-y-3">
            
            {/* Category Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => catagoryDataFunction("category_name", cat.value)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      catagoryData.category_name === cat.value
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic & Title */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Topic</label>
                <input
                  type="text"
                  value={catagoryData.topic_name}
                  onChange={(e) => catagoryDataFunction("topic_name", e.target.value)}
                  placeholder="React Hooks"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Quiz Title</label>
                <input
                  type="text"
                  value={quizeData.title}
                  onChange={(e) => quizeDataFunction("title", e.target.value)}
                  placeholder="Master React Hooks"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Description & Difficulty */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                <input
                  type="text"
                  value={catagoryData.description}
                  onChange={(e) => catagoryDataFunction("description", e.target.value)}
                  placeholder="Brief description..."
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Difficulty Level</label>
                <select
                  value={quizeData.difficulty}
                  onChange={(e) => quizeDataFunction("difficulty", e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Questions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-700">Questions ({questionsData.length})</label>
                <button
                  onClick={() => {
                    setQuestionsData([...questionsData, {
                      question_text: '',
                      option_1: '',
                      option_2: '',
                      option_3: '',
                      option_4: '',
                      correct_option: '',
                      difficulty: 'Medium'
                    }]);
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                >
                  {/* <Plus size={14} /> */}
                  + Add
                </button>
              </div>

              <div className="space-y-1.5">
                {questionsData.map((q, idx) => (
                  <div key={idx} className="border border-gray-200 rounded overflow-hidden">
                    
                    {/* Question Header */}
                    <div
                      onClick={() => openQuestion(idx)}
                      className="flex items-center justify-between p-2.5 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-6 h-6 rounded bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-gray-900 truncate">
                            {q.question_text || `Question ${idx + 1}`}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {q.difficulty} {q.correct_option && `• ${q.correct_option}`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); removeQuestion(idx); }}
                          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          {/* <Trash2 size={14} /> */}Delete
                        </button>
                        {activeQuestionIndex === idx ?
                        //  <ChevronUp size={14} className="text-gray-400" /> 
                         ""
                         : <ChevronDown size={14} className="text-gray-400" />}
                      </div>
                    </div>

                    {/* Question Details */}
                    {activeQuestionIndex === idx && (
                      <div className="p-3 bg-white border-t border-gray-100">
                        <div className="space-y-2">
                          
                          {/* Question Text */}
                          <input
                            type="text"
                            value={q.question_text}
                            onChange={(e) => updateQuestionData(idx, "question_text", e.target.value)}
                            placeholder="Enter your question..."
                            className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                          />

                          {/* Options */}
                          <div className="grid gap-1.5">
                            {['option_1', 'option_2', 'option_3', 'option_4'].map((opt, i) => (
                              <div key={opt} className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-600 flex-shrink-0">
                                  {String.fromCharCode(65 + i)}
                                </div>
                                <input
                                  type="text"
                                  value={q[opt]}
                                  onChange={(e) => updateQuestionData(idx, opt, e.target.value)}
                                  placeholder={`Option ${i + 1}`}
                                  className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Correct Answer & Difficulty */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-600 mb-1">Correct Answer</label>
                              <select
                                value={q.correct_option}
                                onChange={(e) => updateQuestionData(idx, "correct_option", e.target.value)}
                                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                              >
                                <option value="">Select</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-600 mb-1">Difficulty</label>
                              <select
                                value={q.difficulty}
                                onChange={(e) => updateQuestionData(idx, "difficulty", e.target.value)}
                                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                              >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                              </select>
                            </div>
                          </div>

                          {/* Navigation */}
                          <div className="flex items-center justify-between pt-1.5">
                            <button
                              onClick={handlePrevQuestion}
                              disabled={idx === 0}
                              className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Previous
                            </button>
                            
                            <span className="text-[10px] text-gray-500">
                              {idx + 1} of {questionsData.length}
                            </span>
                            
                            <button
                              onClick={handleNextQuestion}
                              className="px-2.5 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                            >
                              {idx === questionsData.length - 1 ? 'Add New' : 'Next'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-3 border-t border-gray-200">
          <button
            onClick={() => setCreateQuizeModal(false)}
            className="flex-1 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
          >
            Create Quiz
          </button>
        </div>
      </div>
    </div>
            )}

            {genrateQuizModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-3">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[92vh]">
        
        {/* Left Panel - Form */}
        <div className="w-full md:w-2/5 p-4 bg-gray-50 border-r border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Generate Quiz</h2>
              <p className="text-xs text-gray-500">AI-powered quiz creation</p>
            </div>
            <button
              onClick={() => setGenrateQuizModal(false)}
              className="w-7 h-7 hover:bg-white rounded flex items-center justify-center transition-colors text-gray-400 hover:text-gray-600"
            >
              {/* <X size={18} />  */}
              X
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <input
                type="text"
                placeholder="Science, History..."
                className="w-full border border-gray-300 px-2.5 py-1.5 rounded text-xs focus:ring-1 focus:ring-red-500 focus:border-transparent transition-all"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Topic</label>
              <input
                type="text"
                placeholder="World War II..."
                className="w-full border border-gray-300 px-2.5 py-1.5 rounded text-xs focus:ring-1 focus:ring-red-500 focus:border-transparent transition-all"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Difficulty</label>
                <select
                  className="w-full border border-gray-300 px-2.5 py-1.5 rounded text-xs focus:ring-1 focus:ring-red-500 focus:border-transparent transition-all"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Questions</label>
                <input
                  type="number"
                  placeholder="10"
                  className="w-full border border-gray-300 px-2.5 py-1.5 rounded text-xs focus:ring-1 focus:ring-red-500 focus:border-transparent transition-all"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  min="1"
                  max="50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">AI Instructions</label>
              <textarea
                placeholder="Special instructions for AI..."
                className="w-full border border-gray-300 px-2.5 py-1.5 rounded text-xs focus:ring-1 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows="3"
              />
            </div>

            <button
              type="button"
              className="bg-red-600 text-white py-2 px-3 rounded hover:bg-red-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-xs mt-1"
              onClick={genrateWithAi}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Quiz with AI'}
            </button>
          </div>
        </div>

        {/* Right Panel - Generated Questions */}
        <div className="w-full md:w-3/5 flex flex-col bg-white">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Generated Quiz
                  {aiQuestions.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      ({aiQuestions.length} questions)
                    </span>
                  )}
                </h2>
              </div>
              {aiQuestions.length > 0 && (
                <div className="flex gap-1.5">
                  <button
                    onClick={addNewQuestion}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-semibold"
                  >
                    {/* <Plus size={14} /> */}
                    + Add
                  </button>
                  <button
                    onClick={saveQuiz}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-semibold"
                  >
                    Save Quiz
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-medium">AI is preparing your questions...</p>
              </div>
            ) : aiQuestions.length > 0 ? (
              <div className="space-y-3">
                {aiQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <span className="flex items-center justify-center w-6 h-6 bg-red-100 text-red-700 font-bold rounded text-xs">
                        {idx + 1}
                      </span>
                      <button
                        onClick={() => deleteQuestion(idx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {/* <Trash2 size={14} /> */}Delete
                      </button>
                    </div>

                    {/* Question Input */}
                    <div className="mb-2.5">
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                        Question
                      </label>
                      <textarea
                        value={q.question}
                        onChange={(e) => handleQuestionEdit(idx, 'question', e.target.value)}
                        className="w-full border border-gray-300 px-2.5 py-1.5 rounded text-xs focus:ring-1 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                        rows="2"
                      />
                    </div>

                    {/* Options */}
                    <div className="mb-2.5 space-y-1.5">
                      <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                        Options
                      </label>
                      {Object.entries(q.options).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-1.5">
                          <span className="flex items-center justify-center w-5 h-5 bg-gray-100 text-gray-700 font-semibold rounded text-[10px] flex-shrink-0">
                            {key.toUpperCase()}
                          </span>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleOptionEdit(idx, key, e.target.value)}
                            className="flex-1 border border-gray-300 px-2.5 py-1.5 rounded text-xs focus:ring-1 focus:ring-red-500 focus:border-transparent transition-all"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Correct Answer */}
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                        Correct Answer
                      </label>
                      <select
                        value={q.answer}
                        onChange={(e) => handleQuestionEdit(idx, 'answer', e.target.value)}
                        className="w-full border border-green-300 bg-green-50 px-2.5 py-1.5 rounded text-xs focus:ring-1 focus:ring-green-500 focus:border-transparent transition-all font-medium text-green-700"
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
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <span className="text-2xl">📝</span>
                </div>
                <p className="text-sm font-medium">No quiz generated yet</p>
                <p className="text-xs mt-1">Fill the form and click "Generate Quiz with AI"</p>
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
