// import axios from "axios";
// import React from "react";
// import { useState } from "react";
// import DynamicCarDiagnosis from "../components/DynamicCarDiagnosis";
// const ProblemInput = () => {
//   const [userInput, setuserInput] = useState("");
//   const [obdCode, setobdCode] = useState("");
//   const [conversationHistory, setConversationHistory] = useState([]);
//   const handleSubmit = async () => {
//     if (!userInput.trim()) return;

//     setuserInput(obdCode.trim() ? userInput + obdCode : userInput);
//     const newUserMessage = { role: "user", content: userInput };
//     const updatedMessage = [...conversationHistory, newUserMessage];
//     setConversationHistory(updatedMessage);
//     console.log(userInput);
//     console.log(updatedMessage);
//     try {
//       const response = await axios.post("http://localhost:3000/query", {
//         userInput,
//         conversationHistory: updatedMessage,
//       });
//       console.log(response);
//       const assistanceResponse = {
//         role: "assistant",
//         content: response.data.response,
//       };
//       setConversationHistory((prev) => [...prev, assistanceResponse]);
//       setuserInput("");
//     } catch (error) {
//       console.error("Error fetching response from server:", error);
//     }
//   };
//   return (
//     <div className="flex flex-col justify-center items-center border border-white rounded-xl lg:max-w-[600px] xl:max-w-[900px] mx-auto gap-4 p-4 m-20 bg-primary text-white">
//       <h2 className="text-2xl font-poppins pt-2">
//         Describe your vehicle problem
//       </h2>

//       {/* Conversation History */}
//       {conversationHistory.length > 0 ? (
//         <div className="w-full overflow-y-auto max-h-[400px] mb-4 p-4 border rounded-lg border-black">
//           {conversationHistory.map((message, index) => (
//             <div
//               key={index}
//               className={`p-2 my-2 rounded-lg ${
//                 message.role === "user"
//                   ? "bg-blue-200 text-right"
//                   : "bg-green-200 text-left"
//               }`}
//             >
//               <strong className="font-montserrat">
//                 {message.role === "user" ? "You" : "Assistant"} :
//               </strong>{" "}
//               {message.role !== "user" ? (
//                 <h1 className="text-2xl font-poppins mb-2">
//                   Car Diagnosis Report
//                 </h1>
//               ) : null}
//               <DynamicCarDiagnosis diagnosisText={message.content} />
//             </div>
//           ))}
//         </div>
//       ) : null}

//       {/* Input Fields */}
//       <input
//         type="text"
//         placeholder="Enter OBD Codes Your Vehicle has Separated by commas"
//         value={obdCode}
//         onChange={(e) => setobdCode(e.target.value)}
//         className="w-[400px] lg:w-[800px] p-2 mb-2 font-montserrat border rounded-lg text-sm border-black"
//       />
//       <textarea
//         value={userInput}
//         onChange={(e) => setuserInput(e.target.value)}
//         placeholder="Enter the details of your vehicle's issue..."
//         className="w-[400px] lg:w-[800px] p-2 mb-2 font-montserrat border rounded-lg border-black"
//       />
//       <button
//         className="bg-blue-500 text-white p-2 rounded-lg"
//         onClick={handleSubmit}
//       >
//         Submit
//       </button>
//     </div>
//   );
// };

// export default ProblemInput;

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import DynamicCarDiagnosis from "../components/DynamicCarDiagnosis";

const ProblemInput = () => {
  const [userInput, setUserInput] = useState("");
  const [obdCode, setObdCode] = useState("");
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const [conversationHistory, setConversationHistory] = useState(() => {
    const savedHistory = localStorage.getItem("conversationHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  // const [conversationHistory, setConversationHistory] = useState([]);
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };
  const handleSubmit = async () => {
    if (!userInput.trim()) return;
    const newUserMessage = {
      role: "user",
      content: obdCode ? `${userInput} (OBD Codes: ${obdCode})` : userInput,
    };
    const updatedHistory = [...conversationHistory, newUserMessage];
    setConversationHistory(updatedHistory);
    if (image !== null) {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("userInput", newUserMessage.content);
      formData.append("conversationHistory", JSON.stringify(updatedHistory));

      try {
        const response = await axios.post(
          "http://localhost:3000/query-with-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data", // Ensure correct content type
            },
          }
        );
        const assistantResponse = {
          role: "assistant",
          content: response.data.response,
        };
        setConversationHistory([...updatedHistory, assistantResponse]);

        setUserInput("");
        setObdCode("");
        setImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
      } catch (error) {
        console.error("Error fetching response from server with image:", error);
      }
      return;
    }
    // const newUserMessage = {
    //   role: "user",
    //   content: obdCode ? `${userInput} (OBD Codes: ${obdCode})` : userInput,
    // };
    // const updatedHistory = [...conversationHistory, newUserMessage];
    // setConversationHistory(updatedHistory);

    try {
      const response = await axios.post("http://localhost:3000/query", {
        userInput: newUserMessage.content,
        conversationHistory: updatedHistory,
      });

      const assistantResponse = {
        role: "assistant",
        content: response.data.response,
      };
      setConversationHistory([...updatedHistory, assistantResponse]);

      setUserInput("");
      setObdCode("");
    } catch (error) {
      console.error("Error fetching response from server:", error);
    }
  };
  const clearLocalStorage = () => {
    localStorage.removeItem("conversationHistory");
  };
  useEffect(() => {
    localStorage.setItem(
      "conversationHistory",
      JSON.stringify(conversationHistory)
    ); // Fix: Save as stringified JSON
  }, [conversationHistory]);
  return (
    <div className="max-w-3xl mx-auto">
      {conversationHistory.length > 0 && (
        <div className="mt-8 space-y-4">
          {conversationHistory.map((message, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>
                  {message.role === "user" ? "You" : "Assistant"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {message.role === "assistant" ? (
                  <DynamicCarDiagnosis diagnosisText={message.content} />
                ) : (
                  <p>{message.content}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Describe your vehicle problem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter OBD Codes (separated by commas)"
              value={obdCode}
              onChange={(e) => setObdCode(e.target.value)}
            />
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter the details of your vehicle's issue..."
              rows={4}
            />

            <div className="flex flex-col lg:flex-row justify-between max-w-2xl space-y-3">
              <div className="">
                <Label htmlFor="image">Image Upload</Label>
                <Input
                  id="image"
                  type="file"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                />
              </div>
              <Button onClick={handleSubmit}>Submit</Button>
              <Button onClick={clearLocalStorage}>Clear Session</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProblemInput;
