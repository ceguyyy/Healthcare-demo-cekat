import { Scenario } from '../types/scenario';

export const scenarios: Scenario[] = [
  {
    id: 1,
    title: "1. Booking Appointment",
    tag: "Core HIS",
    desc: "Temu Janji Dokter & Dynamic Availability SIMRS",
    initialUser: "Saya mau booking dokter kandungan untuk besok lusa.",
    steps: [
      {
        userReply: "Pasien Lama (RM-882910)",
        aiResponse: "Baik, jadwal **Dr. Anita, Sp.OG** (Poli Kandungan) tersedia untuk **Kamis pukul 14:00 WIB**.\n\nApakah Anda ingin mengonfirmasi booking untuk Pasien Lama (**Siti Rahma - RM-882910**)?",
        chips: ["Konfirmasi Booking 14:00", "Pilih Dokter Lain", "Lihat Jam Lain"]
      },
      {
        userReply: "Konfirmasi Booking 14:00",
        aiResponse: "✅ **Booking Berhasil Diproses!**\n\n• **Booking ID:** #BK-99201\n• **Pasien:** Siti Rahma (RM-882910)\n• **Dokter:** Dr. Anita, Sp.OG\n• **Waktu:** Kamis, 14:00 WIB\n\nPengingat otomatis WhatsApp H-1 telah dijadwalkan di sistem.",
        chips: ["Cek Detail Booking", "Ubah Pembayaran", "Kembali ke Menu"],
        richComponent: "booking_success",
        payloadData: {
          endpoint: "/api/v2/his/appointments/create",
          method: "POST",
          status: 201,
          requestBody: { rmNo: "RM-882910", doctorId: "DOC-OG-01", date: "2026-09-03", slot: "14:00" },
          responseBody: { bookingId: "BK-99201", status: "CONFIRMED", reminderScheduled: true },
          executionTimeMs: 142,
          guardrailStatus: "PASS"
        }
      }
    ],
    technicalSpec: {
      systemTrigger: "User Chat Request (Web / WA)",
      hisIntegration: "REST API Endpoint POST /appointments/create",
      cekatModule: "Cekat Intent Parser & Slots Extractor",
      securityLevel: "HIPAA Compliant & Encrypted Transit"
    }
  },
  {
    id: 2,
    title: "2. Reschedule & Batal",
    tag: "HIS Action",
    desc: "Penjadwalan Ulang & Pembatalan Slot Real-Time",
    initialUser: "Saya mau ganti jadwal kontrol dari Selasa ke Kamis untuk No. RM RM-882910.",
    steps: [
      {
        userReply: "Cek Slot Kamis 10:00",
        aiResponse: "Slot Kamis pukul 10:00 WIB bersama **Dr. Budi, Sp.B** (Poli Bedah) tersedia. Apakah Anda ingin memindahkan booking ini ke slot Kamis tersebut?",
        chips: ["Ya, Pindahkan ke Kamis 10:00", "Pilih Jam Lain", "Batalkan Janji"]
      },
      {
        userReply: "Ya, Pindahkan ke Kamis 10:00",
        aiResponse: "🔄 **Reschedule Berhasil!**\n\nJadwal kontrol Anda telah dipindahkan ke **Kamis, 10:00 WIB**.\nSlot lama Anda (Selasa) telah dibebaskan di SIMRS untuk pasien lain.",
        chips: ["Download Struk Reschedule", "Menu Utama"],
        richComponent: "reschedule_success",
        payloadData: {
          endpoint: "/api/v2/his/appointments/reschedule",
          method: "PUT",
          status: 200,
          requestBody: { oldBookingId: "BK-88192", newSlot: "2026-09-03T10:00:00Z" },
          responseBody: { updatedBookingId: "BK-88192", status: "RESCHEDULED" },
          executionTimeMs: 98,
          guardrailStatus: "PASS"
        }
      }
    ],
    technicalSpec: {
      systemTrigger: "User Reschedule Request",
      hisIntegration: "SIMRS Schedule Release & Lock Queue",
      cekatModule: "Transactional Booking State Machine",
      securityLevel: "Access Code Verification"
    }
  },
  {
    id: 3,
    title: "3. Pengingat Kontrol",
    tag: "Broadcast",
    desc: "Pre-Admission Reminder via Webhook H-1",
    initialUser: "[SIMRS Webhook - Automatic Pre-Admission H-1 Control Reminder]",
    steps: [
      {
        userReply: "Terima Notifikasi H-1",
        aiResponse: "Halo Bpk. Ahmad, mengingatkan jadwal kontrol Anda esok hari **Kamis pukul 10:00 WIB** di **Poli Bedah**.\n\nMohon konfirmasi jika Anda akan hadir agar berkas medis siap.",
        chips: ["✅ Konfirmasi Hadir", "🔄 Minta Reschedule", "❌ Batal Berobat"]
      },
      {
        userReply: "✅ Konfirmasi Hadir",
        aiResponse: "🙌 **Terima Kasih atas Konfirmasinya!**\n\nStatus kehadiran Anda telah diperbarui di Poli Bedah. Berkas rekam medis & resep awal telah disiapkan oleh tim medis.",
        chips: ["📍 Petunjuk Lokasi Poli Bedah", "🅿️ Reservasi Parkir VIP"],
        richComponent: "reminder_card",
        payloadData: {
          endpoint: "/api/v2/webhooks/pre-admission",
          method: "POST",
          status: 200,
          requestBody: { patientId: "RM-882910", action: "CONFIRM_PRESENCE" },
          responseBody: { status: "PRE_ADMITTED", queuePriority: "STANDARD" },
          executionTimeMs: 65,
          guardrailStatus: "PASS"
        }
      }
    ],
    technicalSpec: {
      systemTrigger: "n8n Cron Webhook (H-1 08:00 AM)",
      hisIntegration: "Outbound Multi-Channel WA Business API",
      cekatModule: "Cekat Proactive Broadcast Engine",
      securityLevel: "Two-Way Opt-in Verification"
    }
  },
  {
    id: 4,
    title: "4. Cek Antrian Real-time",
    tag: "Queue API",
    desc: "Estimasi Waktu Tunggu Real-time Poli SIMRS",
    initialUser: "Antrian saya berapa ya untuk Poli Anak jam 9 ini?",
    steps: [
      {
        userReply: "Cek Status Antrian RM-882910",
        aiResponse: "📊 **Status Antrian Real-time Poli Anak:**\n\n• **Nomor Antrian Anda:** A-045\n• **Dipanggil Saat Ini:** A-039\n• **Sisa Antrian:** 6 Orang\n• **Estimasi Waktu Tunggu:** ±20 - 25 Menit lagi.",
        chips: ["🔄 Refresh Antrian", "📍 Denah Poli Anak", "📞 Hubungi Perawat Poli"],
        richComponent: "queue_status",
        payloadData: {
          endpoint: "/api/v2/his/queue/status",
          method: "GET",
          status: 200,
          requestBody: { poly: "Poli Anak", currentTicket: "A-045" },
          responseBody: { ticket: "A-045", activeTicket: "A-039", remaining: 6, estMinutes: 22 },
          executionTimeMs: 88,
          guardrailStatus: "PASS"
        }
      }
    ],
    technicalSpec: {
      systemTrigger: "Live User Query",
      hisIntegration: "Queue Machine Socket / Polling API",
      cekatModule: "Dynamic Math & Time Estimator",
      securityLevel: "Session Token Protection"
    }
  },
  {
    id: 5,
    title: "5. Eskalasi Gawat Darurat",
    tag: "Guardrail",
    desc: "Emergency Guardrail & Escalation ke Hotline 119",
    initialUser: "Tolong, ibu saya tiba-tiba tidak sadarkan diri dan napasnya tersengal-sengal!",
    steps: [
      {
        userReply: "[EMERGENCY KEYWORD TRIGGERED]",
        aiResponse: "🚨 **KONDISI GAWAT DARURAT DETEKSI (RED CODE)** 🚨\n\nMohon **SEGERA TELEPON HOTLINE IGD RS SEHAT UTAMA**:\n📞 **119** atau **(021) 555-9119**\n\n*Penting: Segera hubungi nomor darurat sekarang. Tiket medis darurat langsung diteruskan ke Tim Triage IGD.*",
        chips: ["📞 Telepon Hotline IGD (119)", "🚑 Panggil Ambulans Direct", "📍 Rute GPS ke IGD Terdekat"],
        richComponent: "emergency_alert",
        payloadData: {
          endpoint: "/api/v2/guardrails/safety-filter",
          method: "POST",
          status: 200,
          requestBody: { text: "tidak sadarkan diri dan napas tersengal" },
          responseBody: { triggered: true, category: "RED_CODE_EMERGENCY", action: "BYPASS_LLM_TO_HOTLINE" },
          executionTimeMs: 12,
          guardrailStatus: "ESCALATED"
        }
      }
    ],
    technicalSpec: {
      systemTrigger: "Regex & Pattern Emergency Guardrail",
      hisIntegration: "IGD Duty Nurse Alert Webhook",
      cekatModule: "Cekat Safety Shield Guardrail",
      securityLevel: "Zero-Delay Immediate Override"
    }
  },
  {
    id: 6,
    title: "6. Gejala Ambigu",
    tag: "Compliance",
    desc: "Larangan Diagnosa LLM & Rekomendasi Poli AI",
    initialUser: "Perut saya sakit melilit, mual, dan pusing berputar. Sebaiknya saya ke dokter apa ya?",
    steps: [
      {
        userReply: "Tanyakan Rekomendasi Poli",
        aiResponse: "ℹ️ **Catatan Medis Compliance:**\nCekat AI tidak memberikan diagnosa medis langsung.\n\nUntuk gejala perut mual dan pusing berputar, kami sarankan Anda berkonsultasi dengan **Dokter Spesialis Penyakit Dalam** atau **Dokter Umum** terlebih dahulu.",
        chips: ["Booking Penyakit Dalam", "Booking Dokter Umum", "Pilih Poli Lain"],
        payloadData: {
          endpoint: "/api/v2/compliance/medical-filter",
          method: "POST",
          status: 200,
          requestBody: { userSymptom: "sakit melilit, mual, pusing" },
          responseBody: { diagnosisProvided: false, recommendedPolys: ["Penyakit Dalam", "Dokter Umum"] },
          executionTimeMs: 110,
          guardrailStatus: "PASS"
        }
      }
    ],
    technicalSpec: {
      systemTrigger: "Medical Disclaimer Engine",
      hisIntegration: "Poly Specialty Recommender Matrix",
      cekatModule: "Clinical Guardrail & Non-Diagnostic Filter",
      securityLevel: "Permenkes & HIPAA Compliant"
    }
  },
  {
    id: 7,
    title: "7. Surat Rujukan & EMR",
    tag: "OCR + EMR",
    desc: "Membaca Scan Surat Rujukan via OCR n8n",
    initialUser: "Saya mau daftar BPJS pakai surat rujukan ini [Unggah Foto Surat Rujukan].",
    steps: [
      {
        userReply: "Proses OCR Rujukan",
        aiResponse: "📄 **n8n OCR Engine Validated:**\n\n• **No. Rujukan:** 12345/BPJS/2026\n• **Faskes Asal:** Puskesmas Menteng\n• **Poli Tujuan:** Spesialis Saraf\n• **Status VClaim:** ✅ Valid BPJS Active\n\nBerikut jadwal Dokter Spesialis Saraf yang tersedia minggu ini:",
        chips: ["Pilih Dr. Farhan, Sp.N (Kamis)", "Pilih Dr. Rina, Sp.N (Jumat)", "Cek Syarat BPJS"],
        richComponent: "ocr_parsed",
        payloadData: {
          endpoint: "/api/v2/ocr/scan-referral",
          method: "POST",
          status: 200,
          requestBody: { imageUrl: "https://storage.cekat.ai/ref/12345.jpg" },
          responseBody: { referralNo: "12345/BPJS/2026", poly: "Saraf", bpjsValid: true, confidenceScore: 0.98 },
          executionTimeMs: 420,
          guardrailStatus: "PASS"
        }
      }
    ],
    technicalSpec: {
      systemTrigger: "Image Document Upload",
      hisIntegration: "n8n Vision OCR & BPJS VClaim Integration",
      cekatModule: "Multimodal Document Parser",
      securityLevel: "Encrypted Document Store"
    }
  },
  {
    id: 8,
    title: "8. Hasil Lab Aman",
    tag: "PII Masking",
    desc: "Link Secure Web Portal dengan PII Masking",
    initialUser: "Apakah hasil lab darah saya sudah keluar?",
    steps: [
      {
        userReply: "Ambil Hasil Lab",
        aiResponse: "🔒 **Secure Patient Data Portal:**\n\nHasil lab darah Anda (No. Lab **LAB-88102**) sudah SELESAI.\n\nDemi keamanan privasi medis, silakan akses link terenkripsi berikut dan masukkan Tanggal Lahir (DDMMYYYY) Anda:",
        chips: ["🔗 Buka Portal Lab Secure", "📩 Kirim via Email Terenkripsi"],
        richComponent: "lab_portal",
        payloadData: {
          endpoint: "/api/v2/sec/lab-token",
          method: "POST",
          status: 200,
          requestBody: { labNo: "LAB-88102" },
          responseBody: { secureUrl: "https://sec.rs-sehat.co.id/lab/view?token=88102a", expiresSeconds: 3600 },
          executionTimeMs: 76,
          guardrailStatus: "PII_MASKED"
        }
      }
    ],
    technicalSpec: {
      systemTrigger: "User Lab Inquiry",
      hisIntegration: "LIS (Laboratory Information System) API",
      cekatModule: "PII Masking & Dynamic Token Generator",
      securityLevel: "TLS 1.3 + One-Time Token Auth"
    }
  },
  {
    id: 9,
    title: "9. Verifikasi Identitas",
    tag: "Security",
    desc: "WA Flows Challenge (No. RM + Tanggal Lahir)",
    initialUser: "Minta riwayat rekam medis atas nama Ibu Sukaesih dong.",
    steps: [
      {
        userReply: "Verifikasi Identitas Pasien",
        aiResponse: "🛡️ **Verifikasi Privasi & Keamanan Data:**\n\nDemi keamanan data medis pasien, silakan verifikasi identitas (No. KTP / No. RM & Tanggal Lahir) melalui form terenkripsi resmi berikut:",
        chips: ["📝 Buka Form Verifikasi ID", "❓ Lupa Nomor RM"],
        richComponent: "verification_flow",
        payloadData: {
          endpoint: "/api/v2/sec/auth-challenge",
          method: "POST",
          status: 200,
          requestBody: { targetPatient: "Ibu Sukaesih" },
          responseBody: { flowId: "FLOW-SEC-992", status: "CHALLENGE_REQUIRED" },
          executionTimeMs: 84,
          guardrailStatus: "PASS"
        }
      }
    ],
    technicalSpec: {
      systemTrigger: "Sensitive EMR Request",
      hisIntegration: "Meta WhatsApp Flows / Native Web Encryption",
      cekatModule: "Identity Verification Flow Engine",
      securityLevel: "Strict Identity Challenge Protocol"
    }
  },
  {
    id: 10,
    title: "10. Estimasi Biaya & BPJS",
    tag: "Billing",
    desc: "Kisaran Paket Biaya ERACS & Disclaimer Mandatory",
    initialUser: "Operasi Caesar ERACS di sini berapa ya? Ditanggung BPJS penuh tidak?",
    steps: [
      {
        userReply: "Rincian Estimasi Biaya",
        aiResponse: "💰 **Estimasi Paket Operasi Caesar (ERACS):**\n\n• **Kelas 1:** Rp 16.500.000 - Rp 19.500.000\n• **Kelas VIP:** Rp 22.000.000 - Rp 26.000.000\n• **Kelas VVIP:** Rp 29.000.000+\n\n⚠️ *Disclaimer:* Estimasi awal tanpa komplikasi. BPJS Kesehatan meng-cover 100% jika sesuai prosedur rujukan berjenjang Faskes 1.",
        chips: ["Tanya Syarat BPJS", "Hubungi Kasir Billing", "Fasilitas Kamar VIP"],
        richComponent: "billing_breakdown",
        payloadData: {
          endpoint: "/api/v2/billing/estimate",
          method: "GET",
          status: 200,
          requestBody: { procedure: "ERACS_CAESAR" },
          responseBody: { baseEstimateMin: 16500000, baseEstimateMax: 26000000, bpjsCovered: true },
          executionTimeMs: 105,
          guardrailStatus: "PASS"
        }
      }
    ],
    technicalSpec: {
      systemTrigger: "Financial / Billing Inquiry",
      hisIntegration: "SIMRS Billing Rate Master Database",
      cekatModule: "Cost Estimation & Disclaimer Guardrail",
      securityLevel: "Standard Audit Logger"
    }
  },
  {
    id: 11,
    title: "11. Survey CSAT",
    tag: "SIMRS Trigger",
    desc: "Automated CSAT Survey Pasca Service SIMRS",
    initialUser: "[SIMRS Trigger - Patient Discharge Status Complete]",
    steps: [
      {
        userReply: "Isi Survey Kepuasan",
        aiResponse: "⭐ **Survey Kepuasan Pelayanan RS Sehat Utama**\n\nTerima kasih telah mempercayakan kesehatan Anda kepada kami. Mohon berikan penilaian 1 menit untuk meningkatkan pelayanan kami:",
        chips: ["⭐⭐⭐⭐⭐ Sangat Puas", "⭐⭐⭐⭐ Puas", "⭐⭐ Cukup / Perlu Perbaikan"],
        richComponent: "csat_form",
        payloadData: {
          endpoint: "/api/v2/surveys/discharge-csat",
          method: "POST",
          status: 200,
          requestBody: { dischargeId: "DC-99281", patientId: "RM-882910" },
          responseBody: { surveyId: "SV-1029", status: "OPEN" },
          executionTimeMs: 58,
          guardrailStatus: "PASS"
        }
      }
    ],
    technicalSpec: {
      systemTrigger: "SIMRS Discharge Event Webhook",
      hisIntegration: "Patient Experience & Feedback Pipeline",
      cekatModule: "Automated Feedback & Sentiment Analyzer",
      securityLevel: "Anonymized Reporting"
    }
  },
  {
    id: 12,
    title: "12. Cari Klinik Terdekat",
    tag: "Location WA",
    desc: "Share Location WhatsApp & Coordinate Distance Filter",
    initialUser: "Klinik Sehat Utama mana yang paling dekat dari lokasi saya?",
    steps: [
      {
        userReply: "📍 Share Live Location",
        aiResponse: "📍 **Lokasi Klinik Terdekat (Radius 5 KM):**\n\n1. **Klinik Menteng** (2.1 km)\n   *Jl. Cikini Raya No. 45* • Buka s/d 21:00 WIB\n\n2. **Klinik Cikini** (4.3 km)\n   *Jl. Raden Saleh No. 12* • Buka 24 Jam",
        chips: ["🗺️ Google Maps Menteng", "📞 Hubungi Klinik Menteng", "🗓️ Janji Dokter Menteng"],
        richComponent: "clinic_list",
        payloadData: {
          endpoint: "/api/v2/location/nearby",
          method: "POST",
          status: 200,
          requestBody: { lat: -6.1887, lng: 106.8354, radiusKm: 5 },
          responseBody: { totalFound: 2, nearest: "Klinik Menteng", distanceKm: 2.1 },
          executionTimeMs: 95,
          guardrailStatus: "PASS"
        }
      }
    ],
    technicalSpec: {
      systemTrigger: "WhatsApp Live Location Payload",
      hisIntegration: "Google Maps Distance Matrix & Branch DB",
      cekatModule: "Geospatial Distance Calculator",
      securityLevel: "Location Ephemeral Cache"
    }
  }
];
