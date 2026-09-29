"use client";

import ChatSidebar from "@/components/ChatSidebar/ChatSidebar";
import MonacoEditor from "@/components/MonacoEditor/MonacoEditor";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useTheme } from "@/context/ThemeContext";
import ChatContextService from "@/services/ChatContextService";
import {
  SandpackFileExplorer,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import axios from "axios";
import NextImage from "next/image";
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
  FaRocket,
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

/* ═══════════════════════════════════════════════════════════════════════════
   EXTRACT INPUT PROMPTS FROM SOURCE CODE
═══════════════════════════════════════════════════════════════════════════ */
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
        backgroundColor: "#1e1e1e",
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
              <div key={i} style={{ color: "#cccccc", whiteSpace: "pre-wrap" }}>
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
                <span style={{ color: "#cccccc" }}>{line.prompt}</span>
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
            <span style={{ color: "#cccccc" }}>{promptText}</span>
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
          borderTop: "1px solid #2d2d2d",
          backgroundColor: "#007acc",
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
  const router = useRouter();

  /* ── UI States ── */
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  /* ── AI Fix States ── */
  const [isAIFixing, setIsAIFixing] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [fixedCodeSuggestion, setFixedCodeSuggestion] = useState("");
  const [originalCodeForExplanation, setOriginalCodeForExplanation] = useState("");
  const [fixedCodeForExplanation, setFixedCodeForExplanation] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const {
    messages: chatMessages,
    sendToAI,
    fixCodeWithAI,
    aiTyping,
    currentChatId,
    createNewChat
  } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
  const [currentExplanationStep, setCurrentExplanationStep] = useState(0);
  const [explanationSteps, setExplanationSteps] = useState([]);
  const [isExplanationPaused, setIsExplanationPaused] = useState(false);
  const [canResumeExplanation, setCanResumeExplanation] = useState(false);
  const explanationPausedRef = useRef(false);
  const [practiceData, setPracticeData] = useState(null);
  const [showNextModule, setShowNextModule] = useState(false);

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

  // Sync messages from chat context - DISABLED for demo page
  // Demo page uses local aiMessages state only
  useEffect(() => {
    // Only show welcome message if no practice data and no existing messages
    if (!localStorage.getItem('practiceCode') && aiMessages.length === 0) {
      setAiMessages([{
        id: `welcome-${Date.now()}`,
        type: "ai",
        message: "👋 **Hi! I'm your AI coding mentor!**\n\nPaste your code in the chat or upload a file, and I'll help fix it! 🎉",
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  }, []); // Run only once on mount

  /* ── speech ── */
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) setSpeechSynth(window.speechSynthesis);
  }, []);

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

  /* ── Check for practice code from roadmap ── */
  useEffect(() => {
    const practiceDataStr = localStorage.getItem('practiceCode');
    if (practiceDataStr) {
      setShowNextModule(true); // Show Next Module button
      try {
        const data = JSON.parse(practiceDataStr);
        setPracticeData(data); // Save to state

        // Set the code in editor
        if (data.code) {
          setCode(data.code);
        }

        // Detect and set language
        const langMap = {
          'html+css': 'html',
          'javascript': 'javascript',
          'reactjs': 'react',
          'react.js': 'react',
          'nodejs': 'node',
          'node.js': 'node',
          'python': 'python',
          'java': 'java',
          'c++': 'javascript'
        };

        const detectedLang = langMap[data.language] || detectLanguageFromCode(data.code) || 'javascript';
        setLanguage(detectedLang);

        // Check if there's saved chat context for this topic
        const savedContext = ChatContextService.loadChatContext(data.weekNumber, data.topicIndex);

        if (savedContext.success && savedContext.context) {
          // Load saved messages
          setAiMessages(savedContext.context.messages);

          // Load saved explanation state if exists
          if (savedContext.context.explanationState) {
            const expState = savedContext.context.explanationState;
            if (expState.steps && expState.steps.length > 0) {
              setExplanationSteps(expState.steps);
              setCurrentExplanationStep(expState.currentStep || 0);
              setIsExplanationPaused(expState.isPaused || false);
              setCanResumeExplanation(true);
            }
          }

          // Add a message indicating context was restored
          setTimeout(() => {
            setAiMessages(prev => [...prev, {
              id: `context-restored-${Date.now()}-${Math.random()}`,
              type: "ai",
              message: `💾 **Welcome back!** I've restored your previous conversation from ${new Date(savedContext.savedAt).toLocaleString()}.\n\nFeel free to continue where you left off!`,
              timestamp: new Date().toLocaleTimeString()
            }]);
          }, 500);
        } else {
          // No saved context, show welcome message
          const welcomeMessage = `👋 **Welcome to practice mode!**\n\n📚 **Topic:** ${data.topicName}\n\n${data.explanation}\n\n💡 I've loaded the code example in the editor. Let me explain how it works!`;

          setAiMessages([
            {
              id: `practice-welcome-${Date.now()}-${Math.random()}`,
              type: "ai",
              message: welcomeMessage,
              timestamp: new Date().toLocaleTimeString()
            }
          ]);

          // Speak the welcome message (only if speech is available)
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            const speechText = `Welcome to practice mode! Let me explain ${data.topicName}. ${data.explanation}`;
            setTimeout(() => speakText(speechText), 100);
          }

          // After a short delay, explain the code
          setTimeout(() => {
            const codeExplanation = data.codeExplanation
              ? `\n\n🔍 **How the code works:**\n\n${data.codeExplanation}\n\n✨ Try running it and experiment with modifications!`
              : '\n\n✨ Try running this code and see what happens! Feel free to modify it and ask me questions.';

            setAiMessages(prev => [...prev, {
              id: `practice-explanation-${Date.now()}-${Math.random()}`,
              type: "ai",
              message: codeExplanation,
              timestamp: new Date().toLocaleTimeString()
            }]);

            if (data.codeExplanation && typeof window !== 'undefined' && window.speechSynthesis) {
              setTimeout(() => speakText(data.codeExplanation), 100);
            }
          }, 2000);
        }

        // Keep practice data in localStorage for Next Module button

      } catch (error) {
        console.error('Error loading practice code:', error);
      }
    }
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiMessages, isAiTyping]);

  /* ── Auto-save chat context when messages change ── */
  useEffect(() => {
    if (practiceData && aiMessages.length > 1) { // More than just welcome message
      const explanationState = {
        currentStep: currentExplanationStep,
        totalSteps: explanationSteps.length,
        isPaused: isExplanationPaused,
        steps: explanationSteps
      };

      ChatContextService.autoSave(practiceData, aiMessages, explanationState);
    }
  }, [aiMessages, currentExplanationStep, isExplanationPaused, explanationSteps, practiceData]);

  const stopSpeaking = () => { speechSynth?.cancel(); setIsAiSpeaking(false); };

  const toggleListening = () => {
    if (!recognition) {
      setAiMessages(prev => [...prev, {
        id: `voice-error-${Date.now()}-${Math.random()}`,
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
    await logout();
    router.push("/");
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

  // Clean text for speech - Make it human-like and remove code syntax
  const cleanTextForSpeech = (text) => {
    if (!text) return '';

    let cleaned = text
      // Remove code blocks (anything between ``` and ```)
      .replace(/```[\s\S]*?```/g, '')

      // Remove inline code (text between backticks)
      .replace(/`([^`]+)`/g, '$1')

      // Remove markdown links but keep the text [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

      // Remove markdown bold and italic
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')

      // Remove markdown headers
      .replace(/#{1,6}\s+/g, '')

      // Remove emojis and special characters
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // symbols & pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // transport & map symbols
      .replace(/[\u{2600}-\u{26FF}]/gu, '') // misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '') // dingbats

      // Remove HTML tags
      .replace(/<[^>]*>/g, '')

      // Replace common code-related terms with spoken versions
      .replace(/\bconst\b/g, 'constant')
      .replace(/\blet\b/g, 'let')
      .replace(/\bfunction\b/g, 'function')
      .replace(/\breturn\b/g, 'return')
      .replace(/\bif\b/g, 'if')
      .replace(/\belse\b/g, 'else')
      .replace(/\bfor\b/g, 'for')
      .replace(/\bwhile\b/g, 'while')
      .replace(/\btrue\b/g, 'true')
      .replace(/\bfalse\b/g, 'false')
      .replace(/\bnull\b/g, 'null')
      .replace(/\bundefined\b/g, 'undefined')

      // Replace common symbols with words
      .replace(/===/g, 'is equal to')
      .replace(/!==/g, 'is not equal to')
      .replace(/===/g, 'is equal to')
      .replace(/==/g, 'equals')
      .replace(/!=/g, 'not equals')
      .replace(/<=/g, 'less than or equal to')
      .replace(/>=/g, 'greater than or equal to')
      .replace(/</g, 'less than')
      .replace(/>/g, 'greater than')
      .replace(/&&/g, 'and')
      .replace(/\|\|/g, 'or')
      .replace(/!/g, 'not')
      .replace(/\+/g, 'plus')
      .replace(/-/g, 'minus')
      .replace(/\*/g, 'times')
      .replace(/\//g, 'divided by')
      .replace(/%/g, 'modulo')
      .replace(/=/g, 'equals')

      // Replace backslashes and forward slashes
      .replace(/\\/g, '')
      .replace(/\//g, ' ')

      // Replace multiple spaces with single space
      .replace(/\s+/g, ' ')

      // Trim and ensure it ends with proper punctuation
      .trim();

    // Add a period at the end if it doesn't have punctuation
    if (cleaned && !cleaned.match(/[.!?]$/)) {
      cleaned += '.';
    }

    return cleaned;
  };

  const speakTextInChunks = (text) => {
    speakText(text);
  };

  // Speak text with human-like voice
  const speakText = (text, highlightedLines = []) => {
    if (!speechSynth || !text) return;

    // Stop any current speech
    speechSynth.cancel();
    setIsAiSpeaking(false);

    // Highlight lines if provided
    if (highlightedLines && highlightedLines.length > 0 && window.monacoEditor) {
      if (Array.isArray(highlightedLines)) {
        window.monacoEditor.highlightLines(highlightedLines);
      } else {
        window.monacoEditor.highlightLines([highlightedLines]);
      }
    }

    // Clean the text for natural speech
    const cleanText = cleanTextForSpeech(text);

    // Split into sentences for more natural pacing
    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];

    const speakNextChunk = (index) => {
      if (index >= sentences.length) {
        setIsAiSpeaking(false);
        // Clear temporary highlights when done speaking
        if (window.monacoEditor && window.monacoEditor.clearTemporaryHighlights) {
          window.monacoEditor.clearTemporaryHighlights();
        }
        return;
      }

      const sentence = sentences[index].trim();
      if (!sentence) {
        speakNextChunk(index + 1);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentence);

      // Natural speaking rate and pitch
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.1; // Slightly higher for friendly tone
      utterance.volume = 1;

      // Get available voices
      const voices = speechSynth.getVoices();

      // Try to find a natural, friendly voice
      const preferredVoice = voices.find(voice =>
        voice.name.includes('Google UK') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Female') ||
        voice.name.includes('Microsoft Zira') ||
        voice.name.includes('Google US English') ||
        voice.name.includes('Daniel') // Good for technical content
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => speakNextChunk(index + 1);
      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        speakNextChunk(index + 1);
      };

      speechSynth.speak(utterance);
    };

    speakNextChunk(0);
  };

  /* ── Synchronized Code Explanation ── */
  const explainCodeSynchronized = async () => {
    if (!code || code.trim().length === 0) {
      setAiMessages(prev => [...prev, {
        id: `no-code-${Date.now()}-${Math.random()}`,
        type: "ai",
        message: "⚠️ Please write some code first, then I can explain it to you!",
        timestamp: new Date().toLocaleTimeString()
      }]);
      return;
    }

    setIsExplaining(true);
    setIsAiTyping(true);
    setIsExplanationPaused(false);
    setCanResumeExplanation(false);
    explanationPausedRef.current = false;

    try {
      // Get explanation steps from API
      const response = await fetch('/api/explain-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get explanation');
      }

      // Ensure steps is always an array
      let steps = [];

      if (data.steps && Array.isArray(data.steps)) {
        steps = data.steps;
      } else if (data.steps && typeof data.steps === 'object') {
        steps = [data.steps];
      } else if (Array.isArray(data)) {
        steps = data;
      } else if (data && typeof data === 'object') {
        const possibleArray = Object.values(data).find(val => Array.isArray(val));
        if (possibleArray) {
          steps = possibleArray;
        } else {
          steps = [{
            text: "Let me explain this code to you.",
            highlight: code.split('\n')[0] || code,
            lineStart: 1,
            lineEnd: 1
          }];
        }
      } else {
        const lines = code.split('\n');
        steps = lines.slice(0, 5).map((line, index) => ({
          text: `Line ${index + 1}: ${line.substring(0, 50)}${line.length > 50 ? '...' : ''}`,
          highlight: line,
          lineStart: index + 1,
          lineEnd: index + 1
        }));

        if (steps.length === 0) {
          steps = [{
            text: "Let me explain this code to you.",
            highlight: code,
            lineStart: 1,
            lineEnd: 1
          }];
        }
      }

      console.log("=".repeat(80));
      console.log("📥 CLIENT RECEIVED STEPS:", steps.length);
      console.log(JSON.stringify(steps, null, 2));
      console.log("=".repeat(80));

      if (steps.length === 0) {
        throw new Error('No explanation steps received');
      }

      setExplanationSteps(steps);
      setCurrentExplanationStep(0);
      setIsAiTyping(false);

      // Add intro message
      setAiMessages(prev => [...prev, {
        id: `explain-intro-${Date.now()}-${Math.random()}`,
        type: "ai",
        message: "🎓 **Let me explain this code step by step!**\n\nWatch the editor as I highlight each part...\n\n💡 **Tip:** You can pause anytime to ask questions!",
        timestamp: new Date().toLocaleTimeString()
      }]);

      // Split code into lines for accurate line finding
      const codeLines = code.split('\n');

      console.log("📄 CLIENT CODE LINES:", codeLines.length);
      codeLines.forEach((line, idx) => {
        console.log(`  Line ${idx + 1}: "${line}"`);
      });
      console.log("=".repeat(80));

      // Clean text function for speech
      const cleanTextForSpeech = (text) => {
        if (!text) return '';

        return text
          // Remove code blocks
          .replace(/```[\s\S]*?```/g, '')
          // Remove inline code backticks but keep the content
          .replace(/`([^`]+)`/g, '$1')
          // Remove markdown links but keep text
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          // Remove markdown formatting
          .replace(/(\*\*|__)(.*?)\1/g, '$2')
          .replace(/(\*|_)(.*?)\1/g, '$2')
          .replace(/#{1,6}\s+/g, '')
          // Remove emojis
          .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
          .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
          .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
          // Replace common symbols with words
          .replace(/===/g, 'is equal to')
          .replace(/!==/g, 'is not equal to')
          .replace(/==/g, 'equals')
          .replace(/!=/g, 'not equals')
          .replace(/<=/g, 'less than or equal to')
          .replace(/>=/g, 'greater than or equal to')
          .replace(/</g, 'less than')
          .replace(/>/g, 'greater than')
          .replace(/&&/g, 'and')
          .replace(/\|\|/g, 'or')
          .replace(/!/g, 'not')
          .replace(/\+/g, 'plus')
          .replace(/-/g, 'minus')
          .replace(/\*/g, 'times')
          .replace(/\//g, 'divided by')
          .replace(/%/g, 'modulo')
          // Remove backslashes
          .replace(/\\/g, '')
          // Clean up spaces
          .replace(/\s+/g, ' ')
          .trim();
      };

      // Start explaining step by step
      for (let i = 0; i < steps.length; i++) {
        // Check if paused
        while (explanationPausedRef.current) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        const step = steps[i];
        setCurrentExplanationStep(i);
        setCanResumeExplanation(true);

        console.log(`\n🎯 PROCESSING STEP ${i + 1}/${steps.length}:`);
        console.log(`  Text: "${step.text}"`);
        console.log(`  Highlight: "${step.highlight}"`);
        console.log(`  Gemini Line Range: ${step.lineStart} to ${step.lineEnd}`);

        // Validate line numbers
        const lineStart = step.lineStart && !isNaN(step.lineStart) ? step.lineStart : 1;
        const lineEnd = step.lineEnd && !isNaN(step.lineEnd) ? step.lineEnd : lineStart;

        // Find the actual line number by searching for the highlight text
        let actualLineStart = lineStart;
        let actualLineEnd = lineEnd;

        if (step.highlight) {
          const highlightText = step.highlight.trim();
          let found = false;

          for (let lineIdx = 0; lineIdx < codeLines.length; lineIdx++) {
            if (codeLines[lineIdx].includes(highlightText)) {
              actualLineStart = lineIdx + 1;
              actualLineEnd = lineIdx + 1;
              console.log(`  ✅ Found "${highlightText}" at line ${actualLineStart}`);
              console.log(`  📍 Line content: "${codeLines[lineIdx]}"`);
              found = true;
              break;
            }
          }

          if (!found) {
            console.warn(`  ⚠️ Could not find "${highlightText}" in code, using line numbers: ${lineStart}-${lineEnd}`);
          }
        }

        // Ensure line numbers are within bounds
        actualLineStart = Math.max(1, Math.min(actualLineStart, codeLines.length));
        actualLineEnd = Math.max(1, Math.min(actualLineEnd, codeLines.length));

        console.log(`  🎨 Will highlight lines: ${actualLineStart} to ${actualLineEnd}`);

        // Highlight the code in editor
        if (window.monacoEditor && window.monacoEditor.highlightLines) {
          const linesToHighlight = [];
          for (let line = actualLineStart; line <= actualLineEnd; line++) {
            linesToHighlight.push(line);
          }
          console.log(`  ✅ Calling highlightLines with lines:`, linesToHighlight);
          window.monacoEditor.highlightLines(linesToHighlight);
        } else {
          console.error('  ❌ Monaco editor or highlightLines not available!');
        }

        // Add message with unique ID
        const messageId = `step-${Date.now()}-${i}-${Math.random()}`;
        setAiMessages(prev => [...prev, {
          id: messageId,
          type: "ai",
          message: `**Step ${i + 1}/${steps.length}:** ${step.text}`,
          timestamp: new Date().toLocaleTimeString()
        }]);

        // Wait a bit for the message to render
        await new Promise(resolve => setTimeout(resolve, 300));

        // Speak the explanation with human-like voice
        if (speechSynth && !explanationPausedRef.current) {
          await new Promise((resolve) => {
            // Clean the text for natural speech
            const cleanText = cleanTextForSpeech(step.text);

            // Split into sentences for better pacing
            const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];

            let sentenceIndex = 0;

            const speakNextSentence = () => {
              if (sentenceIndex >= sentences.length) {
                setIsAiSpeaking(false);
                setTimeout(resolve, 800);
                return;
              }

              const sentence = sentences[sentenceIndex].trim();
              if (!sentence) {
                sentenceIndex++;
                speakNextSentence();
                return;
              }

              const utterance = new SpeechSynthesisUtterance(sentence);

              // Natural speaking settings
              utterance.rate = 0.9;      // Slightly slower for clarity
              utterance.pitch = 1.1;      // Slightly higher for friendly tone
              utterance.volume = 1;

              // Get voices and find a natural one
              const voices = speechSynth.getVoices();
              const preferredVoice = voices.find(voice =>
                voice.name.includes('Google UK') ||
                voice.name.includes('Samantha') ||
                voice.name.includes('Female') ||
                voice.name.includes('Microsoft Zira') ||
                voice.name.includes('Daniel')
              );

              if (preferredVoice) {
                utterance.voice = preferredVoice;
              }

              utterance.onstart = () => setIsAiSpeaking(true);
              utterance.onend = () => {
                sentenceIndex++;
                speakNextSentence();
              };
              utterance.onerror = (event) => {
                console.error('Speech error:', event);
                sentenceIndex++;
                speakNextSentence();
              };

              speechSynth.speak(utterance);
            };

            speakNextSentence();
          });
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Clear highlight
      if (window.monacoEditor && window.monacoEditor.clearHighlights) {
        window.monacoEditor.clearHighlights();
      }

      // Final message
      setAiMessages(prev => [...prev, {
        id: `final-${Date.now()}-${Math.random()}`,
        type: "ai",
        message: "✅ **Explanation complete!** Feel free to ask me any questions or try modifying the code.",
        timestamp: new Date().toLocaleTimeString()
      }]);

    } catch (error) {
      console.error('Explanation error:', error);

      let errorMessage = "Unknown error occurred";
      if (error && typeof error === 'object') {
        errorMessage = error.message || JSON.stringify(error);
      } else if (error) {
        errorMessage = String(error);
      }

      setAiMessages(prev => [...prev, {
        id: `error-${Date.now()}-${Math.random()}`,
        type: "ai",
        message: `😔 Sorry, I had trouble explaining the code. ${errorMessage}\n\nPlease try again or ask me a specific question!`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsExplaining(false);
      setIsAiTyping(false);
      setIsAiSpeaking(false);
      setCurrentExplanationStep(0);
      setExplanationSteps([]);
      setIsExplanationPaused(false);
      setCanResumeExplanation(false);
      explanationPausedRef.current = false;
    }
  };

  const pauseExplanation = () => {
    explanationPausedRef.current = true;
    setIsExplanationPaused(true);
    speechSynth?.cancel();
    setIsAiSpeaking(false);

    setAiMessages(prev => [...prev, {
      id: `paused-${Date.now()}-${Math.random()}`,
      type: "ai",
      message: "⏸️ **Explanation paused!**\n\nFeel free to ask me any questions about what we've covered so far. Click 'Resume' when you're ready to continue!",
      timestamp: new Date().toLocaleTimeString()
    }]);

    // Save context when pausing
    if (practiceData) {
      const explanationState = {
        currentStep: currentExplanationStep,
        totalSteps: explanationSteps.length,
        isPaused: true,
        steps: explanationSteps
      };
      ChatContextService.saveChatContext(practiceData, aiMessages, explanationState);
    }
  };

  const resumeExplanation = () => {
    explanationPausedRef.current = false;
    setIsExplanationPaused(false);

    setAiMessages(prev => [...prev, {
      id: `resumed-${Date.now()}-${Math.random()}`,
      type: "ai",
      message: "▶️ **Resuming explanation...**",
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const stopExplanation = () => {
    explanationPausedRef.current = false;
    setIsExplanationPaused(false);
    setIsExplaining(false);
    setIsAiTyping(false);
    setIsAiSpeaking(false);
    setCanResumeExplanation(false);
    speechSynth?.cancel();

    if (window.monacoEditor && window.monacoEditor.clearHighlights) {
      window.monacoEditor.clearHighlights();
    }

    setAiMessages(prev => [...prev, {
      id: `stopped-${Date.now()}-${Math.random()}`,
      type: "ai",
      message: "⏹️ **Explanation stopped!**\n\nLet me know if you have any questions or want to start over!",
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleChatWithAI = async (message) => {
    // This function is kept for compatibility but now uses local state
    return { success: true };
  };

  const handleFixWithOpenRouter = async (codeToFix, errorMessage = "") => {
    setIsAIFixing(true);

    try {
      // Step 1: Try OpenRouter for code fixing
      let fixedCode = codeToFix;
      let openRouterSuccess = false;

      try {
        const openRouterResponse = await axios.post("/api/deepseek", {
          code: codeToFix,
          language,
          error: errorMessage,
        });

        fixedCode = openRouterResponse.data.fixedCode;
        openRouterSuccess = true;
      } catch (error) {
        console.error("OpenRouter error:", error);
      }

      // Step 2: Get explanation from Gemini
      const geminiResponse = await axios.post("/api/gemini", {
        originalCode: codeToFix,
        fixedCode: fixedCode,
        language,
        userMessage: errorMessage || "Fix this code",
        isFixExplanation: true
      });

      const explanation = geminiResponse.data.displayMessage || geminiResponse.data.display || "";
      const aiMessage = openRouterSuccess && fixedCode !== codeToFix
        ? `🎯 **I fixed your ${language} code!**\n\nHere's the corrected version:\n\n\`\`\`${language}\n${fixedCode}\n\`\`\`\n\n${explanation}`
        : explanation || "I've analyzed your code.";

      // Add AI response to local state
      setAiMessages(prev => [...prev, {
        id: `ai-fix-${Date.now()}-${Math.random()}`,
        type: "ai",
        message: aiMessage,
        timestamp: new Date().toLocaleTimeString(),
        fixedCode: fixedCode !== codeToFix ? fixedCode : undefined,
        originalCode: codeToFix,
        showFixButtons: fixedCode !== codeToFix
      }]);

      // Speak the explanation
      if (geminiResponse.data.speech) {
        speakText(geminiResponse.data.speech);
      }

      return {
        success: true,
        fixedCode: fixedCode !== codeToFix ? fixedCode : null,
        message: aiMessage
      };
    } catch (error) {
      console.error("Error fixing code:", error);

      // FIX: Better error message
      let errorMsg = "Unknown error occurred";
      if (error && typeof error === 'object') {
        errorMsg = error.message || JSON.stringify(error);
      } else if (error) {
        errorMsg = String(error);
      }

      setAiMessages(prev => [...prev, {
        id: `error-fix-${Date.now()}-${Math.random()}`,
        type: "ai",
        message: `😔 Sorry, I couldn't fix your code right now. ${errorMsg}`,
        timestamp: new Date().toLocaleTimeString()
      }]);

      return { success: false, error: errorMsg };
    } finally {
      setIsAIFixing(false);
    }
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

      // Get the response from Gemini
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalCode,
          fixedCode,
          language: detectedLang || language
        })
      });

      const data = await response.json();
      const displayMessage = data.display || "I've updated your code!";
      const speechMessage = data.speech || "";
      const errors = data.errors || [];

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

      // Add message to chat
      setAiMessages(prev => [...prev, {
        id: `apply-explain-${Date.now()}-${Math.random()}`,
        type: "ai",
        message: displayMessage,
        timestamp: new Date().toLocaleTimeString()
      }]);

      // Speak the explanation
      if (speechMessage) {
        speakText(speechMessage);
      }

    } catch (error) {
      console.error("Apply & Explain error:", error);

      // Simple success message even if explanation fails
      setAiMessages(prev => [...prev, {
        id: `apply-success-${Date.now()}-${Math.random()}`,
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
      id: `apply-fixed-${Date.now()}-${Math.random()}`,
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
        id: `file-upload-${Date.now()}-${Math.random()}`,
        type: "user",
        message: `📁 I uploaded a file: **${file.name}** (${detectedLang})`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    };
    reader.readAsText(file);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const message = userInput.trim();

    // Clear input immediately
    setUserInput("");

    // Add user message to local state
    setAiMessages(prev => [...prev, {
      id: `user-${Date.now()}-${Math.random()}`,
      type: "user",
      message: message,
      timestamp: new Date().toLocaleTimeString()
    }]);

    // Check if message contains code
    const extractedCode = extractCodeFromMessage(message);
    const codeToFix = extractedCode || code;

    const wantsFix = message.toLowerCase().includes('fix') ||
      message.toLowerCase().includes('help') ||
      message.toLowerCase().includes('error') ||
      message.includes('```') ||
      extractedCode !== null;

    setIsAiTyping(true);

    try {
      if (wantsFix && codeToFix) {
        // Fix code with AI
        await handleFixWithOpenRouter(codeToFix, message);
      } else {
        // General chat - use Gemini
        const geminiResponse = await axios.post("/api/gemini", {
          userMessage: message,
          language
        });

        const aiMessage = geminiResponse.data.display || "I'm here to help with your coding questions!";

        setAiMessages(prev => [...prev, {
          id: `ai-${Date.now()}-${Math.random()}`,
          type: "ai",
          message: aiMessage,
          timestamp: new Date().toLocaleTimeString()
        }]);

        // Speak the response
        if (geminiResponse.data.speech) {
          speakText(geminiResponse.data.speech);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setAiMessages(prev => [...prev, {
        id: `error-${Date.now()}-${Math.random()}`,
        type: "ai",
        message: "😔 Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  /* ── Handle Next Module ── */
  const handleNextModule = () => {
    if (!practiceData) {
      setAiMessages(prev => [...prev, {
        id: `no-practice-${Date.now()}-${Math.random()}`,
        type: "ai",
        message: "⚠️ No practice session found. Please start from the roadmap!",
        timestamp: new Date().toLocaleTimeString()
      }]);
      return;
    }

    // Get current roadmap from localStorage
    const roadmapStr = localStorage.getItem('currentRoadmap');
    if (!roadmapStr) {
      setAiMessages(prev => [...prev, {
        id: `no-roadmap-${Date.now()}-${Math.random()}`,
        type: "ai",
        message: "⚠️ No roadmap found. Please go back to the roadmap page!",
        timestamp: new Date().toLocaleTimeString()
      }]);
      return;
    }

    try {
      const roadmap = JSON.parse(roadmapStr);
      const currentWeekNumber = practiceData.weekNumber || 1;
      const currentTopicIndex = practiceData.topicIndex || 0;

      // Find current week
      const currentWeek = roadmap.weeks.find(w => w.week === currentWeekNumber);
      if (!currentWeek || !currentWeek.topics) {
        setAiMessages(prev => [...prev, {
          id: `week-not-found-${Date.now()}-${Math.random()}`,
          type: "ai",
          message: "⚠️ Week not found in roadmap!",
          timestamp: new Date().toLocaleTimeString()
        }]);
        return;
      }

      // Get all topics for the week (flatten day-by-day structure if needed)
      let allTopics = [];
      currentWeek.topics.forEach(topic => {
        if (typeof topic === 'object' && topic.name) {
          allTopics.push(topic);
        }
      });

      // Find next topic
      const nextTopicIndex = currentTopicIndex + 1;

      if (nextTopicIndex < allTopics.length) {
        // Load next topic in same week
        const nextTopic = allTopics[nextTopicIndex];
        const nextPracticeData = {
          code: nextTopic.codeExample || '',
          topicName: nextTopic.name,
          explanation: nextTopic.explanation,
          codeExplanation: nextTopic.codeExplanation,
          language: roadmap.userData.technology.toLowerCase(),
          weekNumber: currentWeekNumber,
          topicIndex: nextTopicIndex
        };

        localStorage.setItem('practiceCode', JSON.stringify(nextPracticeData));

        // Reload the page to load new topic
        window.location.reload();
      } else {
        // No more topics in this week
        setAiMessages(prev => [...prev, {
          id: `week-complete-${Date.now()}-${Math.random()}`,
          type: "ai",
          message: `🎉 **Congratulations!** You've completed all topics in Week ${currentWeekNumber}!\n\nGo back to the roadmap to mark this week as complete and unlock the next week!`,
          timestamp: new Date().toLocaleTimeString()
        }]);
        speakText(`Congratulations! You've completed all topics in Week ${currentWeekNumber}. Go back to the roadmap to continue.`);
      }
    } catch (error) {
      console.error('Error loading next module:', error);
      setAiMessages(prev => [...prev, {
        id: `error-next-${Date.now()}-${Math.random()}`,
        type: "ai",
        message: "😔 Sorry, I couldn't load the next module. Please try again!",
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
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
      className="flex flex-col h-screen"
      style={{
        backgroundColor: "#0B0B0F",
        color: "#EDEDED",
        marginLeft: isSidebarOpen ? "256px" : "0",
        transition: "margin-left 0.3s ease"
      }}
    >
      <ChatSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* ── HEADER ── */}
      <div
        className="h-14 flex items-center px-4 gap-3"
        style={{ backgroundColor: "#0f1117", borderBottom: "1px solid #2a2e3a" }}
      >
        {/* Progress indicator during explanation */}
        {canResumeExplanation && explanationSteps.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-600/20 border border-blue-600/30">
            <span className="text-xs text-blue-400 font-medium">
              Step {currentExplanationStep + 1}/{explanationSteps.length}
            </span>
            {isExplanationPaused && (
              <span className="text-xs text-yellow-400">⏸ Paused</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="h-9 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] bg-[#1a1c22] text-[#EDEDED] border-[#2a2e3a]"
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
            className={`h-9 px-5 rounded-lg font-medium text-sm bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] text-white flex items-center gap-2 transition-all duration-200 ${isRunning || waitingForInput
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

          {/* Explain Code Button */}
          <button
            onClick={explainCodeSynchronized}
            disabled={isExplaining || isAIFixing}
            className={`h-9 px-4 rounded-lg font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-all ${isExplaining || isAIFixing ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
              }`}
            title="Explain code step by step with highlights"
          >
            {isExplaining ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Explaining…</span>
              </>
            ) : (
              <>
                <FaLightbulb />
                <span>Explain Code</span>
              </>
            )}
          </button>

          {/* AI Fix Button */}
          <button
            onClick={() => handleFixWithOpenRouter(code)}
            disabled={isAIFixing}
            className={`h-9 px-4 rounded-lg font-medium text-sm bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 transition-all ${isAIFixing ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
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

          {/* Next Module Button - Only show if in practice mode */}
          {showNextModule && (
            <button
              onClick={handleNextModule}
              className="h-9 px-4 rounded-lg font-medium text-sm bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 transition-all hover:scale-105"
              title="Go to next topic in roadmap"
            >
              <FaRocket />
              <span>Next Module</span>
            </button>
          )}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          {/* Chat History Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#FF5A1F]/10 text-gray-400 hover:text-[#FF5A1F] transition-all"
            style={{ backgroundColor: "#1a1c22" }}
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
              style={{ backgroundColor: "#1a1c22" }}
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
      <div ref={mainContainerRef} className="flex flex-1 overflow-hidden">
        {/* ── LEFT: editor + bottom panel ── */}
        <div ref={leftPanelRef} className="flex flex-col flex-1 overflow-hidden">
          {/* editor */}
          <div className="flex-1 overflow-hidden" style={{ backgroundColor: "#1a1c22" }}>
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
                className="flex flex-col"
                style={{ height: panelHeight, backgroundColor: "#252526", borderTop: "1px solid #2a2e3a" }}
              >
                <div
                  className="flex items-center px-2 py-1 gap-0"
                  style={{ borderBottom: "1px solid #2a2e3a", backgroundColor: "#1e1e1e" }}
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
                          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "#1e1e1e" }}>
                            <span style={{ color: "#6a737d", fontStyle: "italic", fontSize: "13px", fontFamily: "monospace" }}>
                              Click ▶ Run to execute…
                            </span>
                          </div>
                        )}
                        {terminalLines.length > 0 && (
                          <div
                            className="overflow-auto p-2 space-y-[1px]"
                            style={{ maxHeight: "80px", borderTop: "1px solid #2a2e3a", backgroundColor: "#1e1e1e", fontFamily: "monospace", fontSize: "12px" }}
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
                      style={{ backgroundColor: "#1e1e1e", fontFamily: "monospace", fontSize: "13px" }}
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
                    <div className="h-full overflow-auto p-3 space-y-2" style={{ backgroundColor: "#1e1e1e" }}>
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
                    <div className="h-full overflow-auto p-4 space-y-2" style={{ backgroundColor: "#1e1e1e", fontFamily: "monospace", fontSize: "12px" }}>
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
              className="w-[3px] cursor-col-resize hover:bg-[#FF5A1F]/60 transition-colors"
              style={{ backgroundColor: "#2a2e3a" }}
              onMouseDown={(e) => { e.preventDefault(); setIsResizingRight(true); }}
            />

            <div
              className="flex flex-col"
              style={{ width: rightPanelWidth, backgroundColor: "#0f1117", borderLeft: "1px solid #2a2e3a" }}
            >
              {/* avatar */}
              <div
                className="flex flex-col items-center justify-center p-6"
                style={{ height: "30%", borderBottom: "1px solid #2a2e3a" }}
              >
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] p-[2px]">
                    <div className="w-full h-full rounded-full bg-[#1a1c22] flex items-center justify-center">
                      <FaRobot className="text-4xl text-[#FF5A1F]" />
                    </div>
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 flex items-center justify-center gap-[2px]">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-[3px] bg-[#FF5A1F] rounded-full ${isAiSpeaking ? "animate-wave" : "opacity-20"}`}
                        style={{ height: isAiSpeaking ? `${Math.random() * 24 + 4}px` : "4px", animationDelay: `${i * 0.05}s` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-full text-center mt-8">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h3 className="text-white font-semibold text-sm">AI Mentor</h3>
                    <span className={`w-2 h-2 rounded-full ${isAiSpeaking ? "bg-[#FF5A1F] animate-pulse" : "bg-green-400"}`} />
                    {isAiSpeaking && (
                      <button onClick={stopSpeaking} className="text-gray-400 hover:text-[#FF5A1F]">
                        <FaStop size={10} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{isAiSpeaking ? "Speaking…" : "Always here to help"}</p>
                </div>
              </div>

              {/* chat messages */}
              <div className="flex flex-col" style={{ height: "70%" }}>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {aiMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
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
                                p({ node, children, ...props }) {
                                  return (
                                    <p className="mb-2 last:mb-0" {...props}>
                                      {children}
                                    </p>
                                  );
                                },
                                strong({ node, children, ...props }) {
                                  return (
                                    <strong className="font-bold text-[#FF5A1F]" {...props}>
                                      {children}
                                    </strong>
                                  );
                                },
                                ul({ node, children, ...props }) {
                                  return (
                                    <ul className="list-disc list-inside my-2 space-y-1" {...props}>
                                      {children}
                                    </ul>
                                  );
                                },
                                ol({ node, children, ...props }) {
                                  return (
                                    <ol className="list-decimal list-inside my-2 space-y-1" {...props}>
                                      {children}
                                    </ol>
                                  );
                                },
                                li({ node, children, ...props }) {
                                  return (
                                    <li className="ml-2" {...props}>
                                      {children}
                                    </li>
                                  );
                                },
                                code({ node, inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  return !inline && match ? (
                                    <pre className="bg-[#0a0c12] p-3 rounded-lg overflow-x-auto my-3 border border-[#2a2e3a]">
                                      <code className={`${className} text-green-400 text-xs`} {...props}>
                                        {children}
                                      </code>
                                    </pre>
                                  ) : (
                                    <code className="bg-[#2a2e3a] px-1.5 py-0.5 rounded text-[#4ec9b0] font-mono text-xs" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                                a({ node, children, href, ...props }) {
                                  return (
                                    <a href={href} className="text-[#FF5A1F] hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props}>
                                      {children}
                                    </a>
                                  );
                                },
                                h1({ node, children, ...props }) {
                                  return (
                                    <h1 className="text-base font-bold mb-2 text-white" {...props}>
                                      {children}
                                    </h1>
                                  );
                                },
                                h2({ node, children, ...props }) {
                                  return (
                                    <h2 className="text-sm font-bold mb-2 text-white" {...props}>
                                      {children}
                                    </h2>
                                  );
                                },
                                h3({ node, children, ...props }) {
                                  return (
                                    <h3 className="text-xs font-bold mb-1 text-gray-200" {...props}>
                                      {children}
                                    </h3>
                                  );
                                },
                                blockquote({ node, children, ...props }) {
                                  return (
                                    <blockquote className="border-l-2 border-[#FF5A1F] pl-3 my-2 italic text-gray-400" {...props}>
                                      {children}
                                    </blockquote>
                                  );
                                },
                              }}
                            >
                              {msg.message}
                            </ReactMarkdown>

                            {/* Buttons for fixed code */}
                            {msg.showFixButtons && msg.fixedCode && (
                              <div className="mt-4 flex gap-2">
                                <button
                                  onClick={() => applyFixedCode(msg.fixedCode)}
                                  disabled={isExplaining}
                                  className="px-3 py-1.5 rounded-lg text-xs bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-1"
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
                                  className="px-3 py-1.5 rounded-lg text-xs bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-1"
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
                  ))}

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

                {/* chat input with file upload and voice */}
                <div className="p-3 border-t border-[#2a2e3a]" style={{ backgroundColor: "#0a0c12" }}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Ask me anything about coding..."
                      className="flex-1 h-9 px-3 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] bg-[#1a1c22] text-[#EDEDED] border border-[#2a2e3a]"
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

                    {/* Show Pause/Resume/Stop during explanation, otherwise show Send */}
                    {canResumeExplanation ? (
                      <>
                        {/* Pause or Resume button */}
                        {isExplanationPaused ? (
                          <button
                            onClick={resumeExplanation}
                            className="w-9 h-9 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-all hover:scale-105"
                            title="Resume explanation"
                          >
                            <span style={{ fontSize: "14px" }}>▶</span>
                          </button>
                        ) : (
                          <button
                            onClick={pauseExplanation}
                            disabled={!isExplaining}
                            className="w-9 h-9 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white flex items-center justify-center transition-all hover:scale-105"
                            title="Pause explanation"
                          >
                            <span style={{ fontSize: "14px" }}>⏸</span>
                          </button>
                        )}

                        {/* Stop button */}
                        <button
                          onClick={stopExplanation}
                          className="w-9 h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all hover:scale-105"
                          title="Stop explanation"
                        >
                          <FaStop style={{ fontSize: "11px" }} />
                        </button>
                      </>
                    ) : (
                      /* Normal Send button */
                      <button
                        onClick={handleSendMessage}
                        disabled={isAIFixing || isExplaining || aiTyping}
                        className={`w-9 h-9 rounded-lg bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] text-white flex items-center justify-center transition-all ${isAIFixing || isExplaining || aiTyping ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                          }`}
                      >
                        {isAIFixing || isExplaining || aiTyping ? <FaSpinner className="animate-spin" /> : <FaPaperPlane style={{ fontSize: "11px" }} />}
                      </button>
                    )}
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

                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-600">
                    {isListening ? (
                      <>
                        <FaMicrophone className="text-red-500 animate-pulse" />
                        <span className="text-red-500 font-semibold">🎤 Listening... Speak now!</span>
                      </>
                    ) : canResumeExplanation ? (
                      <>
                        {isExplanationPaused ? (
                          <>
                            <span className="text-yellow-400">⏸</span>
                            <span className="text-yellow-400 font-semibold">Paused - Ask questions or click Resume</span>
                          </>
                        ) : (
                          <>
                            <FaLightbulb className="text-blue-400 animate-pulse" />
                            <span className="text-blue-400 font-semibold">Explaining step {currentExplanationStep + 1}/{explanationSteps.length} - Click Pause to ask questions</span>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <FaVolumeUp className={isAiSpeaking ? "text-[#FF5A1F] animate-pulse" : ""} />
                        <span>{isAiSpeaking ? "Speaking…" : "Ask questions, paste code, or use voice"}</span>
                      </>
                    )}
                    {isAiSpeaking && !canResumeExplanation && (
                      <button onClick={stopSpeaking} className="ml-auto text-gray-500 hover:text-[#FF5A1F]">
                        Stop
                      </button>
                    )}
                  </div>
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