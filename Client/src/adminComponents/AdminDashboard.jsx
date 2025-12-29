import axios from "axios";
import React, { useEffect, useState } from "react";


const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const AdminDashboard = () => {
  const [dashBoardData, setDashBoardData] = useState(null)
  const fetchDashboardData = async () => {
    try {
      const resp = await axios.get(`${BASE_URL}/get-dash-board-data`)
      //  console.log("resp of get dasboard data",resp);
      if (resp.data.success) {
        console.log("hiii");

        setDashBoardData(resp.data.data)
      }
    } catch (error) {
      console.log("data not found");


    }

  }

  useEffect(() => {
    fetchDashboardData()
  }, [])


  console.log("dashBoardData", dashBoardData);

  return (
    <div className='text-md text-bold pl-60 py-20'>
      {/* Top Header */}

      {/* Filter Section */}
      <div className="bg-white shadow rounded-lg p-5 mb-4 flex justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search user..."
            className="border px-3 py-1 rounded-lg max-w-40"
          />
          <select className="border px-3 py-1 rounded-lg">
            <option>Select category</option>
            <option>AI Quiz</option>
            <option>Simple Quiz</option>
          </select>
          <input
            type="date"
            className="border px-3 py-1 rounded-lg"
          />
        </div> */}
      </div>

      {/* Stats Cards */}
      {/* Stats Cards – Borderless Compact Design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">

        <div className="bg-green-50 rounded-xl px-4 py-3 shadow-sm hover:shadow transition">
          <p className="text-xs font-medium text-green-700">Total Users</p>
          <h2 className="text-lg font-bold text-green-800 mt-1">
            {dashBoardData?.users}
          </h2>
        </div>

        <div className="bg-green-100 rounded-xl px-4 py-3 shadow-sm hover:shadow transition">
          <p className="text-xs font-medium text-green-700">Total Quizzes</p>
          <h2 className="text-lg font-bold text-green-900 mt-1">
            {dashBoardData?.TotalQuizs}
          </h2>
        </div>

        <div className="bg-red-50 rounded-xl px-4 py-3 shadow-sm hover:shadow transition">
          <p className="text-xs font-medium text-red-700">Most Played Quiz</p>
          <h2 className="text-lg font-bold text-red-800 mt-1 truncate">
            {dashBoardData?.mostAttmptQuizs}
          </h2>
        </div>

        <div className="bg-red-100 rounded-xl px-4 py-3 shadow-sm hover:shadow transition">
          <p className="text-xs font-medium text-red-700">Total Attempts</p>
          <h2 className="text-lg font-bold text-red-900 mt-1">
            {dashBoardData?.totalAttempts}
          </h2>
        </div>

      </div>



      {/* Recent Quizzes Table */}
      <div className="bg-white border rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-600 rounded-full"></span>
          Recent Added Quizzes
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-green-50 text-green-700">
                <th className="px-3 py-2 border font-semibold text-center">ID</th>
                <th className="px-3 py-2 border font-semibold text-left">Quiz</th>
                <th className="px-3 py-2 border font-semibold text-left">Category</th>
                <th className="px-3 py-2 border font-semibold text-left">Topic</th>
                <th className="px-3 py-2 border font-semibold text-center">Created</th>
              </tr>
            </thead>

            <tbody>
              {dashBoardData?.lastFiveQuize?.map((q, i) => (
                <tr
                  key={q.id}
                  className={`transition-colors duration-150
              ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}
              hover:bg-red-50`}
                >
                  <td className="px-3 py-2 border text-center font-medium text-gray-700">
                    {q.id}
                  </td>

                  <td className="px-3 py-2 border font-semibold text-gray-800">
                    {q.title}
                  </td>

                  <td className="px-3 py-2 border text-gray-700">
                    {q.category_name ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        {q.category_name}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">N/A</span>
                    )}
                  </td>

                  <td className="px-3 py-2 border text-gray-700">
                    {q.topic_name ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        {q.topic_name}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">N/A</span>
                    )}
                  </td>

                  <td className="px-3 py-2 border text-center text-gray-600 whitespace-nowrap">
                    {new Date(q.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



    </div>
  );
};


export default AdminDashboard;
