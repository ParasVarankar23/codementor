import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

class RoadmapService {
  constructor() {
    this.collectionName = 'roadmaps';
  }

  /**
   * Save a new roadmap to Firebase
   */
  async saveRoadmap(userId, roadmapData, formData) {
    if (!userId) {
      throw new Error('User must be authenticated to save roadmap');
    }

    try {
      // Create a unique ID for the roadmap
      const roadmapId = `${userId}_${Date.now()}`;
      const roadmapRef = doc(db, this.collectionName, roadmapId);

      const roadmapDoc = {
        id: roadmapId,
        userId: userId,
        technology: formData.technology,
        persona: formData.persona,
        proficiency: formData.proficiency,
        dailyHours: formData.dailyHours,
        timeline: formData.timeline,
        weeks: roadmapData.weeks,
        // Store userData for week page compatibility
        userData: {
          technology: formData.technology,
          persona: formData.persona,
          proficiency: formData.proficiency,
          dailyHours: formData.dailyHours,
          timeline: formData.timeline
        },
        unlockedWeek: 1,
        completedWeeks: [],
        progress: {
          totalWeeks: roadmapData.weeks.length,
          completedWeeks: 0,
          currentWeek: 1,
          percentComplete: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp()
      };

      console.log('💾 Attempting to save roadmap to Firestore...');
      
      // Add retry logic for internal state errors
      let retries = 3;
      let lastError;
      
      while (retries > 0) {
        try {
          await setDoc(roadmapRef, roadmapDoc);
          console.log('✅ Roadmap saved to Firebase:', roadmapId);
          return { success: true, roadmapId, roadmap: roadmapDoc };
        } catch (err) {
          lastError = err;
          retries--;
          
          if (err.message.includes('INTERNAL ASSERTION FAILED')) {
            console.warn(`⚠️ Firestore internal error, retrying... (${retries} attempts left)`);
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            // For other errors, don't retry
            throw err;
          }
        }
      }
      
      // If all retries failed, throw the last error
      throw lastError;
      
    } catch (error) {
      console.error('❌ Error saving roadmap:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Don't throw, return error instead to allow graceful degradation
      return { 
        success: false, 
        error: error.message,
        roadmapId: null 
      };
    }
  }

  /**
   * Get a specific roadmap by ID
   */
  async getRoadmap(roadmapId) {
    try {
      const roadmapRef = doc(db, this.collectionName, roadmapId);
      const roadmapSnap = await getDoc(roadmapRef);

      if (!roadmapSnap.exists()) {
        return { success: false, error: 'Roadmap not found' };
      }

      const roadmap = roadmapSnap.data();
      
      // Update last accessed time
      await updateDoc(roadmapRef, {
        lastAccessedAt: serverTimestamp()
      });

      return { success: true, roadmap };
    } catch (error) {
      console.error('❌ Error getting roadmap:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all roadmaps for a user
   */
  async getUserRoadmaps(userId) {
    if (!userId) {
      console.error('❌ getUserRoadmaps: No userId provided');
      throw new Error('User ID is required');
    }

    try {
      console.log('🔍 Querying roadmaps for userId:', userId);
      
      const roadmapsRef = collection(db, this.collectionName);
      
      // Use simple query without orderBy to avoid internal state errors
      const q = query(roadmapsRef, where('userId', '==', userId));

      console.log('📡 Executing Firestore query...');
      
      const querySnapshot = await getDocs(q);
      
      console.log('📦 Query returned', querySnapshot.size, 'documents');
      
      const roadmaps = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Document:', doc.id, data);
        roadmaps.push({
          id: doc.id,
          ...data
        });
      });

      // Sort manually by createdAt (client-side sorting)
      roadmaps.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
        const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
        return bTime - aTime; // Descending order (newest first)
      });

      console.log(`✅ Found ${roadmaps.length} roadmaps for user ${userId}`);
      return { success: true, roadmaps };
    } catch (error) {
      console.error('❌ Error getting user roadmaps:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      return { success: false, error: error.message, roadmaps: [] };
    }
  }

  /**
   * Update roadmap progress
   */
  async updateProgress(roadmapId, updates) {
    try {
      const roadmapRef = doc(db, this.collectionName, roadmapId);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Calculate progress percentage if completedWeeks is updated
      if (updates.completedWeeks) {
        const roadmapSnap = await getDoc(roadmapRef);
        if (roadmapSnap.exists()) {
          const totalWeeks = roadmapSnap.data().progress.totalWeeks;
          updateData['progress.completedWeeks'] = updates.completedWeeks.length;
          updateData['progress.percentComplete'] = Math.round(
            (updates.completedWeeks.length / totalWeeks) * 100
          );
        }
      }

      await updateDoc(roadmapRef, updateData);

      console.log('✅ Roadmap progress updated:', roadmapId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unlock a week
   */
  async unlockWeek(roadmapId, weekNumber) {
    try {
      const roadmapRef = doc(db, this.collectionName, roadmapId);
      
      await updateDoc(roadmapRef, {
        unlockedWeek: weekNumber,
        'progress.currentWeek': weekNumber,
        updatedAt: serverTimestamp()
      });

      console.log(`✅ Week ${weekNumber} unlocked for roadmap ${roadmapId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error unlocking week:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark a week as completed
   */
  async completeWeek(roadmapId, weekNumber) {
    try {
      const roadmapRef = doc(db, this.collectionName, roadmapId);
      const roadmapSnap = await getDoc(roadmapRef);

      if (!roadmapSnap.exists()) {
        throw new Error('Roadmap not found');
      }

      const roadmap = roadmapSnap.data();
      const completedWeeks = roadmap.completedWeeks || [];

      if (!completedWeeks.includes(weekNumber)) {
        completedWeeks.push(weekNumber);
        
        const totalWeeks = roadmap.progress.totalWeeks;
        const percentComplete = Math.round((completedWeeks.length / totalWeeks) * 100);

        await updateDoc(roadmapRef, {
          completedWeeks: completedWeeks,
          'progress.completedWeeks': completedWeeks.length,
          'progress.percentComplete': percentComplete,
          updatedAt: serverTimestamp()
        });

        console.log(`✅ Week ${weekNumber} marked as completed`);
        return { success: true, percentComplete };
      }

      return { success: true, message: 'Week already completed' };
    } catch (error) {
      console.error('❌ Error completing week:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a roadmap
   */
  async deleteRoadmap(roadmapId) {
    try {
      const roadmapRef = doc(db, this.collectionName, roadmapId);
      await deleteDoc(roadmapRef);

      console.log('✅ Roadmap deleted:', roadmapId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting roadmap:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get the most recent roadmap for a user
   */
  async getLatestRoadmap(userId) {
    try {
      const result = await this.getUserRoadmaps(userId);
      
      if (result.success && result.roadmaps.length > 0) {
        return { success: true, roadmap: result.roadmaps[0] };
      }

      return { success: false, error: 'No roadmaps found' };
    } catch (error) {
      console.error('❌ Error getting latest roadmap:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync local storage roadmap to Firebase
   */
  async syncLocalToFirebase(userId) {
    try {
      const localRoadmap = localStorage.getItem('currentRoadmap');
      const localUnlocked = localStorage.getItem('unlockedWeek');

      if (!localRoadmap) {
        return { success: false, message: 'No local roadmap to sync' };
      }

      const roadmapData = JSON.parse(localRoadmap);
      
      // Check if this roadmap already exists in Firebase
      const userRoadmaps = await this.getUserRoadmaps(userId);
      
      // If user has no roadmaps, save the local one
      if (userRoadmaps.roadmaps.length === 0) {
        const formData = {
          technology: roadmapData.userData?.technology || 'Unknown',
          persona: roadmapData.userData?.persona || 'Student',
          proficiency: roadmapData.userData?.proficiency || 'Beginner',
          dailyHours: roadmapData.userData?.dailyHours || '1 hour',
          timeline: roadmapData.userData?.timeline || '1 Month'
        };

        const result = await this.saveRoadmap(userId, roadmapData, formData);
        
        if (result.success) {
          // Update local storage with Firebase ID
          localStorage.setItem('currentRoadmapId', result.roadmapId);
        }

        return result;
      }

      return { success: true, message: 'Roadmap already synced' };
    } catch (error) {
      console.error('❌ Error syncing to Firebase:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new RoadmapService();
