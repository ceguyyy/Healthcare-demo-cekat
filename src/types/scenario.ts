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

export interface LoadBalancerNode {
  id: string;
  name: string;
  endpoint: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  activeRequests: number;
  trafficPercent: number;
}
