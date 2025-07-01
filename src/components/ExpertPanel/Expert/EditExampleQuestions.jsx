"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi"; // Importing cross icon

const EditExampleQuestions = () => {
  const [questions, setQuestions] = useState([""]); // Initialize with one empty question

  // Function to add a new question
  const handleAddQuestion = () => {
    setQuestions([...questions, ""]); // Add an empty question
  };

  // Function to handle input change
  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = value;
    setQuestions(updatedQuestions);
  };

  // Function to delete a question (except the first one)
  const handleDeleteQuestion = (index) => {
    if (questions.length > 1) {
      const updatedQuestions = questions.filter((_, i) => i !== index);
      setQuestions(updatedQuestions);
    }
  };

  return (
    <div className="p-1 bg-white">
      {/* Header Section */}
      <h2 className="text-lg md:text-2xl font-semibold text-black">
        Example questions
      </h2>
      <p className="text-[#7E7E7E] font-semibold mt-1 pb-8">
        Give the caller examples of questions people have asked
      </p>

      {/* Questions List */}
      <div className="mt-4 space-y-4">
        {questions.map((question, index) => (
          <div key={index} className="relative">
            <h3 className="text-lg font-semibold text-black mb-4">
              Question #{index + 1}
            </h3>
            <div className="relative pb-6">
              <input
                type="text"
                value={question}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                placeholder="- Tap to add an example"
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg text-gray-900 focus:ring-black focus:border-black mt-1"
              />
              {/* Show delete button inside input field when more than one question exists */}
              {questions.length > 1 && (
                <button
                  onClick={() => handleDeleteQuestion(index)}
                  className="absolute top-5 right-3 flex items-center text-gray-500 hover:text-red-500"
                  title="Delete question"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Question Button */}
      <button
        onClick={handleAddQuestion}
        className="mt-4 text-black font-semibold text-lg hover:underline"
      >
        + Add a question
      </button>
    </div>
  );
};

export default EditExampleQuestions;
