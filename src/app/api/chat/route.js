// app/api/chat/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { message, code, language, userId, chatId } = await request.json();

    // Here you would integrate with your AI service (OpenAI, Claude, Gemini, etc.)
    // For now, we'll return a smart response based on the input
    
    let response = "";
    let metadata = {};

    // Check if the message contains code or is asking for help
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/;
    const hasCodeBlock = codeBlockRegex.test(message);
    const extractedCode = hasCodeBlock ? message.match(codeBlockRegex)[1].trim() : null;

    if (hasCodeBlock && extractedCode) {
      // This is a code snippet, provide help
      response = `I see you've shared some ${language} code. What would you like me to help you with? I can:\n\n` +
                `- 🔍 Explain what the code does\n` +
                `- 🐛 Help debug any issues\n` +
                `- 💡 Suggest improvements\n` +
                `- 📚 Explain specific concepts\n\n` +
                `Just let me know what you need!`;
      
      metadata = {
        type: "code-help",
        language,
        hasCode: true
      };
    } else if (message.toLowerCase().includes('explain') || message.toLowerCase().includes('what does')) {
      // Explanation request
      response = `I'd be happy to explain! Could you please specify which part of the code or concept you'd like me to explain? For example:\n\n` +
                `- "Explain this function"\n` +
                `- "What does this loop do?"\n` +
                `- "How does this algorithm work?"\n\n` +
                `The more specific you are, the better I can help!`;
      
      metadata = {
        type: "explanation",
        requiresClarification: true
      };
    } else if (message.toLowerCase().includes('debug') || message.toLowerCase().includes('error') || message.toLowerCase().includes('not working')) {
      // Debugging request
      response = `I'll help you debug! To give you the best assistance, please share:\n\n` +
                `1. The code you're working with\n` +
                `2. What you expect it to do\n` +
                `3. What's actually happening (error messages, unexpected output)\n\n` +
                `You can paste your code here and I'll analyze it!`;
      
      metadata = {
        type: "debug",
        needsCode: true
      };
    } else if (message.toLowerCase().includes('improve') || message.toLowerCase().includes('optimize') || message.toLowerCase().includes('better')) {
      // Optimization request
      response = `I can help optimize your code! Please share your code and let me know what aspects you'd like to improve:\n\n` +
                `- ⚡ Performance\n` +
                `- 📖 Readability\n` +
                `- 🏗️ Structure\n` +
                `- 🔒 Security\n\n` +
                `Paste your code and I'll provide suggestions!`;
      
      metadata = {
        type: "optimization",
        needsCode: true
      };
    } else {
      // General conversation
      const responses = [
        `I'm your AI coding mentor! I can help you with:\n\n` +
        `- 💻 Writing and debugging code\n` +
        `- 📚 Learning programming concepts\n` +
        `- 🚀 Best practices and patterns\n` +
        `- 🔧 Project architecture advice\n\n` +
        `What would you like to learn or build today?`,
        
        `Great question! To give you the best answer, could you share more context?\n\n` +
        `- What language/framework are you using?\n` +
        `- What's your specific goal?\n` +
        `- Have you tried anything so far?\n\n` +
        `The more details you provide, the better I can help!`,
        
        `I'm here to help with all things coding! Whether you're:\n\n` +
        `- 🎓 Learning a new language\n` +
        `- 🐛 Debugging an issue\n` +
        `- 🏗️ Designing an application\n` +
        `- 📈 Optimizing performance\n\n` +
        `Just let me know what you need assistance with!`,
        
        `That's an interesting topic! To provide the most helpful response, could you tell me:\n\n` +
        `- Your experience level with this topic\n` +
        `- What specifically you'd like to understand\n` +
        `- Any relevant code or examples\n\n` +
        `I'll tailor my explanation to your needs!`
      ];
      
      response = responses[Math.floor(Math.random() * responses.length)];
      metadata = {
        type: "general",
        needsMoreInfo: true
      };
    }

    return NextResponse.json({
      message: response,
      metadata,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { 
        error: "Failed to process chat",
        message: "😔 I encountered an error. Please try again."
      },
      { status: 500 }
    );
  }
}