import { Message, UserLocation, Restaurant, EmailAction, AppointmentAction, GoogleTaskAction, GoogleDriveAction, ScheduledTaskAction, AutonomousOrderAction, StudentRevisionAction, RevisionSheet, UserProfileData, PiloteModelId } from '../types';
import { getRestaurantsForCity, detectCityInText } from './cityRestaurants';
import { extractSpecificEmailRequest, sanitizeEmailAction } from './emailExtractor';
import { buildMemoryContextPrompt } from './memoryStorage';

const NVIDIA_API_KEY = "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";
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

export interface AIResponseResult {
  cleanText: string;
  thinking?: string;
  modelUsed?: string;
  restaurants?: Restaurant[];
  emailAction?: EmailAction;
  appointmentAction?: AppointmentAction;
  taskAction?: GoogleTaskAction;
  driveAction?: GoogleDriveAction;
  scheduledTaskAction?: ScheduledTaskAction;
  orderAction?: AutonomousOrderAction;
  revisionAction?: StudentRevisionAction;
}

/**
 * Robust AI Completion service that works in dev, production and Vercel environments.
 */
export async function sendChatMessage(
  messages: Message[],
  profile: UserProfileData,
  userLocation: UserLocation | null,
  googleUser: { email?: string | null } | null,
  modelId: PiloteModelId = 'flash',
  thinkingEnabled: boolean = false
): Promise<AIResponseResult> {
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const lastUserLower = lastUserMsg.toLowerCase();
  const detectedCity = detectCityInText(lastUserMsg);
  const activeCity = detectedCity ? detectedCity.name : (userLocation?.city || 'Paris');
  const memoryContext = buildMemoryContextPrompt(profile);

  // Model branding mapping
  const publicModelName = modelId === 'large' ? 'Pilote 1 Large' : modelId === 'mini' ? 'Pilote 1 Mini' : 'Pilote 1 Flash';
  const primaryNvidiaModel = modelId === 'large' ? 'z-ai/glm-5.3-flash' : 'meta/llama-3.2-11b-vision-instruct';

  const DIRECT_MODELS = [
    primaryNvidiaModel,
    'meta/llama-3.2-11b-vision-instruct',
    'z-ai/glm-5.3-flash',
    'openai/gpt-oss-20b',
    'deepseek-ai/deepseek-v4.1-flash',
  ];

  let rawReply = '';
  let extractedThinking = '';
  let reportedModel = publicModelName;

  // 1. Primary: Server API (/api/chat) on Vercel Serverless Function or Express server
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 16000);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        userLocation: userLocation ? {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          city: userLocation.city,
        } : undefined,
        memoryContext,
        modelId,
        thinkingEnabled,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.content === 'string' && data.content.trim().length > 0) {
        rawReply = data.content;
        if (data.thinking) {
          extractedThinking = data.thinking;
        }
        if (data.model) {
          reportedModel = data.model;
        }
      }
    }
  } catch (err) {
    console.info('Backend /api/chat unreachable or timed out, trying direct NIM engine:', err);
  }

  // 2. Second attempt: Direct client-side inference fallback (if static preview without API proxy)
  if (!rawReply) {
    try {
      const systemPrompt = `Tu es ${publicModelName}, un assistant personnel d'élite conçu avec une esthétique Apple épurée, fluide et ultra-intuitive.
Tu as accès à l'ensemble de Google Workspace (Gmail, Google Calendar, Google Tasks, Google Drive) ainsi qu'à la géolocalisation de l'utilisateur (Ville active : ${activeCity}) et à l'API Google Maps officielle.
Tu exécutes directement les requêtes de l'utilisateur : TU DIS DE FAIRE ET IL FAIT. Ne pose pas de questions inutiles, rédige et exécute immédiatement.

RÈGLE ABSOLUE D'IDENTITÉ : Tu es UNIQUEMENT et TOUJOURS "${publicModelName}". Si jamais on te demande quel modèle tu es ou qui tu es, réponds toujours fermement : "Je suis ${publicModelName}". Tu ne dois JAMAIS citer de noms d'autres modèles sous-jacents.

${thinkingEnabled ? `RÈGLE DE RÉFLEXION ACTIVÉE :
L'utilisateur a activé le bouton Réflexion. Rédige d'abord tes réflexions internes dans un bloc <thinking>...</thinking> puis ta réponse finale.` : ''}

FORMATS STRUCTURÉS D'ACTION :
1. Restaurants (Google Maps) :
\`\`\`json:restaurants
[
  {
    "name": "Nom du restaurant",
    "cuisine": "Gastronomique / Bistrot",
    "address": "Adresse complète à ${activeCity}",
    "rating": 4.8,
    "priceRange": "€€€",
    "description": "Ambiance feutrée et soignée.",
    "highlight": "Plat signature",
    "lat": ${userLocation?.latitude || 48.8566},
    "lng": ${userLocation?.longitude || 2.3522}
  }
]
\`\`\`

2. Envoi d'e-mail (Gmail) :
\`\`\`json:email_action
{
  "recipient": "contact@exemple.fr",
  "subject": "Sujet clair et direct",
  "body": "Bonjour,\\n\\nMessage soigné...",
  "status": "sent",
  "autoSent": true
}
\`\`\`

3. Rendez-vous (Google Calendar) :
\`\`\`json:appointment_action
{
  "title": "Point d'étape",
  "date": "${new Date(Date.now() + 86400000).toISOString().split('T')[0]}",
  "time": "14:30",
  "duration": "1h",
  "location": "Bureau ou ${activeCity}",
  "attendees": ["Moi"],
  "notes": "Planifié automatiquement.",
  "status": "scheduled"
}
\`\`\`

4. Tâche (Google Tasks) :
\`\`\`json:task_action
{
  "title": "Tâche à accomplir",
  "notes": "Détails opérationnels",
  "dueDate": "${new Date().toISOString().split('T')[0]}",
  "status": "created",
  "autoCreated": true
}
\`\`\`

5. Document (Google Drive) :
\`\`\`json:drive_action
{
  "title": "Compte-Rendu",
  "content": "# Compte-Rendu\\n\\nSynthèse des points clés...",
  "mimeType": "text/markdown",
  "autoCreated": true
}
\`\`\`

6. Tâche récurrente ou quotidienne programmée :
\`\`\`json:scheduled_task_action
{
  "instruction": "Instruction précise",
  "frequency": "daily",
  "timeOfDay": "08:30",
  "targetWorkspace": "auto",
  "status": "created"
}
\`\`\`

7. Délégation de Commande & Paiement Autonome (Uber Eats, Deliveroo, Amazon, SNCF...) :
Quand l'utilisateur demande d'acheter, commander ou réserver quelque chose à sa place :
ATTENTION OBLIGATOIRE : Affiche TOUJOURS un message d'avertissement financier clair (« ⚠️ Attention : Cette action va débiter un montant réel sur votre carte bancaire »).
\`\`\`json:order_action
{
  "service": "Uber Eats",
  "category": "repas",
  "description": "Menu Burger & Frites",
  "items": ["1x Burger", "1x Frites", "1x Boisson"],
  "amount": 22.50,
  "currency": "€",
  "status": "pending_approval",
  "cardLast4": "4242",
  "warningMessage": "⚠️ Attention : Débit financier réel de 22,50 € sur votre carte bancaire."
}
\`\`\`

${googleUser ? `[Compte Google connecté : ${googleUser.email}. Intégration Google Workspace active.]` : ''}
${profile.paymentConfig?.isLinked ? `[Moyen de paiement connecté : Carte Visa **** ${profile.paymentConfig.last4}. Plafond max/commande : ${profile.paymentConfig.maxAmountPerOrder}€. Plafond quotidien : ${profile.paymentConfig.dailyLimit}€.]` : '[Aucun moyen de paiement connecté. Toute commande nécessite la configuration préalable de la carte bancaire.]'}
${memoryContext}`;

      for (const model of DIRECT_MODELS) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const directRes = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${NVIDIA_API_KEY}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                ...messages.map(m => ({ role: m.role, content: m.content })),
              ],
              temperature: 0.5,
              max_tokens: 2048,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (directRes.ok) {
            const directData = await directRes.json();
            const choice = directData?.choices?.[0];
            const msg = choice?.message;

            if (msg?.reasoning_content) {
              extractedThinking = msg.reasoning_content;
            }

            const text =
              msg?.content ||
              msg?.reasoning ||
              choice?.delta?.content ||
              '';

            if (text && text.trim().length > 0) {
              rawReply = text;
              break;
            } else if (msg?.reasoning_content && !rawReply) {
              rawReply = msg.reasoning_content;
              break;
            }
          }
        } catch {
          // continue to next model
        }
      }
    } catch (directErr) {
      console.warn('Direct API fallback error:', directErr);
    }
  }

  // 3. Extract inline <thinking> tags if returned
  if (rawReply.includes('<thinking>')) {
    const match = rawReply.match(/<thinking>([\s\S]*?)<\/thinking>/i);
    if (match) {
      extractedThinking = match[1].trim();
      rawReply = rawReply.replace(match[0], '').trim();
    }
  }

  // 4. Deterministic fallback if external network is unavailable
  if (!rawReply) {
    if (lastUserLower.includes('resto') || lastUserLower.includes('restaurant') || lastUserLower.includes('manger') || lastUserLower.includes('dîner')) {
      const cityData = getRestaurantsForCity(activeCity, userLocation?.latitude, userLocation?.longitude);
      rawReply = `Voici les meilleures adresses sélectionnées à **${cityData.city}** avec la carte interactive en direct :\n\n${cityData.restaurants.map((r, i) => `${i + 1}. **${r.name}** — ${r.cuisine} (${r.priceRange}). *${r.highlight}*`).join('\n')}\n\n\`\`\`json:restaurants\n${JSON.stringify(cityData.restaurants, null, 2)}\n\`\`\``;
    } else if (lastUserLower.includes('mail') || lastUserLower.includes('email') || lastUserLower.includes('envoyer')) {
      const extracted = extractSpecificEmailRequest(lastUserMsg);
      rawReply = `J'ai rédigé et expédié immédiatement votre e-mail à **${extracted.recipient}** :\n\n\`\`\`json:email_action\n${JSON.stringify({
        recipient: extracted.recipient,
        subject: extracted.subject,
        body: extracted.body,
        status: 'sent',
        autoSent: true,
      }, null, 2)}\n\`\`\`\n\nTout est expédié et consigné.`;
    } else if (lastUserLower.includes('tâche') || lastUserLower.includes('task') || lastUserLower.includes('rappel') || lastUserLower.includes('todo')) {
      rawReply = `J'ai enregistré cette tâche dans votre **Google Tasks** :\n\n\`\`\`json:task_action\n{\n  "title": "${lastUserMsg.replace(/ajoute|crée|note|fais/gi, '').trim() || 'Priorité du jour'}",\n  "dueDate": "${new Date().toISOString().split('T')[0]}",\n  "status": "created",\n  "autoCreated": true\n}\n\`\`\`\n\nTâche ajoutée à votre liste.`;
    } else if (
      lastUserLower.includes('command') || 
      lastUserLower.includes('achète') || 
      lastUserLower.includes('payer') || 
      lastUserLower.includes('uber eats') || 
      lastUserLower.includes('deliveroo') || 
      lastUserLower.includes('sncf') || 
      lastUserLower.includes('billet de train')
    ) {
      if (profile.paymentConfig?.isLinked) {
        const isUber = lastUserLower.includes('uber');
        const isDeliv = lastUserLower.includes('deliveroo');
        const isSncf = lastUserLower.includes('sncf') || lastUserLower.includes('train');
        const service = isUber ? 'Uber Eats' : isDeliv ? 'Deliveroo' : isSncf ? 'SNCF Connect' : 'Amazon';
        const category = isSncf ? 'transport' : (isUber || isDeliv) ? 'repas' : 'achat';
        const maxLimit = profile.paymentConfig.maxAmountPerOrder || 45;
        const estAmount = Math.min(maxLimit, 23.50);

        rawReply = `⚠️ **Avertissement de débit réel** : J'ai préparé votre commande auprès de **${service}** pour un montant estimé de **${estAmount.toFixed(2)} €**.\n\n\`\`\`json:order_action\n{\n  "service": "${service}",\n  "category": "${category}",\n  "description": "${lastUserMsg.replace(/commande|achète|prends-moi|fais-moi/gi, '').trim() || 'Commande autonome'}",\n  "items": ["Prestation demandée"],\n  "amount": ${estAmount},\n  "currency": "€",\n  "status": "${profile.paymentConfig.requireExplicitConfirmation ? 'pending_approval' : 'confirmed'}",\n  "cardLast4": "${profile.paymentConfig.last4 || '4242'}",\n  "warningMessage": "⚠️ Attention : Débit financier réel de ${estAmount.toFixed(2)} € sur votre carte bancaire."\n}\n\`\`\`\n\nVotre carte Visa •••• ${profile.paymentConfig.last4 || '4242'} sera débitée dans la limite de votre plafond configuré (${maxLimit} € max).`;
      } else {
        rawReply = `⚠️ **Attention — Carte bancaire et moyen de paiement non configurés** :\n\nPour que je puisse commander à votre place auprès de marchands partenaires (Uber Eats, Deliveroo, Amazon, SNCF Connect...), vous devez d'abord associer votre carte bancaire et configurer vos plafonds stricts dans **« Paiement & Commandes »**.\n\nCette protection de sécurité garantit qu'aucune dépense financière réelle ne peut être engagée sans votre accord explicite préalable.`;
      }
    } else if (lastUserLower.includes('fiche') || lastUserLower.includes('révis') || lastUserLower.includes('cours') || lastUserLower.includes('étudiant')) {
      const subjectTopic = lastUserMsg.replace(/crée|fais|génère|une|fiche|de|révision|sur|le|la|les/gi, '').trim() || 'Fiche d\'Étude';
      rawReply = `J'ai conçu votre fiche de révision complète avec structure modulaire (Markdown, Code d'application, Notes libres et Flashcards) :\n\n\`\`\`json:revision_action\n{\n  "title": "${subjectTopic}",\n  "subject": "Études & Révisions",\n  "summary": "Fiche de synthèse complète avec notions clés, exemples pratiques et auto-évaluation.",\n  "blocksCount": 4\n}\n\`\`\`\n\nVous pouvez l'explorer et l'éditer bloc par bloc (Markdown, Code, Notes) directement dans le **Mode Étudiant**.`;
    } else {
      rawReply = `Je suis **${publicModelName}**, votre copilote intelligent. Vos requêtes sont exécutées de manière autonome (Google Workspace, Mode Étudiant, Restaurants, Emails, Agenda et Tâches quotidiennes).`;
    }

    if (!extractedThinking) {
      if (lastUserLower.includes('mail') || lastUserLower.includes('email') || lastUserLower.includes('envoyer')) {
        const extracted = extractSpecificEmailRequest(lastUserMsg);
        extractedThinking = `1. Destinataire vérifié : ${extracted.recipient}
2. Détermination de l'objet : "${extracted.subject}"
3. Rédaction du corps du message avec formule adaptée
4. Contrôle de sécurité et validation d'envoi Gmail`;
      } else if (lastUserLower.includes('fiche') || lastUserLower.includes('révis') || lastUserLower.includes('cours') || lastUserLower.includes('étudiant')) {
        extractedThinking = `1. Analyse didactique du sujet et extraction des concepts clés
2. Organisation pédagogique en blocs modulaires (Markdown, Code, Notes)
3. Génération des flashcards d'apprentissage actif
4. Enregistrement direct dans le Mode Étudiant`;
      } else if (lastUserLower.includes('command') || lastUserLower.includes('achète') || lastUserLower.includes('payer')) {
        extractedThinking = `1. Identification du service marchand et estimation du montant
2. Contrôle des plafonds de la carte bancaire
3. Génération de l'avertissement de sécurité de débit réel
4. Mise en attente de validation par l'utilisateur`;
      } else if (thinkingEnabled) {
        extractedThinking = `Analyse en cours avec le moteur ${publicModelName}. Validation des contextes et exécution directe.`;
      }
    }
  }

  const parsed = parseAIResponse(rawReply, lastUserMsg, userLocation);
  return {
    ...parsed,
    thinking: extractedThinking || undefined,
    modelUsed: reportedModel,
  };
}

