import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;


const UserPage = () => {
  const location = useLocation();
  const user = location?.state?.userData;
  const [openProfile, setOpenProfile] = useState(false);

console.log("log in every render");



const getQuizs=async()=>{
 try {
   const resp=await axios.get(`${BASE_URL}/get-quiz`)
   console.log("getquize resp",resp?.data?.data);
 } catch (error) {
  console.log("quize is not get");
  
  
 }
}

useEffect(()=>{
  getQuizs()
},[])




  return (
    <>
      {/* HEADER */}
      <div className="w-full px-6 py-3 bg-gray-900 text-white flex justify-between items-center shadow">
        <h2 className="text-xl font-semibold">Quiz tech</h2>

        {/* PROFILE ICON */}
        <div
          onClick={() => {setOpenProfile(true);fetchQuizs()}}
          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center cursor-pointer font-bold text-lg hover:scale-105 transition"
        >
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div className="p-6">
        <h1 className="text-2xl font-bold">User Page Here</h1>
      </div>

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
    </>
  );
};

export default UserPage;
