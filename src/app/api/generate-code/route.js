// app/api/generate-code/route.js
import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function POST(req) {
  try {
    const { message, language } = await req.json();

    console.log("🎯 Generate Code API received:", { message, language });

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are a friendly coding mentor. The user asks: "${message}"

Language context: ${language || "javascript"}

TASK:
Generate code based on the user's request and explain it.

Return a JSON object with:
{
  "code": "the complete working code with proper formatting",
  "language": "detected programming language",
  "explanation": "natural explanation mentioning line numbers (for speech)",
  "displayMessage": "friendly message with **markdown** for the chat",
  "highlightedLines": [array of line numbers to highlight during explanation]
}

IMPORTANT:
- If they ask for code, generate complete, runnable code
- Include line numbers in the explanation (e.g., "On line 5, we...")
- Make the explanation conversational and easy to understand
- The highlightedLines array should contain the line numbers that are being explained

Example for "write a Java program for prime numbers":
{
  "code": "import java.util.Scanner;\n\npublic class PrimeNumber {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.print(\"Enter a number: \");\n        int num = scanner.nextInt();\n        boolean isPrime = true;\n        \n        if (num <= 1) {\n            isPrime = false;\n        } else {\n            for (int i = 2; i <= Math.sqrt(num); i++) {\n                if (num % i == 0) {\n                    isPrime = false;\n                    break;\n                }\n            }\n        }\n        \n        if (isPrime) {\n            System.out.println(num + \" is a prime number\");\n        } else {\n            System.out.println(num + \" is not a prime number\");\n        }\n        scanner.close();\n    }\n}",
  "language": "java",
  "explanation": "Let me walk you through this prime number checker! On line 6, we create a Scanner to get input from the user. Then on line 8, we read the number. The real magic happens in the for loop on line 13 - we only need to check divisors up to the square root of the number, which makes it much faster. If we find any divisor on line 14, we set isPrime to false and break out of the loop. Finally, on lines 19-22, we print whether the number is prime or not.",
  "displayMessage": "**Here's a Java program to check prime numbers!** 🎯\n\nLet me explain how it works:\n- **Line 6**: Creates a Scanner to read user input\n- **Line 8**: Reads the number you want to check\n- **Line 13**: Loop that checks divisors up to √n\n- **Line 14**: If a divisor is found, the number isn't prime\n- **Lines 19-22**: Prints the result\n\nTry running it with different numbers!",
  "highlightedLines": [6, 8, 13, 14, 19, 20, 21, 22]
}

Return ONLY the JSON. No other text.
`;

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

    // Parse JSON from response
    try {
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return NextResponse.json({
        success: true,
        data: {
          code: parsed.code || "",
          language: parsed.language || language || "javascript",
          explanation: parsed.explanation || "",
          displayMessage: parsed.displayMessage || parsed.explanation || "Here's what I found!",
          highlightedLines: parsed.highlightedLines || []
        }
      });
    } catch (e) {
      console.error("Failed to parse Gemini response:", e);

      // Fallback response
      return NextResponse.json({
        success: true,
        data: {
          code: "",
          language: language || "javascript",
          explanation: "I'm here to help! Could you please provide more details about what you'd like to know?",
          displayMessage: "👋 **I'm here to help!** Could you please provide more details about what you'd like to know?",
          highlightedLines: []
        }
      });
    }

  } catch (error) {
    console.error("Generate Code API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate code"
      },
      { status: 500 }
    );
  }
}