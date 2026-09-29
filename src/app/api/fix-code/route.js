// app/api/fix-code/route.js
import { NextResponse } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req) {
  try {
    const { code, language, errorMessage } = await req.json();

    console.log("🔧 Fix Code API received:", { 
      language, 
      codeLength: code?.length,
      hasError: !!errorMessage 
    });

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Code is required" },
        { status: 400 }
      );
    }

    // Try OpenRouter to fix the code
    let fixedCode = code;
    let wasFixed = false;

    if (OPENROUTER_API_KEY) {
      try {
        const fixPrompt = `
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
${errorMessage || "Fix any syntax or runtime errors"}

Code:
${code}

Return ONLY the corrected code.
No explanations.
No markdown.
No extra text.
`;

        console.log("📤 Sending to OpenRouter for fix");
        const openRouterResponse = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "CodeMentor AI"
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat",
            messages: [
              {
                role: "system",
                content: "You are a strict code fixer. Only fix the specific error. Do not improve or modify anything else. Return ONLY the corrected code with no explanations."
              },
              { role: "user", content: fixPrompt }
            ],
            temperature: 0.1,
            max_tokens: 2000
          })
        });

        if (openRouterResponse.ok) {
          const data = await openRouterResponse.json();
          let suggestedFix = data.choices?.[0]?.message?.content || "";
          
          // Clean up the response
          suggestedFix = suggestedFix
            .replace(/```[\w]*\n?/g, "")
            .replace(/```/g, "")
            .replace(/^Here('|’)s the fixed code:?\n*/i, "")
            .replace(/^Sure!?\n*/i, "")
            .replace(/^Certainly!?\n*/i, "")
            .trim();

          // Only use if it's different and reasonable
          if (suggestedFix && suggestedFix !== code && suggestedFix.length > 0) {
            // Check if line count is similar (not completely rewritten)
            const originalLines = code.split('\n').length;
            const fixedLines = suggestedFix.split('\n').length;
            
            if (Math.abs(originalLines - fixedLines) <= 3) {
              fixedCode = suggestedFix;
              wasFixed = true;
              console.log("✅ OpenRouter successfully fixed the code");
            } else {
              console.log("⚠️ OpenRouter changed structure too much, using original");
            }
          } else {
            console.log("ℹ️ OpenRouter made no changes");
          }
        } else {
          console.error("OpenRouter API error:", openRouterResponse.status);
        }
      } catch (openRouterError) {
        console.error("OpenRouter error:", openRouterError);
      }
    } else {
      console.log("ℹ️ OpenRouter API key not configured, skipping fix step");
    }

    // Return ONLY the fixed code, no explanation
    return NextResponse.json({
      success: true,
      data: {
        fixedCode: wasFixed ? fixedCode : null,
        originalCode: code,
        wasFixed
      }
    });

  } catch (error) {
    console.error("Fix Code API error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Failed to fix code"
      },
      { status: 500 }
    );
  }
}