#!/usr/bin/env node
// Autonomous Cold Case Investigator
// Runs every 4 hours via GitHub Actions.
// Finds cases with fewer than 3 leads, generates a forensic analysis
// using OpenAI, and posts the result back to the ledger.

const API_BASE = (process.env.API_BASE_URL || 'https://cold-case-ledger.replit.app').replace(/\/$/, '');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DETECTIVE_SONNET_ID = 'fc392a80-1b14-4fe3-8e36-dc65296decfe';
const LEAD_THRESHOLD = 10;

if (!OPENAI_API_KEY) {
  console.error('[FATAL] OPENAI_API_KEY is not set.');
  process.exit(1);
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status} from ${url}: ${body}`);
  }
  return res.json();
}

async function getCases() {
  return fetchJSON(`${API_BASE}/api/cases`);
}

async function getLeadsForCase(caseId) {
  const all = await fetchJSON(`${API_BASE}/api/leads`);
  return all.filter(l => String(l.case_id) === String(caseId) || String(l.cases?.id) === String(caseId));
}

async function generateAnalysis(caseData, existingLeads) {
  const existingSummary = existingLeads.length > 0
    ? existingLeads.map((l, i) => `Lead ${i + 1}: ${l.content || l.description || JSON.stringify(l)}`).join('\n\n')
    : 'No prior leads submitted yet.';

  const prompt = [
    `You are DETECTIVE-SONNET, an autonomous forensic intelligence analyst working on cold cases.`,
    ``,
    `CASE FILE: ${caseData.title}`,
    `Description: ${caseData.description || 'No description available.'}`,
    `Location: ${caseData.location || 'Unknown'}`,
    ``,
    `EXISTING LEADS (${existingLeads.length}):`,
    existingSummary,
    ``,
    `Your task: Submit one new forensic lead that adds meaningful intelligence value.`,
    `Focus on a specific angle not already covered by existing leads.`,
    `Format: Start with a header like [FORENSIC ANALYSIS — ${caseData.title}], then present`,
    `your findings with key indicators and a probable conclusion.`,
    `Be specific. Reference real historical facts where applicable. 150–300 words.`,
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function postLead(caseId, content) {
  return fetchJSON(`${API_BASE}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      case_id: caseId,
      agent_id: DETECTIVE_SONNET_ID,
      content,
      source_url: '',
    }),
  });
}

async function main() {
  console.log(`[INIT] Cold Case Investigator starting — ${new Date().toISOString()}`);
  console.log(`[INIT] Target: ${API_BASE}`);

  const cases = await getCases();
  console.log(`[INFO] Fetched ${cases.length} case(s).`);

  const underInvestigated = cases.filter(c => c.lead_count < LEAD_THRESHOLD);
  console.log(`[INFO] ${underInvestigated.length} case(s) have fewer than ${LEAD_THRESHOLD} leads.`);

  if (underInvestigated.length === 0) {
    console.log('[INFO] All cases are sufficiently investigated. Nothing to do.');
    return;
  }

  for (const caseData of underInvestigated) {
    console.log(`\n[CASE] Processing: ${caseData.title} (${caseData.lead_count} existing leads)`);

    const existingLeads = await getLeadsForCase(caseData.id);
    console.log(`[CASE] Retrieved ${existingLeads.length} existing lead(s) for context.`);

    const analysis = await generateAnalysis(caseData, existingLeads);
    console.log(`[CASE] Analysis generated (${analysis.length} chars).`);

    const lead = await postLead(caseData.id, analysis);
    console.log(`[CASE] Lead posted. ID: ${lead.id}`);
  }

  console.log('\n[DONE] Investigation cycle complete.');
}

main().catch(err => {
  console.error('[FATAL]', err.message);
  process.exit(1);
});
