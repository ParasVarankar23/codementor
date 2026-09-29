/**
 * ChatContextService - Save and load chat context for practice sessions
 * Stores chat messages and explanation state so users can resume later
 */

class ChatContextService {
  constructor() {
    this.storageKey = 'chatContext';
  }

  /**
   * Save current chat context to localStorage
   */
  saveChatContext(practiceData, messages, explanationState = {}) {
    if (!practiceData) {
      console.warn('No practice data to save chat context');
      return { success: false };
    }

    try {
      const contextKey = this.getContextKey(
        practiceData.weekNumber, 
        practiceData.topicIndex
      );

      const context = {
        practiceData,
        messages: messages.map(msg => ({
          id: msg.id,
          type: msg.type,
          message: msg.message,
          timestamp: msg.timestamp,
          fixedCode: msg.fixedCode,
          originalCode: msg.originalCode,
          showFixButtons: msg.showFixButtons
        })),
        explanationState: {
          currentStep: explanationState.currentStep || 0,
          totalSteps: explanationState.totalSteps || 0,
          isPaused: explanationState.isPaused || false,
          steps: explanationState.steps || []
        },
        savedAt: new Date().toISOString()
      };

      localStorage.setItem(contextKey, JSON.stringify(context));
      console.log('✅ Chat context saved:', contextKey);
      
      return { success: true, contextKey };
    } catch (error) {
      console.error('❌ Error saving chat context:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load chat context for a specific topic
   */
  loadChatContext(weekNumber, topicIndex) {
    try {
      const contextKey = this.getContextKey(weekNumber, topicIndex);
      const contextStr = localStorage.getItem(contextKey);

      if (!contextStr) {
        return { success: false, message: 'No saved context found' };
      }

      const context = JSON.parse(contextStr);
      console.log('✅ Chat context loaded:', contextKey);
      
      return { 
        success: true, 
        context,
        savedAt: context.savedAt 
      };
    } catch (error) {
      console.error('❌ Error loading chat context:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if chat context exists for a topic
   */
  hasContext(weekNumber, topicIndex) {
    const contextKey = this.getContextKey(weekNumber, topicIndex);
    return localStorage.getItem(contextKey) !== null;
  }

  /**
   * Clear chat context for a specific topic
   */
  clearContext(weekNumber, topicIndex) {
    try {
      const contextKey = this.getContextKey(weekNumber, topicIndex);
      localStorage.removeItem(contextKey);
      console.log('✅ Chat context cleared:', contextKey);
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing chat context:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all chat contexts
   */
  clearAllContexts() {
    try {
      const keys = Object.keys(localStorage);
      const contextKeys = keys.filter(key => key.startsWith(this.storageKey));
      
      contextKeys.forEach(key => localStorage.removeItem(key));
      
      console.log(`✅ Cleared ${contextKeys.length} chat contexts`);
      return { success: true, count: contextKeys.length };
    } catch (error) {
      console.error('❌ Error clearing all contexts:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all saved contexts
   */
  getAllContexts() {
    try {
      const keys = Object.keys(localStorage);
      const contextKeys = keys.filter(key => key.startsWith(this.storageKey));
      
      const contexts = contextKeys.map(key => {
        try {
          const context = JSON.parse(localStorage.getItem(key));
          return {
            key,
            weekNumber: context.practiceData?.weekNumber,
            topicIndex: context.practiceData?.topicIndex,
            topicName: context.practiceData?.topicName,
            messageCount: context.messages?.length || 0,
            savedAt: context.savedAt
          };
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      return { success: true, contexts };
    } catch (error) {
      console.error('❌ Error getting all contexts:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate unique key for chat context
   */
  getContextKey(weekNumber, topicIndex) {
    return `${this.storageKey}_week${weekNumber}_topic${topicIndex}`;
  }

  /**
   * Auto-save chat context (debounced)
   */
  autoSave(practiceData, messages, explanationState) {
    // Clear any existing timeout
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    // Save after 2 seconds of inactivity
    this.autoSaveTimeout = setTimeout(() => {
      this.saveChatContext(practiceData, messages, explanationState);
    }, 2000);
  }
}

export default new ChatContextService();
