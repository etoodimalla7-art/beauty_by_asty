/* ============================================
   REÇU PDF — Beauty by Asty
   v2 (logos corrigés + QR code + dates propres)
   ============================================ */

/* ---- Config par maison ---- */
const RECEIPT_CONFIG = {
  beauty: {
    name: 'Beauty by Asty',
    sub: 'Beauté · Maquillage · Abidjan',
    logo: 'https://i.postimg.cc/66nqg9G0/beaute.png',
    color: '#1C1410',
    accent: '#B8895A',
    prefix: 'BBA'
  },
  deco: {
    name: 'Beauty by Asty Déco',
    sub: "Décoration d'intérieur · Abidjan",
    logo: 'https://i.postimg.cc/3wmz7bC8/design.png',
    color: '#1C1410',
    accent: '#8B4A3B',
    prefix: 'BBD'
  },
  studio: {
    name: 'Beauty by Asty Studio',
    sub: 'Création de contenu · Abidjan',
    logo: 'https://i.postimg.cc/wxZMb1vz/studio.png',
    color: '#1C1410',
    accent: '#B8895A',
    prefix: 'BBS'
  },
  group: {
    name: 'Beauty by Asty',
    sub: 'Groupe · Beauté · Déco · Studio',
    logo: 'https://i.postimg.cc/hGjxFhk9/f4c7dd9c-a888-401e-bdf4-98204fceed03.png',
    color: '#1C1410',
    accent: '#B8895A',
    prefix: 'BBG'
  }
};

