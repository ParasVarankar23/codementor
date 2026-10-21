// app/api/gemini/route.js
import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function POST(req) {
  try {
    const {
      userMessage,
      language,
      currentCode,
      isChatMessage,
      originalCode,
      fixedCode,
      isFixExplanation
    } = await req.json();

    console.log("Gemini API received:", {
      isChatMessage,
      isFixExplanation,
      hasUserMessage: !!userMessage,
      language,
      hasOriginal: !!originalCode,
      hasFixed: !!fixedCode
    });

    // CASE 1: Chat Message - Generate code and explanation
    if (isChatMessage && userMessage) {
      const prompt = `
You are a friendly coding mentor. The user asks: "${userMessage}"

Current language context: ${language || "javascript"}

TASK:
1. If they ask for code, generate the complete working code
2. Provide a warm, human-like explanation of how it works
3. When explaining, mention specific line numbers
4. Use natural, conversational language like a real teacher

Return a JSON object with:
{
  "code": "the complete code with proper formatting",
  "language": "detected language",
  "explanation": "natural explanation mentioning line numbers (for speech)",
  "displayMessage": "friendly message with **markdown** for the chat",
  "highlightedLines": [array of line numbers to highlight during explanation]
}

Example for prime number program:
{
  "code": "import java.util.Scanner;\n\npublic class PrimeNumber {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.print(\"Enter a number: \");\n        int num = scanner.nextInt();\n        boolean isPrime = true;\n        \n        if (num <= 1) {\n            isPrime = false;\n        } else {\n            for (int i = 2; i <= Math.sqrt(num); i++) {\n                if (num % i == 0) {\n                    isPrime = false;\n                    break;\n                }\n            }\n        }\n        \n        if (isPrime) {\n            System.out.println(num + \" is a prime number\");\n        } else {\n            System.out.println(num + \" is not a prime number\");\n        }\n        scanner.close();\n    }\n}",
  "language": "java",
  "explanation": "Let me walk you through this prime number checker! On line 6, we create a Scanner to get input from the user. Then on line 8, we read the number. The real magic happens in the for loop on line 13 - we only need to check divisors up to the square root of the number, which makes it much faster. If we find any divisor on line 14, we set isPrime to false and break out of the loop. Finally, on lines 19-22, we print whether the number is prime or not.",
  "displayMessage": "**Here's a Java program to check prime numbers!** 🎯\n\nLet me explain how it works:\n- **Line 6**: Creates a Scanner to read user input\n- **Line 8**: Reads the number you want to check\n- **Line 13**: Loop that checks divisors up to √n\n- **Line 14**: If a divisor is found, the number isn't prime\n- **Lines 19-22**: Prints the result\n\nTry running it with different numbers!",
  "highlightedLines": [6, 8, 13, 14, 19, 20, 21, 22]
}

For general questions like "what is a variable?":
{
  "code": "",
  "language": "javascript",
  "explanation": "A variable is like a labeled box where you can store information. Think of it as a container with a name that holds a value. For example, 'let age = 25;' creates a variable called 'age' that stores the number 25.",
  "displayMessage": "**Let me explain variables!** 📦\n\nA variable is like a labeled box where you can store information. Think of it as a container with a name that holds a value.\n\nFor example:\n\`\`\`javascript\nlet age = 25;\n\`\`\`\n\nThis creates a variable called 'age' that stores the number 25. You can change what's in the box later, which is why it's called a 'variable' - it can vary!",
  "highlightedLines": []
}

Return ONLY the JSON. No other text.
`;

      try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Gemini API error:", errorText);
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts[0]?.text || "";

        console.log("📥 Raw Gemini response for chat:", text.substring(0, 200) + "...");

        try {
          // Clean the response - remove markdown code blocks
          let cleaned = text.replace(/```json\n?|\n?```/g, '').trim();

          // Extract JSON object
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error("No JSON object found in response");
          }

          const parsed = JSON.parse(jsonMatch[0]);

          // Validate required fields
          const response_data = {
            code: parsed.code || "",
            language: parsed.language || language || "javascript",
            explanation: parsed.explanation || "",
            displayMessage: parsed.displayMessage || parsed.explanation || "Here's what I found!",
            highlightedLines: parsed.highlightedLines || []
          };

          console.log("✅ Successfully parsed chat response:", {
            hasCode: !!response_data.code,
            language: response_data.language,
            explanationLength: response_data.explanation.length,
            highlightedLinesCount: response_data.highlightedLines.length
          });

          return NextResponse.json(response_data);

        } catch (parseError) {
          console.error("❌ Failed to parse Gemini response:", parseError);
          console.error("Raw text that failed:", text);

          // Fallback response
          return NextResponse.json({
            code: "",
            language: language || "javascript",
            explanation: "I'm here to help! Could you please provide more details about what you'd like to know?",
            displayMessage: "👋 **I'm here to help!** Could you please provide more details about what you'd like to know?",
            highlightedLines: []
          });
        }
      } catch (apiError) {
        console.error("Gemini API call failed:", apiError);

        // Fallback response
        return NextResponse.json({
          code: "",
          language: language || "javascript",
          explanation: "I'm here to help! Could you please provide more details about what you'd like to know?",
          displayMessage: "👋 **I'm here to help!** Could you please provide more details about what you'd like to know?",
          highlightedLines: []
        });
      }
    }

    // CASE 2: Fix Explanation - Compare original and fixed code
    if (isFixExplanation && originalCode && fixedCode) {
      if (originalCode === fixedCode) {
        return NextResponse.json({
          displayMessage: "✅ **Your code looks great!** No fixes needed. Keep up the good work! 🎉",
          explanation: "Your code looks great! No fixes needed. Keep up the good work!",
          steps: [],
          errors: [],
          highlightedLines: []
        });
      }

      const prompt = `
You are a helpful coding mentor. Compare the original code (with issues) and the fixed code.

ORIGINAL CODE:
\`\`\`${language}
${originalCode}
\`\`\`

FIXED CODE:
\`\`\`${language}
${fixedCode}
\`\`\`

TASK:
1. Explain only the differences between the original and fixed code. Do not explain unchanged code or give a general code walkthrough.
2. Return one concise step for each distinct change, explaining what was wrong and what changed.
3. Use line numbers from the FIXED CODE for lineStart, lineEnd, errors.line, and highlightedLines.
4. Keep each step beginner-friendly and suitable for speech.

Return a JSON with:
{
  "displayMessage": "Short friendly summary of the fixes only",
  "explanation": "Short spoken intro about the fixes only",
  "steps": [{"text": "What changed and why", "lineStart": number, "lineEnd": number}],
  "errors": [{"line": number, "message": "what was wrong", "fix": "how it was fixed"}],
  "highlightedLines": [array of fixed-code line numbers that were changed]
}

Examples:

For a single fix:
{
  "displayMessage": "**I found and fixed the issue!** 🛠️\n\nOn **line 8**, the h1 tag wasn't closed properly. I added the missing '>'.\n\nYour code should work perfectly now!",
  "explanation": "I found and fixed the issue. On line 8, the h1 tag wasn't closed properly. I added the missing greater than symbol. Your code should work perfectly now!",
  "steps": [{"text": "Step 1: The h1 tag on line 8 was missing its closing bracket. I added the missing bracket on line 8.", "lineStart": 8, "lineEnd": 8}],
  "errors": [{"line": 8, "message": "unclosed h1 tag", "fix": "added '>'}],
  "highlightedLines": [8]
}

For multiple fixes:
{
  "displayMessage": "I found and fixed a couple of issues in your code! 🛠️\n\n- On **line 8**, the h1 tag wasn't closed properly\n- On **line 12**, there was a typo in 'console.log'\n\nYour code should work perfectly now!",
  "explanation": "I found and fixed two issues. On line 8, the h1 tag wasn't closed properly - I added the missing greater-than symbol. On line 12, there was a typo in console.log - I corrected it. Your code should work perfectly now!",
  "steps": [
    {"text": "Step 1: The h1 tag on line 8 was missing its closing bracket. I added the missing bracket on line 8.", "lineStart": 8, "lineEnd": 8},
    {"text": "Step 2: The console.log call on line 12 had a typo. I corrected the function name on line 12.", "lineStart": 12, "lineEnd": 12}
  ],
  "errors": [
    {"line": 8, "message": "unclosed h1 tag", "fix": "added '>'},
    {"line": 12, "message": "typo in console.log", "fix": "corrected to console.log"}
  ],
  "highlightedLines": [8, 12]
}

The examples illustrate concise fix-only wording. Always include the required "steps" field in your response, with one entry per change and fixed-code line numbers.
If no differences are found, return an empty steps array.
Return ONLY the JSON. No other text.
`;

      try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 2048,
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Gemini API error:", errorText);
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts[0]?.text || "";

        console.log("📥 Raw Gemini response for fix explanation:", text.substring(0, 200) + "...");

        try {
          // Clean the response - remove markdown code blocks
          let cleaned = text.replace(/```json\n?|\n?```/g, '').trim();

          // Extract JSON object
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error("No JSON object found in response");
          }

          const parsed = JSON.parse(jsonMatch[0]);
          const parsedErrors = Array.isArray(parsed.errors) ? parsed.errors : [];
          const parsedSteps = Array.isArray(parsed.steps)
            ? parsed.steps.filter((step) => step && typeof step.text === "string")
            : [];
          const steps = parsedSteps.length > 0
            ? parsedSteps.map((step) => ({
              text: step.text,
              lineStart: Number.isFinite(Number(step.lineStart)) ? Number(step.lineStart) : 1,
              lineEnd: Number.isFinite(Number(step.lineEnd))
                ? Number(step.lineEnd)
                : Number(step.lineStart) || 1
            }))
            : parsedErrors.map((error) => {
              const line = Number(error.line) || 1;
              return {
                text: `On line ${line}, ${error.message || "an issue was found"}. ${error.fix || "The code was corrected."}`,
                lineStart: line,
                lineEnd: line
              };
            });

          // Validate required fields
          const response_data = {
            displayMessage: parsed.displayMessage || "I fixed your code!",
            explanation: parsed.explanation || "",
            steps,
            errors: parsedErrors,
            highlightedLines: Array.isArray(parsed.highlightedLines) ? parsed.highlightedLines : []
          };

          console.log("✅ Successfully parsed fix explanation:", {
            displayMessageLength: response_data.displayMessage.length,
            errorsCount: response_data.errors.length,
            highlightedLinesCount: response_data.highlightedLines.length
          });

          return NextResponse.json(response_data);

        } catch (parseError) {
          console.error("❌ Failed to parse fix explanation:", parseError);
          console.error("Raw text that failed:", text);

          // Fallback fix explanation
          return NextResponse.json({
            displayMessage: "I couldn't generate step-by-step details for the code changes.",
            explanation: "",
            steps: [],
            errors: [],
            highlightedLines: []
          });
        }
      } catch (apiError) {
        console.error("Gemini API call failed:", apiError);

        // Fallback fix explanation
        return NextResponse.json({
          displayMessage: "I couldn't generate step-by-step details for the code changes.",
          explanation: "",
          steps: [],
          errors: [],
          highlightedLines: []
        });
      }
    }

    // Default response for invalid requests
    return NextResponse.json({
      displayMessage: "👋 How can I help you with your code today?",
      explanation: "How can I help you with your code today?",
      errors: [],
      highlightedLines: []
    });

  } catch (error) {
    console.error("🔥 Gemini API fatal error:", error);
    return NextResponse.json({
      displayMessage: "😔 Sorry, I encountered an error. Please try again.",
      explanation: "Sorry, I encountered an error. Please try again.",
      errors: [],
      highlightedLines: []
    });
  }
}