import { Category } from '../types/scenario';

export const defaultCategories: Category[] = [
  {
    id: 'healthcare',
    title: 'Healthcare AI Suite',
    description: '16 SA Study Cases: Triage, Resep Obat Guardrail, Vision OCR EMR, BPJS VClaim & Pre-Admission.',
    icon: 'fa-hospital-user',
    badge: '16 SA Study Cases',
    isCustom: false
  },
  {
    id: 'banking',
    title: 'Banking & Financial AI',
    description: 'Verifikasi Identitas Nasabah, Escrow Dispute, Pre-Approval Kredit, & Guardrail Anti-Fraud.',
    icon: 'fa-building-columns',
    badge: 'Finance & Banking',
    isCustom: false
  },
  {
    id: 'retail',
    title: 'E-Commerce & Retail AI',
    description: 'Lacak Pengiriman Real-time, Retur Barang Terstruktur, & Catalog Recommendation Engine.',
    icon: 'fa-bag-shopping',
    badge: 'E-Commerce Retail',
    isCustom: false
  },
  {
    id: 'gov',
    title: 'Government & Public Services',
    description: 'Layanan Dukcapil, Perpanjangan SIM/STNK, & Escalation System Penanganan Aduan Warga.',
    icon: 'fa-landmark',
    badge: 'Public Services',
    isCustom: false
  }
];
