import { NextResponse } from "next/server";

const SANDBOX_URL = process.env.SANDBOX_URL || "http://localhost:3001/execute";

export async function POST(req) {
  try {
    const body = await req.json();

    // basic validation
    if (!body.language || !Array.isArray(body.files)) {
      return NextResponse.json(
        { error: "Invalid payload format" },
        { status: 400 }
      );
    }

    const language = String(body.language).trim().toLowerCase();
    const languageAliases = { javascript: "node", "c++": "cpp" };
    const sandboxLanguage = languageAliases[language] || language;
    const filenames = {
      python: "Main.py",
      java: "Main.java",
      node: "Main.js",
      cpp: "Main.cpp"
    };

    if (!filenames[sandboxLanguage]) {
      return NextResponse.json(
        {
          error: `The Docker sandbox does not support ${body.language}. Supported languages: ${Object.keys(filenames).join(", ")}`
        },
        { status: 400 }
      );
    }

    const sandboxBody = {
      ...body,
      language: sandboxLanguage,
      files: body.files.map((file, index) =>
        index === 0 ? { ...file, name: filenames[sandboxLanguage] } : file
      )
    };

    const sandboxRes = await fetch(SANDBOX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sandboxBody),
      cache: "no-store"
    });

    const responseText = await sandboxRes.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          error: "Sandbox service returned a non-JSON response",
          details: responseText.slice(0, 300)
        },
        { status: 502 }
      );
    }

    return NextResponse.json(data, {
      status: sandboxRes.ok ? 200 : sandboxRes.status
    });

  } catch (err) {
    return NextResponse.json(
      {
        error: "Sandbox service is unavailable",
        details: err.message
      },
      { status: 503 }
    );
  }
}