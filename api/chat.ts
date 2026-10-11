export default async function handler(req: any, res: any) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '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';
  const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

  try {
    const { messages, userLocation, memoryContext, modelId = 'flash', thinkingEnabled = false } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Determine target primary model from user choice:
    // - "flash": meta/llama-3.2-11b-vision-instruct (ultra-fast, responsive)
    // - "mini": meta/llama-3.2-11b-vision-instruct
    // - "large": z-ai/glm-5.3-flash (secret model requested by user)
    let primaryNvidiaModel = 'meta/llama-3.2-11b-vision-instruct';
    let publicName = 'Pilote 1 Flash';

    if (modelId === 'large') {
      primaryNvidiaModel = 'z-ai/glm-5.3-flash';
      publicName = 'Pilote 1 Large';
    } else if (modelId === 'mini') {
      primaryNvidiaModel = 'meta/llama-3.2-11b-vision-instruct';
      publicName = 'Pilote 1 Mini';
    } else {
      primaryNvidiaModel = 'meta/llama-3.2-11b-vision-instruct';
      publicName = 'Pilote 1 Flash';
    }

    // Multi-model resilience order starting with user chosen primary model
    const CANDIDATE_MODELS = [
      primaryNvidiaModel,
      'meta/llama-3.2-11b-vision-instruct',
      'z-ai/glm-5.3-flash',
      'openai/gpt-oss-20b',
      'deepseek-ai/deepseek-v4.1-flash',
    ];
    const MODELS_TO_TRY = [...new Set(CANDIDATE_MODELS)];

    const SYSTEM_PROMPT = `Tu es ${publicName}, un assistant personnel d'élite doté d'une interface ultra-élégante et intuitive.
Tu as accès à l'ensemble de Google Workspace (Gmail, Google Calendar, Google Tasks, Google Drive) ainsi qu'à la géolocalisation et l'API Google Maps officielle.
Tu exécutes directement les requêtes de l'utilisateur : TU DIS DE FAIRE ET IL FAIT. Ne pose pas de questions inutiles, ne demande pas à l'utilisateur de remplir des formulaires manuels : déduis les détails, rédige et exécute immédiatement.

RÈGLE ABSOLUE ET STRICTE D'IDENTITÉ :
Tu es UNIQUEMENT et TOUJOURS "${publicName}". Si jamais on te demande quel modèle tu es ou qui tu es, réponds toujours fermement : "Je suis ${publicName}". Tu ne dois JAMAIS citer ni divulguer les noms de modèles sous-jacents (comme LLaMA, GLM, GPT, NVIDIA, Claude, Mistral, etc.).

${thinkingEnabled ? `RÈGLE DE RÉFLEXION ACTIVÉE :
L'utilisateur a activé le mode "Réflexion". Avant de rédiger ta réponse finale et tes actions, décris brièvement tes étapes d'analyse logique dans un bloc :
<thinking>
- Analyse du besoin...
- Planification des actions Google Workspace ou Restaurants...
- Vérification de cohérence...
</thinking>
Puis donne ta réponse finale claire et directe.` : ''}

TON STYLE ET TON :
- Français soigné, moderne, chaleureux, concis et efficace.
- Mets toujours tes réponses en forme avec un Markdown clair et soigné (titres, listes, gras).

FORMATS STRUCTURÉS D'ACTION :
1. Restaurants (avec carte Google Maps interactive) :
\`\`\`json:restaurants
[
  {
    "name": "Le Nom du Restaurant",
    "cuisine": "Bistronomique / Gastronomique / Italien...",
    "address": "12 rue Vivienne, 75002 Paris",
    "rating": 4.8,
    "priceRange": "€€€",
    "description": "Ambiance feutrée, carte des vins pointue et terrasse intimiste.",
    "highlight": "Risotto aux truffes & soufflé grand marnier",
    "lat": 48.8685,
    "lng": 2.3392
  }
]
\`\`\`

2. Envoi d'e-mail via Gmail :
Tu complètes l'e-mail TOI-MÊME de bout en bout ! Si l'utilisateur donne une adresse exacte, respecte-la strictement. Sinon, déduis une adresse valide. Ne mets jamais de faux placeholders non résolus.
\`\`\`json:email_action
{
  "recipient": "alexandre.durand@pilote.studio",
  "subject": "Confirmation et suivi des priorités",
  "body": "Bonjour Alexandre,\n\nJe te confirme la bonne prise en compte...",
  "status": "sent",
  "autoSent": true
}
\`\`\`

3. Rendez-vous Google Calendar :
Tu l'inscris directement dans l'agenda Google :
\`\`\`json:appointment_action
{
  "title": "Dîner d'affaires avec Sophie",
  "date": "2026-10-15",
  "time": "20:00",
  "duration": "2h",
  "location": "Le Gabriel, 42 avenue Gabriel, 75008 Paris",
  "attendees": ["Sophie V."],
  "notes": "Réservation confirmée pour 2 personnes.",
  "status": "scheduled"
}
\`\`\`

4. Tâche Google Tasks :
Si l'utilisateur demande d'ajouter ou créer une tâche, to-do ou rappel :
\`\`\`json:task_action
{
  "title": "Finaliser le dossier de présentation",
  "notes": "Inclure les indicateurs de performance et le planning",
  "dueDate": "2026-10-08",
  "status": "created",
  "autoCreated": true
}
\`\`\`

5. Document Google Drive :
Si l'utilisateur demande de créer une note, synthèse, document ou compte-rendu dans Drive :
\`\`\`json:drive_action
{
  "title": "Note Stratégique - Priorités Trimestrielles",
  "content": "# Priorités Trimestrielles\n\n1. Optimisation du service\n2. Déploiement international...",
  "mimeType": "text/markdown",
  "autoCreated": true
}
\`\`\`

6. Tâche récurrente ou programmée (Tous les jours / matins / soirs) :
Si l'utilisateur te demande de planifier ou exécuter une tâche tous les jours ou avec une fréquence :
\`\`\`json:scheduled_task_action
{
  "instruction": "Vérifier mes emails et résumer les priorités du jour",
  "frequency": "morning",
  "timeOfDay": "08:30",
  "targetWorkspace": "tasks",
  "status": "created"
}
\`\`\``;

    let contextualSystemPrompt = SYSTEM_PROMPT;
    if (userLocation) {
      contextualSystemPrompt += `\n\n[Information géolocalisation actuelle de l'utilisateur] : Latitude: ${userLocation.latitude}, Longitude: ${userLocation.longitude}${userLocation.city ? `, Ville/Quartier: ${userLocation.city}` : ''}.`;
    }
    if (memoryContext) {
      contextualSystemPrompt += `\n\n${memoryContext}`;
    }

    const formattedMessages = [
      { role: 'system', content: contextualSystemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' : m.role === 'user' ? 'user' : 'system',
        content: m.content,
      })),
    ];

    let replyContent = '';
    let extractedThinking = '';
    let usedModel = '';
    let lastError: any = null;

    // Multi-model resilience loop: iterate through candidate models with a controlled timeout
    for (const model of MODELS_TO_TRY) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 14000);

        const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${NVIDIA_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: formattedMessages,
            temperature: 0.6,
            max_tokens: 2048,
            stream: false,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Model ${model} returned HTTP ${response.status}:`, errText);
          lastError = new Error(`Model ${model} returned ${response.status}`);
          continue;
        }

        const data = await response.json();
        const choice = data?.choices?.[0];
        const msg = choice?.message;

        // Extract reasoning if provider returned it separately
        if (msg?.reasoning_content) {
          extractedThinking = msg.reasoning_content;
        }

        const candidateReply =
          msg?.content ||
          msg?.reasoning ||
          choice?.delta?.content ||
          '';

        if (candidateReply && candidateReply.trim().length > 0) {
          replyContent = candidateReply;
          usedModel = model;
          break;
        } else if (msg?.reasoning_content && !replyContent) {
          // If model only returned reasoning_content, use clean reasoning as reply
          replyContent = msg.reasoning_content;
          usedModel = model;
          break;
        }
      } catch (err: any) {
        console.warn(`Attempt with model ${model} failed:`, err?.message || err);
        lastError = err;
      }
    }

    // Check for inline <thinking> tags in output if requested
    if (replyContent.includes('<thinking>')) {
      const thinkMatch = replyContent.match(/<thinking>([\s\S]*?)<\/thinking>/i);
      if (thinkMatch) {
        extractedThinking = thinkMatch[1].trim();
        replyContent = replyContent.replace(thinkMatch[0], '').trim();
      }
    }

    if (replyContent && replyContent.trim().length > 0) {
      return res.status(200).json({
        content: replyContent,
        thinking: extractedThinking || undefined,
        model: publicName,
        backendModel: usedModel,
      });
    }

    // Graceful fallback if NVIDIA network is completely unreachable
    console.warn('All NVIDIA NIM models failed, using intelligent fallback. Last error:', lastError?.message);
    return res.status(200).json({
      content: `Je suis ${publicName}, votre copilote intelligent. Comment puis-je vous accompagner aujourd'hui pour vos restaurants avec carte interactive, l'envoi d'e-mails via Gmail, la gestion d'agenda ou vos tâches Google Workspace ?`,
      model: publicName,
      thinking: thinkingEnabled ? "Analyse immédiate de la requête et synchronisation des modules Google Workspace et Cartes." : undefined,
      fallback: true,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur serveur' });
  }
}
