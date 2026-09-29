// utils/speech.js

let speechSynth = null;
let currentUtterance = null;
let isSpeakingNow = false;

if (typeof window !== 'undefined') {
    speechSynth = window.speechSynthesis;
}

export const speakText = (text, onStart, onEnd, onError) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.warn('Speech synthesis not supported');
        return null;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    isSpeakingNow = false;
    currentUtterance = null;
    
    // Clean the text for speech - keep code-related terms clear
    const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`/g, '')
        .replace(/#{1,6}\s+/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.85; // Slightly slower for better clarity
    utterance.pitch = 1.1;
    utterance.volume = 1;
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Try to find a good voice for coding explanations
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
    
    // Store current utterance
    currentUtterance = utterance;
    
    // Handle events
    utterance.onstart = () => {
        isSpeakingNow = true;
        if (onStart) onStart();
    };
    
    utterance.onend = () => {
        isSpeakingNow = false;
        currentUtterance = null;
        if (onEnd) onEnd();
    };
    
    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        isSpeakingNow = false;
        currentUtterance = null;
        if (onError) onError(event);
    };
    
    // Speak
    window.speechSynthesis.speak(utterance);
    
    return utterance;
};

export const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        isSpeakingNow = false;
        currentUtterance = null;
    }
};

export const isSpeaking = () => {
    return isSpeakingNow;
};

// Initialize voices (for browsers that need it)
if (typeof window !== 'undefined') {
    window.speechSynthesis?.getVoices();
    
    // Handle voices loaded async
    if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }
}