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
