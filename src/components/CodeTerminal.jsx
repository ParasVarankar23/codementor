"use client";

import { useState } from "react";
import {
    Play,
    Eye,
    Trash2,
    Terminal as TerminalIcon,
    X,
} from "lucide-react";

export default function CodeTerminal() {
    const [language, setLanguage] = useState("JavaScript");
    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");
    const [preview, setPreview] = useState(false);

    const runCode = () => {
        if (!code.trim()) {
            setOutput("No JavaScript code found.");
            return;
        }

        if (language === "JavaScript") {
            try {
                const logs = [];

                const originalLog = console.log;

                console.log = (...args) => {
                    logs.push(
                        args
                            .map((item) =>
                                typeof item === "object"
                                    ? JSON.stringify(item)
                                    : String(item)
                            )
                            .join(" ")
                    );
                };

                // Execute JavaScript
                new Function(code)();

                console.log = originalLog;

                setOutput(
                    logs.length > 0
                        ? logs.join("\n")
                        : "Code executed successfully."
                );
            } catch (error) {
                console.log = console.log;
                setOutput(`Error: ${error.message}`);
            }
        }
    };

    const clearTerminal = () => {
        setOutput("");
    };

    const openPreview = () => {
        setPreview(true);
    };

    return (
        <div className="cm-terminal">

            {/* =========================================
          TOP TERMINAL BAR
      ========================================= */}
            <div className="cm-terminal-header">

                <div className="cm-window-controls">
                    <span className="cm-dot cm-red"></span>
                    <span className="cm-dot cm-yellow"></span>
                    <span className="cm-dot cm-green"></span>
                </div>

                <div className="cm-terminal-title">
                    <TerminalIcon size={18} />
                    <span>CodeMentor Terminal</span>
                </div>

                <div className="cm-terminal-actions">

                    <button
                        className="cm-header-button"
                        onClick={openPreview}
                    >
                        <Eye size={17} />
                        Preview
                    </button>

                    <button
                        className="cm-icon-button"
                        onClick={clearTerminal}
                        title="Clear"
                    >
                        <Trash2 size={18} />
                    </button>

                    <button
                        className="cm-run-button"
                        onClick={runCode}
                    >
                        <Play size={17} fill="currentColor" />
                        Run
                    </button>

                </div>
            </div>

            {/* =========================================
          TERMINAL OUTPUT
      ========================================= */}
            <div className="cm-terminal-body">

                {output ? (
                    <div className="cm-output">

                        {output.startsWith("Error:") ||
                            output.startsWith("No JavaScript") ? (
                            <div className="cm-error">
                                <X size={18} />
                                <span>{output}</span>
                            </div>
                        ) : (
                            <>
                                <div className="cm-success-line">
                                    <span className="cm-success-symbol">✓</span>
                                    <span>Code executed successfully</span>
                                </div>

                                <pre className="cm-output-text">
                                    {output}
                                </pre>
                            </>
                        )}

                    </div>
                ) : (
                    <div className="cm-terminal-empty">

                        <div className="cm-prompt-line">
                            <span className="cm-user">
                                codementor
                            </span>

                            <span className="cm-at">
                                @
                            </span>

                            <span className="cm-workspace">
                                workspace
                            </span>

                            <span className="cm-symbol">
                                :$
                            </span>

                            <span className="cm-ready">
                                ready
                            </span>
                        </div>

                        <div className="cm-terminal-message">
                            <span>Run your code to see the output here.</span>
                        </div>

                    </div>
                )}

            </div>

            {/* =========================================
          CODE INPUT AREA
      ========================================= */}
            <div className="cm-code-section">

                <div className="cm-code-header">

                    <div className="cm-language">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            <option>JavaScript</option>
                            <option>HTML</option>
                            <option>CSS</option>
                        </select>
                    </div>

                    <div className="cm-status">
                        <span></span>
                        Ready
                    </div>

                </div>

                <textarea
                    className="cm-code-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={`// Write your ${language} code here...

console.log("Hello CodeMentor!");`}
                    spellCheck={false}
                />

            </div>

            {/* =========================================
          BROWSER PREVIEW
      ========================================= */}
            {preview && (
                <div className="cm-preview">

                    <div className="cm-preview-header">

                        <div className="cm-preview-title">
                            Browser Preview
                        </div>

                        <button
                            className="cm-preview-close"
                            onClick={() => setPreview(false)}
                        >
                            Close
                        </button>

                    </div>

                    <iframe
                        title="Code Preview"
                        className="cm-preview-frame"
                        srcDoc={
                            language === "HTML"
                                ? code
                                : `
                  <html>
                    <body>
                      <script>
                        ${language === "JavaScript" ? code : ""}
                      <\/script>
                    </body>
                  </html>
                `
                        }
                    />

                </div>
            )}
        </div>
    );
}