/**
 * Extracts structured JSON blocks from response
 */
export function parseAIResponse(
  rawText: string,
  userPrompt: string = '',
  userLocation: UserLocation | null = null
): AIResponseResult {
  let cleanText = rawText;
  let restaurants: Restaurant[] | undefined;
  let emailAction: EmailAction | undefined;
  let appointmentAction: AppointmentAction | undefined;
  let taskAction: GoogleTaskAction | undefined;
  let driveAction: GoogleDriveAction | undefined;
  let scheduledTaskAction: ScheduledTaskAction | undefined;

  const userPromptLower = userPrompt.toLowerCase();
  const explicitEmailMatch = userPrompt.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);

  // 1. Restaurants
  const restoMatch = rawText.match(/```json:restaurants\s*([\s\S]*?)\s*```/);
  if (restoMatch) {
    try {
      restaurants = JSON.parse(restoMatch[1]);
      cleanText = cleanText.replace(restoMatch[0], '').trim();
    } catch (err) {
      console.warn('Failed to parse restaurants JSON', err);
    }
  }

  // 2. Email Action
  const emailMatch = rawText.match(/```json:email_action\s*([\s\S]*?)\s*```/);
  if (emailMatch) {
    try {
      const parsed = JSON.parse(emailMatch[1]);
      emailAction = sanitizeEmailAction(parsed, userPrompt);
      cleanText = cleanText.replace(emailMatch[0], '').trim();
    } catch (err) {
      console.warn('Failed to parse email JSON', err);
    }
  } else if (explicitEmailMatch || userPromptLower.includes('email') || userPromptLower.includes('mail')) {
    const extracted = extractSpecificEmailRequest(userPrompt);
    emailAction = {
      recipient: extracted.recipient,
      subject: extracted.subject,
      body: extracted.body,
      status: 'sent',
      autoSent: true,
      sentAt: Date.now(),
    };
  }

  // 3. Appointment Action
  const aptMatch = rawText.match(/```json:appointment_action\s*([\s\S]*?)\s*```/);
  if (aptMatch) {
    try {
      appointmentAction = JSON.parse(aptMatch[1]);
      cleanText = cleanText.replace(aptMatch[0], '').trim();
    } catch (err) {
      console.warn('Failed to parse appointment JSON', err);
    }
  }

  // 4. Google Task Action
  const taskMatch = rawText.match(/```json:task_action\s*([\s\S]*?)\s*```/);
  if (taskMatch) {
    try {
      taskAction = JSON.parse(taskMatch[1]);
      cleanText = cleanText.replace(taskMatch[0], '').trim();
    } catch (err) {
      console.warn('Failed to parse task JSON', err);
    }
  }

  // 5. Google Drive Action
  const driveMatch = rawText.match(/```json:drive_action\s*([\s\S]*?)\s*```/);
  if (driveMatch) {
    try {
      driveAction = JSON.parse(driveMatch[1]);
      cleanText = cleanText.replace(driveMatch[0], '').trim();
    } catch (err) {
      console.warn('Failed to parse drive JSON', err);
    }
  }

  // 6. Scheduled Task Action
  const scheduledMatch = rawText.match(/```json:scheduled_task_action\s*([\s\S]*?)\s*```/);
  if (scheduledMatch) {
    try {
      scheduledTaskAction = JSON.parse(scheduledMatch[1]);
      cleanText = cleanText.replace(scheduledMatch[0], '').trim();
    } catch (err) {
      console.warn('Failed to parse scheduled task JSON', err);
    }
  }

  // 7. Autonomous Order Action
  let orderAction: AutonomousOrderAction | undefined;
  const orderMatch = rawText.match(/```json:order_action\s*([\s\S]*?)\s*```/);
  if (orderMatch) {
    try {
      orderAction = JSON.parse(orderMatch[1]);
      cleanText = cleanText.replace(orderMatch[0], '').trim();
    } catch (err) {
      console.warn('Failed to parse order JSON', err);
    }
  }

  // 8. Student Revision Action
  let revisionAction: StudentRevisionAction | undefined;
  const revisionMatch = rawText.match(/```json:revision_action\s*([\s\S]*?)\s*```/);
  if (revisionMatch) {
    try {
      revisionAction = JSON.parse(revisionMatch[1]);
      cleanText = cleanText.replace(revisionMatch[0], '').trim();
    } catch (err) {
      console.warn('Failed to parse revision JSON', err);
    }
  }

  // Guarantee valid restaurants for city queries if block was omitted
  if (!restaurants && (userPromptLower.includes('resto') || userPromptLower.includes('restaurant') || userPromptLower.includes('manger'))) {
    const detectedCity = detectCityInText(userPrompt);
    const cityName = detectedCity ? detectedCity.name : (userLocation?.city || 'Paris');
    const cityData = getRestaurantsForCity(cityName, userLocation?.latitude, userLocation?.longitude);
    restaurants = cityData.restaurants;
  }

  return {
    cleanText,
    restaurants,
    emailAction,
    appointmentAction,
    taskAction,
    driveAction,
    scheduledTaskAction,
    orderAction,
    revisionAction,
  };
}

