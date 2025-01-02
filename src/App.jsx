import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Keeps track of current step
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    orderName: "",
    address: "",
    quantity: "",
    email: "",
  });
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, generatingAnswer]);

  // Function to handle order confirmation and send the email
  async function generateAnswer(e) {
    e.preventDefault();
    if (!question.trim()) return;

    setGeneratingAnswer(true);
    const currentQuestion = question;
    setQuestion(""); // Clear input immediately after sending

    // Add user question to chat history
    setChatHistory((prev) => [
      ...prev,
      { type: "question", content: currentQuestion },
    ]);

    let newDetails = { ...userDetails };

    try {
      // Check which step we are at
      if (currentStep === 0) {
        newDetails.firstName = question; // Save first name
        setUserDetails(newDetails);
        setCurrentStep(1);
        setAnswer(`Hello ${newDetails.firstName}! What is your order name?`);
      } else if (currentStep === 1) {
        newDetails.orderName = question; // Save order name
        setUserDetails(newDetails);
        setCurrentStep(2);
        setAnswer(`Got it! What is the delivery address for ${newDetails.orderName}?`);
      } else if (currentStep === 2) {
        newDetails.address = question; // Save address
        setUserDetails(newDetails);
        setCurrentStep(3);
        setAnswer(`Thanks! How many ${newDetails.orderName} would you like to order?`);
      } else if (currentStep === 3) {
        newDetails.quantity = question; // Save quantity
        setUserDetails(newDetails);
        setCurrentStep(4);
        setAnswer(
          `You have ordered ${newDetails.quantity} of ${newDetails.orderName}. What is your email address?`
        );
      } else if (currentStep === 4) {
        newDetails.email = question; // Save email
        setUserDetails(newDetails);
        setCurrentStep(5);
        setAnswer(
          `You provided the email: ${newDetails.email}. Is everything correct? (yes/no)`
        );
      } else if (currentStep === 5) {
        if (question.toLowerCase() === "yes") {
          // Send the email after confirmation
          await axios.post("http://localhost:5000/send-email", {
            email: newDetails.email,
            orderName: newDetails.orderName,
            address: newDetails.address,
            quantity: newDetails.quantity,
          });

          setAnswer(`Order confirmed! A confirmation email has been sent to ${newDetails.email}.`);
          setChatHistory((prev) => [
            ...prev,
            { type: "answer", content: `Order confirmed! A confirmation email has been sent to ${newDetails.email}.` },
          ]);
        } else {
          setAnswer("Order canceled. Let me know if you'd like to try again!");
        }
        setCurrentStep(0); // Reset steps after confirmation or cancellation
      }
    } catch (error) {
      console.error(error);
      setAnswer("Sorry - Something went wrong. Please try again!");
    }

    setGeneratingAnswer(false);
  }

  function setAnswer(answer) {
    setChatHistory((prev) => [
      ...prev,
      { type: "answer", content: answer },
    ]);
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="h-full max-w-4xl mx-auto flex flex-col p-3">
        {/* Fixed Header */}
        <header className="text-center py-4">
          <a
            // href="https://chat-ai.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h1 className="text-4xl font-bold text-blue-500 hover:text-blue-600 transition-colors">
              Chat AI
            </h1>
          </a>
        </header>

        {/* Scrollable Chat Container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-4 rounded-lg bg-white shadow-lg p-4 hide-scrollbar"
        >
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="bg-blue-50 rounded-xl p-8 max-w-2xl">
                <h2 className="text-2xl font-bold text-blue-600 mb-4">
                  Welcome to Chat AI! 👋
                </h2>
                <p className="text-gray-600 mb-4">
                  I'm here to help you place an order step by step. Let's get started!
                </p>
                <p className="text-gray-500 mt-6 text-sm">
                  Just type your responses below.
                </p>
              </div>
            </div>
          ) : (
            <>
              {chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    chat.type === "question" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block max-w-[80%] p-3 rounded-lg overflow-auto hide-scrollbar ${
                      chat.type === "question"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <ReactMarkdown className="overflow-auto hide-scrollbar">
                      {chat.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </>
          )}
          {generatingAnswer && (
            <div className="text-left">
              <div className="inline-block bg-gray-100 p-3 rounded-lg animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Fixed Input Form */}
        <form
          onSubmit={generateAnswer}
          className="bg-white rounded-lg shadow-lg p-4"
        >
          <div className="flex gap-2">
            <textarea
              required
              className="flex-1 border border-gray-300 rounded p-3 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                currentStep === 0
                  ? "What is your first name?"
                  : currentStep === 1
                  ? "What is your order name?"
                  : currentStep === 2
                  ? "What is your delivery address?"
                  : currentStep === 3
                  ? "How many would you like to order?"
                  : currentStep === 4
                  ? "What is your email address?"
                  : "Please confirm your order (yes/no)"
              }
              rows="2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  generateAnswer(e);
                }
              }}
            ></textarea>
            <button
              type="submit"
              className={`px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
                generatingAnswer ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={generatingAnswer}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
