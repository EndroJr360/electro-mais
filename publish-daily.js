import fs from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!raw) throw new Error('Falta o secret FIREBASE_SERVICE_ACCOUNT_JSON no GitHub.');
const serviceAccount = JSON.parse(raw);
initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id });
const db = getFirestore();
const tips = JSON.parse(fs.readFileSync(new URL('../content/dicas.json', import.meta.url), 'utf8'));
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Maputo' });
const epochDay = Math.floor(Date.parse(`${today}T00:00:00Z`) / 86400000);
const tip = tips[((epochDay % tips.length) + tips.length) % tips.length];
const id = `daily-tip-${today}`;
const ref = db.collection('electroContent').doc(id);
const existing = await ref.get();
if (existing.exists) {
  console.log(`Já existe publicação para ${today}; nada alterado (${id}).`);
} else {
  await ref.set({
    ...tip,
    id,
    author: 'Electro Mais Moçambique',
    published: true,
    publishDate: today,
    createdAt: new Date().toISOString(),
    createdBy: 'github-actions-daily-scheduler',
    source: 'agendamento-automatico',
    createdWith: 'Electro Mais daily scheduler',
    publishedAt: FieldValue.serverTimestamp()
  });
  console.log(`Publicada dica ${id}: ${tip.title}`);
}