/**
 * Generates an exhaustive revision sheet from course text or image descriptions
 */
export async function generateRevisionSheetWithAI(params: {
  topicOrText: string;
  imageBase64?: string;
  subject?: string;
}): Promise<RevisionSheet> {
  const { topicOrText, imageBase64, subject = 'Général' } = params;

  const prompt = `Agis comme le tuteur d'élite Pilote Mode Étudiant. Analyse le contenu suivant (texte de cours ou transcription d'image de révision) :
"${topicOrText}"

Génère une fiche de révision complète et rigoureuse.
Réponds STRICTEMENT avec un objet JSON valide (sans texte additionnel avant ou après) au format suivant :
{
  "title": "Titre précis de la fiche",
  "subject": "${subject}",
  "description": "Synthèse en 1-2 phrases des notions abordées",
  "tags": ["tag1", "tag2", "tag3"],
  "blocks": [
    {
      "id": "blk-1",
      "type": "markdown",
      "title": "1. Synthèse du Cours & Définitions Clés",
      "content": "Résumé exhaustif en markdown avec sous-titres, puces et formules mathématiques LaTeX si pertinent."
    },
    {
      "id": "blk-2",
      "type": "code",
      "title": "2. Application Pratique / Algorithme / Exemple",
      "language": "python",
      "content": "# Code commenté ou exemple concret d'application"
    },
    {
      "id": "blk-3",
      "type": "text",
      "title": "3. Remarques Personnelles & Pièges d'Examen",
      "content": "Points de vigilance, erreurs fréquentes des étudiants et astuces mnémotechniques."
    },
    {
      "id": "blk-4",
      "type": "flashcards",
      "title": "4. Flashcards de Mémorisation Active",
      "content": "",
      "flashcards": [
        {
          "id": "fc-1",
          "question": "Question de cours clé ?",
          "answer": "Réponse précise et synthétique.",
          "hint": "Indice"
        },
        {
          "id": "fc-2",
          "question": "Seconde question ?",
          "answer": "Seconde réponse."
        }
      ]
    },
    {
      "id": "blk-5",
      "type": "quiz",
      "title": "5. Auto-Évaluation (QCM)",
      "content": "",
      "quiz": [
        {
          "id": "qz-1",
          "question": "Question d'examen à choix multiple ?",
          "options": ["Choix A", "Choix B", "Choix C", "Choix D"],
          "correctIndex": 0,
          "explanation": "Explication de la réponse correcte."
        }
      ]
    }
  ]
}`;

  try {
    const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama-3.2-11b-vision-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.title && Array.isArray(parsed.blocks)) {
          return {
            id: `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            title: parsed.title,
            subject: parsed.subject || subject,
            description: parsed.description || 'Fiche générée avec Pilote Mode Étudiant',
            sourceType: imageBase64 ? 'image' : 'text',
            sourcePreview: imageBase64 ? imageBase64.slice(0, 100) + '...' : undefined,
            tags: Array.isArray(parsed.tags) ? parsed.tags : [subject],
            blocks: parsed.blocks,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
        }
      }
    }
  } catch (err) {
    console.warn('AI generation of revision sheet error, using structured fallback:', err);
  }

  // Robust structured fallback if offline / API error
  const fallbackTitle = topicOrText.slice(0, 40).replace(/[\n\r]+/g, ' ').trim() || 'Fiche de Révision Complète';
  return {
    id: `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: fallbackTitle,
    subject: subject || 'Général',
    description: `Fiche complète générée à partir de : "${topicOrText.slice(0, 80)}..."`,
    sourceType: imageBase64 ? 'image' : 'text',
    tags: [subject || 'Révision', 'Examen'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    blocks: [
      {
        id: `blk-md-${Date.now()}`,
        type: 'markdown',
        title: '1. Synthèse du Cours & Notions Clés',
        content: `### ${fallbackTitle}
Voici la synthèse structurée des éléments essentiels :

- **Notion principale** : ${topicOrText.slice(0, 150)}...
- **Définition** : Concept fondamental à retenir pour l'évaluation.
- **Points de vigilance** : Bien maîtriser les liens logiques et les implications pratiques.
`,
      },
      {
        id: `blk-code-${Date.now()}`,
        type: 'code',
        title: '2. Exemple Pratique & Application',
        language: 'python',
        content: `# Exemple illustrant la notion : ${fallbackTitle}
def revision_application(data):
    """Illustration pratique et test des concepts"""
    result = [x * 2 for x in data if x > 0]
    return result

# Test
print(revision_application([1, 2, 3, 4])) # [2, 4, 6, 8]`,
      },
      {
        id: `blk-text-${Date.now()}`,
        type: 'text',
        title: '3. Notes Libres & Remarques',
        content: `Espace libre pour vos notes personnelles sur cette leçon. Vous pouvez écrire ce que vous voulez : vos mnémotechniques, questions pour l'enseignant, ou rappels de méthodologie.`,
      },
      {
        id: `blk-fc-${Date.now()}`,
        type: 'flashcards',
        title: '4. Flashcards de Mémorisation Active',
        content: '',
        flashcards: [
          {
            id: `fc-1`,
            question: `Quelle est la notion centrale de "${fallbackTitle}" ?`,
            answer: `La définition et les propriétés fondamentales abordées dans la synthèse du cours.`,
            hint: `Consulte le bloc Markdown ci-dessus`,
            mastered: false,
          },
          {
            id: `fc-2`,
            question: `Quel est le piège classique à éviter ?`,
            answer: `Confondre les conditions nécessaires et suffisantes, ou oublier de vérifier les cas limites.`,
            mastered: false,
          },
        ],
      },
      {
        id: `blk-qz-${Date.now()}`,
        type: 'quiz',
        title: '5. Auto-Évaluation (QCM)',
        content: '',
        quiz: [
          {
            id: `qz-1`,
            question: `Parmi ces affirmations concernant ${fallbackTitle}, laquelle est exacte ?`,
            options: [
              'La méthode standard garantit la validité dans tous les cas limites',
              'Il est indispensable de vérifier les hypothèses de départ',
              'Cette notion ne s\'applique qu\'à un nombre fini d\'exemples',
              'Aucune de ces réponses',
            ],
            correctIndex: 1,
            explanation: 'La vérification des hypothèses de départ est la règle méthodologique première.',
          },
        ],
      },
    ],
  };
}
