// app/api/openrouter/route.js
import { NextResponse } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Available models
const MODELS = {
  DEEPSEEK: "deepseek/deepseek-chat",
  MISTRAL: "mistralai/mistral-7b-instruct",
  CLAUDE: "anthropic/claude-2",
  GPT4: "openai/gpt-4",
  LLAMA: "meta-llama/llama-2-70b-chat"
};

export async function POST(req) {
  try {
    const { code, language, error } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "No code provided", fixedCode: code },
        { status: 400 }
      );
    }

    // If no API key, return original code
    if (!OPENROUTER_API_KEY) {
      console.warn("OpenRouter API key not configured");
      return NextResponse.json({ 
        fixedCode: code,
        warning: "API key not configured" 
      });
    }

    const prompt = `
Fix ONLY the error in this ${language} code.

IMPORTANT RULES:
- DO NOT refactor
- DO NOT improve
- DO NOT reformat
- DO NOT rename variables
- DO NOT add comments
- DO NOT add extra lines
- DO NOT remove working code
- ONLY modify the minimal part required to fix the error

Error:
${error || "Fix any syntax or runtime errors"}

Code:
${code}

Return ONLY the corrected code.
No explanations.
No markdown.
No extra text.
`;

    console.log(`Sending request to OpenRouter for ${language} code fix`);

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "CodeMentor AI"
      },
      body: JSON.stringify({
        model: MODELS.DEEPSEEK,
        messages: [
          {
            role: "system",
            content: "You are a strict code fixer. Only fix the specific error. Do not improve or modify anything else. Return ONLY the corrected code with no explanations."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 2000,
        top_p: 0.1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      // Return original code if API fails
      return NextResponse.json({ 
        fixedCode: code,
        warning: "API error, using original code" 
      });
    }

    const data = await response.json();
    
    // Extract the fixed code from response
    let fixedCode = data.choices?.[0]?.message?.content || code;

    // Clean up the response
    fixedCode = fixedCode
      .replace(/```[\w]*\n?/g, "") // Remove markdown code fences
      .replace(/```/g, "") // Remove remaining backticks
      .replace(/^Here('|’)s the fixed code:?\n*/i, "") // Remove intro phrases
      .replace(/^Sure!?\n*/i, "")
      .replace(/^Certainly!?\n*/i, "")
      .replace(/^Below is the corrected code:?\n*/i, "")
      .replace(/^The corrected code is:?\n*/i, "")
      .trim();

    // If no changes were made or response is invalid, return original
    if (!fixedCode || fixedCode.length === 0 || fixedCode === code) {
      return NextResponse.json({ fixedCode: code });
    }

    // Safety check: If the model drastically changed the code structure
    const originalLines = code.split('\n').length;
    const fixedLines = fixedCode.split('\n').length;
    
    // Allow small line count differences (within 2 lines)
    if (Math.abs(originalLines - fixedLines) > 2) {
      console.warn("Model attempted major structure change, using original");
      return NextResponse.json({ 
        fixedCode: code,
        warning: "Structure changed too much"
      });
    }

    return NextResponse.json({ 
      fixedCode,
      changes: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("OpenRouter API error:", error);
    // Always return the original code on error
    return NextResponse.json({ 
      fixedCode: code,
      warning: "Error occurred, using original code" 
    });
  }
}

// GET endpoint to check API status
export async function GET() {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { status: "error", message: "OpenRouter API key not configured" },
        { status: 200 }
      );
    }

    return NextResponse.json({ 
      status: "ok", 
      message: "OpenRouter API is configured",
      models: MODELS
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 200 }
    );
  }
} 