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
  card?: CardData;
  enableCard?: boolean;
}

export interface Scenario {
  id: string;
  categoryId: string; // Belongs to a Category (e.g., 'healthcare', 'banking', etc.)
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
  steps: Step[];
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string; // FontAwesome icon class or Lucide name (e.g. 'fa-hospital', 'fa-building-columns')
  badge: string;
  scenarioCount?: number;
  isCustom?: boolean;
}
