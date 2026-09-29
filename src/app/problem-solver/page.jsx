"use client";

import ChatSidebar from "@/components/ChatSidebar/ChatSidebar";
import MonacoEditor from "@/components/MonacoEditor/MonacoEditor";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useTheme } from "@/context/ThemeContext";
import {
    SandpackFileExplorer,
    SandpackLayout,
    SandpackPreview,
    SandpackProvider,
} from "@codesandbox/sandpack-react";
import { default as Image, default as NextImage } from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    FaCheck,
    FaComments,
    FaCompress,
    FaCopy,
    FaExpand,
    FaHistory,
    FaLightbulb,
    FaMagic,
    FaMicrophone,
    FaMoon,
    FaPaperPlane,
    FaRobot,
    FaSignInAlt,
    FaSpinner,
    FaStop,
    FaSun,
    FaTerminal,
    FaUser,
    FaVolumeUp,
} from "react-icons/fa";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';


function extractPrompts(src, lang) {
    const prompts = [];

    if (lang === "python") {
        const re = /input\s*\(\s*(?:f?["'`]([^"'`]*)["'`])?\s*\)/g;
        let m;
        while ((m = re.exec(src)) !== null) {
            prompts.push(m[1] ?? "");
        }
    } else if (lang === "java") {
        const printRe = /System\.out\.print(?:ln)?\s*\(\s*"([^"]*)"\s*\)\s*;/g;
        const scannerRe = /scanner\.(nextLine|nextInt|nextDouble|nextFloat|nextLong|next)\s*\(\s*\)/gi;

        const prints = [];
        let pm;
        while ((pm = printRe.exec(src)) !== null) {
            prints.push({ idx: pm.index, text: pm[1] });
        }

        const scanners = [];
        let sm;
        while ((sm = scannerRe.exec(src)) !== null) {
            scanners.push({ idx: sm.index });
        }

        scanners.forEach((s) => {
            const preceding = prints.filter((p) => p.idx < s.idx);
            if (preceding.length > 0) {
                prompts.push(preceding[preceding.length - 1].text);
            } else {
                prompts.push("");
            }
        });
    } else if (lang === "node") {
        const re = /rl\.question\s*\(\s*['"`]([^'"`]*)['"`]/g;
        let m;
        while ((m = re.exec(src)) !== null) {
            prompts.push(m[1]);
        }
    }

    return prompts;
}

/* ═══════════════════════════════════════════════════════════════════════════
   VS CODE–STYLE TERMINAL
═══════════════════════════════════════════════════════════════════════════ */
function Terminal({ lines, onSubmitInput, waitingForInput, promptText }) {
    const [typed, setTyped] = useState("");
    const hiddenRef = useRef(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [lines, waitingForInput, typed]);

    useEffect(() => {
        if (waitingForInput) {
            setTyped("");
            setTimeout(() => hiddenRef.current?.focus(), 40);
        }
    }, [waitingForInput]);

    const submit = () => {
        const val = typed;
        setTyped("");
        onSubmitInput(val);
    };

    return (
        <div
            className="flex flex-col h-full"
            style={{
                backgroundColor: "var(--workbench-editor, var(--editor-bg))",
                fontFamily: "'Cascadia Code','Fira Code','Consolas','Courier New',monospace",
                fontSize: "13px",
                lineHeight: "1.55",
                cursor: waitingForInput ? "text" : "default",
            }}
            onClick={() => waitingForInput && hiddenRef.current?.focus()}
        >
            <div className="flex-1 overflow-auto px-4 pt-3 pb-2">
                {lines.length === 0 && !waitingForInput && (
                    <span style={{ color: "#6a737d", fontStyle: "italic" }}>
                        Click ▶ Run to execute your code…
                    </span>
                )}

                {lines.map((line, i) => {
                    if (line.type === "output") {
                        return (
                            <div key={i} style={{ color: "var(--workbench-text)", whiteSpace: "pre-wrap" }}>
                                {line.text}
                            </div>
                        );
                    }
                    if (line.type === "error") {
                        return (
                            <div key={i} style={{ color: "#f14c4c", whiteSpace: "pre-wrap" }}>
                                {line.text}
                            </div>
                        );
                    }
                    if (line.type === "input-echo") {
                        return (
                            <div key={i} style={{ whiteSpace: "pre-wrap" }}>
                                <span style={{ color: "var(--workbench-text)" }}>{line.prompt}</span>
                                <span style={{ color: "#4ec9b0" }}>{line.answer}</span>
                            </div>
                        );
                    }
                    if (line.type === "divider") {
                        return (
                            <div
                                key={i}
                                style={{ color: "#3c3c3c", fontSize: "11px", padding: "2px 0", whiteSpace: "pre-wrap" }}
                            >
                                {line.text}
                            </div>
                        );
                    }
                    return null;
                })}

                {waitingForInput && (
                    <div style={{ display: "flex", alignItems: "center", whiteSpace: "pre-wrap" }}>
                        <span style={{ color: "var(--workbench-text)" }}>{promptText}</span>
                        <span style={{ color: "#4ec9b0" }}>{typed}</span>
                        <span
                            style={{
                                display: "inline-block",
                                width: "8px",
                                height: "1.1em",
                                backgroundColor: "#aeafad",
                                marginLeft: "1px",
                                verticalAlign: "text-bottom",
                                animation: "termBlink 1.1s step-end infinite",
                            }}
                        />
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            <div
                style={{
                    borderTop: "1px solid var(--workbench-border)",
                    backgroundColor: "#4338ca",
                    color: "#ffffff",
                    fontSize: "11px",
                    padding: "1px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    minHeight: "20px",
                }}
            >
                {waitingForInput ? (
                    <>
                        <span style={{ opacity: 0.9 }}>⌨</span>
                        <span>stdin — type your input and press Enter</span>
                    </>
                ) : lines.length > 0 ? (
                    <>
                        <span>✓</span>
                        <span>Process exited</span>
                    </>
                ) : (
                    <span>Terminal</span>
                )}
            </div>

            <input
                ref={hiddenRef}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        submit();
                    }
                }}
                style={{
                    position: "absolute",
                    opacity: 0,
                    pointerEvents: "none",
                    width: 0,
                    height: 0,
                }}
                tabIndex={-1}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
            />

            <style jsx global>{`
        @keyframes termBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXTRACT CODE FROM MESSAGE HELPER
═══════════════════════════════════════════════════════════════════════════ */
const extractCodeFromMessage = (message) => {
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/;
    const match = message.match(codeBlockRegex);
    if (match) {
        return match[1].trim();
    }
    return null;
};

/* ═══════════════════════════════════════════════════════════════════════════
   DETECT LANGUAGE FROM CODE
═══════════════════════════════════════════════════════════════════════════ */
const detectLanguageFromCode = (code) => {
    if (!code) return null;

    // Python detection
    if (code.includes('def ') || code.includes('import ') || code.includes('print(') ||
        code.includes('input(') || code.includes('class ') && code.includes(':')) {
        return 'python';
    }

    // Java detection
    if (code.includes('public class ') || code.includes('System.out.println') ||
        code.includes('public static void main') || code.includes('Scanner ')) {
        return 'java';
    }

    // Node.js detection
    if (code.includes('require(') || code.includes('readline') ||
        code.includes('process.stdin') || code.includes('module.exports')) {
        return 'node';
    }

    // React detection
    if ((code.includes('import React') || code.includes('from "react"') ||
        code.includes("from 'react'")) && (code.includes('function App') ||
            code.includes('class App') || code.includes('export default'))) {
        return 'react';
    }

    // Next.js detection
    if (code.includes('export default function Page') ||
        (code.includes('export default') && code.includes('pages'))) {
        return 'next';
    }

    // HTML detection
    if (code.includes('<!DOCTYPE html>') || (code.includes('<html') && code.includes('</html>'))) {
        return 'html';
    }

    // CSS detection
    if (code.includes('{') && code.includes('}') &&
        (code.includes(':') || code.includes(';')) &&
        !code.includes('<') && !code.includes('>')) {
        return 'css';
    }

    // JavaScript detection (default)
    return 'javascript';
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function Home() {
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const isDark = theme === "dark";
    const monacoTheme = isDark ? "vs-dark" : "vs";
    const workbenchTheme = {
        "--workbench-bg": isDark ? "#0B0B0F" : "#f5f7fb",
        "--workbench-surface": isDark ? "#0f1117" : "#ffffff",
        "--workbench-editor": isDark ? "#1a1c22" : "#ffffff",
        "--workbench-panel": isDark ? "#252526" : "#f1f3f7",
        "--workbench-border": isDark ? "#2a2e3a" : "#d7dce5",
        "--workbench-text": isDark ? "#EDEDED" : "#172033",
        "--workbench-muted": isDark ? "#a1a1aa" : "#526075",
    };
    const router = useRouter();

    /* ── UI States ── */
    const [scrolled, setScrolled] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    /* ── AI Fix States ── */
    const [isAIFixing, setIsAIFixing] = useState(false);
    const [isExplaining, setIsExplaining] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);

    // Voice selection state
    const [availableVoices, setAvailableVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [showVoiceSelector, setShowVoiceSelector] = useState(false);

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [hasShownWelcomeModal, setHasShownWelcomeModal] = useState(false);


    const {
        messages: chatMessages,
        sendToAI,
        fixCodeWithAI,
        aiTyping,
    } = useChat();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Speech control states
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechUtterance, setSpeechUtterance] = useState(null);

    /* ── default snippets ── */
    const defaultReactCode = `import React from "react";
function App() {
  return <div><h1>Hello, World!</h1></div>;
}
export default App;`;

    const defaultNextCode = `export default function Page() {
  return <h1>Hello, World!</h1>;
}`;

    const defaultHtmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Hello World</title>
</head>
<body>
  <h1>Hello World</h1>
  <p>Edit this HTML and click Run!</p>
</body>
</html>`;

    const defaultCssCode = `/* try editing this stylesheet */
body { font-family: Arial, sans-serif; background: #f0f0f0; }
h1 { color: #333; }`;

    const defaultJsCode = `console.log("Hello, world!");
console.log("The answer is:", 42);`;

    const defaultPythonCode = `name = input("Enter your name: ")
print(f"Hello, {name}!")

num1 = int(input("Enter first number: "))
num2 = int(input("Enter second number: "))
print(f"Sum: {num1 + num2}")`;

    const defaultNodeCode = `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Enter your name: ', (name) => {
  console.log(\`Hello, \${name}!\`);
  rl.question('Enter first number: ', (num1) => {
    rl.question('Enter second number: ', (num2) => {
      console.log(\`Sum: \${parseInt(num1) + parseInt(num2)}\`);
      rl.close();
    });
  });
});`;

    const defaultJavaCode = `import java.util.Scanner;
public class Main {
  public static void main(String[] args) {
    Scanner scanner = new Scanner(System.in);
    System.out.print("Enter your name: ");
    String name = scanner.nextLine();
    System.out.println("Hello, " + name + "!");
    System.out.print("Enter first number: ");
    int num1 = scanner.nextInt();
    System.out.print("Enter second number: ");
    int num2 = scanner.nextInt();
    System.out.println("Sum: " + (num1 + num2));
    scanner.close();
  }
}`;

    /* ── state ── */
    const [code, setCode] = useState(defaultHtmlCode);
    const [language, setLanguage] = useState("html");
    const [sandpackFiles, setSandpackFiles] = useState({});
    const [sandpackKey, setSandpackKey] = useState(0);
    const [selectedFile, setSelectedFile] = useState("/src/App.jsx");

    // terminal
    const [terminalLines, setTerminalLines] = useState([]);
    const [waitingForInput, setWaitingForInput] = useState(false);
    const [currentPrompt, setCurrentPrompt] = useState("");
    const resolveRef = useRef(null);
    const promptsRef = useRef([]);
    const answersRef = useRef([]);

    // iframe (HTML/CSS/JS)
    const [srcDoc, setSrcDoc] = useState("");
    const [runKey, setRunKey] = useState(0);

    // panels
    const [activeTab, setActiveTab] = useState("output");
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [panelHeight, setPanelHeight] = useState(280);
    const [isResizingPanel, setIsResizingPanel] = useState(false);
    const [rightPanelWidth, setRightPanelWidth] = useState(380);
    const [isResizingRight, setIsResizingRight] = useState(false);

    // run state
    const [isRunning, setIsRunning] = useState(false);

    const [aiMessages, setAiMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [speechSynth, setSpeechSynth] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);

    const messagesEndRef = useRef(null);
    const fullscreenRef = useRef(null);
    const leftPanelRef = useRef(null);
    const mainContainerRef = useRef(null);
    const sandpackExplorerRef = useRef(null);
    const fileInputRef = useRef(null);

    const isReactSandpack = language === "react";
    const isNextSandpack = language === "next";
    const isRemote = ["python", "node", "java"].includes(language);
    const isClientSide = ["html", "css", "javascript"].includes(language);

    // Debug effect to monitor message state
    useEffect(() => {
        console.log("📊 Current aiMessages state:", {
            count: aiMessages.length,
            messages: aiMessages.map(m => ({ id: m.id, type: m.type, messagePreview: m.message?.substring(0, 50) }))
        });
    }, [aiMessages]);

    /* ── Scroll Effect ── */
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            setScrolled(isScrolled);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Show welcome/login modal when user first enters the page (if not logged in)
    useEffect(() => {
        // Check if user is not logged in AND we haven't shown the modal yet this session
        if (!user && !hasShownWelcomeModal) {
            // Small delay to make sure everything is loaded
            const timer = setTimeout(() => {
                setShowLoginModal(true);
                setHasShownWelcomeModal(true);

                // Also add a welcome message to the chat
                setAiMessages(prev => [...prev, {
                    id: `welcome-login-${Date.now()}-${Math.random()}`,
                    type: "ai",
                    message: "👋 **Welcome to CodeMentor!**\n\nTo start using AI features like code fixing and explanations, please sign in. It's free and only takes a few seconds! 🚀",
                    timestamp: new Date().toLocaleTimeString()
                }]);
            }, 1500); // Show after 1.5 seconds

            return () => clearTimeout(timer);
        }
    }, [user, hasShownWelcomeModal]); // Run when user or hasShownWelcomeModal changes

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [aiMessages, isAiTyping]);

    // Sync messages from chat context
    useEffect(() => {
        console.log("🔄 Syncing messages from chat context:", chatMessages);

        if (chatMessages && Array.isArray(chatMessages) && chatMessages.length > 0) {
            // Filter out any invalid messages and ensure they have unique IDs
            const validMessages = chatMessages
                .filter(msg => msg && msg.message && typeof msg.message === 'string')
                .map((msg, index) => ({
                    ...msg,
                    // Ensure each message has a unique ID
                    id: msg.id || `msg-${Date.now()}-${index}-${Math.random()}`
                }));

            console.log("✅ Setting AI messages:", validMessages.length);
            setAiMessages(validMessages);
        } else {
            // Only show welcome message if there are no messages AND no chat history
            console.log("ℹ️ No messages found, showing welcome message");
            setAiMessages([{
                id: `welcome-${Date.now()}`,
                type: "ai",
                message: "👋 **Hi! I'm your AI coding mentor!**\n\nPaste your code in the chat or upload a file, and I'll help fix it! 🎉",
                timestamp: new Date().toLocaleTimeString()
            }]);
        }
    }, [chatMessages]); // Remove the empty dependency array


    /* ── speech ── */
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Initialize speech synthesis
            const synth = window.speechSynthesis;
            setSpeechSynth(synth);

            // Pre-load voices
            if (synth) {
                // Chrome needs this to load voices
                synth.getVoices();

                // For browsers that need time to load voices
                const loadVoices = () => {
                    synth.getVoices();
                };

                if (synth.onvoiceschanged !== undefined) {
                    synth.onvoiceschanged = loadVoices;
                }
            }

            console.log("🎤 Speech synthesis initialized");
        }
    }, []);

    // Clean up speech on unmount
    useEffect(() => {
        return () => {
            if (speechSynth) {
                speechSynth.cancel();
            }
        };
    }, [speechSynth]);

    /* ── speech recognition (STT) ── */
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognitionInstance = new SpeechRecognition();
                recognitionInstance.continuous = false;
                recognitionInstance.interimResults = false;
                recognitionInstance.lang = 'en-US';

                recognitionInstance.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    setUserInput(prev => prev + (prev ? ' ' : '') + transcript);
                };

                recognitionInstance.onerror = (event) => {
                    console.error('Speech recognition error:', event.error);
                    setIsListening(false);
                };

                recognitionInstance.onend = () => {
                    setIsListening(false);
                };

                setRecognition(recognitionInstance);
            }
        }
    }, []);


    const stopSpeaking = () => {
        if (speechSynth) {
            speechSynth.cancel();
            setIsAiSpeaking(false);
            setIsSpeaking(false);
            // Clear temporary highlights when stopped
            if (window.monacoEditor && window.monacoEditor.clearTemporaryHighlights) {
                window.monacoEditor.clearTemporaryHighlights();
            }
        }
    };

    // Load available voices when speech synthesis is ready
    useEffect(() => {
        if (speechSynth) {
            const loadVoices = () => {
                const voices = speechSynth.getVoices();

                // Filter and sort voices (prefer female voices but show all)
                const voiceList = voices.map(voice => ({
                    name: voice.name,
                    lang: voice.lang,
                    voiceURI: voice.voiceURI,
                    default: voice.default,
                    voice: voice // store the actual voice object
                }));

                // Sort: female voices first, then by name
                voiceList.sort((a, b) => {
                    const aIsFemale = a.name.toLowerCase().includes('female') ||
                        a.name.includes('Samantha') ||
                        a.name.includes('Google UK') ||
                        a.name.includes('Zira') ||
                        a.name.includes('Hazel');
                    const bIsFemale = b.name.toLowerCase().includes('female') ||
                        b.name.includes('Samantha') ||
                        b.name.includes('Google UK') ||
                        b.name.includes('Zira') ||
                        b.name.includes('Hazel');

                    if (aIsFemale && !bIsFemale) return -1;
                    if (!aIsFemale && bIsFemale) return 1;
                    return a.name.localeCompare(b.name);
                });

                setAvailableVoices(voiceList);

                // Set default voice (try to find a female voice first)
                const defaultVoice = voiceList.find(v =>
                    v.name.includes('Google UK') ||
                    v.name.includes('Samantha') ||
                    v.name.includes('Female') ||
                    v.name.includes('Zira') ||
                    v.name.includes('Hazel')
                ) || voiceList[0] || null;

                setSelectedVoice(defaultVoice);

                console.log("🎤 Available voices loaded:", voiceList.length);
            };

            // Chrome loads voices asynchronously
            if (speechSynth.onvoiceschanged !== undefined) {
                speechSynth.onvoiceschanged = loadVoices;
            }

            // Load immediately in case voices are already loaded
            loadVoices();
        }
    }, [speechSynth]);


    const toggleListening = () => {
        if (!recognition) {
            setAiMessages(prev => [...prev, {
                id: Date.now(),
                type: "ai",
                message: "😔 **Sorry!** Voice input is not supported in your browser. Try Chrome or Edge.",
                timestamp: new Date().toLocaleTimeString()
            }]);
            return;
        }

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.start();
            setIsListening(true);
        }
    };

    /* ── User Functions ── */
    const getUserInitials = () => {
        if (!user) return "";

        if (user.displayName) {
            const names = user.displayName.split(' ');
            if (names.length >= 2) {
                return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
            } else if (names.length === 1) {
                return names[0][0].toUpperCase();
            }
        }

        if (user.email) {
            return user.email[0].toUpperCase();
        }

        return "U";
    };

    const handleSignInClick = () => {
        router.push("/login");
    };

    const handleLogout = async () => {
        const result = await logout();
        if (!result?.success) return;

        setShowDropdown(false);
        router.replace("/");
    };

    /* ── language change ── */
    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        setTerminalLines([]);
        setWaitingForInput(false);
        setSrcDoc("");
        resolveRef.current = null;
        promptsRef.current = [];
        answersRef.current = [];

        const map = {
            react: defaultReactCode, next: defaultNextCode,
            html: defaultHtmlCode, css: defaultCssCode,
            javascript: defaultJsCode, python: defaultPythonCode,
            node: defaultNodeCode, java: defaultJavaCode,
        };
        const c = map[lang] ?? "";
        setCode(c);

        if (lang === "react" || lang === "next") {
            const files = buildSandpackFiles(c, lang);
            setSandpackFiles(files);
            setSandpackKey((p) => p + 1);
            setSelectedFile(lang === "react" ? "/src/App.jsx" : "/app/page.jsx");
        }
    };

    // Clean text for speech - Make it sound natural and remove code syntax
    const cleanTextForSpeech = (text) => {
        if (!text) return '';

        let cleaned = text
            // Remove code blocks entirely (they sound terrible when spoken)
            .replace(/```[\s\S]*?```/g, '')

            // Remove inline code backticks but keep the content
            .replace(/`([^`]+)`/g, '$1')

            // Remove markdown links but keep the text [text](url) -> text
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

            // Remove markdown bold and italic (keep the text)
            .replace(/(\*\*|__)(.*?)\1/g, '$2')
            .replace(/(\*|_)(.*?)\1/g, '$2')

            // Remove markdown headers but keep the text
            .replace(/#{1,6}\s+/g, '')

            // Remove ALL emojis (comprehensive)
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // emoticons
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // symbols & pictographs
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // transport & map symbols
            .replace(/[\u{2600}-\u{26FF}]/gu, '')   // misc symbols
            .replace(/[\u{2700}-\u{27BF}]/gu, '')   // dingbats
            .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // supplemental symbols
            .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // symbols and pictographs extended
            .replace(/[\u{2300}-\u{23FF}]/gu, '')   // misc technical
            .replace(/[\u{2B50}]/gu, '')            // star emoji specifically

            // Handle HTML tags - convert to spoken words
            .replace(/<([^>]+)>/g, (match, tag) => {
                const tagName = tag.split(' ')[0].toLowerCase();
                const tagMap = {
                    'h1': 'heading 1',
                    'h2': 'heading 2',
                    'h3': 'heading 3',
                    'p': 'paragraph',
                    'div': 'division',
                    'span': 'span',
                    'a': 'link',
                    'img': 'image',
                    'br': 'line break',
                    'hr': 'horizontal rule',
                    'ul': 'unordered list',
                    'ol': 'ordered list',
                    'li': 'list item',
                    'table': 'table',
                    'tr': 'table row',
                    'td': 'table data',
                    'th': 'table header',
                    'form': 'form',
                    'input': 'input',
                    'button': 'button',
                    'script': 'script',
                    'style': 'style',
                    'meta': 'meta',
                    'link': 'link',
                    'head': 'head',
                    'body': 'body',
                    'html': 'html'
                };
                return tagMap[tagName] ? ` ${tagMap[tagName]} ` : ' ';
            })

            // Replace common code symbols with words
            .replace(/===/g, ' is equal to ')
            .replace(/!==/g, ' is not equal to ')
            .replace(/==/g, ' equals ')
            .replace(/!=/g, ' not equals ')
            .replace(/<=/g, ' less than or equal to ')
            .replace(/>=/g, ' greater than or equal to ')
            .replace(/</g, ' less than ')
            .replace(/>/g, ' greater than ')
            .replace(/&&/g, ' and ')
            .replace(/\|\|/g, ' or ')
            .replace(/!/g, ' ') // Just remove exclamation marks
            .replace(/\+/g, ' plus ')
            .replace(/-/g, ' minus ')
            .replace(/\*/g, ' times ')
            .replace(/\//g, ' divided by ')
            .replace(/%/g, ' percent ')
            .replace(/=/g, ' equals ')
            .replace(/\(/g, ' ') // Remove parentheses
            .replace(/\)/g, ' ')
            .replace(/\[/g, ' ')
            .replace(/\]/g, ' ')
            .replace(/\{/g, ' ')
            .replace(/\}/g, ' ')
            .replace(/;/g, ' ') // Replace semicolons with space
            .replace(/:/g, ' ') // Replace colons with space
            .replace(/,/g, ', ') // Keep commas with space
            .replace(/\./g, '. ') // Keep periods with space

            // Remove backslashes
            .replace(/\\/g, '')

            // Remove multiple spaces
            .replace(/\s+/g, ' ')

            .trim();

        return cleaned;
    };

    // Speak text with line highlighting support - USES SELECTED VOICE
    const speakText = (text, highlightedLines = []) => {
        if (!text) {
            console.log("No text to speak");
            return;
        }

        if (!speechSynth) {
            console.log("Speech synthesis not initialized");
            return;
        }

        // IMPORTANT: Completely stop any current speech
        try {
            speechSynth.cancel();
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        } catch (e) {
            console.error("Error canceling speech:", e);
        }

        setIsSpeaking(false);
        setIsAiSpeaking(false);

        // Small delay to ensure speech is fully canceled
        setTimeout(() => {
            // Highlight lines if provided
            if (highlightedLines && highlightedLines.length > 0 && window.monacoEditor) {
                try {
                    if (window.monacoEditor.highlightLines) {
                        window.monacoEditor.highlightLines(highlightedLines);
                    }
                } catch (e) {
                    console.error("Error highlighting lines:", e);
                }
            }

            // Clean the text for natural speech
            const cleanText = cleanTextForSpeech(text);

            if (!cleanText) {
                console.log("Text became empty after cleaning");
                return;
            }

            console.log("🔊 Speaking with voice:", selectedVoice?.name || "default");

            // Split into sentences for more natural pacing
            const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];

            let currentSentenceIndex = 0;
            let isActive = true;

            const speakNextSentence = () => {
                if (!isActive) {
                    console.log("⏹️ Speech stopped mid-sentence");
                    setIsSpeaking(false);
                    setIsAiSpeaking(false);
                    if (window.monacoEditor && window.monacoEditor.clearTemporaryHighlights) {
                        window.monacoEditor.clearTemporaryHighlights();
                    }
                    return;
                }

                if (currentSentenceIndex >= sentences.length) {
                    console.log("✅ Speech completed");
                    setIsSpeaking(false);
                    setIsAiSpeaking(false);
                    if (window.monacoEditor && window.monacoEditor.clearTemporaryHighlights) {
                        window.monacoEditor.clearTemporaryHighlights();
                    }
                    return;
                }

                const sentence = sentences[currentSentenceIndex].trim();
                if (!sentence) {
                    currentSentenceIndex++;
                    speakNextSentence();
                    return;
                }

                try {
                    const utterance = new SpeechSynthesisUtterance(sentence);

                    // Use selected voice or default
                    if (selectedVoice && selectedVoice.voice) {
                        utterance.voice = selectedVoice.voice;
                    }

                    // Natural speaking settings
                    utterance.rate = 0.85;
                    utterance.pitch = 1.0; // Let the voice maintain its natural pitch
                    utterance.volume = 1;

                    utterance.onstart = () => {
                        console.log(`▶️ Speaking sentence ${currentSentenceIndex + 1}/${sentences.length}`);
                        setIsSpeaking(true);
                        setIsAiSpeaking(true);
                    };

                    utterance.onend = () => {
                        console.log(`✅ Finished sentence ${currentSentenceIndex + 1}`);
                        currentSentenceIndex++;
                        setTimeout(speakNextSentence, 100);
                    };

                    utterance.onerror = (event) => {
                        console.error('Speech error:', event);
                        currentSentenceIndex++;
                        setTimeout(speakNextSentence, 100);
                    };

                    setSpeechUtterance(utterance);
                    speechSynth.speak(utterance);

                } catch (e) {
                    console.error("Error creating utterance:", e);
                    currentSentenceIndex++;
                    setTimeout(speakNextSentence, 100);
                }
            };

            speakNextSentence();

            window.stopCurrentSpeech = () => {
                isActive = false;
            };

        }, 100);
    };

    // Stop speaking function - COMPLETELY stops all speech
    const handleStopSpeaking = () => {
        console.log("⏹️ Stopping all speech");

        if (speechSynth) {
            try {
                // Cancel ALL speech
                speechSynth.cancel();

                // Also cancel any queued speech
                if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                }

                // Clear any pending utterances
                if (speechUtterance) {
                    speechUtterance.onend = null;
                    speechUtterance.onerror = null;
                }

            } catch (e) {
                console.error("Error canceling speech:", e);
            }
        }

        // Update states
        setIsSpeaking(false);
        setIsAiSpeaking(false);
        setSpeechUtterance(null);

        // Clear temporary highlights
        if (window.monacoEditor && window.monacoEditor.clearTemporaryHighlights) {
            window.monacoEditor.clearTemporaryHighlights();
        }

        // Signal any active speech to stop
        if (window.stopCurrentSpeech) {
            window.stopCurrentSpeech();
        }
    };

    // Keep the old function for backward compatibility
    const speakTextInChunks = (text) => {
        speakText(text);
    };


    /* ── HANDLE CHAT MESSAGES (Generates code + explanation) ── */
    const handleSendMessage = async () => {
        // Check if user is logged in
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        if (!userInput.trim()) return;

        const message = userInput.trim();
        const timestamp = new Date().toLocaleTimeString();

        // Create user message with unique ID
        const userMsg = {
            id: `user-${Date.now()}-${Math.random()}`,
            type: "user",
            message: message,
            timestamp: timestamp
        };

        console.log("📝 Adding user message:", userMsg);

        // Add user message to UI immediately
        setAiMessages(prev => {
            const newMessages = [...prev, userMsg];
            console.log("📊 Messages after user message:", newMessages.length);
            return newMessages;
        });

        setUserInput("");

        try {
            // Send to AI through chat context (uses generate-code API)
            const result = await sendToAI(message, code, language);

            if (result.success && result.data) {
                console.log("🤖 AI response received:", result.data);

                // Update editor with generated code if present
                if (result.data.code) {
                    setCode(result.data.code);
                }

                // Update language if detected
                if (result.data.language && result.data.language !== language) {
                    setLanguage(result.data.language);
                }

                // The AI message will be added by sendToAI through the context
                // No need to add it manually here

                // Speak the explanation with line highlighting
                if (result.data.explanation) {
                    speakText(result.data.explanation, result.data.highlightedLines);
                }
            }
        } catch (error) {
            console.error("Error in handleSendMessage:", error);
        }
    };

    /* ── HANDLE AI FIX BUTTON (Fixes existing code) ── */
    const handleFixWithOpenRouter = async () => {
        // Check if user is logged in
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        if (!code.trim()) {
            setAiMessages(prev => [...prev, {
                id: `error-${Date.now()}-${Math.random()}`,
                type: "ai",
                message: "I don't see any code to fix. Please write some code in the editor first! 🤔",
                timestamp: new Date().toLocaleTimeString()
            }]);
            return;
        }

        setIsAIFixing(true);

        try {
            console.log("🔧 Calling fixCodeWithAI with code length:", code.length);

            // Use fixCodeWithAI which uses fix-code API (OpenRouter + Gemini)
            const result = await fixCodeWithAI(code, "");

            console.log("📥 fixCodeWithAI result:", {
                success: result.success,
                wasFixed: result.wasFixed,
                hasFixedCode: !!result.fixedCode,
                messageLength: result.message?.length
            });

            if (result.success) {
                // Update editor with fixed code if changes were made
                if (result.wasFixed && result.fixedCode) {
                    console.log("✅ Updating editor with fixed code");
                    setCode(result.fixedCode);
                } else {
                    console.log("ℹ️ No code changes were made");
                }

                // The message with buttons is already added by fixCodeWithAI through the context
                // No need to add it manually here

                // Speak the explanation with line highlighting
                if (result.explanation) {
                    speakText(result.explanation, result.highlightedLines);
                }
            }
        } catch (error) {
            console.error("Error in handleFixWithOpenRouter:", error);
        } finally {
            setIsAIFixing(false);
        }
    };

    /* ── Login Modal Component ── */
    const LoginModal = () => {
        if (!showLoginModal) return null;

        return (
            <>
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
                    onClick={() => setShowLoginModal(false)}
                >
                    {/* Modal */}
                    <div
                        className="bg-[#1a1c22] rounded-2xl max-w-md w-full border border-[#2a2e3a] shadow-2xl overflow-hidden animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with gradient */}
                        <div className="relative h-24 bg-gradient-to-r from-indigo-600/20 to-indigo-900/20 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 opacity-30">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500 rounded-full filter blur-3xl"></div>
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-700 rounded-full filter blur-3xl"></div>
                            </div>
                            <div className="relative flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-800 flex items-center justify-center animate-pulse">
                                    <Image src="/logo.png" alt="" width={100} height={100} />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Welcome to CodeMentor! </h2>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            <div className="text-center space-y-2">
                                <p className="text-gray-300 text-sm">
                                    You're just one step away from unlocking the full power of AI-assisted coding!
                                </p>
                            </div>

                            {/* Features list */}
                            <div className="space-y-3 bg-[#0f1117] p-4 rounded-xl border border-[#2a2e3a]">
                                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                                    <FaMagic className="text-indigo-500" />
                                    Sign in to get:
                                </h3>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li className="flex items-center gap-2">
                                        <FaCheck className="text-indigo-500 text-xs" />
                                        <span> <span className="text-white">AI-powered code fixes</span> - Fix errors instantly</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <FaCheck className="text-indigo-500 text-xs" />
                                        <span> <span className="text-white">Step-by-step explanations</span> - Learn as you code</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <FaCheck className="text-indigo-500 text-xs" />
                                        <span> <span className="text-white">Save chat history</span> - Never lose your progress</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <FaCheck className="text-indigo-500 text-xs" />
                                        <span> <span className="text-white">Voice explanations</span> - Listen and learn</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <FaCheck className="text-indigo-500 text-xs" />
                                        <span> <span className="text-white">Personalized roadmap</span> - Track your journey</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Quick stats */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-[#0f1117] p-2 rounded-lg border border-[#2a2e3a]">
                                    <div className="text-indigo-500 font-bold text-lg">1000+</div>
                                    <div className="text-[10px] text-gray-500">Happy Developers</div>
                                </div>
                                <div className="bg-[#0f1117] p-2 rounded-lg border border-[#2a2e3a]">
                                    <div className="text-indigo-500 font-bold text-lg">24/7</div>
                                    <div className="text-[10px] text-gray-500">AI Assistance</div>
                                </div>
                                <div className="bg-[#0f1117] p-2 rounded-lg border border-[#2a2e3a]">
                                    <div className="text-indigo-500 font-bold text-lg">Free</div>
                                    <div className="text-[10px] text-gray-500">No credit card</div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLoginModal(false)}
                                    className="flex-1 px-4 py-3 rounded-lg border border-[#2a2e3a] text-gray-300 hover:bg-[#2a2e3a] transition-all font-medium text-sm hover:scale-105"
                                >
                                    Browse as Guest
                                </button>
                                <button
                                    onClick={() => {
                                        setShowLoginModal(false);
                                        router.push("/login");
                                    }}
                                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-semibold hover:scale-110 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group"
                                >
                                    <FaSignInAlt className="group-hover:rotate-12 transition-transform" />
                                    Sign In Free
                                </button>
                            </div>

                            {/* Guest note */}
                            <p className="text-xs text-center text-gray-600">
                                Sign in with Google - takes 5 seconds, completely free!
                            </p>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => setShowLoginModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors hover:rotate-90 transform duration-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </>
        );
    };

    /* ── Handle Apply & Explain ── */
    const handleApplyAndExplain = async (originalCode, fixedCode) => {
        if (!originalCode || !fixedCode) {
            console.error("Missing codes");
            return;
        }

        setIsExplaining(true);
        setIsAiTyping(true);

        try {
            // Detect language from fixed code
            const detectedLang = detectLanguageFromCode(fixedCode);
            if (detectedLang && detectedLang !== language) {
                setLanguage(detectedLang);
            }

            // Apply the fixed code to editor
            setCode(fixedCode);

            // Clear any existing highlights
            if (window.monacoEditor && window.monacoEditor.clearHighlights) {
                window.monacoEditor.clearHighlights();
            }

            // Get the explanation from Gemini API
            console.log("📝 Getting explanation from Gemini for fixed code");
            const response = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    originalCode,
                    fixedCode,
                    language: detectedLang || language,
                    isFixExplanation: true
                })
            });

            const data = await response.json();
            const displayMessage = data.displayMessage || "I've updated your code!";
            const speechMessage = data.explanation || "";
            const errors = data.errors || [];
            const highlightedLines = data.highlightedLines || [];

            // Highlight errors in editor
            if (errors.length > 0) {
                if (window.monacoEditor && window.monacoEditor.highlightErrors) {
                    const errorsWithFixes = errors.map(err => ({
                        ...err,
                        fix: err.fix || "Check syntax and correct accordingly"
                    }));
                    window.monacoEditor.highlightErrors(errorsWithFixes);
                }
            }

            // Highlight the fixed lines during explanation
            if (highlightedLines && highlightedLines.length > 0 && window.monacoEditor) {
                window.monacoEditor.highlightLines(highlightedLines);
            }

            // Add explanation message to chat
            setAiMessages(prev => [...prev, {
                id: Date.now(),
                type: "ai",
                message: displayMessage,
                timestamp: new Date().toLocaleTimeString()
            }]);

            // Speak the explanation with line highlighting
            if (speechMessage) {
                speakText(speechMessage, highlightedLines);
            }

        } catch (error) {
            console.error("Apply & Explain error:", error);

            // Simple success message even if explanation fails
            setAiMessages(prev => [...prev, {
                id: Date.now(),
                type: "ai",
                message: "✅ **Code applied!** Check the editor to see the changes.",
                timestamp: new Date().toLocaleTimeString()
            }]);
            speakText("I applied the fixes to your code.");
        } finally {
            setIsExplaining(false);
            setIsAiTyping(false);
        }
    };

    /* ── Apply Fixed Code to Editor (without explanation) ── */
    const applyFixedCode = (fixedCode) => {
        const detectedLang = detectLanguageFromCode(fixedCode);
        if (detectedLang && detectedLang !== language) {
            setLanguage(detectedLang);
        }

        setCode(fixedCode);
        setAiMessages(prev => [...prev, {
            id: Date.now(),
            type: "ai",
            message: "✨ **Applied!** The fixed code is now in your editor.",
            timestamp: new Date().toLocaleTimeString()
        }]);
        speakText("I applied the fixes to your editor!");

        if (window.monaco && window.monaco.editor) {
            const editor = window.monaco.editor.getEditors()[0];
            if (editor && editor.clearHighlights) {
                editor.clearHighlights();
            }
        }
    };

    /* ── Handle File Upload ── */
    const handleFileUpload = (event) => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;

            const extension = file.name.split('.').pop().toLowerCase();
            const langMap = {
                'js': 'javascript',
                'jsx': 'react',
                'ts': 'javascript',
                'tsx': 'react',
                'py': 'python',
                'java': 'java',
                'html': 'html',
                'css': 'css',
                'json': 'javascript'
            };

            const detectedLang = langMap[extension] || detectLanguageFromCode(content) || language;
            if (detectedLang !== language) {
                setLanguage(detectedLang);
            }

            setCode(content);

            setAiMessages(prev => [...prev, {
                id: Date.now(),
                type: "user",
                message: `📁 I uploaded a file: **${file.name}** (${detectedLang})`,
                timestamp: new Date().toLocaleTimeString()
            }]);
        };
        reader.readAsText(file);
    };

    /* ── sandpack helpers ── */
    const buildSandpackFiles = (overrideCode, overrideLang) => {
        const c = overrideCode ?? code;
        const l = overrideLang ?? language;
        if (l === "react") {
            return {
                "/public/index.html": "<div id='root'></div>",
                "/src/App.jsx": c || defaultReactCode,
                "/src/index.js": "import React from 'react';\nimport{createRoot}from 'react-dom/client';\nimport App from './App.jsx';\ncreateRoot(document.getElementById('root')).render(<App/>);",
                "/package.json": '{"name":"react-app","main":"src/index.js","dependencies":{"react":"latest","react-dom":"latest"}}',
                "/styles.css": "body{font-family:Arial;}",
            };
        }
        if (l === "next") return { "/app/page.jsx": c || defaultNextCode };
        return {};
    };

    useEffect(() => {
        if (isReactSandpack) {
            setCode(defaultReactCode);
            setSandpackFiles(buildSandpackFiles(defaultReactCode, "react"));
            setSandpackKey((p) => p + 1);
            setSelectedFile("/src/App.jsx");
        } else if (isNextSandpack) {
            setCode(defaultNextCode);
            setSandpackFiles(buildSandpackFiles(defaultNextCode, "next"));
            setSandpackKey((p) => p + 1);
            setSelectedFile("/app/page.jsx");
        }
    }, [language]);

    useEffect(() => {
        if (!(isReactSandpack || isNextSandpack)) return;
        setSandpackFiles((p) => ({ ...p, [selectedFile]: code }));
    }, [code, selectedFile]);

    /* ── iframe console interception ── */
    useEffect(() => {
        const handler = (e) => {
            if (!e.data?.type) return;
            if (e.data.type === "log" || e.data.type === "warn")
                setTerminalLines((p) => [...p, { type: "output", text: e.data.message }]);
            if (e.data.type === "error")
                setTerminalLines((p) => [...p, { type: "error", text: e.data.message }]);
        };
        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, []);

    /* ── build srcDoc for HTML / CSS / JS ── */
    const buildSrcDoc = (c, lang) => {
        const intercept = `<script>(function(){
function _s(t,a){var x=Array.from(a).map(function(v){return typeof v==='object'?JSON.stringify(v,null,2):String(v);}).join(' ');window.parent.postMessage({type:t,message:x},'*');}
var _l=console.log.bind(console),_e=console.error.bind(console),_w=console.warn.bind(console);
console.log=function(){_s('log',arguments);_l.apply(console,arguments);};
console.error=function(){_s('error',arguments);_e.apply(console,arguments);};
console.warn=function(){_s('warn',arguments);_w.apply(console,arguments);};
window.onerror=function(m,_,ln,_c,err){window.parent.postMessage({type:'error',message:(err?err.message:m)+' (line '+ln+')'},'*');return false;};
window.addEventListener('unhandledrejection',function(ev){window.parent.postMessage({type:'error',message:'Promise: '+ev.reason},'*');});
})()<\/script>`;

        if (lang === "html") {
            let html = c;
            if (html.includes("</body>")) return html.replace("</body>", intercept + "</body>");
            if (html.includes("<body>")) return html.replace("<body>", "<body>" + intercept);
            return intercept + html;
        }
        if (lang === "css") {
            return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>*{box-sizing:border-box}body{margin:0;padding:20px;font-family:Arial}</style>
<style>${c}</style></head><body>${intercept}
<h1>Heading 1</h1><h2>Heading 2</h2><p>Paragraph to preview your styles.</p>
<button>Button</button><a href="#">Link</a>
<div class="box">Box 1</div><div class="box">Box 2</div>
<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul></body></html>`;
        }
        if (lang === "javascript") {
            return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{margin:0;padding:12px;background:#1e1e1e;color:#cccccc;font-family:'Consolas',monospace;font-size:13px}</style>
</head><body>${intercept}
<script>try{${c}}catch(err){window.parent.postMessage({type:'error',message:err.message},'*');}<\/script>
</body></html>`;
        }
        return "";
    };

    /* ── terminal submit callback ── */
    const handleTerminalInput = useCallback((value) => {
        if (resolveRef.current) {
            resolveRef.current(value);
            resolveRef.current = null;
        }
    }, []);

    /* ── interactive execution ── */
    const runInteractive = useCallback(async () => {
        const prompts = extractPrompts(code, language);
        promptsRef.current = prompts;
        answersRef.current = [];

        addLine({ type: "divider", text: `\u2500\u2500\u2500 ${language.toUpperCase()} \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500` });

        for (let i = 0; i < prompts.length; i++) {
            const prompt = prompts[i];
            setCurrentPrompt(prompt);
            setWaitingForInput(true);

            const answer = await new Promise((resolve) => {
                resolveRef.current = resolve;
            });

            setWaitingForInput(false);
            setCurrentPrompt("");
            addLine({ type: "input-echo", prompt, answer });
            answersRef.current.push(answer);
        }

        addLine({ type: "divider", text: "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" });
        setIsRunning(true);

        try {
            const fileName =
                language === "python" ? "Main.py" :
                    language === "java" ? "Main.java" :
                        "Main.js";

            const stdin = answersRef.current.join("\n");

            const res = await fetch("/api/sandbox", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language,
                    files: [{ name: fileName, content: code }],
                    stdin,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                addLine({ type: "error", text: data.error || data.message || `HTTP ${res.status}` });
                return;
            }

            const raw = [data.stdout, data.output].filter(Boolean).join("").trimEnd();
            if (raw) {
                const linesToSuppress = new Set();
                answersRef.current.forEach((ans, idx) => {
                    const p = prompts[idx] ?? "";
                    linesToSuppress.add((p + ans).trim());
                    linesToSuppress.add(ans.trim());
                    linesToSuppress.add(p.trim());
                });

                raw.split("\n").forEach((l) => {
                    const stripped = l.trimEnd();
                    if (linesToSuppress.has(stripped)) return;
                    addLine({ type: "output", text: stripped });
                });
            } else if (!data.stderr) {
                addLine({ type: "divider", text: "(no output)" });
            }

            if (data.stderr?.trim()) {
                data.stderr.trim().split("\n").forEach((l) => {
                    addLine({ type: "error", text: l });
                });
            }
        } catch (err) {
            addLine({ type: "error", text: err.message });
        } finally {
            setIsRunning(false);
            resolveRef.current = null;
            promptsRef.current = [];
            answersRef.current = [];
        }
    }, [code, language]);

    const addLine = (line) => setTerminalLines((p) => [...p, line]);

    /* ── main Run button handler ── */
    const handleRun = async () => {
        setActiveTab("output");
        setIsPanelOpen(true);
        setTerminalLines([]);
        setWaitingForInput(false);
        resolveRef.current = null;

        if (isReactSandpack || isNextSandpack) {
            setIsRunning(true);
            setSandpackFiles(buildSandpackFiles());
            setSandpackKey((p) => p + 1);
            setTimeout(() => setIsRunning(false), 1000);
            return;
        }

        if (isClientSide) {
            setIsRunning(true);
            setSrcDoc(buildSrcDoc(code, language));
            setRunKey((p) => p + 1);
            setTerminalLines([{ type: "divider", text: `─── ${language.toUpperCase()} rendered ───────────────────────────────────────` }]);
            setTimeout(() => setIsRunning(false), 500);
            return;
        }

        if (isRemote) {
            await runInteractive();
        }
    };

    /* ── fullscreen ── */
    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            fullscreenRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    /* ── panel resize ── */
    useEffect(() => {
        if (!isResizingPanel) return;
        const onMove = (e) => {
            if (!leftPanelRef.current) return;
            const r = leftPanelRef.current.getBoundingClientRect();
            setPanelHeight(Math.max(140, Math.min(r.height - 140, r.bottom - e.clientY)));
        };
        const onUp = () => setIsResizingPanel(false);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    }, [isResizingPanel]);

    useEffect(() => {
        if (!isResizingRight) return;
        const onMove = (e) => {
            if (!mainContainerRef.current) return;
            const r = mainContainerRef.current.getBoundingClientRect();
            setRightPanelWidth(Math.max(320, Math.min(600, r.right - e.clientX)));
        };
        const onUp = () => setIsResizingRight(false);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    }, [isResizingRight]);

    /* ═══════════════════════════════════════════════════════════════
       RENDER
    ═══════════════════════════════════════════════════════════════ */
    return (
        <div
            ref={fullscreenRef}
            className="problem-solver-workbench flex flex-col h-dvh min-h-0 overflow-hidden"
            data-theme={theme}
            style={{
                ...workbenchTheme,
                backgroundColor: "var(--workbench-bg)",
                color: "var(--workbench-text)",
            }}
        >
            <ChatSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <LoginModal />

            {/* ── HEADER ── */}
            <div
                className="workbench-toolbar h-14 min-h-14 flex items-center px-3 sm:px-4 gap-3"
                style={{ backgroundColor: "var(--workbench-surface)", borderBottom: "1px solid var(--workbench-border)" }}
            >
                <div className="workbench-primary-tools flex items-center gap-2">
                    <button
                        className={`h-9 px-5 rounded-lg font-medium text-sm border border-gray-400/20 hover:bg-gradient-to-b from-gray-400/30 via-transparent to-transparent text-[var(--workbench-text)] flex items-center gap-2 transition-all cursor-pointer duration-200 ${isRunning || waitingForInput
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:scale-105 hover:shadow-lg"
                            }`}
                        onClick={() => router.push("/")}
                    >
                        Home</button>
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="h-9 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-[var(--workbench-text)] border-[var(--workbench-border)]"
                    >
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="javascript">JavaScript</option>
                        <option value="react">React.js</option>
                        <option value="python">Python</option>
                        <option value="node">Node.js</option>
                        <option value="java">Java</option>
                    </select>

                    <button
                        onClick={handleRun}
                        disabled={isRunning || waitingForInput}
                        className={`h-9 px-5 rounded-lg font-medium text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center gap-2 transition-all duration-200 ${isRunning || waitingForInput
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:scale-105 hover:shadow-lg"
                            }`}
                    >
                        {isRunning ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Running…</span>
                            </>
                        ) : waitingForInput ? (
                            <>
                                <span className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
                                <span>Waiting…</span>
                            </>
                        ) : (
                            <>
                                <span>▶</span>
                                <span>Run</span>
                            </>
                        )}
                    </button>

                    {/* AI Fix Button - Uses fix-code API (OpenRouter + Gemini) */}
                    <button
                        onClick={handleFixWithOpenRouter}
                        disabled={isAIFixing}
                        className={`h-9 px-4 rounded-lg font-medium text-sm bg-gradient-to-br from-indigo-600 to-indigo-800 hover:bg-gradient-to-bl cursor-pointer text-white flex items-center gap-2 transition-all ${isAIFixing ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                            }`}
                        title="Fix code with AI"
                    >
                        {isAIFixing ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                <span>Fixing…</span>
                            </>
                        ) : (
                            <>
                                <FaMagic />
                                <span>AI Fix</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="workbench-toolbar-spacer flex-1" />

                <div className="workbench-secondary-tools flex items-center gap-1">
                    {/* Chat History Toggle Button */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#FF5A1F]/10 text-gray-400 hover:text-[#FF5A1F] transition-all"
                        style={{ backgroundColor: "var(--workbench-editor)" }}
                        title="Toggle chat history"
                    >
                        <FaHistory />
                    </button>

                    {[
                        { icon: isDark ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />, action: () => setTheme(isDark ? "light" : "dark"), title: "Toggle theme" },
                        { icon: <FaComments className="text-lg" />, action: () => setIsRightPanelOpen((p) => !p), title: "Toggle AI panel" },
                        { icon: <FaTerminal className="text-lg" />, action: () => setIsPanelOpen((p) => !p), title: "Toggle terminal" },
                        { icon: isFullscreen ? <FaCompress className="text-lg" /> : <FaExpand className="text-lg" />, action: handleFullscreen, title: "Fullscreen" },
                    ].map((btn, i) => (
                        <button
                            key={i}
                            onClick={btn.action}
                            title={btn.title}
                            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#FF5A1F]/10 text-gray-400 hover:text-[#FF5A1F] transition-all"
                            style={{ backgroundColor: "var(--workbench-editor)" }}
                        >
                            {btn.icon}
                        </button>
                    ))}

                    {/* User Menu / Sign In Button */}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#FF5A1F]/10 transition-all duration-300 cursor-pointer border border-[#2a2e3a]"
                            >
                                {user.photoURL ? (
                                    <NextImage
                                        src={user.photoURL}
                                        alt={user.displayName || "User"}
                                        width={32}
                                        height={32}
                                        className="rounded-full border-2 border-[#FF5A1F]/30"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] flex items-center justify-center text-white text-sm font-semibold">
                                        {getUserInitials()}
                                    </div>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {showDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowDropdown(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1c22] border border-[#2a2e3a] rounded-xl shadow-2xl z-50 overflow-hidden">
                                        <div className="p-3 border-b border-[#2a2e3a]">
                                            <p className="text-xs text-gray-400">Signed in as</p>
                                            <p className="text-sm text-white truncate">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:text-[#FF5A1F] hover:bg-[#FF5A1F]/10 transition-colors flex items-center gap-2 cursor-pointer"
                                        >
                                            <FaSignInAlt className="text-[#FF5A1F]" />
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={handleSignInClick}
                            className={`
                bg-gradient-to-r from-[#FF5A1F] via-[#f47b4e] to-[#d93d0b] 
                text-white font-semibold px-5 py-2 rounded-lg text-sm 
                transition-all duration-300 ease-out cursor-pointer
                hover:shadow-[0_12px_25px_-8px_#FF5A1F] hover:scale-110 
                active:scale-95 whitespace-nowrap
                ${scrolled
                                    ? 'shadow-[0_8px_20px_-6px_#FF5A1F] scale-95'
                                    : 'shadow-[0_12px_25px_-8px_#FF5A1F]'
                                }
              `}>
                            Sign In
                        </button>
                    )}
                </div>
            </div>

            {/* ── MAIN ── */}
            <div ref={mainContainerRef} className="workbench-main flex flex-1 min-h-0 overflow-hidden">
                {/* ── LEFT: editor + bottom panel ── */}
                <div ref={leftPanelRef} className="flex min-w-0 min-h-0 flex-col flex-1 overflow-hidden">
                    {/* editor */}
                    <div className="min-h-0 flex-1 overflow-hidden" style={{ backgroundColor: "var(--workbench-editor)" }}>
                        <MonacoEditor
                            language={(isReactSandpack || isNextSandpack) ? "javascript" : language}
                            code={code}
                            setCode={setCode}
                            theme={monacoTheme}
                            isRunning={isRunning}
                        />
                    </div>

                    {/* bottom panel */}
                    {isPanelOpen && (
                        <>
                            <div
                                className="h-[3px] cursor-row-resize hover:bg-[#FF5A1F]/60 transition-colors"
                                style={{ backgroundColor: "#2a2e3a" }}
                                onMouseDown={(e) => { e.preventDefault(); setIsResizingPanel(true); }}
                            />

                            <div
                                className="workbench-terminal-panel flex min-h-0 flex-col"
                                style={{ height: panelHeight, backgroundColor: "var(--workbench-panel)", borderTop: "1px solid var(--workbench-border)" }}
                            >
                                <div
                                    className="flex items-center px-2 py-1 gap-0"
                                    style={{ borderBottom: "1px solid var(--workbench-border)", backgroundColor: "var(--workbench-surface)" }}
                                >
                                    {["output", "console", "problems", "debug"].map((name) => (
                                        <Tab key={name} name={name} activeTab={activeTab} setActiveTab={setActiveTab} />
                                    ))}

                                    {waitingForInput && (
                                        <span
                                            className="ml-auto mr-2 flex items-center gap-1 text-xs"
                                            style={{ color: "#d7ba7d" }}
                                        >
                                            <span
                                                className="w-2 h-2 rounded-full animate-pulse"
                                                style={{ backgroundColor: "#d7ba7d" }}
                                            />
                                            stdin — type in terminal
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    {activeTab === "output" && (
                                        isReactSandpack && Object.keys(sandpackFiles).length > 0 ? (
                                            <SandpackProvider
                                                key={`${sandpackKey}-react`}
                                                template="react"
                                                files={sandpackFiles}
                                                theme={isDark ? "dark" : "light"}
                                            >
                                                <SandpackLayout style={{ height: "100%", display: "flex", flexDirection: "row" }}>
                                                    <div style={{ minWidth: 180, borderRight: "1px solid #2a2e3a", height: "100%" }}>
                                                        <div ref={sandpackExplorerRef} style={{ height: "100%" }}>
                                                            <SandpackFileExplorer style={{ height: "100%" }} />
                                                        </div>
                                                    </div>
                                                    <div style={{ flex: 1, height: "100%" }}>
                                                        <SandpackPreview style={{ height: "100%" }} />
                                                    </div>
                                                </SandpackLayout>
                                            </SandpackProvider>
                                        ) : isClientSide ? (
                                            <div className="flex flex-col h-full">
                                                {srcDoc ? (
                                                    <iframe
                                                        key={runKey}
                                                        srcDoc={srcDoc}
                                                        sandbox="allow-scripts allow-same-origin allow-modals allow-forms"
                                                        className="flex-1 border-0 w-full"
                                                        style={{ backgroundColor: "#fff" }}
                                                        title="output"
                                                    />
                                                ) : (
                                                    <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "var(--workbench-editor)" }}>
                                                        <span style={{ color: "#6a737d", fontStyle: "italic", fontSize: "13px", fontFamily: "monospace" }}>
                                                            Click ▶ Run to execute…
                                                        </span>
                                                    </div>
                                                )}
                                                {terminalLines.length > 0 && (
                                                    <div
                                                        className="overflow-auto p-2 space-y-[1px]"
                                                        style={{ maxHeight: "80px", borderTop: "1px solid var(--workbench-border)", backgroundColor: "var(--workbench-editor)", fontFamily: "monospace", fontSize: "12px" }}
                                                    >
                                                        {terminalLines.map((l, i) => (
                                                            <div key={i} style={{ color: l.type === "error" ? "#f14c4c" : "#9cdcfe", whiteSpace: "pre-wrap" }}>
                                                                {l.text}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <Terminal
                                                lines={terminalLines}
                                                onSubmitInput={handleTerminalInput}
                                                waitingForInput={waitingForInput}
                                                promptText={currentPrompt}
                                            />
                                        )
                                    )}

                                    {activeTab === "console" && (
                                        <div
                                            className="h-full overflow-auto p-3 space-y-[1px]"
                                            style={{ backgroundColor: "var(--workbench-editor)", fontFamily: "monospace", fontSize: "13px" }}
                                        >
                                            {terminalLines.length === 0 ? (
                                                <span style={{ color: "#6a737d", fontStyle: "italic" }}>No logs yet.</span>
                                            ) : terminalLines.map((l, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        color:
                                                            l.type === "error" ? "#f14c4c" :
                                                                l.type === "input-echo" ? "#4ec9b0" :
                                                                    l.type === "divider" ? "#3c3c3c" : "#cccccc",
                                                        whiteSpace: "pre-wrap",
                                                    }}
                                                >
                                                    {l.type === "input-echo" ? `${l.prompt}${l.answer}` : l.text}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeTab === "problems" && (
                                        <div className="h-full overflow-auto p-3 space-y-2" style={{ backgroundColor: "var(--workbench-editor)" }}>
                                            {terminalLines.filter((l) => l.type === "error").length === 0 ? (
                                                <span style={{ color: "#6a737d", fontStyle: "italic", fontSize: "13px", fontFamily: "monospace" }}>
                                                    No problems detected.
                                                </span>
                                            ) : (
                                                terminalLines.filter((l) => l.type === "error").map((l, i) => (
                                                    <div
                                                        key={i}
                                                        className="p-3 rounded"
                                                        style={{
                                                            color: "#f14c4c",
                                                            backgroundColor: "rgba(241,76,76,0.08)",
                                                            border: "1px solid rgba(241,76,76,0.25)",
                                                            fontFamily: "monospace",
                                                            fontSize: "12px",
                                                            whiteSpace: "pre-wrap",
                                                        }}
                                                    >
                                                        ⚠ {l.text}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    {activeTab === "debug" && (
                                        <div className="h-full overflow-auto p-4 space-y-2" style={{ backgroundColor: "var(--workbench-editor)", fontFamily: "monospace", fontSize: "12px" }}>
                                            {[
                                                ["Language", language.toUpperCase()],
                                                ["Lines", code.split("\n").length],
                                                ["Characters", code.length],
                                                ["Output lines", terminalLines.filter((l) => l.type === "output").length],
                                                ["Errors", terminalLines.filter((l) => l.type === "error").length],
                                                ["Waiting for stdin", waitingForInput ? "Yes ⏳" : "No"],
                                                ["Prompts detected", extractPrompts(code, language).length],
                                            ].map(([k, v]) => (
                                                <div key={k} style={{ color: "#9cdcfe" }}>
                                                    {k}: <span style={{ color: "#ce9178" }}>{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ── RIGHT: AI panel ── */}
                {isRightPanelOpen && (
                    <>
                        <div
                            className="workbench-ai-resize w-[3px] cursor-col-resize hover:bg-indigo-500/60 transition-colors"
                            style={{ backgroundColor: "var(--workbench-border)" }}
                            onMouseDown={(e) => { e.preventDefault(); setIsResizingRight(true); }}
                        />

                        <div
                            className="workbench-ai-panel flex min-h-0 flex-col"
                            style={{ width: rightPanelWidth, backgroundColor: "var(--workbench-surface)", borderLeft: "1px solid var(--workbench-border)" }}
                        >
                            {/* avatar */}
                            <div
                                className="workbench-ai-identity flex flex-col items-center justify-center p-6"
                                style={{ paddingTop: "40px", borderBottom: "1px solid var(--workbench-border)" }}
                            >
                                <div className="workbench-ai-avatar relative mb-6">
                                    <div className="workbench-ai-avatar-frame w-24 h-24 rounded-full bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] p-[2px]">
                                        <div className="w-full h-full rounded-full bg-[#1a1c22] flex items-center justify-center">
                                            <FaRobot className="text-4xl text-indigo-500" aria-label="AI coding mentor" />
                                        </div>
                                    </div>
                                    <div className="workbench-ai-wave absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 flex items-center justify-center gap-[2px]">
                                        {[...Array(20)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-[3px] bg-[#FF5A1F] rounded-full ${isAiSpeaking ? "animate-wave" : "opacity-20"}`}
                                                style={{ height: isAiSpeaking ? `${Math.random() * 24 + 4}px` : "4px", animationDelay: `${i * 0.05}s` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="workbench-ai-details w-full text-center mt-8">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <h3 className="text-white font-semibold text-sm">AI Mentor</h3>
                                        <span className={`w-2 h-2 rounded-full bg-indigo-500 ${isAiSpeaking ? "animate-pulse" : ""}`} />

                                        {/* Voice Selector Button - Moved here */}
                                        {availableVoices.length > 0 && (
                                            <div className="relative ml-2">
                                                <button
                                                    onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                                                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#2a2e3a] hover:bg-[#3a3e4a] text-gray-300 text-[10px] transition-all border border-[#3a3e4a]"
                                                    title="Select voice"
                                                >
                                                    <span>🎤</span>
                                                    <span className="max-w-[80px] truncate">
                                                        {selectedVoice?.name?.split(' ').slice(0, 2).join(' ') || 'Voice'}
                                                    </span>
                                                    <span>▼</span>
                                                </button>

                                                {/* Voice Dropdown */}
                                                {showVoiceSelector && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-40"
                                                            onClick={() => setShowVoiceSelector(false)}
                                                        />
                                                        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-72 max-h-60 overflow-y-auto bg-[#1a1c22] border border-[#2a2e3a] rounded-lg shadow-2xl z-50">
                                                            <div className="p-3 border-b border-[#2a2e3a] sticky top-0 bg-[#1a1c22]">
                                                                <p className="text-xs font-semibold text-gray-300">Select Voice</p>
                                                                <p className="text-[9px] text-gray-500 mt-1">Choose how your AI Mentor sounds</p>
                                                            </div>
                                                            <div className="p-2">
                                                                {availableVoices.map((voice, index) => {
                                                                    // Check if it's a female voice for visual indicator
                                                                    const isFemaleVoice = voice.name.toLowerCase().includes('female') ||
                                                                        voice.name.includes('Samantha') ||
                                                                        voice.name.includes('Google UK') ||
                                                                        voice.name.includes('Zira') ||
                                                                        voice.name.includes('Hazel') ||
                                                                        voice.name.includes('Susan') ||
                                                                        voice.name.includes('Catherine') ||
                                                                        voice.name.includes('Heera') ||
                                                                        voice.name.includes('Moira') ||
                                                                        voice.name.includes('Fiona') ||
                                                                        voice.name.includes('Tessa') ||
                                                                        voice.name.includes('Veena') ||
                                                                        voice.name.includes('Karen');

                                                                    return (
                                                                        <button
                                                                            key={index}
                                                                            onClick={() => {
                                                                                setSelectedVoice(voice);
                                                                                setShowVoiceSelector(false);
                                                                                // Test the voice with a friendly message
                                                                                const testUtterance = new SpeechSynthesisUtterance("Hello! I'm your AI coding mentor. How can I help you today?");
                                                                                testUtterance.voice = voice.voice;
                                                                                testUtterance.rate = 0.85;
                                                                                if (speechSynth) {
                                                                                    speechSynth.cancel();
                                                                                    speechSynth.speak(testUtterance);
                                                                                }
                                                                            }}
                                                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all mb-1 ${selectedVoice?.name === voice.name
                                                                                ? 'bg-gradient-to-r from-[#FF5A1F]/20 to-[#FF5A1F]/10 border border-[#FF5A1F]/30'
                                                                                : 'hover:bg-[#2a2e3a] border border-transparent'
                                                                                }`}
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="font-medium text-gray-200 flex items-center gap-1">
                                                                                    {voice.name}
                                                                                    {isFemaleVoice && (
                                                                                        <span className="text-[10px] text-pink-400" title="Female voice">♀️</span>
                                                                                    )}
                                                                                </div>
                                                                                {selectedVoice?.name === voice.name && (
                                                                                    <FaCheck className="text-[#FF5A1F] text-[10px]" />
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center justify-between mt-1">
                                                                                <span className="text-[9px] text-gray-500">{voice.lang}</span>
                                                                                {voice.default && (
                                                                                    <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">Default</span>
                                                                                )}
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                            <div className="p-2 border-t border-[#2a2e3a] text-[8px] text-gray-600 text-center">
                                                                {availableVoices.length} voices available
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {/* Stop Speech Button */}
                                        {isSpeaking && (
                                            <button
                                                onClick={handleStopSpeaking}
                                                className="w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-500 flex items-center justify-center transition-all"
                                                title="Stop all speech"
                                            >
                                                <FaStop size={10} />
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-500 mt-2">
                                        {isAiSpeaking ? "Speaking…" : "Always here to help"}
                                        {selectedVoice && !isAiSpeaking && (
                                            <span className="text-gray-600 ml-1">• {selectedVoice.name.split(' ').slice(0, 2).join(' ')}</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* chat messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {aiMessages.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        <p>No messages yet. Start a conversation!</p>
                                    </div>
                                ) : (
                                    aiMessages.map((msg, index) => {
                                        return (
                                            <div key={msg.id || `msg-${index}`} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                                                <div className={`flex gap-3 max-w-[85%] ${msg.type === "user" ? "flex-row-reverse" : ""}`}>
                                                    <div className="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] p-[1px]">
                                                        <div className="w-full h-full rounded-full bg-[#1a1c22] flex items-center justify-center">
                                                            {msg.type === "user"
                                                                ? <FaUser className="text-[#FF5A1F]" style={{ fontSize: "9px" }} />
                                                                : <FaRobot className="text-[#FF5A1F]" style={{ fontSize: "9px" }} />}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div
                                                            className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.type === "user"
                                                                ? "bg-[#FF5A1F] text-white rounded-tr-none"
                                                                : "bg-[#1a1c22] text-gray-300 rounded-tl-none border border-[#2a2e3a]"
                                                                }`}
                                                        >
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                rehypePlugins={[rehypeRaw]}
                                                                components={{
                                                                    code({ node, inline, className, children, ...props }) {
                                                                        const match = /language-(\w+)/.exec(className || '');
                                                                        return !inline && match ? (
                                                                            <pre className="bg-[#2a2e3a] p-2 rounded-lg overflow-x-auto my-2">
                                                                                <code className={className} {...props}>
                                                                                    {children}
                                                                                </code>
                                                                            </pre>
                                                                        ) : (
                                                                            <code className="bg-[#2a2e3a] px-1 rounded" {...props}>
                                                                                {children}
                                                                            </code>
                                                                        );
                                                                    },
                                                                    a({ node, children, href, ...props }) {
                                                                        return (
                                                                            <a href={href} className="text-[#FF5A1F] hover:underline" target="_blank" rel="noopener noreferrer" {...props}>
                                                                                {children}
                                                                            </a>
                                                                        );
                                                                    },
                                                                }}
                                                            >
                                                                {msg.message}
                                                            </ReactMarkdown>

                                                            {/* Listen Button for AI messages */}
                                                            {msg.type === "ai" && (
                                                                <div className="mt-2 flex justify-end">
                                                                    <button
                                                                        onClick={() => {
                                                                            if (isSpeaking) {
                                                                                handleStopSpeaking();
                                                                            }
                                                                            speakText(msg.message, msg.highlightedLines || []);
                                                                        }}
                                                                        disabled={isSpeaking}
                                                                        className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all ${isSpeaking
                                                                            ? 'bg-indigo-500/20 text-indigo-500 cursor-not-allowed'
                                                                            : 'bg-[#2a2e3a] hover:bg-[#3a3e4a] text-gray-300 hover:text-white'
                                                                            }`}
                                                                        title="Listen to this message"
                                                                    >
                                                                        <FaVolumeUp className={isSpeaking ? 'animate-pulse' : ''} size={10} />
                                                                        <span>{isSpeaking ? 'Speaking...' : 'Listen'}</span>
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {/* Buttons for fixed code */}
                                                            {msg.showFixButtons && msg.fixedCode && (
                                                                <div className="mt-4 flex gap-2">
                                                                    <button
                                                                        onClick={() => applyFixedCode(msg.fixedCode)}
                                                                        disabled={isExplaining}
                                                                        className="px-3 py-1.5 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1"
                                                                        title="Apply the fixed code to editor"
                                                                    >
                                                                        <FaCheck size={10} />
                                                                        Apply Changes
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleApplyAndExplain(msg.originalCode, msg.fixedCode)}
                                                                        disabled={isExplaining}
                                                                        className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1"
                                                                        title="Apply code and highlight what was fixed"
                                                                    >
                                                                        {isExplaining ? (
                                                                            <FaSpinner className="animate-spin" size={10} />
                                                                        ) : (
                                                                            <FaLightbulb size={10} />
                                                                        )}
                                                                        Apply & Explain
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(msg.fixedCode);
                                                                            setCopiedIndex(msg.id);
                                                                            setTimeout(() => setCopiedIndex(null), 2000);
                                                                        }}
                                                                        className="px-3 py-1.5 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1"
                                                                    >
                                                                        {copiedIndex === msg.id ? <FaCheck size={10} /> : <FaCopy size={10} />}
                                                                        Copy
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-gray-600 mt-1 block">{msg.timestamp}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                {aiTyping && (
                                    <div className="flex justify-start">
                                        <div className="flex gap-3">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] p-[1px]">
                                                <div className="w-full h-full rounded-full bg-[#1a1c22] flex items-center justify-center">
                                                    <FaRobot className="text-[#FF5A1F]" style={{ fontSize: "9px" }} />
                                                </div>
                                            </div>
                                            <div className="bg-[#1a1c22] px-4 py-3 rounded-2xl rounded-tl-none border border-[#2a2e3a]">
                                                <div className="flex gap-1">
                                                    {[0, 0.2, 0.4].map((d, i) => (
                                                        <span key={i} className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* CHAT INPUT SECTION - THIS WAS MISSING */}
                            <div className="p-3 border-t border-[#2a2e3a]" style={{ backgroundColor: "var(--workbench-surface)" }}>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                        placeholder="Ask me anything about coding..."
                                        className="min-w-0 flex-1 h-9 px-3 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-[var(--workbench-text)] border border-[var(--workbench-border)]"
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        accept=".js,.jsx,.ts,.tsx,.py,.java,.html,.css,.json,.txt"
                                        style={{ display: 'none' }}
                                    />
                                    <div className="relative">
                                        {isListening && (
                                            <>
                                                <div className="absolute inset-0 rounded-lg bg-red-500 opacity-20 animate-ping" />
                                                <div className="absolute inset-0 rounded-lg bg-red-500 opacity-30 animate-pulse" />
                                            </>
                                        )}
                                        <button
                                            onClick={toggleListening}
                                            className={`relative w-9 h-9 rounded-lg border transition-all flex items-center justify-center ${isListening
                                                ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/50'
                                                : 'bg-[#1a1c22] border-[#2a2e3a] text-gray-400 hover:text-[#FF5A1F] hover:border-[#FF5A1F]'
                                                }`}
                                            title={isListening ? "Stop listening" : "Voice input"}
                                        >
                                            <FaMicrophone className={isListening ? 'animate-pulse' : ''} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-9 h-9 rounded-lg bg-[#1a1c22] border border-[#2a2e3a] text-gray-400 hover:text-[#FF5A1F] hover:border-[#FF5A1F] transition-all flex items-center justify-center"
                                        title="Upload code file"
                                    >
                                        📎
                                    </button>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isAIFixing || isExplaining || aiTyping}
                                        className={`w-9 h-9 rounded-lg bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] text-white flex items-center justify-center transition-all ${isAIFixing || isExplaining || aiTyping ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                                            }`}
                                    >
                                        {isAIFixing || isExplaining || aiTyping ? <FaSpinner className="animate-spin" /> : <FaPaperPlane style={{ fontSize: "11px" }} />}
                                    </button>
                                </div>

                                {/* Voice Input Waveform Indicator */}
                                {isListening && (
                                    <div className="flex items-center justify-center gap-[2px] mt-2 mb-1">
                                        {[...Array(15)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-[3px] bg-red-500 rounded-full animate-voice-wave"
                                                style={{
                                                    height: '4px',
                                                    animationDelay: `${i * 0.08}s`,
                                                    animationDuration: '0.8s'
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* AI Speaking Status and Stop Button */}
                                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-600">
                                    {isListening ? (
                                        <>
                                            <FaMicrophone className="text-red-500 animate-pulse" />
                                            <span className="text-red-500 font-semibold">🎤 Listening... Speak now!</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaVolumeUp className={isSpeaking ? "text-[#FF5A1F] animate-pulse" : ""} />
                                            <span>{isSpeaking ? "Speaking…" : "Ask questions, paste code, or use voice"}</span>
                                        </>
                                    )}

                                    {/* Stop button - shown when speaking */}
                                    {isSpeaking && (
                                        <button
                                            onClick={handleStopSpeaking}
                                            className="ml-auto bg-red-500/20 hover:bg-red-500/30 text-red-500 px-2 py-0.5 rounded text-[9px] font-medium flex items-center gap-1 transition-all"
                                        >
                                            <FaStop size={8} />
                                            Stop
                                        </button>
                                    )}

                                    {/* Original stop button for isAiSpeaking (keep for backward compatibility) */}
                                    {!isSpeaking && isAiSpeaking && (
                                        <button onClick={stopSpeaking} className="ml-auto text-gray-500 hover:text-[#FF5A1F]">
                                            <FaStop size={10} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style jsx>{`
  @keyframes wave { 0%,100%{height:4px} 50%{height:24px} }
  .animate-wave { animation: wave 0.8s ease-in-out infinite; }
  @keyframes voice-wave { 
    0%, 100% { height: 4px; } 
    50% { height: 20px; } 
  }
  .animate-voice-wave { 
    animation: voice-wave 0.5s ease-in-out infinite; 
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`}</style>
        </div>
    );
}

/* ── Tab button ── */
function Tab({ name, activeTab, setActiveTab }) {
    const active = activeTab === name;
    return (
        <button
            onClick={() => setActiveTab(name)}
            className="px-4 py-[6px] capitalize text-xs font-medium transition-all"
            style={{
                backgroundColor: active ? "#1e1e1e" : "transparent",
                color: active ? "#cccccc" : "#6a737d",
                borderBottom: active ? "1px solid #FF5A1F" : "1px solid transparent",
                borderRadius: "0",
            }}
        >
            {name}
        </button>
    );
}