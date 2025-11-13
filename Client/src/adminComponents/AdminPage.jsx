import React, { useState } from 'react'

const AdminPage = () => {
    const [createQuizeModal,setCreateQuizeModal]=useState(false)
    const [createQuizModal, setCreateQuizModal] = useState(true);
  const [formData, setFormData] = useState({
    category: '',
    topic: '',
    description: '',
    title: '',
    difficulty: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    questionDifficulty: 'Medium'
  });

  const handleSubmit = () => {
    console.log('Quiz created:', formData);
    setCreateQuizModal(false);
  };



    const addQuizfunction=()=>{
     setCreateQuizeModal(true)
    }

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




  return (
 <div className="relative min-h-screen  from-gray-50 to-green-50 p-10">
  {/* Add Quiz Button */}
  <div
    className="fixed bottom-8 right-8 bg-green-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-green-700 cursor-pointer transition-all duration-300 flex items-center gap-2"
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
              onClick={() => setCreateQuizModal(false)}
              className="absolute top-6 right-6 z-20 text-gray-400 hover:text-white bg-white hover:bg-gradient-to-br hover:from-red-500 hover:to-pink-600 rounded-full p-2 transition-all duration-300 shadow-lg hover:shadow-red-500/50 hover:rotate-90 group"
            >
        <button onClick={()=>setCreateQuizeModal(false)}>x</button>
            </button>

            {/* Modal Content */}
            <div className="relative z-10 p-8 max-h-[95vh] overflow-y-auto">
              {/* Title Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
                  {/* <Sparkles className="w-8 h-8 text-white" /> */}
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
                        onClick={() => setFormData({ ...formData, category: cat.value })}
                        className={`relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 group ${
                          formData.category === cat.value
                            ? `bg-gradient-to-br ${cat.color} border-transparent shadow-lg`
                            : 'bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {formData.category === cat.value && (
                          <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                        )}
                        <div className="text-3xl mb-2">{cat.icon}</div>
                        <div className={`text-xs font-semibold ${
                          formData.category === cat.value ? 'text-white' : 'text-gray-700'
                        }`}>
                          {cat.value}
                        </div>
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
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
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
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                        onClick={() => setFormData({ ...formData, difficulty: diff.value })}
                        className={`relative p-4 rounded-xl font-semibold transition-all duration-300 ${
                          formData.difficulty === diff.value
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

                {/* Question Section - Enhanced Card */}
                <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                    <span className="text-2xl">❓</span>
                    <span>Question Details</span>
                  </h3>

                  <div className="space-y-4">
                    {/* Question Input */}
                    <div>
                      <input
                        type="text"
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        placeholder="Enter your question..."
                        className="w-full border-2 border-purple-200 rounded-xl p-4 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-white font-medium"
                      />
                    </div>

                    {/* Options Grid */}
                    <div className="grid gap-3">
                      {[0, 1, 2, 3].map((idx) => (
                        <div key={idx} className="flex items-center gap-3 group">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md transition-all ${
                            formData.correctAnswer === String(idx + 1)
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600 scale-110'
                              : 'bg-gradient-to-br from-purple-500 to-pink-500 group-hover:scale-110'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <input
                            type="text"
                            value={formData.options[idx]}
                            onChange={(e) => {
                              const newOptions = [...formData.options];
                              newOptions[idx] = e.target.value;
                              setFormData({ ...formData, options: newOptions });
                            }}
                            placeholder={`Option ${idx + 1}`}
                            className="flex-1 border-2 border-purple-200 rounded-xl p-3 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-white"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Correct Answer & Question Difficulty */}
                    <div className="grid md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                          ✅ Correct Answer
                        </label>
                        <div className="relative">
                          <select
                            value={formData.correctAnswer}
                            onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                            className="w-full border-2 border-purple-200 rounded-xl p-3 pr-10 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-white appearance-none cursor-pointer"
                          >
                            <option value="">Select correct option</option>
                            <option value="1">Option A</option>
                            <option value="2">Option B</option>
                            <option value="3">Option C</option>
                            <option value="4">Option D</option>
                          </select>
                          {/* <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" /> */}
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                          🎯 Question Difficulty
                        </label>
                        <div className="relative">
                          <select
                            value={formData.questionDifficulty}
                            onChange={(e) => setFormData({ ...formData, questionDifficulty: e.target.value })}
                            className="w-full border-2 border-purple-200 rounded-xl p-3 pr-10 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-white appearance-none cursor-pointer"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                          {/* <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" /> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Enhanced */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setCreateQuizModal(false)}
                    className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 px-6 py-4 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white px-6 py-4 rounded-xl hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 font-semibold hover:scale-105 flex items-center justify-center gap-2"
                  >
                    {/* <Sparkles className="w-5 h-5" /> */}
                    <span>Create Quiz</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
</div>

  )
}

export default AdminPage
