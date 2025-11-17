
export interface Preferences {
    interests: string[];
    textModel: string;
    imageModel: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  type: 'text' | 'image' | 'error';
  content: string;
  sources?: { uri: string; title: string }[];
  imageUrl?: string;
  suggestions?: string[];
}

export interface Visitor {
    id?: string;
    name: string;
    searches: string[];
    preferences?: Preferences;
    memories?: string[];
}

export interface LiveTranscription {
    sender: 'user' | 'ai';
    text: string;
}