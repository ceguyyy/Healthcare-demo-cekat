export type TriggerType = 'INBOUND_USER' | 'OUTBOUND_SYSTEM';

export interface CardItem {
  label: string;
  val: string;
}

export interface CardData {
  title: string;
  sub: string;
  items: CardItem[];
  status: string;
}

export interface Step {
  userReply: string;
  aiResponse: string;
  chips?: string[];
  enableCard?: boolean;
  card?: CardData;
}

export interface Scenario {
  id: string;
  categoryId: string;
  name: string;
  title: string;
  tag: string;
  saAuthor?: string;
  triggerType: TriggerType;
  outboundPill?: string;
  description: string;
  cekatComponents: string[];
  apiScopes: string[];
  ruleNote: string;
  stepsDetail: string[];
  initialText: string;
  hideInitialMessage?: boolean;
  steps: Step[];
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge: string;
  isCustom?: boolean;
}

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'uuid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
};