/* ---- ID unique lisible ---- */
function generateReceiptId(brand) {
  const cfg = RECEIPT_CONFIG[brand] || RECEIPT_CONFIG.group;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cfg.prefix}-${y}${m}${d}-${rand}`;
}

/* ---- Formate une date ISO en français lisible ---- */
function formatDateFR(isoDate) {
  if (!isoDate) return '—';
  try {
    const d = new Date(isoDate);
    if (isNaN(d)) return isoDate;
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch (_) { return isoDate; }
}

/* ---- Hex → RGB pour jsPDF ---- */
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16)
  ];
}

/* ---- Génère le PDF ---- */
async function generateReceiptPDF(data, brand) {
  const cfg = RECEIPT_CONFIG[brand] || RECEIPT_CONFIG.group;
  const receiptId = data.receiptId || generateReceiptId(brand);

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // ----- Fond alabaster -----
  doc.setFillColor(250, 247, 242);
  doc.rect(0, 0, W, H, 'F');

  // ----- Bande haute espresso -----
  doc.setFillColor(28, 20, 16);
  doc.rect(0, 0, W, 42, 'F');

  // ----- Logo -----
  try {
    const logoData = await loadImageAsDataURL(cfg.logo);
    doc.addImage(logoData, 'PNG', W / 2 - 14, 6, 28, 28);
  } catch (e) {
    console.warn('[receipt] Logo non chargé:', e);
    doc.setTextColor(250, 247, 242);
    doc.setFont('times', 'italic');
    doc.setFontSize(26);
    doc.text('BBA', W / 2, 26, { align: 'center' });
  }

  // ----- Titre maison -----
  doc.setTextColor(250, 247, 242);
  doc.setFont('times', 'normal');
  doc.setFontSize(15);
  doc.text(cfg.name, W / 2, 54, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(184, 137, 90);
  doc.text(cfg.sub.toUpperCase(), W / 2, 60, { align: 'center' });

  // ----- Titre principal -----
  doc.setTextColor(28, 20, 16);
  doc.setFont('times', 'italic');
  doc.setFontSize(30);
  doc.text('Reçu de Réservation', W / 2, 92, { align: 'center' });

  // Ligne dorée
  doc.setDrawColor(184, 137, 90);
  doc.setLineWidth(0.3);
  doc.line(W / 2 - 40, 98, W / 2 + 40, 98);

  // ----- Numéro de reçu -----
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 80);
  doc.text('NUMÉRO DE REÇU', W / 2, 110, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(28, 20, 16);
  doc.text(receiptId, W / 2, 118, { align: 'center' });

  // ----- Bloc détails -----
  const boxY = 132;
  const boxW = 160;
  const boxX = (W - boxW) / 2;
  const boxH = 74;

  doc.setDrawColor(232, 221, 208);
  doc.setLineWidth(0.3);
  doc.rect(boxX, boxY, boxW, boxH);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(184, 137, 90);
  doc.text('DÉTAILS DE LA RÉSERVATION', boxX + 8, boxY + 10);

  const col1X = boxX + 8;
  const col2X = boxX + boxW / 2 + 4;
  let rowY = boxY + 22;

  // Client
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 80);
  doc.text('CLIENT', col1X, rowY);
  doc.setFontSize(11);
  doc.setTextColor(28, 20, 16);
  doc.setFont('times', 'normal');
  doc.text(data.name || '—', col1X, rowY + 6);

  // Téléphone
  rowY += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 80);
  doc.text('TÉLÉPHONE', col1X, rowY);
  doc.setFontSize(11);
  doc.setTextColor(28, 20, 16);
  doc.setFont('times', 'normal');
  doc.text(data.phone || '—', col1X, rowY + 6);

  // Prestation
  rowY += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 80);
  doc.text('PRESTATION', col1X, rowY);
  doc.setFontSize(11);
  doc.setTextColor(28, 20, 16);
  doc.setFont('times', 'normal');
  doc.text(data.service || '—', col1X, rowY + 6);

  // Date
  let rowY2 = boxY + 22;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 80);
  doc.text('DATE', col2X, rowY2);
  doc.setFontSize(11);
  doc.setTextColor(28, 20, 16);
  doc.setFont('times', 'normal');
  doc.text(formatDateFR(data.date), col2X, rowY2 + 6);

  // Heure
  rowY2 += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 80);
  doc.text('HEURE', col2X, rowY2);
  doc.setFontSize(11);
  doc.setTextColor(28, 20, 16);
  doc.setFont('times', 'normal');
  doc.text(data.time || '—', col2X, rowY2 + 6);

  // Lieu
  rowY2 += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 80);
  doc.text('LIEU', col2X, rowY2);
  doc.setFontSize(11);
  doc.setTextColor(28, 20, 16);
  doc.setFont('times', 'normal');
  doc.text(data.location || 'À définir', col2X, rowY2 + 6);

  // ----- Message (optionnel) -----
  let cursorY = boxY + boxH + 8;
  if (data.message && data.message.trim()) {
    doc.setDrawColor(232, 221, 208);
    doc.rect(boxX, cursorY, boxW, 26);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(184, 137, 90);
    doc.text('MESSAGE', boxX + 8, cursorY + 9);
    doc.setFontSize(10);
    doc.setTextColor(28, 20, 16);
    doc.setFont('times', 'italic');
    const lines = doc.splitTextToSize(data.message, boxW - 16);
    doc.text(lines, boxX + 8, cursorY + 17);
    cursorY += 32;
  }

  // ----- QR code (optionnel, si lib QRCode disponible) -----
  if (window.QRCode) {
    try {
      const qrUrl = `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, '')}recu.html?id=${encodeURIComponent(receiptId)}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 0, width: 200 });
      doc.addImage(qrDataUrl, 'PNG', W - 60, cursorY, 30, 30);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(120, 100, 80);
      doc.text('Scanner pour vérifier', W - 60, cursorY + 33);
    } catch (e) {
      console.warn('[receipt] QR non généré:', e);
    }
  }

  // ----- Bandeau "À PRÉSENTER À L'ACCUEIL" -----
  const infoY = 246;
  doc.setFillColor(28, 20, 16);
  doc.rect(boxX, infoY, boxW, 28, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(184, 137, 90);
  doc.text("À PRÉSENTER À L'ACCUEIL", W / 2, infoY + 10, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(250, 247, 242);
  doc.text(
    'Ce reçu atteste de votre réservation. Merci de le présenter à votre arrivée.',
    W / 2, infoY + 19, { align: 'center', maxWidth: boxW - 16 }
  );

  // ----- Mentions légales -----
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 100, 80);
  doc.text(
    'Annulation gratuite jusqu\'à 24h avant. Passé ce délai, contactez-nous directement.',
    W / 2, infoY + 38, { align: 'center', maxWidth: boxW }
  );

  // ----- Pied de page -----
  const footerY = H - 30;
  doc.setDrawColor(232, 221, 208);
  doc.setLineWidth(0.3);
  doc.line(20, footerY, W - 20, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 80);
  doc.text(
    "Cocody, Quartier Jules Vernes, Ruelle face pharmacie Kannien, Villa 188 — Abidjan, Côte d'Ivoire",
    W / 2, footerY + 6, { align: 'center' }
  );
  doc.text(
    '+225 98 38 65 99 · beautybyasty@gmail.com · @beautybyasty',
    W / 2, footerY + 12, { align: 'center' }
  );

  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(184, 137, 90);
  doc.text(
    `Émis le ${new Date().toLocaleDateString('fr-FR')}`,
    W / 2, footerY + 20, { align: 'center' }
  );

  // ----- Sauvegarde -----
  doc.save(`Recu-${receiptId}.pdf`);
}

/* ---- Charge une image distante en DataURL ---- */
function loadImageAsDataURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try { resolve(canvas.toDataURL('image/png')); }
      catch (err) { reject(err); }
    };
    img.onerror = () => reject(new Error('Image non chargée: ' + url));
    img.src = url;
  });
}
