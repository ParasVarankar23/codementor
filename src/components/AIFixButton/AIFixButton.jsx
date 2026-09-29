// components/AIFixButton.jsx
import { useState } from "react";
import { FaMagic, FaSpinner } from "react-icons/fa";

export default function AIFixButton({ code, language, onFix }) {
  const [isFixing, setIsFixing] = useState(false);

  const handleFix = async () => {
    setIsFixing(true);
    
    // Get the error from console or let user specify
    const error = prompt("What's the error or issue? (Optional)");
    
    // Call your parent handler
    await onFix(code, language, error);
    
    setIsFixing(false);
  };

  return (
    <button
      onClick={handleFix}
      disabled={isFixing}
      className="ml-2 px-3 py-1.5 rounded-lg text-sm bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 transition-all disabled:opacity-50"
      title="Fix code with AI"
    >
      {isFixing ? (
        <FaSpinner className="animate-spin" />
      ) : (
        <FaMagic />
      )}
      <span>Fix with AI</span>
    </button>
  );
}