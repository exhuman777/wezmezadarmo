import { NextRequest } from 'next/server';
import { chatCompletion } from '@/ai/openrouter';
import { CORS_HEADERS, optionsResponse } from '@/lib/apiAuth';

export async function OPTIONS() {
  return optionsResponse();
}

export interface ZusZ15aProfile {
  powodOpieki: string;
  relacjaDoZiecka: string;
}

export interface FormProfile {
  projectName: string;
  websiteUrl: string;
  projectDescription: string;
  problemSolved: string;
  targetUsers: string;
  fundingGoals: string;
  isOpenSource: boolean;
  license: string;
  amountRequested: string;
  organizationName: string;
  country: string;
  priorFunding: string;
  teamDescription: string;
}

interface FormAssistRequest {
  formType: 'nlnet' | 'zus-z15a-justification';
  fieldKey: string;
  fieldLabel: string;
  fieldDescription: string;
  profile: FormProfile | ZusZ15aProfile;
}

const NLNET_FIELD_PROMPTS: Record<string, string> = {
  abstract: `Write a compelling abstract for an NLnet NGI Zero Commons Fund grant application (300-400 words).
The abstract must explain the entire project and its expected outcomes.
Structure: (1) Problem statement, (2) What the project does, (3) Technical approach, (4) Social impact, (5) What the grant will fund specifically.
Write in English. Do not use bullet points -- use flowing paragraphs.
Do not start with "This project" or "We". Start with the problem or a strong statement.`,

  prior_involvement: `Write the "Prior involvement" section for an NLnet application.
Describe any prior involvement with NLnet, NGI programs, or related open-source/civic tech organizations.
If no prior involvement, state this honestly and briefly mention connections to the ecosystem (conferences, communities, partnerships).
Keep it to 2-3 sentences. Be factual and concise.`,

  budget_breakdown: `Write a detailed budget breakdown for an NLnet grant application.
Include: task name, hours, hourly rate (€75/hr), total per task, and brief task description.
Cover: open-sourcing and documentation, core feature development, database expansion, testing, community outreach, infrastructure.
Format as a numbered list with clear structure. End with a total that matches the requested amount.
Justify the hourly rate in 1 sentence.`,

  other_funding: `Write the "Other funding sources" section for an NLnet application.
Describe all past, current, and pending funding for this project.
If self-funded with no external investment, state this clearly and honestly.
Mention any planned revenue model if applicable. Keep it to 2-3 sentences.`,

  comparison: `Write the "Comparison with existing/historical efforts" section for an NLnet application.
Compare this project to: (1) existing tools solving the same problem, (2) historical or international equivalents.
Explain what makes this project different: technical approach, openness, scope, target users, or sustainability model.
Be specific. Name actual competing tools and explain the genuine differences. 3-4 paragraphs.`,

  technical_challenges: `Write the "Expected technical challenges" section for an NLnet application.
List 3-5 concrete technical challenges that make this project non-trivial.
For each: describe the challenge and the proposed solution or mitigation approach.
Focus on actual engineering difficulty, not project management. Use numbered list format.`,

  ecosystem: `Write the "Ecosystem description and stakeholder engagement strategy" for an NLnet application.
Describe: (1) who are the primary stakeholders, (2) how will you engage them, (3) how will the project contribute back to the open-source ecosystem.
Include: plans for community building, documentation, conference participation, partnerships with NGOs or institutions.
3-4 paragraphs.`,

  ai_disclosure: `Write the "Generative AI disclosure" for an NLnet application.
This application was drafted with AI assistance (Claude by Anthropic) for structure and phrasing.
All factual content was provided and verified by the applicant. The final text was reviewed and edited by the applicant.
Write this as a clear, honest 2-3 sentence disclosure. Do not be defensive about AI use -- NLnet explicitly asks for this information.`,
};

export async function POST(request: NextRequest) {
  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ error: 'Brak klucza API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  let body: FormAssistRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const { formType, fieldKey, profile } = body;

  const ft = formType as string;
  if (ft !== 'nlnet' && ft !== 'zus-z15a-justification') {
    return new Response(JSON.stringify({ error: 'Unsupported form type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  // ZUS Z-15a: generate justification for why second parent can't care for child
  if (ft === 'zus-z15a-justification') {
    const zusProfile = body.profile as ZusZ15aProfile;
    const { powodOpieki, relacjaDoZiecka } = zusProfile;
    const result = await chatCompletion([
      { role: 'system', content: 'Jestes asystentem pomagajacym wypelnic formularz ZUS Z-15a. Pisz po polsku, zwiezle, formalnie.' },
      { role: 'user', content: `Wygeneruj krotkie oswiadczenie (1-2 zdania) dlaczego wspolmalzonek lub drugi rodzic nie moze sprawowac opieki nad dzieckiem. Powod opieki wnioskodawcy: ${powodOpieki}. Relacja wnioskodawcy do dziecka: ${relacjaDoZiecka}. Napisz oswiadczenie w pierwszej osobie liczby mnogiej (my/wspolmalzonek). Brak cudzysłowow.` },
    ]);
    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const nlnetProfile = body.profile as FormProfile;
  const fieldPrompt = NLNET_FIELD_PROMPTS[fieldKey];
  if (!fieldPrompt) {
    return new Response(JSON.stringify({ error: 'Unknown field' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const systemPrompt = `You are an expert grant writer helping applicants prepare NLnet NGI Zero Commons Fund applications.
Write accurate, compelling, and honest content. Do not invent facts -- use only what the applicant has provided.
If information is missing, write the best possible answer based on what is given and note where the applicant should add specifics.
Write in English. No markdown formatting (no bold, no headers). Use plain paragraphs or numbered lists as appropriate.`;

  const profileContext = `PROJECT PROFILE:
- Project name: ${nlnetProfile.projectName}
- Website: ${nlnetProfile.websiteUrl}
- Organization: ${nlnetProfile.organizationName} (${nlnetProfile.country})
- Description: ${nlnetProfile.projectDescription}
- Problem solved: ${nlnetProfile.problemSolved}
- Target users: ${nlnetProfile.targetUsers}
- Funding goals: ${nlnetProfile.fundingGoals}
- Open source: ${nlnetProfile.isOpenSource ? 'Yes' : 'No'}${nlnetProfile.license ? `, license: ${nlnetProfile.license}` : ''}
- Amount requested: ${nlnetProfile.amountRequested}
- Team: ${nlnetProfile.teamDescription}
- Prior funding: ${nlnetProfile.priorFunding || 'None'}`;

  const userPrompt = `${profileContext}

TASK: ${fieldPrompt}

Write the answer now. Do not repeat the task description. Just write the answer directly.`;

  try {
    const result = await chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  } catch (err) {
    console.error('form-assist error:', err);
    return new Response(JSON.stringify({ error: 'AI error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}
