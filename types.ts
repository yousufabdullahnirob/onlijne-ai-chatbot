
export enum AppMode {
  Chat = 'Chat',
  ImageGen = 'Image Generation',
  VideoGen = 'Video Generation',
  WebSearch = 'Web Search',
  Live = 'Live Conversation',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 string
  groundingChunks?: any[];
}
