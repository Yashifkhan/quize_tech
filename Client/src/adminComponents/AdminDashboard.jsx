import axios from "axios";
import React, { useEffect, useState } from "react";


const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const AdminDashboard = () => {

    const [dashBoardData,setDashBoardData]=useState(null)

    const fetchDashboardData=async()=>{
       try {
         const resp=await axios.get(`${BASE_URL}/get-dash-board-data`)
        //  console.log("resp of get dasboard data",resp);
         if(resp.data.success){
            console.log("hiii");
            
            setDashBoardData(resp.data.data)
         }
       } catch (error) {
        console.log("data not found");
        
        
       }
        
    }

    useEffect(()=>{
        fetchDashboardData()
    },[])


    console.log("dashBoardData",dashBoardData);
    
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

      {/* Stats Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
        <div className="bg-blue-100 py-3 px-6  rounded-xl shadow">
          <p className="text-sm font-medium">Total Users</p>
          <h2 className="text-xl font-bold mt-2">{dashBoardData?.users}</h2>
        </div>

        <div className="bg-green-100 py-3 px-6 rounded-xl shadow">
          <p className="text-sm font-medium">Total Quizzes</p>
          <h2 className="text-xl font-bold mt-2">{dashBoardData?.TotalQuizs}</h2>
        </div>

        <div className="bg-yellow-100 py-3 px-6 rounded-xl shadow">
          <p className="text-sm font-medium">Most Played Quiz</p>
          <h2 className="text-xl font-bold mt-2">{dashBoardData?.mostAttmptQuizs}</h2>
        </div>

        <div className="bg-red-100 py-3 px-6 rounded-xl shadow">
          <p className="text-sm font-medium">Total Attempts</p>
          <h2 className="text-xl font-bold mt-2">{dashBoardData?.totalAttempts}</h2>
        </div>
      </div>

{/* Table / Recent Data */}
<div className="bg-white shadow-lg rounded-xl p-6">
  <h2 className="text-lg font-semibold mb-4">Recent Added Quizzes</h2>

  <div className="overflow-x-auto">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-100 text-gray-700">
          <th className="p-3 border font-medium">ID</th>
          <th className="p-3 border font-medium">Quiz Name</th>
          <th className="p-3 border font-medium">Category</th>
          <th className="p-3 border font-medium">Topic</th>
          <th className="p-3 border font-medium">Created At</th>
        </tr>
      </thead>

      <tbody>
        {dashBoardData?.lastFiveQuize?.map((q, i) => (
          <tr
            key={q.id}
            className={`transition-all ${
              i % 2 === 0 ? "bg-gray-50" : "bg-white"
            } hover:bg-blue-50`}
          >
            <td className="p-3 border text-center font-medium text-gray-700">
              {q.id}
            </td>
            <td className="p-3 border text-gray-800 font-semibold">
              {q.title}
            </td>
            <td className="p-3 border text-gray-700">
              {q.category_name || (
                <span className="text-gray-400 italic">N/A</span>
              )}
            </td>
            <td className="p-3 border text-gray-700">
              {q.topic_name || (
                <span className="text-gray-400 italic">N/A</span>
              )}
            </td>
            <td className="p-3 border text-gray-600">
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
