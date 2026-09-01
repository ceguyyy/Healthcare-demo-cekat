import { z } from 'zod';

export const CardItemSchema = z.object({
  label: z.string().optional().default(''),
  val: z.string().optional().default('')
});

export const CardDataSchema = z.object({
  title: z.string().optional().default('Detail Info'),
  sub: z.string().optional().default(''),
  items: z.array(CardItemSchema).optional().default([]),
  status: z.string().optional().default('PROCESSED')
});

export const FlowInputFieldSchema = z.object({
  id: z.string().optional().default(''),
  label: z.string().min(1, 'Label field wajib diisi'),
  type: z.enum(['text', 'select', 'date', 'radio', 'checkbox']).optional().default('text'),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  defaultValue: z.string().optional()
});

export const FlowDataSchema = z.object({
  title: z.string().optional().default('Form Dynamic'),
  description: z.string().optional(),
  buttonText: z.string().optional().default('Kirim Form'),
  fields: z.array(FlowInputFieldSchema).optional().default([]),
  submitResponseText: z.string().optional()
});

export const StepSchema = z.object({
  userReply: z.string().min(1, 'Pesan balasan user/step wajib diisi'),
  aiResponse: z.string().min(1, 'Respon AI/bot wajib diisi'),
  chips: z.array(z.string()).optional(),
  enableCard: z.boolean().optional(),
  card: CardDataSchema.optional(),
  enableFlow: z.boolean().optional(),
  flow: FlowDataSchema.optional()
});

export const CustomBrandingSchema = z.object({
  botName: z.string().optional(),
  botAvatarUrl: z.string().optional(),
  subTitle: z.string().optional(),
  headerColor: z.string().optional()
});

export const ScenarioSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().optional(),
  name: z.string().min(1, 'Nama singkat skenario wajib diisi'),
  title: z.string().min(1, 'Judul lengkap skenario wajib diisi'),
  tag: z.string().optional().default('Use Case Demo'),
  saAuthor: z.string().optional(),
  triggerType: z.enum(['INBOUND_USER', 'OUTBOUND_SYSTEM']).optional().default('INBOUND_USER'),
  outboundPill: z.string().optional(),
  description: z.string().optional().default(''),
  cekatComponents: z.array(z.string()).optional().default([]),
  apiScopes: z.array(z.string()).optional().default([]),
  ruleNote: z.string().optional().default(''),
  stepsDetail: z.array(z.string()).optional().default([]),
  initialText: z.string().optional().default(''),
  hideInitialMessage: z.boolean().optional(),
  startFromStepIdx: z.number().optional(),
  customBranding: CustomBrandingSchema.optional(),
  steps: z.array(StepSchema).min(1, 'Skenario harus memiliki minimal 1 step percakapan')
});

// Single object or array of scenarios for JSON Import (uses z.preprocess for clean array error messages)
export const ImportJsonPayloadSchema = z.preprocess((val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'object' && val !== null) return [val];
  return val;
}, z.array(ScenarioSchema).min(1, 'Payload JSON tidak boleh kosong'));
