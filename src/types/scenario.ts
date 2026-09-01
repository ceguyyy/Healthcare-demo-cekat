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

export interface FlowInputField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'radio' | 'checkbox';
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
}

export interface FlowData {
  title: string;
  description?: string;
  buttonText?: string;
  fields: FlowInputField[];
  submitResponseText?: string;
}

export interface Step {
  userReply: string;
  aiResponse: string;
  chips?: string[];
  enableCard?: boolean;
  card?: CardData;
  enableFlow?: boolean;
  flow?: FlowData;
}

export interface CustomBranding {
  botName?: string;
  botAvatarUrl?: string;
  subTitle?: string;
  headerColor?: string;
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
  startFromStepIdx?: number;
  customBranding?: CustomBranding;
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
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
