"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaSpinner } from "react-icons/fa";

// Speech utility function
const speakText = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
        voice.name.includes('Google UK') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Female')
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
};

// Prevent SSR crash
const Editor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center" style={{ backgroundColor: "var(--workbench-editor, var(--editor-bg, #1a1c22))" }}>
            <FaSpinner className="animate-spin text-teal-600 text-2xl" />
        </div>
    )
});

export default function MonacoEditor({ language, code, setCode, onMount, theme, isRunning }) {
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const decorationRef = useRef([]);
    const temporaryDecorationRef = useRef([]);
    const languageRef = useRef(language || "html");
    const [isEditorLoading, setIsEditorLoading] = useState(true);

    // Hover states
    const [hoveredLine, setHoveredLine] = useState(null);
    const [hoveredError, setHoveredError] = useState(null);
    const hoverTimeoutRef = useRef(null);

    useEffect(() => {
        languageRef.current = language || "html";
    }, [language]);

    // Effect to speak fix on hover
    useEffect(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }

        if (!hoveredError || !hoveredError.fix) return;

        hoverTimeoutRef.current = setTimeout(() => {
            const fixText = `Fix suggestion: ${hoveredError.fix}`;
            speakText(fixText);
        }, 500);

        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, [hoveredError]);

    // Function to highlight specific lines (for explanations)
    const highlightLines = useCallback((lines) => {
        if (!editorRef.current || !monacoRef.current || !lines || lines.length === 0) return;

        const monaco = monacoRef.current;
        const editor = editorRef.current;
        const model = editor.getModel();

        if (!model) return;

        console.log("🎨 Highlighting lines:", lines);

        // Clear any previous temporary highlights
        if (temporaryDecorationRef.current.length > 0) {
            editor.deltaDecorations(temporaryDecorationRef.current, []);
            temporaryDecorationRef.current = [];
        }

        // Create decorations for each line to highlight
        const decorations = lines.map(lineNum => {
            const lineNumber = Math.min(Math.max(1, lineNum), model.getLineCount());
            return {
                range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                options: {
                    isWholeLine: true,
                    className: 'temporary-highlight',
                    glyphMarginClassName: 'speaking-glyph',
                    overviewRuler: {
                        color: '#0f766e',
                        position: monaco.editor.OverviewRulerLane.Center
                    },
                    marginClassName: 'speaking-margin',
                    inlineClassName: 'temporary-highlight-inline',
                    stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                }
            };
        });

        // Apply decorations
        temporaryDecorationRef.current = editor.deltaDecorations([], decorations);

        // Reveal the first highlighted line
        if (lines.length > 0) {
            editor.revealLineInCenter(lines[0]);
        }
    }, []);

    // Function to clear temporary highlights
    const clearTemporaryHighlights = useCallback(() => {
        if (editorRef.current && temporaryDecorationRef.current.length > 0) {
            console.log("🧹 Clearing temporary highlights");
            editorRef.current.deltaDecorations(temporaryDecorationRef.current, []);
            temporaryDecorationRef.current = [];
        }
    }, []);

    // Function to highlight errors (permanent highlights)
    const highlightErrors = useCallback((errors) => {
        if (!editorRef.current || !monacoRef.current) return;

        // Clear existing decorations if no errors
        if (!errors || errors.length === 0) {
            if (decorationRef.current.length > 0) {
                decorationRef.current = editorRef.current.deltaDecorations(decorationRef.current, []);
            }
            return;
        }

        const monaco = monacoRef.current;
        const editor = editorRef.current;
        const model = editor.getModel();

        if (!model) return;

        console.log("🔴 Highlighting errors:", errors);

        // Create decorations for each error
        const newDecorations = errors.map(error => {
            const lineNumber = Math.min(Math.max(1, error.line), model.getLineCount());

            return {
                range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                options: {
                    isWholeLine: true,
                    className: 'error-line-highlight',
                    glyphMarginClassName: 'error-glyph',
                    hoverMessage: {
                        value: `**Line ${lineNumber}:** ${error.message}\n\n**Fix:** ${error.fix}`
                    },
                    marginClassName: 'error-margin',
                    stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                }
            };
        });

        // Apply new decorations
        decorationRef.current = editor.deltaDecorations(decorationRef.current, newDecorations);

        // Reveal the first error line
        if (errors.length > 0) {
            editor.revealLineInCenter(errors[0].line);
        }
    }, []);

    // Function to clear all permanent highlights
    const clearHighlights = useCallback(() => {
        if (editorRef.current && decorationRef.current.length > 0) {
            console.log("🧹 Clearing permanent highlights");
            decorationRef.current = editorRef.current.deltaDecorations(decorationRef.current, []);
        }
    }, []);

    // Function to clear all highlights (both permanent and temporary)
    const clearAllHighlights = useCallback(() => {
        clearHighlights();
        clearTemporaryHighlights();
    }, [clearHighlights, clearTemporaryHighlights]);

    // Handle mouse move to detect hover on error lines
    const handleEditorMouseMove = useCallback((e) => {
        if (!editorRef.current || !monacoRef.current) return;

        const editor = editorRef.current;
        const position = e.target.position;

        if (!position) return;

        const lineNumber = position.lineNumber;

        // Get decorations for this line
        const decorations = editor.getLineDecorations(lineNumber);

        if (decorations && decorations.length > 0) {
            const errorDecoration = decorations.find(d =>
                d.options.className === 'error-line-highlight'
            );

            if (errorDecoration && errorDecoration.options.hoverMessage) {
                const hoverText = errorDecoration.options.hoverMessage.value;
                const fixMatch = hoverText.match(/\*\*Fix:\*\* (.*?)(?:\n|$)/);

                if (fixMatch && fixMatch[1]) {
                    const lineError = {
                        line: lineNumber,
                        message: hoverText,
                        fix: fixMatch[1].trim()
                    };

                    if (hoveredLine !== lineNumber || JSON.stringify(hoveredError) !== JSON.stringify(lineError)) {
                        setHoveredLine(lineNumber);
                        setHoveredError(lineError);
                    }
                    return;
                }
            }
        }

        setHoveredLine(null);
        setHoveredError(null);
    }, [hoveredLine, hoveredError]);

    // Expose methods to parent component
    useEffect(() => {
        if (editorRef.current && monacoRef.current) {
            // Make methods available globally
            window.monacoEditor = window.monacoEditor || {};
            window.monacoEditor.highlightErrors = highlightErrors;
            window.monacoEditor.clearHighlights = clearHighlights;
            window.monacoEditor.highlightLines = highlightLines;
            window.monacoEditor.clearTemporaryHighlights = clearTemporaryHighlights;
            window.monacoEditor.clearAllHighlights = clearAllHighlights;
        }
    }, [editorRef.current, monacoRef.current, highlightErrors, clearHighlights, highlightLines, clearTemporaryHighlights, clearAllHighlights]);

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        monacoRef.current = monaco;
        setIsEditorLoading(false);

        // Add custom methods to editor instance
        editor.highlightErrors = highlightErrors;
        editor.clearHighlights = clearHighlights;
        editor.highlightLines = highlightLines;
        editor.clearTemporaryHighlights = clearTemporaryHighlights;
        editor.clearAllHighlights = clearAllHighlights;

        // Make editor available globally
        window.monacoEditor = editor;
        window.monaco = monaco;

        // Add mouse move listener for hover detection
        editor.onMouseMove(handleEditorMouseMove);

        // Add hover provider for custom tooltip
        try {
            // Register for multiple languages
            const languages = [language, 'javascript', 'typescript', 'html', 'css', 'python', 'java', 'cpp'];
            languages.forEach(lang => {
                monaco.languages.registerHoverProvider(lang, {
                    provideHover: (model, position) => {
                        const lineNumber = position.lineNumber;

                        const decorations = editor.getLineDecorations(lineNumber);
                        const errorDecoration = decorations?.find(d =>
                            d.options.className === 'error-line-highlight'
                        );

                        if (errorDecoration && errorDecoration.options.hoverMessage) {
                            const hoverText = errorDecoration.options.hoverMessage.value;
                            const fixMatch = hoverText.match(/\*\*Fix:\*\* (.*?)(?:\n|$)/);

                            if (fixMatch && fixMatch[1]) {
                                return {
                                    range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                                    contents: [
                                        { value: hoverText },
                                        {
                                            value: `\n\n🔊 **Click to hear fix:** [Listen](${fixMatch[1].trim()})`
                                        }
                                    ]
                                };
                            }
                        }
                        return null;
                    }
                });
            });
        } catch (e) {
            console.warn("Could not register hover provider:", e);
        }

        // Add click handler for speech button
        editor.onMouseDown((e) => {
            const target = e.target;
            if (target?.element?.innerText === 'Listen') {
                const lineNumber = target.position?.lineNumber;
                if (lineNumber) {
                    const decorations = editor.getLineDecorations(lineNumber);
                    const errorDecoration = decorations?.find(d =>
                        d.options.className === 'error-line-highlight'
                    );

                    if (errorDecoration && errorDecoration.options.hoverMessage) {
                        const hoverText = errorDecoration.options.hoverMessage.value;
                        const fixMatch = hoverText.match(/\*\*Fix:\*\* (.*?)(?:\n|$)/);

                        if (fixMatch && fixMatch[1]) {
                            speakText(`Fix suggestion: ${fixMatch[1].trim()}`);
                        }
                    }
                }
            }
        });

        // Format document on Shift+Alt+F
        try {
            editor.addCommand(
                monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
                () => {
                    const action = editor.getAction("editor.action.formatDocument");
                    if (action) action.run();
                }
            );
        } catch (e) {
            console.warn("Could not add format command:", e);
        }

        // Clear highlights when content changes
        editor.onDidChangeModelContent(() => {
            clearHighlights();
            clearTemporaryHighlights();
            setHoveredLine(null);
            setHoveredError(null);
        });

        if (onMount) {
            onMount(editor, monaco);
        }
    }

    const handleEditorChange = (value) => {
        setCode(value);
        clearHighlights();
        clearTemporaryHighlights();
        setHoveredLine(null);
        setHoveredError(null);
    };

    const RunningOverlay = () => (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <div className="bg-(--workbench-editor) p-4 rounded-xl border border-teal-600/30 shadow-2xl flex items-center gap-3">
                <FaSpinner className="animate-spin text-teal-600 text-xl" />
                <span className="text-white">Executing code...</span>
            </div>
        </div>
    );

    return (
        <div className="relative h-full w-full">
            {isRunning && <RunningOverlay />}

            {isEditorLoading && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "var(--workbench-editor, var(--editor-bg, #1a1c22))" }}>
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-teal-600 text-3xl mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">Loading editor...</p>
                    </div>
                </div>
            )}

            <Editor
                height="100%"
                width="100%"
                language={language}
                theme={theme}
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    automaticLayout: true,
                    autoClosingBrackets: "always",
                    autoClosingQuotes: "always",
                    autoClosingOvertype: "always",
                    autoSurround: "languageDefined",
                    formatOnPaste: true,
                    formatOnType: true,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    padding: { top: 10, bottom: 10 },
                    lineNumbers: "on",
                    glyphMargin: true,
                    folding: true,
                    lineDecorationsWidth: 10,
                    renderLineHighlight: "all",
                    quickSuggestions: true,
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: "on",
                    tabCompletion: "on",
                    wordBasedSuggestions: true,
                    parameterHints: { enabled: true },
                    hover: {
                        enabled: true,
                        delay: 300
                    },
                    scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible'
                    }
                }}
            />
        </div>
    );
}