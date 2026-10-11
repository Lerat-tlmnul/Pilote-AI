import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { extractSpecificEmailRequest } from './src/lib/emailExtractor.ts';
import { getRestaurantsForCity, detectCityInText } from './src/lib/cityRestaurants.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// NVIDIA API credentials
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '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';

// Multi-provider priority list for NVIDIA NIM API
const CANDIDATE_MODELS = [
  process.env.NVIDIA_MODEL_NAME || 'meta/llama-3.2-11b-vision-instruct',
  'meta/llama-3.2-11b-vision-instruct',
  'z-ai/glm-5.3-flash',
  'openai/gpt-oss-20b',
  'deepseek-ai/deepseek-v4.1-flash',
];
const MODELS_TO_TRY = [...new Set(CANDIDATE_MODELS)];

// Pilote 1 persona and strict guidelines
const SYSTEM_PROMPT = `Tu es Pilote 1, un assistant personnel d'élite doté d'une interface ultra-élégante avec un design Apple minimaliste et fluide.
Tu as accès à l'ensemble de Google Workspace (Gmail, Google Calendar, Google Tasks, Google Drive), à la géolocalisation et à l'API Google Maps officielle.
Tu exécutes directement les requêtes de l'utilisateur : TU DIS DE FAIRE ET IL FAIT. Ne pose pas de questions inutiles, rédige et exécute immédiatement.

RÈGLE ABSOLUE ET STRICTE D'IDENTITÉ :
Tu es UNIQUEMENT et TOUJOURS "Pilote 1". Tu ne dois JAMAIS citer ni divulguer le nom d'un modèle d'IA sous-jacent.

FORMATS STRUCTURÉS D'ACTION :
1. Restaurants (avec carte interactive en direct) : bloc \`\`\`json:restaurants ... \`\`\`
2. Envoi d'e-mail via Gmail : bloc \`\`\`json:email_action ... \`\`\` (respecte scrupuleusement l'adresse e-mail et le message fournis)
3. Rendez-vous Google Calendar : bloc \`\`\`json:appointment_action ... \`\`\`
4. Google Tasks : bloc \`\`\`json:task_action ... \`\`\`
5. Google Drive : bloc \`\`\`json:drive_action ... \`\`\`
6. Tâches quotidiennes et récurrentes : bloc \`\`\`json:scheduled_task_action ... \`\`\``;

// In-memory appointments and sent emails
interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  attendees: string[];
  notes?: string;
  createdAt: number;
}

interface SentEmail {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  sentAt: number;
}

const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    title: 'Déjeuner stratégique Q4',
    date: '2026-10-12',
    time: '12:30',
    duration: '1h30',
    location: 'Bistrot Paul Bert, Paris 11e',
    attendees: ['Alexandre D.', 'Claire M.'],
    notes: 'Discussion sur la refonte de la roadmap',
    createdAt: Date.now() - 3600000,
  },
];

const mockSentEmails: SentEmail[] = [
  {
    id: 'mail-1',
    recipient: 'direction@cabinet.fr',
    subject: 'Confirmation de notre réservation',
    body: 'Bonjour, la table est réservée pour ce lundi à 12h30. Au plaisir d\'échanger.',
    sentAt: Date.now() - 14400000,
  },
];

app.use(express.json());

