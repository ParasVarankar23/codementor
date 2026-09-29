// app/api/explain-code/route.js
import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request) {
  try {
    const { code, language } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Code is required", steps: [] },
        { status: 400 }
      );
    }

    // Validate API key
    if (!GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY is not configured");
      return NextResponse.json(
        { error: "Gemini API key not configured", steps: [] },
        { status: 200 } // Return 200 with empty steps to avoid client errors
      );
    }

    const prompt = `You are a coding tutor explaining code line by line. Analyze this ${language} code and create a step-by-step explanation.

Code:
\`\`\`${language}
${code}
\`\`\`

CRITICAL: The code above has ${code.split('\n').length} lines. Line numbers start at 1 and end at ${code.split('\n').length}.

Return a JSON array where each step explains a specific part of the code. Each step MUST have:
1. "text": The explanation text (keep it concise, 1-2 sentences)
2. "highlight": The EXACT text from the code to highlight (must match character-by-character)
3. "lineStart": Starting line number (1-indexed, between 1 and ${code.split('\n').length})
4. "lineEnd": Ending line number (1-indexed, between 1 and ${code.split('\n').length})

Example format:
[
  {
    "text": "The DOCTYPE declaration tells the browser this is an HTML5 document.",
    "highlight": "<!DOCTYPE html>",
    "lineStart": 1,
    "lineEnd": 1
  },
  {
    "text": "The html tag is the root element that contains all other HTML elements.",
    "highlight": "<html lang=\\"en\\">",
    "lineStart": 2,
    "lineEnd": 2
  }
]

IMPORTANT RULES:
- Explain in logical order (top to bottom)
- Keep explanations simple and beginner-friendly
- "highlight" must be EXACT text from code (including spaces, quotes, brackets)
- If a line has attributes like <html lang="en">, include them in highlight
- Line numbers must be accurate (count from line 1)
- Cover all important parts of the code
- Each step should be short (max 2 sentences)
- Return ONLY the JSON array, no other text

Return ONLY the JSON array, no markdown, no explanations, just the JSON.`;

    console.log("📤 Sending request to Gemini API...");
    
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              topK: 20,
              topP: 0.8,
              maxOutputTokens: 2048,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Gemini API error:", response.status, errorData);
        
        // Return fallback steps
        return NextResponse.json({ 
          steps: createFallbackSteps(code) 
        });
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      console.log("=".repeat(80));
      console.log("📝 GEMINI RAW RESPONSE:");
      console.log(text.substring(0, 500) + (text.length > 500 ? "..." : ""));
      console.log("=".repeat(80));

      // Extract JSON from response
      let steps = [];
      try {
        // Remove markdown code blocks if present
        let cleanedText = text.trim();
        
        // Remove ```json and ``` wrappers
        cleanedText = cleanedText.replace(/^```json\s*/i, '');
        cleanedText = cleanedText.replace(/^```\s*/i, '');
        cleanedText = cleanedText.replace(/\s*```$/i, '');
        
        // Try to find JSON array
        const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          steps = JSON.parse(jsonMatch[0]);
        } else {
          // Try to parse as JSON object and convert to array if needed
          const parsed = JSON.parse(cleanedText);
          if (Array.isArray(parsed)) {
            steps = parsed;
          } else if (parsed && typeof parsed === 'object') {
            // If it's an object with steps property, use that
            if (parsed.steps && Array.isArray(parsed.steps)) {
              steps = parsed.steps;
            } else {
              // Otherwise, convert the object to an array of steps
              steps = [parsed];
            }
          }
        }
        
        // Validate steps is an array
        if (!Array.isArray(steps)) {
          steps = [];
        }
        
        console.log(`✅ Successfully parsed ${steps.length} steps`);
        
      } catch (e) {
        console.error("❌ Failed to parse JSON:", e);
        console.error("Raw text that failed:", text.substring(0, 200));
        
        // Create fallback steps
        steps = createFallbackSteps(code);
      }

      // Ensure steps is always an array and has valid structure
      if (!Array.isArray(steps) || steps.length === 0) {
        steps = createFallbackSteps(code);
      }

      // Validate each step has required fields
      steps = steps.map(step => ({
        text: step.text || `Line ${step.lineStart || 1}`,
        highlight: step.highlight || code.split('\n')[step.lineStart - 1] || code.split('\n')[0] || code,
        lineStart: step.lineStart && !isNaN(step.lineStart) ? Math.max(1, step.lineStart) : 1,
        lineEnd: step.lineEnd && !isNaN(step.lineEnd) ? Math.max(1, step.lineEnd) : 1
      }));

      return NextResponse.json({ steps });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle timeout specifically
      if (fetchError.name === 'AbortError') {
        console.error("⏰ Gemini API timeout after 30 seconds");
        return NextResponse.json({ 
          steps: createFallbackSteps(code) 
        });
      }
      
      throw fetchError;
    }

  } catch (error) {
    console.error("🔥 Explain code error:", error);
    
    // Always return an array, even on error
    return NextResponse.json({ 
      steps: createFallbackSteps(code || "No code provided")
    });
  }
}

// Helper function to create fallback steps
function createFallbackSteps(code) {
  const lines = code.split('\n');
  const steps = [];
  
  // Create a step for each line (max 10 steps to avoid too many)
  const maxSteps = Math.min(lines.length, 10);
  
  for (let i = 0; i < maxSteps; i++) {
    const lineNumber = i + 1;
    const lineContent = lines[i].trim();
    
    if (lineContent) { // Skip empty lines
      steps.push({
        text: `Line ${lineNumber}: ${lineContent.substring(0, 50)}${lineContent.length > 50 ? '...' : ''}`,
        highlight: lines[i],
        lineStart: lineNumber,
        lineEnd: lineNumber
      });
    }
  }
  
  // If no steps were created (all empty lines), create a generic step
  if (steps.length === 0) {
    steps.push({
      text: "Here's your code. Let's go through it step by step.",
      highlight: lines[0] || code,
      lineStart: 1,
      lineEnd: 1
    });
  }
  
  return steps;
}