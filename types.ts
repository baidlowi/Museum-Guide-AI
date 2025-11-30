
export interface Artifact {
  id: string;
  title: string;
  artist: string;
  year: string;
  period: string;
  description: string;
  imageUrl: string;
  fullDetails: string; // Context for the AI
  suggestedQuestions: string[];
  mapPosition: {
    top: string;
    left: string;
    roomName: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

export type ViewMode = 'entry' | 'room' | 'artifact';
