export type ScenarioCategory = 
  | 'Core HIS'
  | 'HIS Action'
  | 'Broadcast'
  | 'Queue API'
  | 'Guardrail'
  | 'Compliance'
  | 'OCR + EMR'
  | 'PII Masking'
  | 'Security'
  | 'Billing'
  | 'SIMRS Trigger'
  | 'Location WA';

export interface ScenarioStep {
  userReply: string;
  aiResponse: string;
  chips: string[];
  richComponent?: 
    | 'booking_success'
    | 'reschedule_success'
    | 'reminder_card'
    | 'queue_status'
    | 'emergency_alert'
    | 'ocr_parsed'
    | 'lab_portal'
    | 'verification_flow'
    | 'billing_breakdown'
    | 'csat_form'
    | 'clinic_list';
  payloadData?: {
    endpoint?: string;
    method?: string;
    status?: number;
    requestBody?: Record<string, unknown>;
    responseBody?: Record<string, unknown>;
    executionTimeMs?: number;
    guardrailStatus?: 'PASS' | 'FLAGGED' | 'ESCALATED' | 'PII_MASKED';
  };
}

export interface Scenario {
  id: number;
  title: string;
  tag: ScenarioCategory;
  desc: string;
  initialUser: string;
  steps: ScenarioStep[];
  technicalSpec: {
    systemTrigger: string;
    hisIntegration: string;
    cekatModule: string;
    securityLevel: string;
  };
}
