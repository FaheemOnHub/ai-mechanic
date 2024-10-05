import axios from "axios";
import React from "react";
import { useState } from "react";
import DynamicCarDiagnosis from "../components/DynamicCarDiagnosis";
const ProblemInput = () => {
  const [userInput, setuserInput] = useState("");
  const [obdCode, setobdCode] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    setuserInput(obdCode.trim() ? userInput + obdCode : userInput);
    const newUserMessage = { role: "user", content: userInput };
    const updatedMessage = [...conversationHistory, newUserMessage];
    setConversationHistory(updatedMessage);
    console.log(userInput);
    console.log(updatedMessage);
    try {
      const response = await axios.post("http://localhost:3000/query", {
        userInput,
        conversationHistory: updatedMessage,
      });
      console.log(response);
      const assistanceResponse = {
        role: "assistant",
        content: response.data.response,
      };
      setConversationHistory((prev) => [...prev, assistanceResponse]);
      setuserInput("");
    } catch (error) {
      console.error("Error fetching response from server:", error);
    }
  };
  return (
    <div className="flex flex-col justify-center items-center border border-white rounded-xl lg:max-w-[600px] xl:max-w-[900px] mx-auto gap-4 p-4 m-20 bg-primary text-white">
      <h2 className="text-2xl font-poppins pt-2">
        Describe your vehicle problem
      </h2>

      {/* Conversation History */}
      {conversationHistory.length > 0 ? (
        <div className="w-full overflow-y-auto max-h-[400px] mb-4 p-4 border rounded-lg border-black">
          {conversationHistory.map((message, index) => (
            <div
              key={index}
              className={`p-2 my-2 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-200 text-right"
                  : "bg-green-200 text-left"
              }`}
            >
              <strong className="font-montserrat">
                {message.role === "user" ? "You" : "Assistant"} :
              </strong>{" "}
              {message.role !== "user" ? (
                <h1 className="text-2xl font-poppins mb-2">
                  Car Diagnosis Report
                </h1>
              ) : null}
              <DynamicCarDiagnosis diagnosisText={message.content} />
            </div>
          ))}
        </div>
      ) : null}

      {/* Input Fields */}
      <input
        type="text"
        placeholder="Enter OBD Codes Your Vehicle has Separated by commas"
        value={obdCode}
        onChange={(e) => setobdCode(e.target.value)}
        className="w-[400px] lg:w-[800px] p-2 mb-2 font-montserrat border rounded-lg text-sm border-black"
      />
      <textarea
        value={userInput}
        onChange={(e) => setuserInput(e.target.value)}
        placeholder="Enter the details of your vehicle's issue..."
        className="w-[400px] lg:w-[800px] p-2 mb-2 font-montserrat border rounded-lg border-black"
      />
      <button
        className="bg-blue-500 text-white p-2 rounded-lg"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export default ProblemInput;
