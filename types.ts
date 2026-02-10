import { LucideIcon } from 'lucide-react';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
}

export interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export enum LegalAssistantStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  startTime: number;
  messages: ChatMessage[];
  areaOfInterest?: string;
  deviceInfo: string;
}

export interface ChatOption {
  id: string;
  label: string;
  prompt: string;
}