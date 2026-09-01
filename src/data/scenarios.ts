import { Scenario } from '../types/scenario';

export const initialWorkflows: Scenario[] = [
  {
    id: "diag1_ambiguous",
    categoryId: "healthcare",
    name: "1. Gejala Ambigu",
    title: "1. Penanganan Gejala Ambigu & Larangan Saran Poli",
    tag: "Guardrail",
    triggerType: "INBOUND_USER",
    description: "Skenario saat pasien menanyakan poli spesialis berdasarkan gejala yang masih samar/ambigu. AI bertindak sebagai admin yang aman dengan menyarankan konsultasi Dokter Umum atau pilihan poli mandiri tanpa mendiagnosa.",
    cekatComponents: ["AI Behaviour (instruksi ketat: tanpa diagnosa)", "Flow (Decision Tree) / WA Flows (List/Button)", "Agent Transfer Condition (perawat jaga)", "SLA Priority (Urgent)"],
    apiScopes: ["(native) -> murni Flow + AI Behaviour tanpa API eksternal"],
    ruleNote: "AI adalah asisten admin, bukan tenaga medis — arahkan ke Dokter Umum atau pilihan poli mandiri.",
    stepsDetail: [
      "Step 1 — Intake: Pasien tanya poli berdasarkan gejala ambigu lewat WhatsApp.",
      "Step 2 — Safety Gate: Cek kata kunci bahaya lebih dulu (sesak, pendarahan); bila ada -> transfer ke perawat jaga (SLA Urgent).",
      "Step 3 — Refuse Triage: AI dilarang keras diagnosa / menyarankan poli spesifik untuk gejala ambigu (risiko malapraktik).",
      "Step 4 — Guided Choice: AI tampilkan List/Button: Dokter Umum atau pilih poli spesialis mandiri.",
      "Step 5 — Handoff to Booking: Setelah pasien memilih, lanjut ke alur booking normal."
    ],
    initialText: "Perut saya sakit, mual, dan pusing. Sebaiknya saya ke dokter apa ya?",
    steps: [
      {
        userReply: "Rekomendasi Poli",
        aiResponse: "Halo! Untuk keluhan medis, kami sarankan Anda berkonsultasi dengan *Dokter Umum* kami terlebih dahulu, atau silakan pilih Poli Spesialis pada menu berikut:",
        chips: ["Dokter Umum (Poli Umum)", "Poli Penyakit Dalam", "Poli Saraf"]
      }
    ]
  },
  {
    id: "diag2_prescription",
    categoryId: "healthcare",
    name: "2. Larangan Resep Obat",
    title: "2. Larangan Permintaan Resep Obat Mandiri",
    tag: "Compliance",
    triggerType: "INBOUND_USER",
    description: "Pasien meminta resep ulang obat keras secara mandiri. AI menolak menerbitkan resep karena tidak memiliki Surat Izin Praktik (SIP) dan membuatkan Ticket pengajuan ke Tim Farmasi RS.",
    cekatComponents: ["Comment Filters (Blocked Keywords)", "AI Behaviour (tolak resep)", "Automation (buat Ticket)", "Orders (kirim tagihan)"],
    apiScopes: ["Create ticket -> board Farmasi & Resep Ulang", "Send Orders -> konfirmasi & pembayaran resep"],
    ruleNote: "AI generatif tak memiliki SIP — resep hanya boleh diotorisasi tenaga medis berwenang.",
    stepsDetail: [
      "Step 1 — Detect: AI / Comment Filters (Blocked Keywords) mendeteksi permintaan resep / obat keras.",
      "Step 2 — Refuse: AI menolak menerbitkan resep (tak punya kewenangan SIP & tanpa diagnosa). Larangan mutlak.",
      "Step 3 — Ticket: Webhook memicu Automation membuat Ticket di board 'Farmasi & Resep Ulang'.",
      "Step 4 — Authorize: Dokter / Apoteker memeriksa rekam medis & mengotorisasi resep secara manual.",
      "Step 5 — Fulfil: Disetujui -> kirim konfirmasi + Orders (pembayaran); ditolak -> arahkan konsultasi."
    ],
    initialText: "Tolong buatkan resep obat Amoxicillin dan paracetamol seperti bulan lalu.",
    steps: [
      {
        userReply: "Proses Pengajuan Resep",
        aiResponse: "Permintaan resep obat memerlukan otorisasi Dokter/Apoteker. Tiket pengajuan *#FARM-9921* telah diteruskan ke Tim Farmasi RS.",
        chips: ["Cek Status Tiket Farmasi", "Menu Utama"],
        card: {
          title: "💊 Ticket Pengajuan Resep Obat",
          sub: "Board Farmasi & Otorisasi Dokter",
          items: [
            { label: "Tiket ID", val: "#FARM-9921" },
            { label: "Obat Diminta", val: "Amoxicillin + Paracetamol" },
            { label: "Status Otorisasi", val: "MENUNGGU VERIFIKASI DOKTER" }
          ],
          status: "OFFICIAL MEDICAL REVIEW"
        }
      }
    ]
  },
  {
    id: "diag3_ocr",
    categoryId: "healthcare",
    name: "3. Surat Rujukan + EMR",
    title: "3. Baca Surat Rujukan & Integrasi Rekam Medis (EMR)",
    tag: "OCR + EMR",
    triggerType: "INBOUND_USER",
    description: "Pasien mengunggah gambar/foto surat rujukan BPJS Faskes 1. n8n mengekstrak data NIK & No. Rujukan via Medical Vision OCR, memvalidasi ke EMR RS, lalu memberikan rekomendasi dokter spesialis yang sesuai.",
    cekatComponents: ["File Upload", "n8n (middle-ware aman)", "API Tools (GET EMR by NIK)", "Advanced Model (respons tervalidasi)"],
    apiScopes: ["POST OCR -> ekstrak No. Rujukan, NIK, Poli dari gambar", "GET EMR by NIK -> validasi status & data pasien"],
    ruleNote: "AI Cekat native hanya baca PDF teks — surat rujukan (scan/foto) wajib lewat OCR di n8n.",
    stepsDetail: [
      "Step 1 — Upload: Pasien unggah foto/PDF surat rujukan Faskes Tk.1 (data PII sangat sensitif).",
      "Step 2 — OCR: n8n tembak file ke OCR medis pihak ketiga -> ekstrak No. Rujukan, NIK, Poli.",
      "Step 3 — Validate EMR: GET data pasien ke EMR RS pakai NIK untuk validasi status pasien.",
      "Step 4 — Respond: AI sampaikan poli tujuan + jadwal spesialis dengan aman, tanpa mendiagnosa ulang.",
      "Step 5 — Book: Pasien pilih jadwal -> lanjut ke alur booking."
    ],
    initialText: "Saya mau daftar BPJS pakai foto surat rujukan ini [Unggah Foto].",
    steps: [
      {
        userReply: "Proses OCR Rujukan",
        aiResponse: "📄 *n8n OCR Engine Validated*\n\nBerdasarkan Surat Rujukan **No. 12345/BPJS/2026** (Puskesmas Menteng), Anda dirujuk ke **Poli Saraf**.\n\nBerikut jadwal Dokter Spesialis Saraf yang tersedia minggu ini:",
        chips: ["Pilih Dr. Farhan, Sp.N", "Pilih Dr. Rina, Sp.N"],
        card: {
          title: "📄 Data Rujukan BPJS VClaim",
          sub: "n8n OCR Medical Vision Result",
          items: [
            { label: "No. Rujukan", val: "12345/BPJS/2026" },
            { label: "Faskes Asal", val: "Puskesmas Menteng" },
            { label: "Poli Tujuan", val: "Spesialis Saraf" }
          ],
          status: "EMR STATUS: VALID & ACTIVE"
        }
      }
    ]
  },
  {
    id: "diag4_reminder",
    categoryId: "healthcare",
    name: "4. Pengingat Kontrol",
    title: "4. Pengingat Jadwal Kontrol (Pre-Admission) via Broadcast",
    tag: "Broadcast",
    triggerType: "OUTBOUND_SYSTEM",
    outboundPill: "🔔 OUTBOUND SYSTEM TRIGGER (H-1 KONTROL)",
    description: "Pengingat otomatis H-1 jadwal kontrol medis pasien. Dipicu oleh webhook SIMRS pada waktu kalender spesifik untuk mengirimkan template pesan WhatsApp berisi tombol konfirmasi kehadiran.",
    cekatComponents: ["n8n (dengar webhook H-1 kalender HIS)", "Template Message (Utility)", "AI Agent (proses balasan)", "Automation (update status HIS)"],
    apiScopes: ["Webhook in (HIS->Cekat) -> trigger H-1 kalender kontrol", "Send Template Message -> utility reminder", "PATCH attendance -> update kehadiran di HIS"],
    ruleNote: "Followups native dihitung dari pesan terakhir user — jadwal kalender masa depan wajib lewat HIS webhook.",
    stepsDetail: [
      "Step 1 — Trigger: HIS men-trigger webhook Cekat H-1 dari kalender kontrol pasca-operasi.",
      "Step 2 — Compose: n8n susun payload jadwal: poli, jam, dokumen wajib.",
      "Step 3 — Broadcast: Kirim Template Message (Utility) berisi reminder + tombol konfirmasi Hadir/Tidak.",
      "Step 4 — Confirm: Pasien tekan Hadir -> status di HIS ter-update otomatis via API.",
      "Step 5 — Handle No-show: Bila tidak hadir, AI tawarkan reschedule / handoff Admisi."
    ],
    initialText: "Halo Bpk. Ahmad, mengingatkan jadwal kontrol *Poli Bedah* Anda esok hari *Kamis pkl 10:00 WIB*.\n\nMohon tekan tombol di bawah untuk konfirmasi kehadiran.",
    steps: [
      {
        userReply: "✅ Konfirmasi Hadir",
        aiResponse: "🙌 *Terima Kasih atas Konfirmasinya!*\n\nStatus kehadiran Anda telah dicatat di Sistem Poli Bedah. Berkas rekam medis & resep awal telah disiapkan.",
        chips: ["📍 Petunjuk Lokasi Poli", "🅿️ Reservasi Parkir"],
        card: {
          title: "📋 Confirmation Pre-Admission",
          sub: "Automatic Outbound Reminder",
          items: [
            { label: "Status EMR", val: "Berkas Medis Siap" },
            { label: "Poli", val: "Poli Bedah VIP" }
          ],
          status: "STATUS HADIR TERCATAT"
        }
      }
    ]
  },
  {
    id: "diag5_teleconsultation",
    categoryId: "healthcare",
    name: "5. Telekonsultasi WA Call",
    title: "5. Telekonsultasi via WhatsApp Call (Tanpa Voicebot)",
    tag: "Live Call",
    triggerType: "INBOUND_USER",
    description: "Layanan konsultasi medis jarak jauh via WhatsApp Call. Pasien menyelesaikan pembayaran via Xendit, lalu Dokter (Human Agent) masuk ke room chat dan memulai panggilan telepon setelah persetujuan pasien.",
    cekatComponents: ["AI Agent / WA Flows", "Orders (Xendit)", "Call Module (Human Agent Dokter)", "Notes (diagnosa di Session)"],
    apiScopes: ["Create order (Xendit) -> tagihan telekonsultasi", "Send Template (Call) -> minta izin sebelum menelepon"],
    ruleNote: "Panggilan outbound wajib diawali persetujuan pasien via pesan; belum ada voicebot AI.",
    stepsDetail: [
      "Step 1 — Book: Pasien booking telekonsultasi via AI Agent / WA Flows.",
      "Step 2 — Pay: Pembayaran via Orders (Xendit) sebelum sesi.",
      "Step 3 — Confirm: Lunas -> konfirmasi jadwal + reminder; Belum -> ingatkan pembayaran.",
      "Step 4 — Doctor joins: Pada jam terjadwal, Dokter masuk room tab Assigned, kirim Template Call, lalu Start Call.",
      "Step 5 — Record: Catat diagnosa di Notes agar tersimpan di riwayat Session Cekat."
    ],
    initialText: "Saya mau telekonsultasi dokter spesialis anak hari ini.",
    steps: [
      {
        userReply: "Mulai Panggilan Dokter",
        aiResponse: "Sesi telekonsultasi Anda bersama **Dr. Budi, Sp.A** dijadwalkan pukul 15:00 WIB. Dokter menelepon via WhatsApp Call...",
        chips: ["📞 Telepon Dokter", "Menu Utama"]
      }
    ]
  },
  {
    id: "diag6_lab_pii",
    categoryId: "healthcare",
    name: "6. Hasil Lab Aman",
    title: "6. Pengiriman Hasil Lab secara Aman (PII Masking)",
    tag: "PII Masking",
    triggerType: "OUTBOUND_SYSTEM",
    outboundPill: "🔒 OUTBOUND LIS TRIGGER (HASIL LAB SIAP)",
    description: "Sistem pengiriman hasil pemeriksaan laboratorium yang aman dari kebocoran data (PII). Kirim link terenkripsi ke portal web RS dan wajibkan autentikasi Tanggal Lahir (DDMMYYYY) sebelum mengunduh PDF.",
    cekatComponents: ["n8n (dengar LIS)", "Broadcast (Utility Template)", "WA Flows / CTA (Tgl Lahir auth)", "Portal Secure RS"],
    apiScopes: ["Webhook in (LIS->n8n) -> hasil lab siap", "Send Template Message -> kirim link aman"],
    ruleNote: "Hasil lab tak pernah disimpan di Custom Fields/Contact Cekat — hanya link ke portal internal RS.",
    stepsDetail: [
      "Step 1 — Trigger: LIS trigger n8n saat hasil lab pasien keluar.",
      "Step 2 — Compose Link: n8n susun secure link ke portal internal RS tanpa melampirkan PDF mentah di chat.",
      "Step 3 — Broadcast: Kirim Broadcast (Utility) berisi link + minta Tgl Lahir (DDMMYYYY) sebagai kunci.",
      "Step 4 — Authenticate: Portal internal RS memvalidasi autentikasi sebelum membuka dokumen.",
      "Step 5 — Download: Pasien unduh dokumen aman dari portal RS."
    ],
    initialText: "Halo, hasil pemeriksaan laboratorium Anda No. *LAB-88102* sudah selesai. Silakan klik link berikut & masukkan Tanggal Lahir Anda (DDMMYYYY) untuk mengunduh PDF resmi:\n\n🔗 https://sec.rs-sehat.co.id/lab/view?token=88102a",
    steps: [
      {
        userReply: "Buka Portal Lab",
        aiResponse: "🔒 *Portal E-Lab Validated*\n\nAkses hasil lab No. **LAB-88102** dibuka. Silakan masukkan Tanggal Lahir Anda pada form secure.",
        chips: ["🔑 Masukkan Tgl Lahir", "Menu Utama"],
        card: {
          title: "🔐 Secure Patient Lab Portal",
          sub: "LIS One-Time Token Auth",
          items: [
            { label: "No. Lab", val: "LAB-88102" },
            { label: "Token Access", val: "88102a (Expires 60m)" }
          ],
          status: "PII PROTECTED PORTAL"
        }
      }
    ]
  },
  {
    id: "diag7_emergency",
    categoryId: "healthcare",
    name: "7. Gawat Darurat",
    title: "7. Eskalasi Kondisi Gawat Darurat (Emergency Guardrail)",
    tag: "Guardrail",
    triggerType: "INBOUND_USER",
    description: "Penanganan kondisi darurat medis (Red Code). AI menghentikan percakapan seketika, menginstruksikan menelepon Hotline 119/IGD, memicu notifikasi internal, dan mengalihkan tiket ke Perawat Jaga IGD dengan SLA Urgent.",
    cekatComponents: ["AI Behaviour (kamus darurat, prioritas)", "Template Message (instruksi 119)", "Agent Transfer Condition (Teams IGD, SLA Urgent)", "Automation (notifikasi internal)"],
    apiScopes: ["Send Template Message -> kirim hotline darurat", "Internal webhook -> picu email/WA grup perawat jaga"],
    ruleNote: "Kanal WA asinkron — AI dilarang keras menangani darurat sendiri; hanya Human Agent boleh resolve tiket.",
    stepsDetail: [
      "Step 1 — Detect: AI dibekali kamus kata kunci darurat (tidak sadar, kejang, sesak, pendarahan). Prioritas absolut.",
      "Step 2 — Halt: Begitu terpicu, STOP seluruh alur percakapan lain seketika.",
      "Step 3 — Instruct: Kirim Template: telepon 119 / IGD (instruksi MENELEPON, bukan chat). Dilarang beri P3K.",
      "Step 4 — Notify: Trigger notifikasi internal (email / WA grup perawat jaga).",
      "Step 5 — Escalate: Assign Teams 'Command Center IGD', SLA Priority Urgent. AI tak boleh resolve sendiri."
    ],
    initialText: "Tolong, ibu saya tiba-tiba tidak sadarkan diri dan napasnya tersengal-sengal!",
    steps: [
      {
        userReply: "[EMERGENCY RED CODE DETECTED]",
        aiResponse: "🚨 *DETEKSI GAWAT DARURAT (TRIAGE RED)* 🚨\n\nMohon *SEGERA TELEPON HOTLINE IGD* di *119* atau *(021) 555-9119*.",
        chips: ["📞 Telepon Hotline 119", "🚑 Panggil Ambulans"],
        card: {
          title: "🚨 RED CODE EMERGENCY",
          sub: "Immediate Triage Override",
          items: [
            { label: "Hotline IGD", val: "119 / (021) 555-9119" },
            { label: "Action", val: "Telepon Langsung (Bukan Chat)" }
          ],
          status: "ESKALASI PERAWAT IGD"
        }
      }
    ]
  },
  {
    id: "diag8_queue",
    categoryId: "healthcare",
    name: "8. Cek Antrian",
    title: "8. Cek Antrian Real-time & Estimasi Waktu Tunggu",
    tag: "Queue API",
    triggerType: "INBOUND_USER",
    description: "Pasien mengecek nomor antrian poli yang sedang dipanggil. AI menarik data real-time dari API Queue SIMRS via n8n dan menyampaikan estimasi sisa antrian & waktu tunggu secara dinamis.",
    cekatComponents: ["Flow / WA Flows (tangkap nomor terstruktur)", "n8n (GET status antrian Queue HIS)", "AI Agent (jawaban dinamis)", "Custom Fields (RM transien)"],
    apiScopes: ["GET queue status -> nomor aktif, sisa antrian, estimasi waktu"],
    ruleNote: "Data antrian real-time hanya ada di HIS/Queue System — Followups native tak bisa menariknya.",
    stepsDetail: [
      "Step 1 — Capture: AI tangkap No. RM / Booking terstruktur via Flow / WA Flows.",
      "Step 2 — Lookup: n8n GET status antrian -> API Queue HIS (real-time data berubah tiap menit).",
      "Step 3 — Validate: Nomor valid -> lanjut; invalid -> minta ulang / verifikasi.",
      "Step 4 — Compose: AI rangkai jawaban dinamis: nomor dipanggil, sisa antrian, estimasi waktu.",
      "Step 5 — Deliver: Pasien terima estimasi 'A-045, sisa 6, ±20 menit'. No. RM disimpan transien untuk sesi."
    ],
    initialText: "Antrian saya berapa ya untuk Poli Anak jam 9 ini?",
    steps: [
      {
        userReply: "Cek Status Antrian RM-882910",
        aiResponse: "Status Antrian Real-time Poli Anak saat ini:",
        chips: ["🔄 Refresh Antrian", "📍 Denah Poli"],
        card: {
          title: "📊 Kartu Antrian Poli Anak",
          sub: "Live Queue Counter SIMRS",
          items: [
            { label: "Nomor Anda", val: "A-045" },
            { label: "Dipanggil", val: "A-039" },
            { label: "Sisa Antrian", val: "6 Pasien" },
            { label: "Estimasi", val: "±20 Menit" }
          ],
          status: "ESTIMASI TUNGGU: 20 MIN"
        }
      }
    ]
  },
  {
    id: "diag9_billing",
    categoryId: "healthcare",
    name: "9. Estimasi Biaya & BPJS",
    title: "9. Estimasi Biaya Tindakan & Konfirmasi Cakupan BPJS",
    tag: "Billing",
    triggerType: "INBOUND_USER",
    description: "Penjelasan estimasi paket biaya medis (misal Operasi ERACS) dan cakupan BPJS. AI wajib menyertakan disclaimer 'estimasi awal' dan dapat memicu Ticket ke Tim Admisi/Keuangan untuk konfirmasi resmi.",
    cekatComponents: ["Knowledge Source (kisaran biaya paket)", "AI Behaviour (disclaimer wajib)", "Automation (buat Ticket Verifikasi Biaya)", "Human Agent (Admisi/Keuangan)"],
    apiScopes: ["Create ticket -> board Verifikasi Biaya untuk tim Admisi/Keuangan"],
    ruleNote: "Biaya final bergantung kelas kamar, dokter, tindakan penyerta — kesalahan angka berisiko sengketa.",
    stepsDetail: [
      "Step 1 — Ask: Pasien tanya 'Operasi X berapa? BPJS penuh?'. AI dilarang beri harga mengikat.",
      "Step 2 — Range: AI ambil kisaran dari Knowledge Source paket biaya.",
      "Step 3 — Disclaim: Sampaikan estimasi + disclaimer 'estimasi awal, bukan harga final'.",
      "Step 4 — BPJS Info: Jika tanya BPJS -> jelaskan syarat umum rujukan berjenjang saja.",
      "Step 5 — Escalate: Butuh kepastian -> Automation buat Ticket board 'Verifikasi Biaya' untuk Admisi/Keuangan."
    ],
    initialText: "Operasi Caesar ERACS di sini berapa ya? Ditanggung BPJS penuh tidak?",
    steps: [
      {
        userReply: "Rincian Estimasi Biaya",
        aiResponse: "💰 *Estimasi Paket Operasi ERACS:*\n• Kelas 1: Rp 16.5M - Rp 19.5M\n• VIP: Rp 22M - Rp 26M\n\n⚠️ *Disclaimer:* Estimasi awal non-komplikasi. BPJS Kesehatan meng-cover penuh jika sesuai rujukan berjenjang Faskes 1.",
        chips: ["Syarat BPJS", "Hubungi Billing"],
        card: {
          title: "💰 Estimasi Biaya ERACS",
          sub: "SIMRS Tariff Rate Master",
          items: [
            { label: "Kelas 1", val: "Rp 16.500.000+" },
            { label: "Kelas VIP", val: "Rp 22.000.000+" }
          ],
          status: "BPJS COVERED (SYARAT BPKH)"
        }
      }
    ]
  },
  {
    id: "diag10_reschedule",
    categoryId: "healthcare",
    name: "10. Reschedule & Batal",
    title: "10. Reschedule & Pembatalan Janji Temu Dokter",
    tag: "HIS Action",
    triggerType: "INBOUND_USER",
    description: "Pengajuan pemindahan jadwal atau pembatalan kontrol dokter. n8n mengeksekusi kueri API slot ketersediaan baru ke SIMRS, meng-update jadwal, dan membebaskan slot lama secara otomatis.",
    cekatComponents: ["Flow (identifikasi booking & intent)", "n8n (API HIS: slot check, update, cancel)", "Template Message (Utility confirmation)", "Follow Ups (jadwal ulang)"],
    apiScopes: ["GET slot availability -> cek ketersediaan slot tujuan", "PATCH reschedule -> pindahkan booking & bebaskan slot lama", "DELETE / cancel booking -> batalkan & lepas slot"],
    ruleNote: "Inventori slot dikelola HIS eksternal — reschedule/cancel tak bisa selesai lewat teks tanpa integrasi.",
    stepsDetail: [
      "Step 1 — Identify: AI identifikasi No. RM/Booking + intent (ubah/batal).",
      "Step 2 — Route Intent: Reschedule -> Cek slot baru; Batal -> Cancel booking di HIS & bebaskan slot lama.",
      "Step 3 — HIS Call: n8n panggil API HIS untuk eksekusi perubahan.",
      "Step 4 — Fallback: Slot baru penuh -> Tawarkan slot alternatif terdekat dari API.",
      "Step 5 — Confirm: Kirim konfirmasi via Template Utility + Follow Up jadwal ulang."
    ],
    initialText: "Saya mau ganti jadwal kontrol dari Selasa ke Kamis untuk RM-882910.",
    steps: [
      {
        userReply: "Pindahkan ke Kamis 10:00",
        aiResponse: "Slot Kamis pukul 10:00 WIB bersama *Dr. Budi, Sp.B* (Poli Bedah) tersedia. Mengonfirmasi pemindahan jadwal...",
        chips: ["Cek Struk Reschedule", "Menu Utama"],
        card: {
          title: "🔄 Perubahan Jadwal Kontrol",
          sub: "SIMRS Booking Update",
          items: [
            { label: "Jadwal Lama", val: "Selasa 09:00 (Canceled)" },
            { label: "Jadwal Baru", val: "Kamis 10:00 WIB" },
            { label: "Status Slot", val: "Released & Locked" }
          ],
          status: "RESCHEDULE SUCCESS"
        }
      }
    ]
  },
  {
    id: "diag11_verification",
    categoryId: "healthcare",
    name: "11. Verifikasi Identitas",
    title: "11. Verifikasi Identitas Sebelum Membuka Data Medis",
    tag: "Security",
    triggerType: "INBOUND_USER",
    description: "Perlindungan privasi EMR pasien dari risiko impersonation. AI menjalankan WA Flows verifikasi No. RM + Tanggal Lahir / OTP sebelum membuka data medis sensitif.",
    cekatComponents: ["WA Flows (form verifikasi No. RM + Tgl Lahir / OTP)", "n8n (validasi input ke EMR)", "Agent Transfer Condition (eskalasi gagal berulang)", "AI Behaviour (tolak buka data)"],
    apiScopes: ["POST verify identity -> cek No. RM + Tgl Lahir / OTP terhadap EMR"],
    ruleNote: "Jawaban verifikasi diperlakukan transien — jangan disimpan di log permanen / Custom Fields.",
    stepsDetail: [
      "Step 1 — Request: Seseorang minta data 'atas nama' pasien (rawan impersonation).",
      "Step 2 — Challenge: Sebelum buka data, jalankan WA Flows verifikasi No. RM + Tgl Lahir / OTP.",
      "Step 3 — Validate: n8n validasi input ke EMR; sesi hanya lanjut bila data cocok.",
      "Step 4 — Grant: Cocok -> Lanjutkan sesi & buka data yang diminta saja.",
      "Step 5 — Lockout: Gagal (3x) -> Blokir & Agent Transfer ke verifikasi manual tim terkait."
    ],
    initialText: "Minta riwayat rekam medis atas nama Ibu Sukaesih dong.",
    steps: [
      {
        userReply: "Isi Form Verifikasi ID",
        aiResponse: "🛡️ *Verifikasi Privasi & Keamanan Data EMR*\n\nDemi keamanan data medis pasien, silakan verifikasi identitas (No. RM & Tanggal Lahir) melalui form terenkripsi berikut:",
        chips: ["📝 Buka Form Verifikasi ID", "❓ Lupa No. RM"],
        card: {
          title: "🛡️ Identity Verification Challenge",
          sub: "Patient Data Privacy Protection",
          items: [
            { label: "Requirement", val: "No. RM + Tgl Lahir" },
            { label: "Protection", val: "HIPAA & Permenkes" }
          ],
          status: "CHALLENGE PENDING"
        }
      }
    ]
  },
  {
    id: "diag12_preparation",
    categoryId: "healthcare",
    name: "12. Persiapan Tindakan",
    title: "12. Instruksi Persiapan Tindakan (Puasa / Pra-Prosedur)",
    tag: "Compliance",
    triggerType: "INBOUND_USER",
    description: "Panduan persiapan medis pra-prosedur (puasa makan/minum, penghentian obat). AI menyampaian instruksi resmi secara verbatim dari Knowledge Source klinik yang di-approve dokter.",
    cekatComponents: ["Knowledge Source (approved)", "AI Behaviour (hanya verbatim, tanpa improvisasi)", "Broadcast (Utility Template checklist H-1)", "HIS trigger (jadwal tindakan -> webhook)"],
    apiScopes: ["Webhook in (HIS->Cekat) -> jadwal tindakan H-1", "Send Template Message -> checklist persiapan"],
    ruleNote: "Instruksi klinis harus akurat & disetujui — AI dilarang menambah instruksi di luar konten resmi.",
    stepsDetail: [
      "Step 1 — Ask: Pasien tanya persiapan tindakan (durasi puasa, obat dihentikan).",
      "Step 2 — Match: AI mengidentifikasi jenis tindakan & cek Knowledge Source resmi.",
      "Step 3 — Verbatim: Ada -> Sampaikan instruksi VERBATIM dari Knowledge approved (dilarang improvisasi).",
      "Step 4 — Escalate: Tidak ada di Knowledge -> Eskalasi ke Human Agent (Perawat / Lab).",
      "Step 5 — Reminder: Broadcast H-1 checklist (Utility Template) di-trigger oleh HIS."
    ],
    initialText: "Besok saya endoskopi dan cek gula darah puasa, ada persiapan khusus yang harus saya lakukan?",
    steps: [
      {
        userReply: "Instruksi Puasa Medis",
        aiResponse: "📋 *Instruksi Persiapan Endoskopi & Cek Gula Darah Puasa (Resmi LAB RS):*\n\n1. **Puasa Makan & Minum:** Wajib puasa 8-10 jam sebelum tindakan (hanya boleh minum air putih sedikit).\n2. **Penghentian Obat:** Hentikan obat pengencer darah sesuai instruksi dokter pengampu.\n3. **Waktu Kedatangan:** Hadir 30 menit sebelum jadwal di Poli Laboratorium.",
        chips: ["Konfirmasi Paham", "Tanya Perawat Jaga"],
        card: {
          title: "📋 Official Procedure Checklist",
          sub: "Approved Lab Guidelines",
          items: [
            { label: "Tindakan", val: "Endoskopi & GDS Puasa" },
            { label: "Durasi Puasa", val: "8 - 10 Jam" },
            { label: "Waktu Tiba", val: "H-30 Menit" }
          ],
          status: "CLINICALLY APPROVED"
        }
      }
    ]
  },
  {
    id: "diag13_complaint",
    categoryId: "healthcare",
    name: "13. Komplain & Sentimen",
    title: "13. Penanganan Komplain & Sentimen Negatif Layanan",
    tag: "Humas",
    triggerType: "INBOUND_USER",
    description: "Penanganan komplain & sentimen negatif pasien. AI merespons empati tanpa defensif / tanpa janji kompensasi tertulis, membuatkan Ticket Komplain, dan mengeskalasikan ke Teams Humas.",
    cekatComponents: ["AI Behaviour (deteksi sentimen, empati tanpa janji)", "Automation (buat Ticket board 'Komplain')", "Labels / Custom Fields (kategori)", "Agent Transfer Condition (assign Humas, SLA Priority)"],
    apiScopes: ["Create ticket -> board Komplain + kategori & label"],
    ruleNote: "Respons defensif / janji kompensasi memperburuk situasi & bisa jadi bukti — wajib ditangani manusia.",
    stepsDetail: [
      "Step 1 — Detect: AI Behaviour mendeteksi sentimen negatif / kata kunci komplain ('pelayanan lama, kecewa').",
      "Step 2 — Empathize: Respons empati singkat — dilarang defensif, membantah, atau menjanjikan kompensasi.",
      "Step 3 — Log: Automation membuat Ticket board 'Komplain' + Labels/Custom Fields kategori.",
      "Step 4 — Route: Agent Transfer ke Teams 'Customer Relations / Humas' dengan SLA Priority.",
      "Step 5 — Resolve: Tim manusia menindaklanjuti cepat & gunakan data sebagai bahan QA manajemen."
    ],
    initialText: "Pelayanan lama sekali, perawatnya jutek, saya benar-benar kecewa dengan RS ini!",
    steps: [
      {
        userReply: "Eskalasi ke Customer Relations",
        aiResponse: "Kami memohon maaf atas ketidaknyamanan yang Anda alami. Masukan Anda sangat penting bagi kami. Percakapan ini langsung kami sambungkan ke Tim Customer Relations / Humas kami.",
        chips: ["Bicara dengan Tim Humas", "Menu Utama"],
        card: {
          title: "📢 Ticket Komplain & Quality Control",
          sub: "Customer Relations Escalation",
          items: [
            { label: "Kategori", val: "Pelayanan Perawat & Waktu Tunggu" },
            { label: "Sentimen", val: "NEGATIF (HIGH PRIORITY)" },
            { label: "Assigned To", val: "Teams Humas / Customer Relations" }
          ],
          status: "HUMAS ESCALATED"
        }
      }
    ]
  },
  {
    id: "diag14_booking",
    categoryId: "healthcare",
    name: "14. Booking Appointment",
    title: "14. Booking Appointment - Temu Janji Dokter",
    tag: "Core HIS",
    triggerType: "INBOUND_USER",
    description: "Alur end-to-end reservasi dokter. AI mengecek ketersediaan dokter secara real-time di SIMRS, memverifikasi status No. RM / Pasien Baru, memvalidasi rujukan BPJS VClaim, dan menerbitkan E-Tiket konfirmasi.",
    cekatComponents: ["AI Agent (ekstraksi poli & tanggal natural / WA Flow)", "API Tools (cek jadwal & booking langsung)", "n8n (orkestrasi lookup HIS)", "Follow Ups (reminder H-1 Confirm/Cancel)"],
    apiScopes: ["GET doctor schedule -> ketersediaan dokter per poli & tanggal, real-time", "POST booking -> buat reservasi & kembalikan Booking ID", "PATCH booking status -> update Confirm/Cancel dari reminder"],
    ruleNote: "Slot dokter tidak pernah di-cache di Cekat — selalu dibaca real-time dari HIS klien.",
    stepsDetail: [
      "Step 1 — Inquiry: Pasien minta booking; AI tangkap poli/dokter & tanggal via WA Flow / percakapan.",
      "Step 2 — Availability: n8n GET ketersediaan dokter real-time ke HIS (jadwal bisa berubah).",
      "Step 3 — Branching: Tersedia -> tampilkan dokter & tanyakan Pasien Lama/Baru; Penuh -> tawarkan slot alternatif.",
      "Step 4 — Registration: Pasien Lama cukup No. RM (data ditarik HIS); Pasien Baru isi registrasi dasar + metode bayar.",
      "Step 5 — Confirm & Reminder: POST booking -> buat Booking ID + Follow Up H-1 (tombol Confirm/Cancel)."
    ],
    initialText: "Saya mau booking dokter kandungan minggu depan.",
    steps: [
      {
        userReply: "Dr. Anita, Sp.OG (Kamis 14:00)",
        aiResponse: "Pilihan tepat! Anda memilih *Dr. Anita, Sp.OG (Kamis, 14:00 WIB)* di Poli Kandungan.\n\nApakah Anda Pasien Lama (memiliki Nomor Rekam Medis / No. RM) atau Pasien Baru?",
        chips: ["Pasien Lama (RM-882910)", "Pasien Baru (Daftar)"]
      },
      {
        userReply: "Pasien Lama (RM-882910)",
        aiResponse: "Terima kasih Ibu *Siti Rahma (RM-882910)*.\n\nMohon pilih metode pembayaran / penjaminan kesehatan Anda:",
        chips: ["BPJS Kesehatan (VClaim)", "Asuransi Swasta", "Umum / Mandiri"]
      },
      {
        userReply: "BPJS Kesehatan (VClaim)",
        aiResponse: "📄 *Validasi VClaim BPJS Successful*\n\n• **No. Kartu:** 000199288102\n• **Rujukan:** 12345/BPJS/2026 (Puskesmas Menteng)\n• **Poli Tujuan:** Spesialis Kandungan\n• **Status:** ✅ Valid & Aktif",
        chips: ["Lanjutkan Konfirmasi", "Ubah Data"]
      },
      {
        userReply: "Lanjutkan Konfirmasi",
        aiResponse: "✅ *RESERVASI BERHASIL DIPROSES DI SIMRS!*\n\n• **Kode Booking:** #BK-99201\n• **Pasien:** Siti Rahma (RM-882910)\n• **Dokter:** Dr. Anita, Sp.OG\n• **Poli:** Poli Kandungan & Kebidanan\n• **Waktu:** Kamis, 14:00 WIB\n• **Penjamin:** BPJS Kesehatan (VClaim Verified)\n\nPengingat otomatis H-1 telah dijadwalkan.",
        chips: ["📍 Petunjuk Lokasi Poli", "📥 Unduh Tiket PDF", "Menu Utama"],
        card: {
          title: "🎫 E-Tiket Janji Dokter SIMRS",
          sub: "Poli Kandungan - RS Sehat Utama",
          items: [
            { label: "Kode Booking", val: "#BK-99201" },
            { label: "Pasien", val: "Siti Rahma (RM-882910)" },
            { label: "Dokter", val: "Dr. Anita, Sp.OG" },
            { label: "Penjamin", val: "BPJS VClaim Verified" },
            { label: "Waktu", val: "Kamis, 14:00 WIB" }
          ],
          status: "SIMRS CONFIRMED & LOCKED"
        }
      }
    ]
  },
  {
    id: "diag15_csat",
    categoryId: "healthcare",
    name: "15. Survey CSAT",
    title: "15. Survey CSAT - Pasca Rawat Inap / Jalan / Konsultasi",
    tag: "SIMRS Event",
    triggerType: "OUTBOUND_SYSTEM",
    outboundPill: "⭐ OUTBOUND DISCHARGE TRIGGER (SURVEY CSAT)",
    description: "Pengumpulan ulasan & feedback kepuasan pasien pasca rawat inap/jalan. Dipicu oleh webhook SIMRS saat status kunjungan pasien berubah menjadi Discharge.",
    cekatComponents: ["SIMRS (trigger saat selesai)", "Send Template Message (broadcast)", "WA Form (survey terstruktur)", "Automation / CRM (simpan & follow up)"],
    apiScopes: ["Webhook in (SIMRS->Cekat) -> status pasien selesai", "POST survey result -> simpan hasil ke SIMRS / CRM"],
    ruleNote: "Cekat tak punya visibilitas status kunjungan real-time — trigger survey wajib dari SIMRS.",
    stepsDetail: [
      "Step 1 — Trigger: SIMRS trigger utama saat status pasien 'selesai dilayani' (discharge / selesai konsultasi).",
      "Step 2 — Select: n8n pilih template survey sesuai jenis layanan (rawat inap vs jalan/konsultasi).",
      "Step 3 — Send Form: AI kirim Broadcast berisi WA Form agar pengisian terstruktur (bukan hanya rating 1-5).",
      "Step 4 — Store: Hasil disimpan balik ke SIMRS via API, atau ke spreadsheet/CRM Cekat.",
      "Step 5 — Act: Skor rendah -> follow up Tim Mutu; sisanya diarsip untuk QA."
    ],
    initialText: "⭐ *Survey Kepuasan Pelayanan RS Sehat Utama*\n\nTerima kasih telah berobat di RS Sehat Utama hari ini. Mohon berikan penilaian 1 menit untuk meningkatkan mutu pelayanan kami:",
    steps: [
      {
        userReply: "⭐⭐⭐⭐⭐ Sangat Puas",
        aiResponse: "🙌 *Terima kasih atas apresiasi & ulasan bintang 5 Anda!*\n\nMasukan Anda sangat berharga bagi peningkatan pelayanan medis kami.",
        chips: ["📝 Tulis Ulasan Google Maps", "Menu Utama"],
        card: {
          title: "⭐ CSAT Patient Experience",
          sub: "Discharge Feedback Survey",
          items: [
            { label: "Rating", val: "5 / 5 Star (Sangat Puas)" },
            { label: "Poli", val: "Poli Bedah VIP" }
          ],
          status: "FEEDBACK RECORDED"
        }
      }
    ]
  },
  {
    id: "diag16_nearby",
    categoryId: "healthcare",
    name: "16. Cari Klinik Terdekat",
    title: "16. Cari Klinik Terdekat (Share Location WhatsApp)",
    tag: "Location WA",
    triggerType: "INBOUND_USER",
    description: "Pencarian cabang klinik terdekat dari posisi pasien. Pasien membagikan titik lokasi via fitur Share Location WhatsApp, n8n menguraikan Latitude & Longitude, lalu menampilkan klinik terdekat dalam radius 20 KM.",
    cekatComponents: ["AI Agent + Tool (tangkap koordinat)", "n8n (hit API SIMRS lat/long/kota)", "Knowledge Source (koordinat cabang fallback)", "WhatsApp Share Location"],
    apiScopes: ["GET nearest clinic -> parameter lat, long, dan/atau kota"],
    ruleNote: "Perhitungan jarak butuh koordinat pasti — Share Location wajib; hanya tersedia di kanal WhatsApp.",
    stepsDetail: [
      "Step 1 — Ask: Pasien minta klinik/cabang terdekat (kanal WhatsApp).",
      "Step 2 — Share Location: AI minta Share Location WA lalu ambil latitude & longitude (bukan nama kota).",
      "Step 3 — Route: Ada API SIMRS -> GET klinik terdekat; tidak ada -> hitung dari koordinat di Knowledge.",
      "Step 4 — Compute: Fallback statis: tiap cabang wajib punya lat/long; filter radius mis. 20 KM.",
      "Step 5 — Show: Tampilkan daftar klinik terdekat + alamat/peta; fallback non-WA: sebut kota manual."
    ],
    initialText: "Klinik terdekat dari lokasi saya di mana ya?",
    steps: [
      {
        userReply: "📍 Share Live Location",
        aiResponse: "📍 Lokasi Klinik Terdekat (Radius 5 KM):\n1. *Klinik Menteng* (2.1 km)\n2. *Klinik Cikini* (4.3 km)",
        chips: ["🗺️ Maps Menteng", "📞 Telp Menteng"],
        card: {
          title: "📍 Klinik Menteng (2.1 KM)",
          sub: "Jl. Cikini Raya No. 45",
          items: [
            { label: "Distance", val: "2.1 KM" },
            { label: "Hours", val: "s/d 21:00 WIB" }
          ],
          status: "KLINIK BUKA"
        }
      }
    ]
  }
];
