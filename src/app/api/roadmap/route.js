import { NextResponse } from 'next/server';
import GeminiService from '../../../services/GeminiService';

export async function POST(request) {
  try {
    const formData = await request.json();

    // Validate required fields
    if (!formData.technology || !formData.proficiency || !formData.timeline) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Generate roadmap
    const geminiService = new GeminiService();
    const result = await geminiService.generateRoadmap(formData);

    return NextResponse.json({
      success: true,
      roadmap: result.roadmap,
      metadata: {
        requestId: result.requestId,
        model: result.model,
        timestamp: result.timestamp
      }
    });
  } catch (error) {
    console.error('Roadmap generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate roadmap' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    
    if (hasApiKey) {
      const geminiService = new GeminiService();
      const status = geminiService.getServiceStatus();
      
      return NextResponse.json({
        status: 'operational',
        service: 'Gemini AI',
        ...status
      });
    } else {
      return NextResponse.json(
        {
          status: 'not_configured',
          service: 'Gemini AI',
          message: 'API key not configured'
        },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}
