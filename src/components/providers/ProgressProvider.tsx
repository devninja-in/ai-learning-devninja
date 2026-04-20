import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface LearningProgress {
  completedPhases: number[];
  currentPhase: number;
  completedLessons: string[];
  timeSpent: number; // in minutes
  lastAccessed: string;
}

interface ProgressContextType {
  progress: LearningProgress;
  updateProgress: (update: Partial<LearningProgress>) => void;
  completePhase: (phaseId: number) => void;
  completeLesson: (lessonId: string) => void;
  setCurrentPhase: (phaseId: number) => void;
  addTimeSpent: (minutes: number) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}

interface ProgressProviderProps {
  children: ReactNode;
}

const defaultProgress: LearningProgress = {
  completedPhases: [],
  currentPhase: 1,
  completedLessons: [],
  timeSpent: 0,
  lastAccessed: new Date().toISOString(),
};

export function ProgressProvider({ children }: ProgressProviderProps) {
  const [progress, setProgress] = useState<LearningProgress>(defaultProgress);
  const [mounted, setMounted] = useState(false);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem('learning-progress');
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setProgress({ ...defaultProgress, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load progress from localStorage:', error);
    }
    setMounted(true);
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (!mounted) return;

    try {
      localStorage.setItem('learning-progress', JSON.stringify(progress));
    } catch (error) {
      console.warn('Failed to save progress to localStorage:', error);
    }
  }, [progress, mounted]);

  const updateProgress = (update: Partial<LearningProgress>) => {
    setProgress(current => ({
      ...current,
      ...update,
      lastAccessed: new Date().toISOString(),
    }));
  };

  const completePhase = (phaseId: number) => {
    setProgress(current => ({
      ...current,
      completedPhases: [...new Set([...current.completedPhases, phaseId])],
      currentPhase: Math.max(current.currentPhase, phaseId + 1),
      lastAccessed: new Date().toISOString(),
    }));
  };

  const completeLesson = (lessonId: string) => {
    setProgress(current => ({
      ...current,
      completedLessons: [...new Set([...current.completedLessons, lessonId])],
      lastAccessed: new Date().toISOString(),
    }));
  };

  const setCurrentPhase = (phaseId: number) => {
    setProgress(current => ({
      ...current,
      currentPhase: phaseId,
      lastAccessed: new Date().toISOString(),
    }));
  };

  const addTimeSpent = (minutes: number) => {
    setProgress(current => ({
      ...current,
      timeSpent: current.timeSpent + minutes,
      lastAccessed: new Date().toISOString(),
    }));
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ProgressContext.Provider
      value={{
        progress,
        updateProgress,
        completePhase,
        completeLesson,
        setCurrentPhase,
        addTimeSpent,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}