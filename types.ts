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
  AWAITING_FEEDBACK = 'AWAITING_FEEDBACK', // Usuario respondiendo encuesta
  SUMMARIZING = 'SUMMARIZING', // Generando resumen final
  FALLBACK_MODE = 'FALLBACK_MODE', // Modo manual cuando fallan las APIs
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface LeadSummary {
  clientName: string;
  contactInfo: string;
  legalCategory: string; // Penal, Civil, Laboral, etc.
  caseSummary: string; // Resumen de hechos
  urgencyLevel: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA';
  recommendedAction: string; // Sugerencia de la IA para el abogado humano
}

export interface ChatSession {
  id: string;
  startTime: number;
  messages: ChatMessage[];
  areaOfInterest?: string;
  deviceInfo: string;
  leadSummary?: LeadSummary;
  // Nuevos campos de feedback
  clientSatisfaction?: 'positive' | 'neutral' | 'negative';
  requiresFollowUp?: boolean; // Si el usuario pidió explícitamente ser contactado
}

export interface ChatOption {
  id: string;
  label: string;
  prompt: string;
  action?: 'link' | 'flow'; // Para diferenciar acciones en modo fallback
  value?: string; // URL o ID del siguiente paso del flujo
}

export interface NewsSource {
  title: string;
  uri: string;
}

export interface NewsResult {
  text: string;
  sources: NewsSource[];
}