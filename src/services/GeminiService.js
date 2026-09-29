class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || null;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';
    this.lastRequestTime = 0;
    this.minRequestInterval = 2000;
    this.activeRequests = new Set();
  }

  async throttleRequest(requestId) {
    if (this.activeRequests.has(requestId)) {
      throw new Error('Request already in progress. Please wait.');
    }

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.activeRequests.add(requestId);
    this.lastRequestTime = Date.now();
  }

  releaseRequest(requestId) {
    this.activeRequests.delete(requestId);
  }

  async generateRoadmap(formData) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const requestId = `roadmap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      await this.throttleRequest(requestId);
      const prompt = this.buildRoadmapPrompt(formData);

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 16384
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Gemini API request failed');
      }

      const result = await response.json();
      
      if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
        const aiResponse = result.candidates[0].content.parts[0].text;
        const roadmap = this.parseGeminiResponse(aiResponse, formData);

        return {
          success: true,
          requestId,
          roadmap,
          model: 'gemini-2.0-flash-exp',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Invalid response from Gemini API');
      }
    } catch (error) {
      if (error.message.includes('429') || error.message.includes('quota')) {
        throw new Error('AI service temporarily unavailable. Please try again in a few minutes.');
      }
      throw error;
    } finally {
      this.releaseRequest(requestId);
    }
  }

  buildRoadmapPrompt(data) {
    const weeksNeeded = data.timeline === '1 Month' ? 4 : data.timeline === '2 Months' ? 8 : 12;
    const hoursPerDay = parseInt(data.dailyHours.replace(/[^0-9]/g, '')) || 1;
    const hoursPerWeek = hoursPerDay * 7;

    return `You are an expert coding mentor. Create a ${data.timeline} learning roadmap for ${data.technology}.

**User Profile:**
- Technology: ${data.technology}
- Role: ${data.persona}
- Level: ${data.proficiency}
- Daily Hours: ${data.dailyHours}
- Timeline: ${data.timeline}

**Requirements:**
Generate EXACTLY ${weeksNeeded} weeks with this JSON structure:

{
  "weeks": [
    {
      "week": 1,
      "title": "Week 1: [Specific Focus]",
      "focus": "Brief description of week's focus",
      "topics": [
        {
          "name": "Topic Name",
          "explanation": "Simple 2-3 sentence explanation",
          "codeExample": "// Working code example\\nconst example = 'code';",
          "codeExplanation": "Brief explanation of what the code does"
        }
      ],
      "projects": ["Project description"],
      "estimatedHours": "${hoursPerWeek}h",
      "adaptiveHints": ["Tip 1", "Tip 2", "Tip 3"]
    }
  ]
}

**Content Rules:**
1. Week 1: NO projects (empty array [])
2. Weeks 2-${weeksNeeded}: 1 project per week
3. ${this.getTopicsPerWeek(hoursPerDay, data.timeline)} topics per week
4. Adjust depth based on ${data.proficiency} level
5. ${this.getContentDepth(hoursPerDay, data.timeline)}

**Technology-Specific (${data.technology}):**
${this.getTechGuidance(data.technology)}

Return ONLY valid JSON. No markdown, no extra text.`;
  }

  getTopicsPerWeek(hoursPerDay, timeline) {
    const intensity = hoursPerDay * (timeline === '1 Month' ? 4 : timeline === '2 Months' ? 8 : 12);
    
    if (intensity <= 20) return '8-10';
    if (intensity <= 40) return '6-8';
    if (intensity <= 80) return '5-7';
    return '4-6';
  }

  getContentDepth(hoursPerDay, timeline) {
    const intensity = hoursPerDay * (timeline === '1 Month' ? 4 : timeline === '2 Months' ? 8 : 12);
    
    if (intensity <= 20) return 'Brief explanations, simple examples, fast pace';
    if (intensity <= 40) return 'Moderate detail, practical examples, steady pace';
    if (intensity <= 80) return 'Good detail, multiple examples, balanced pace';
    return 'Deep explanations, comprehensive examples, thorough pace';
  }

  getTechGuidance(tech) {
    const guides = {
      'html+css': 'Semantic HTML, Flexbox, Grid, responsive design, animations',
      'javascript': 'ES6+, DOM manipulation, async/await, APIs, modules',
      'reactjs': 'Components, hooks, state management, routing, API integration',
      'nodejs': 'Express, REST APIs, databases, authentication, deployment',
      'python': 'Syntax, data structures, OOP, libraries, file handling',
      'java': 'OOP, collections, Spring framework, design patterns',
      'c++': 'Syntax, pointers, STL, memory management, optimization'
    };

    return guides[tech.toLowerCase()] || 'Core concepts, best practices, real-world projects';
  }

  parseGeminiResponse(aiResponse, formData) {
    try {
      let cleaned = aiResponse.trim()
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .replace(/^json\s*/g, '')
        .trim();

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      let jsonStr = jsonMatch[0]
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/\n/g, ' ')
        .replace(/\r/g, '');

      const parsed = JSON.parse(jsonStr);

      if (!parsed.weeks || !Array.isArray(parsed.weeks) || parsed.weeks.length === 0) {
        throw new Error('Invalid weeks structure');
      }

      return {
        weeks: parsed.weeks,
        userData: formData
      };
    } catch (error) {
      console.error('Parse error:', error.message);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }

  getServiceStatus() {
    return {
      activeRequests: this.activeRequests.size,
      canMakeRequest: this.activeRequests.size === 0 && 
        (Date.now() - this.lastRequestTime) >= this.minRequestInterval,
      hasApiKey: !!this.apiKey
    };
  }
}

export default GeminiService;
