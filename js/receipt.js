/* ============================================
   REÇU PDF — Génération automatique
   ============================================ */

/* Config par maison */
const RECEIPT_CONFIG = {
  beauty: {
    name: 'Beauty by Asty',
    sub: 'Beauté · Maquillage · Abidjan',
    logo: 'https://i.postimg.cc/3NLfBy9m/beaute.png',
    color: '#1C1410',
    accent: '#B8895A',
    prefix: 'BBA'
  },
  deco: {
    name: 'Beauty by Asty Déco',
    sub: 'Décoration d\'intérieur · Abidjan',
    logo: 'https://i.postimg.cc/J0Kv2Y75/design.png',
    color: '#1C1410',
    accent: '#8B4A3B',
    prefix: 'BBD'
  },
  studio: {
    name: 'Beauty by Asty Studio',
    sub: 'Création de contenu · Abidjan',
    logo: 'https://i.postimg.cc/fLfrVq9m/studio.png',
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

/* Génère un ID unique et lisible */
function generateReceiptId(brand) {
  const cfg = RECEIPT_CONFIG[brand] || RECEIPT_CONFIG.group;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cfg.prefix}-${y}${m}${d}-${rand}`;
}

/* Génère le PDF du reçu */
async function generateReceiptPDF(data, brand) {
  const cfg = RECEIPT_CONFIG[brand] || RECEIPT_CONFIG.group;
  const receiptId = data.receiptId || generateReceiptId(brand);

  // Crée le PDF (format A4 portrait, unités mm)
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // ============================================
  // FOND
  // ============================================
  doc.setFillColor(250, 247, 242); // alabaster
  doc.rect(0, 0, W, H, 'F');

  // ============================================
  // BANDE HAUTE (espresso)
  // ============================================
  doc.setFillColor(28, 20, 16);
  doc.rect(0, 0, W, 40, 'F');

  // ============================================
  // LOGO (essai de chargement)
  // ============================================
  try {
    const logoData = await loadImageAsDataURL(cfg.logo);
    // Logo centré en haut
    doc.addImage(logoData, 'PNG', W / 2 - 15, 8, 30, 30);
  } catch (e) {
    console.warn('Logo non chargé :', e);
    // Fallback : monogramme texte
    doc.setTextColor(250, 247, 242);
    doc.setFont('times', 'italic');
    doc.setFontSize(28);
    doc.text('BBA', W / 2, 25, { align: 'center' });
  }

  // ============================================
  // TITRE DE LA MAISON
  // ============================================
  doc.setTextColor(250, 247, 242);
  doc.setFont('times', 'normal');
  doc.setFontSize(16);
  doc.text(cfg.name, W / 2, 52, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(184, 137, 90);
  doc.text(cfg.sub.toUpperCase(), W / 2, 58, { align: 'center' });

  // ============================================
  // TITRE PRINCIPAL
  // ============================================
  doc.setTextColor(28, 20, 16);
  doc.setFont('times', 'italic');
  doc.setFontSize(32);
  doc.text('Reçu de Réservation', W / 2, 90, { align: 'center' });

  // Ligne décorative
  doc.setDrawColor(184, 137, 90);
  doc.setLineWidth(0.3);
  doc.line(W / 2 - 40, 96, W / 2 + 40, 96);

  // ============================================
  // NUMÉRO DE REÇU
  // ============================================
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 100, 80);
  doc.text('NUMÉRO DE REÇU', W / 2, 108, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(28, 20, 16);
  doc.text(receiptId, W / 2, 116, { align: 'center' });

  // ============================================
  // BLOC INFORMATIONS CLIENT
  // ============================================
  const boxY = 130;
  const boxW = 160;
  const boxX = (W - boxW) / 2;

  // Cadre
  doc.setDrawColor(232, 221, 208);
  doc.setLineWidth(0.3);
  doc.rect(boxX, boxY, boxW, 70);

  // Titre du cadre
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(184, 137, 90);
  doc.text('DÉTAILS DE LA RÉSERVATION', boxX + 8, boxY + 10);

  // Colonne gauche
  const col1X = boxX + 8;
  const col2X = boxX + boxW / 2 + 4;
  let rowY = boxY + 22;

  // Nom
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
  doc.text(data.date || '—', col2X, rowY2 + 6);

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

  // ============================================
  // MESSAGE (si présent)
  // ============================================
  if (data.message && data.message.trim()) {
    const msgY = boxY + 80;
    doc.setDrawColor(232, 221, 208);
    doc.rect(boxX, msgY, boxW, 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(184, 137, 90);
    doc.text('MESSAGE', boxX + 8, msgY + 10);

    doc.setFontSize(10);
    doc.setTextColor(28, 20, 16);
    doc.setFont('times', 'italic');
    const msgLines = doc.splitTextToSize(data.message, boxW - 16);
    doc.text(msgLines, boxX + 8, msgY + 18);
  }

  // ============================================
  // BLOC "À PRÉSENTER À L'ACCUEIL"
  // ============================================
  const infoY = 245;

  // Fond espresso
  doc.setFillColor(28, 20, 16);
  doc.rect(boxX, infoY, boxW, 26, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(184, 137, 90);
  doc.text('À PRÉSENTER À L\'ACCUEIL', W / 2, infoY + 10, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(250, 247, 242);
  doc.text(
    'Ce reçu atteste de votre réservation. Merci de le présenter à votre arrivée.',
    W / 2, infoY + 18, { align: 'center', maxWidth: boxW - 16 }
  );

  // ============================================
  // PIED DE PAGE
  // ============================================
  const footerY = H - 30;
  doc.setDrawColor(232, 221, 208);
  doc.setLineWidth(0.3);
  doc.line(20, footerY, W - 20, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 80);
  doc.text(
    'Cocody, Quartier Jules Vernes, Ruelle face pharmacie Kannien, Villa 188 — Abidjan, Côte d\'Ivoire',
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

  // ============================================
  // SAUVEGARDE
  // ============================================
  const fileName = `Recu-${receiptId}.pdf`;
  doc.save(fileName);
}

/* Charge une image et la convertit en DataURL */
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
      try {
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Image non chargée'));
    img.src = url;
  });
}
