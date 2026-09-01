import { z } from 'zod';

export const CardItemSchema = z.object({
  label: z.string().default(''),
  val: z.string().default('')
});

export const CardDataSchema = z.object({
  title: z.string().default('Detail Info'),
  sub: z.string().default(''),
  items: z.array(CardItemSchema).default([]),
  status: z.string().default('PROCESSED')
});

export const FlowInputFieldSchema = z.object({
  id: z.string().default(''),
  label: z.string().min(1, 'Label field wajib diisi'),
  type: z.enum(['text', 'select', 'date', 'radio', 'checkbox']).default('text'),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  defaultValue: z.string().optional()
});

export const FlowDataSchema = z.object({
  title: z.string().default('Form Dynamic'),
  description: z.string().optional(),
  buttonText: z.string().default('Kirim Form'),
  fields: z.array(FlowInputFieldSchema).default([]),
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
  categoryId: z.string().min(1, 'Category ID wajib diisi'),
  name: z.string().min(1, 'Nama singkat skenario wajib diisi'),
  title: z.string().min(1, 'Judul lengkap skenario wajib diisi'),
  tag: z.string().default('Use Case Demo'),
  saAuthor: z.string().optional(),
  triggerType: z.enum(['INBOUND_USER', 'OUTBOUND_SYSTEM']).default('INBOUND_USER'),
  outboundPill: z.string().optional(),
  description: z.string().default(''),
  cekatComponents: z.array(z.string()).default([]),
  apiScopes: z.array(z.string()).default([]),
  ruleNote: z.string().default(''),
  stepsDetail: z.array(z.string()).default([]),
  initialText: z.string().default(''),
  hideInitialMessage: z.boolean().optional(),
  startFromStepIdx: z.number().optional(),
  customBranding: CustomBrandingSchema.optional(),
  steps: z.array(StepSchema).min(1, 'Skenario harus memiliki minimal 1 step percakapan')
});

// Single object or array of scenarios for JSON Import
export const ImportJsonPayloadSchema = z.union([
  ScenarioSchema,
  z.array(ScenarioSchema).min(1, 'Array JSON tidak boleh kosong')
]);
