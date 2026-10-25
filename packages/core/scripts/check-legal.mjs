// Checks that each legal document's "Last updated" date in src/legal.js was changed whenever its wording was.
// The last accepted wording (a short hash) and date of each document are kept in legal-hashes.json (committed).
//   npm run legal:check    (also part of the root `npm run lint`): fails if a document's wording changed but its
//                          date did not; otherwise records the current wording and dates
//   npm run legal:accept   records the current wording without a new date (typo or formatting fixes)

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const LEGAL = fileURLToPath(new URL('../src/legal.js', import.meta.url));
const HASHES = fileURLToPath(new URL('./legal-hashes.json', import.meta.url));
const accept = process.argv.includes('--accept');

const { LegalDoc, STUDENT_LEGAL_DOCS, STAFF_LEGAL_DOCS } = await import(pathToFileURL(LEGAL).href);
// Keys match the UPDATED object in legal.js
const docs = {
  studentTerms: STUDENT_LEGAL_DOCS[LegalDoc.TERMS],
  privacy: STUDENT_LEGAL_DOCS[LegalDoc.PRIVACY],
  staffTerms: STAFF_LEGAL_DOCS[LegalDoc.TERMS],
};

// Everything except the date itself
const hashOf = (doc) => createHash('sha256').update(JSON.stringify({ ...doc, updated: undefined })).digest('hex').slice(0, 16);

let known = {};
try {
  known = JSON.parse(await readFile(HASHES, 'utf8'));
} catch {
  // First run: everything is recorded as it is
}

const current = {};
const stale = [];
for (const [key, doc] of Object.entries(docs)) {
  current[key] = { hash: hashOf(doc), updated: doc.updated };
  const last = known[key];
  if (last && last.hash !== current[key].hash && last.updated === doc.updated) stale.push(`${doc.title} (UPDATED.${key})`);
}

if (stale.length && !accept) {
  console.error(
    `Legal wording changed but its "Last updated" date did not:\n${stale.map((s) => `  - ${s}`).join('\n')}\n`
    + 'Set the new date in packages/core/src/legal.js, or run `npm run legal:accept` if the change is only a typo or formatting fix.',
  );
  process.exit(1);
}

if (JSON.stringify(current) !== JSON.stringify(known)) {
  await writeFile(HASHES, `${JSON.stringify(current, null, 2)}\n`);
}
console.log(accept && stale.length ? `Legal: accepted without a new date: ${stale.join(', ')}` : 'Legal dates OK');
