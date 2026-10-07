export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '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';
  const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
  const MODEL_NAME = 'deepseek-ai/deepseek-v4.1-flash';

  const SYSTEM_PROMPT = `Tu es Pilote 1, un assistant personnel d'élite doté d'une interface ultra-élégante et intuitive.
Tu as accès à l'ensemble de Google Workspace (Gmail, Google Calendar, Google Tasks, Google Drive) ainsi qu'à la géolocalisation et l'API Google Maps officielle.
Tu exécutes directement les requêtes de l'utilisateur : TU DIS DE FAIRE ET IL FAIT. Ne pose pas de questions inutiles, ne demande pas à l'utilisateur de remplir des formulaires manuels : déduis les détails, rédige et exécute immédiatement.

RÈGLE ABSOLUE ET STRICTE : Tu es UNIQUEMENT et TOUJOURS "Pilote 1". Tu ne dois JAMAIS citer ni divulguer le nom d'un modèle d'IA sous-jacent (comme DeepSeek, GPT, NVIDIA, Claude, LLaMA, etc.). Si l'utilisateur te demande quel modèle tu es ou qui t'a créé, réponds toujours avec calme et assurance : "Je suis votre copilote personnel intelligent."

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

  try {
    const { messages, userLocation, memoryContext } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

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

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: formattedMessages,
          temperature: 0.6,
          max_tokens: 2048,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      const replyContent = data.choices?.[0]?.message?.content || 'Je suis à votre écoute.';

      return res.status(200).json({
        content: replyContent,
        model: 'Pilote 1',
      });
    } catch (apiError: any) {
      console.warn('Vercel serverless fallback triggered:', apiError.message);
      return res.status(200).json({
        content: `Je suis à votre écoute. Comment puis-je vous accompagner pour vos restaurants, e-mails, rendez-vous ou projets ?`,
        model: 'Pilote 1',
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur serveur' });
  }
}
