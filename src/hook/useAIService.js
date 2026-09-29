// hooks/useAIService.js
import { useState } from "react";

export function useAIService() {
  const [isAILoading, setIsAILoading] = useState(false);

  const fixCodeWithDeepSeek = async (code, language, error) => {
    try {
      const response = await fetch("/api/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, error })
      });
      
      const data = await response.json();
      return data.fixedCode;
    } catch (error) {
      console.error("DeepSeek error:", error);
      return null;
    }
  };

  const explainWithGemini = async (originalCode, fixedCode, language, error) => {
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalCode, fixedCode, language, error })
      });
      
      const data = await response.json();
      return data.explanation;
    } catch (error) {
      console.error("Gemini error:", error);
      return null;
    }
  };

  const analyzeAndFixCode = async (code, language, error) => {
    setIsAILoading(true);
    
    // Step 1: Get fixed code from DeepSeek
    const fixedCode = await fixCodeWithDeepSeek(code, language, error);
    
    if (!fixedCode) {
      setIsAILoading(false);
      return { error: "Failed to fix code" };
    }
    
    // Step 2: Get kid-friendly explanation from Gemini
    const explanation = await explainWithGemini(code, fixedCode, language, error);
    
    setIsAILoading(false);
    
    return {
      fixedCode,
      explanation,
      originalCode: code
    };
  };

  return {
    analyzeAndFixCode,
    isAILoading
  };
}