// Enable CORS on Express for local dev / testing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userLocation, memoryContext, modelId = 'flash', thinkingEnabled = false } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

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

    const CANDIDATE_MODELS = [
      primaryNvidiaModel,
      'meta/llama-3.2-11b-vision-instruct',
      'z-ai/glm-5.3-flash',
      'openai/gpt-oss-20b',
      'deepseek-ai/deepseek-v4.1-flash',
    ];
    const MODELS_TO_TRY = [...new Set(CANDIDATE_MODELS)];

    const lastUserMsgRaw = messages[messages.length - 1]?.content || '';
    const lastUserMsgLower = lastUserMsgRaw.toLowerCase();

    // Detect user requested city
    const detectedCity = detectCityInText(lastUserMsgRaw);
    const activeCityName = detectedCity ? detectedCity.name : (userLocation?.city || 'Paris');

    let contextualSystemPrompt = `Tu es ${publicName}, un assistant personnel d'élite doté d'une interface ultra-élégante avec un design Apple minimaliste et fluide.
Tu as accès à l'ensemble de Google Workspace (Gmail, Google Calendar, Google Tasks, Google Drive), à la géolocalisation et à l'API Google Maps officielle.
Tu exécutes directement les requêtes de l'utilisateur : TU DIS DE FAIRE ET IL FAIT. Ne pose pas de questions inutiles, rédige et exécute immédiatement.

RÈGLE ABSOLUE ET STRICTE D'IDENTITÉ :
Tu es UNIQUEMENT et TOUJOURS "${publicName}". Si jamais on te demande quel modèle tu es ou qui tu es, réponds toujours fermement : "Je suis ${publicName}". Tu ne dois JAMAIS citer ni divulguer le nom d'un modèle d'IA sous-jacent.

${thinkingEnabled ? `RÈGLE DE RÉFLEXION ACTIVÉE :
L'utilisateur a activé le mode "Réflexion". Avant de rédiger ta réponse finale et tes actions, décris brièvement tes étapes d'analyse logique dans un bloc :
<thinking>
- Analyse du besoin...
- Planification des actions Google Workspace ou Restaurants...
- Vérification de cohérence...
</thinking>
Puis donne ta réponse finale claire et directe.` : ''}

FORMATS STRUCTURÉS D'ACTION :
1. Restaurants (avec carte interactive en direct) : bloc \`\`\`json:restaurants ... \`\`\`
2. Envoi d'e-mail via Gmail : bloc \`\`\`json:email_action ... \`\`\`
3. Rendez-vous Google Calendar : bloc \`\`\`json:appointment_action ... \`\`\`
4. Google Tasks : bloc \`\`\`json:task_action ... \`\`\`
5. Google Drive : bloc \`\`\`json:drive_action ... \`\`\`
6. Tâches quotidiennes et récurrentes : bloc \`\`\`json:scheduled_task_action ... \`\`\``;

    if (userLocation || detectedCity) {
      contextualSystemPrompt += `\n\n[Information de localisation active] : Ville ciblée : ${activeCityName}.`;
      if (userLocation?.latitude && userLocation?.longitude) {
        contextualSystemPrompt += ` Coordonnées GPS : Latitude: ${userLocation.latitude}, Longitude: ${userLocation.longitude}.`;
      }
      contextualSystemPrompt += ` Toutes les recommandations de restaurants et itinéraires doivent impérativement être situées à ${activeCityName}.`;
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

    // Multi-model resilience loop
    for (const model of MODELS_TO_TRY) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

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
            temperature: 0.5,
            max_tokens: 2048,
            stream: false,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`NVIDIA API Error status on model ${model}:`, response.status, errorText);
          continue;
        }

        const data = await response.json();
        const choice = data?.choices?.[0];
        const msg = choice?.message;

        if (msg?.reasoning_content) {
          extractedThinking = msg.reasoning_content;
        }

        const candidate =
          msg?.content ||
          msg?.reasoning ||
          choice?.delta?.content ||
          '';

        if (candidate && candidate.trim().length > 0) {
          replyContent = candidate;
          usedModel = model;
          break;
        } else if (msg?.reasoning_content && !replyContent) {
          replyContent = msg.reasoning_content;
          usedModel = model;
          break;
        }
      } catch (err: any) {
        console.warn(`Attempt with ${model} failed:`, err?.message);
      }
    }

    if (!replyContent) {
      replyContent = `Je suis à votre écoute en tant que ${publicName}.`;
    }

    // Check for inline <thinking> tags in output if requested
    if (replyContent.includes('<thinking>')) {
      const thinkMatch = replyContent.match(/<thinking>([\s\S]*?)<\/thinking>/i);
      if (thinkMatch) {
        extractedThinking = thinkMatch[1].trim();
        replyContent = replyContent.replace(thinkMatch[0], '').trim();
      }
    }

    // ==============================================================
    // CRITICAL GUARANTEE: STRICT RESPECT OF USER EMAIL & MESSAGE
    // ==============================================================
    const explicitEmailMatch = lastUserMsgRaw.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    const isEmailIntent = explicitEmailMatch || lastUserMsgLower.includes('mail') || lastUserMsgLower.includes('email') || lastUserMsgLower.includes('envoyer');

    if (isEmailIntent) {
      const extracted = extractSpecificEmailRequest(lastUserMsgRaw);
      const emailBlockMatch = replyContent.match(/```json:email_action\s*([\s\S]*?)\s*```/);

      let finalRecipient = explicitEmailMatch ? explicitEmailMatch[1].trim() : extracted.recipient;
      let finalBody = extracted.userMessage ? extracted.body : '';
      let finalSubject = extracted.subject;

      if (emailBlockMatch) {
        try {
          const emailObj = JSON.parse(emailBlockMatch[1]);
          if (explicitEmailMatch) {
            emailObj.recipient = explicitEmailMatch[1].trim();
          } else if (!emailObj.recipient || emailObj.recipient.includes('partenaire') || emailObj.recipient.includes('exemple')) {
            emailObj.recipient = finalRecipient;
          }

          if (extracted.userMessage) {
            emailObj.body = finalBody;
            emailObj.subject = finalSubject;
          }

          emailObj.status = 'sent';
          emailObj.autoSent = true;
          finalRecipient = emailObj.recipient;

          const newBlock = `\`\`\`json:email_action\n${JSON.stringify(emailObj, null, 2)}\n\`\`\``;
          replyContent = replyContent.replace(emailBlockMatch[0], newBlock);
        } catch (e) {
          console.warn('Could not re-parse email block:', e);
        }
      } else if (explicitEmailMatch) {
        const newBlock = `\n\n\`\`\`json:email_action\n${JSON.stringify({
          recipient: finalRecipient,
          subject: finalSubject,
          body: finalBody || `Bonjour,\n\nMessage transmis avec succès.\n\nBien cordialement,\nExpédié avec Pilote 1`,
          status: 'sent',
          autoSent: true,
        }, null, 2)}\n\`\`\``;
        replyContent += newBlock;
      }

      replyContent = replyContent.replace(/contact@partenaire\.com/g, finalRecipient);
      replyContent = replyContent.replace(/alexandre\.durand@pilote\.studio/g, finalRecipient);
      replyContent = replyContent.replace(/partenaire\.com/g, finalRecipient.split('@')[1] || 'contact.fr');
    }

    // ==============================================================
    // RESTAURANTS CITY CONSISTENCY GUARANTEE
    // ==============================================================
    if (lastUserMsgLower.includes('resto') || lastUserMsgLower.includes('restaurant') || lastUserMsgLower.includes('manger') || lastUserMsgLower.includes('dîner')) {
      const restoBlockMatch = replyContent.match(/```json:restaurants\s*([\s\S]*?)\s*```/);
      if (detectedCity || (userLocation?.city && userLocation.city.toLowerCase() !== 'paris')) {
        const targetCity = detectedCity ? detectedCity.name : userLocation.city;
        const cityData = getRestaurantsForCity(targetCity, userLocation?.latitude, userLocation?.longitude);

        if (!restoBlockMatch) {
          replyContent += `\n\n\`\`\`json:restaurants\n${JSON.stringify(cityData.restaurants, null, 2)}\n\`\`\``;
        } else {
          try {
            const currentRestos = JSON.parse(restoBlockMatch[1]);
            const firstAddress = currentRestos[0]?.address?.toLowerCase() || '';
            if (!firstAddress.includes(targetCity.toLowerCase())) {
              const newBlock = `\`\`\`json:restaurants\n${JSON.stringify(cityData.restaurants, null, 2)}\n\`\`\``;
              replyContent = replyContent.replace(restoBlockMatch[0], newBlock);
            }
          } catch {
            // ignore
          }
        }
      }
    }

    return res.json({
      content: replyContent,
      thinking: extractedThinking || undefined,
      model: publicName,
      provider: 'NVIDIA NIM',
      backendModel: usedModel,
    });
  } catch (err: any) {
    console.error('Fatal server chat error:', err);
    return res.status(500).json({ error: err.message || 'Erreur serveur' });
  }
});

