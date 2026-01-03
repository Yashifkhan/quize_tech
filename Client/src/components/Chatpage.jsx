import React, { useState, useRef } from "react";
import { Paperclip, Send, X } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";


const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! Upload an image or send a message to get started." }
  ]);
  const [inputText, setInputText] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const [result,setResult]=useState("");


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSendMessage =async () => {
    if (inputText && previewImage) {
         try {
    const formData = new FormData();
    formData.append("text", inputText);
    
    // Get the actual file from the ref instead of the preview URL
    const file = fileInputRef.current.files[0]; 
    if (file) {
      formData.append("file", file);
    }

    const resp = await axios.post(`${BASE_URL}/chat-with-doc/start`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    console.log("Response:", resp.data);
  } catch (error) {
    console.error("Upload failed", error);
  }


    }
    else{
      if(!inputText) return alert("Please enter a message");
      try {
         const resp = await axios.post(`${BASE_URL}/chat-with-doc/simple-chat`,{inputText});
         console.log("resp of chat data",resp);
         if(resp.data){
          setResult(resp.data)
         }
         
      } catch (error) {
        console.log("error",error);
        
        
      }

    }

 
   
    setInputText("");
    setPreviewImage(null);

  };




  console.log("previewImage",previewImage);
  console.log("inputText",inputText);
  
  

  return (
    <div className="flex h-[600px] bg-[#efe7de] ">
      
      {/* LEFT: USER SECTION */}
      <div className="w-1/2 flex flex-col border-r border-gray-300">
        
        {/* Header */}
        <div className="bg-[#075e54] text-white p-4 font-semibold">
          User Input
        </div>

        {/* User Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* {
            result && (
              <div className="bg-white p-3 rounded-lg shadow">
                <p className="text-sm">{result.answer}</p>
              </div>
            )
          } */}
          
          
        </div>

        {/* Input Area */}
        <div className="p-3 bg-[#f0f0f0]">
          {previewImage && (
            <div className="relative w-20 h-20 mb-2">
              <img src={previewImage} className="rounded w-full h-full" />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current.click()}
              className="p-2 hover:bg-gray-200 rounded-full"
            >
              <Paperclip />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />

            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type here..."
              className="flex-1 p-2 rounded-full text-sm"
            />

            <button
              onClick={handleSendMessage}
              className="bg-[#075e54] text-white p-2 rounded-full"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: AI SECTION */}
      <div className="w-1/2 flex flex-col">
        
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 font-semibold">
          AI Response
        </div>

        {/* AI Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
           {
  result && (
    <div className="bg-white p-4 rounded-lg shadow prose max-w-none">
      <ReactMarkdown>
        {result.answer}
      </ReactMarkdown>
    </div>
  )
}
          
           
        </div>
      </div>

    </div>
  );
};

export default ChatPage;