// GET /api/appointments
app.get('/api/appointments', (req, res) => {
  res.json({ appointments: mockAppointments });
});

// POST /api/appointments
app.post('/api/appointments', (req, res) => {
  const { title, date, time, duration, location, attendees, notes } = req.body;
  if (!title || !date || !time) {
    return res.status(400).json({ error: 'Title, date, and time are required' });
  }
  const newAppointment: Appointment = {
    id: `apt-${Date.now()}`,
    title,
    date,
    time,
    duration: duration || '1h',
    location: location || 'À définir',
    attendees: attendees || [],
    notes,
    createdAt: Date.now(),
  };
  mockAppointments.unshift(newAppointment);
  res.status(201).json({ appointment: newAppointment });
});

// GET /api/emails
app.get('/api/emails', (req, res) => {
  res.json({ emails: mockSentEmails });
});

// POST /api/emails
app.post('/api/emails', (req, res) => {
  const { recipient, subject, body } = req.body;
  if (!recipient || !subject || !body) {
    return res.status(400).json({ error: 'Recipient, subject, and body are required' });
  }
  const newEmail: SentEmail = {
    id: `mail-${Date.now()}`,
    recipient,
    subject,
    body,
    sentAt: Date.now(),
  };
  mockSentEmails.unshift(newEmail);
  res.status(201).json({ email: newEmail });
});

// GET /api/restaurants
app.get('/api/restaurants', (req, res) => {
  const { city, lat, lng } = req.query;
  const cityName = typeof city === 'string' ? city : 'Paris';
  const latitude = typeof lat === 'string' ? parseFloat(lat) : undefined;
  const longitude = typeof lng === 'string' ? parseFloat(lng) : undefined;

  const result = getRestaurantsForCity(cityName, latitude, longitude);
  res.json(result);
});

// Production Vite static assets vs Dev middlewares
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} (production=${isProduction})`);
  });
}

startServer();
