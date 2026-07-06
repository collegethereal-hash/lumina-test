import OpenAI from 'openai';

export type AIModelType = 
  | 'qwen/qwen3.5-122b-a10b'
  | 'stepfun-ai/step-3.5-flash'
  | 'abacusai/dracarys-llama-3.1-70b-instruct';

const nvidiaClient = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || '',
  baseURL: 'https://integrate.api.nvidia.com/v1',
  timeout: 30000, // 30 секунд таймаут для быстрого фоллбэка
  maxRetries: 0, // Не пытаемся повторить запрос автоматически
});

export async function chatWithKokoAI(
  message: string, 
  modelType: AIModelType,
  partner1: string,
  partner2: string,
  spaceName: string,
  userName: string,
  mode: 'personal' | 'shared',
  secretKnowledge: string,
  conversationHistory: { role: 'user' | 'koko' | 'cindy' | 'grinch'; text: string }[]
) {
  const startTime = performance.now();
  console.log(`⏱️ [KOKO] Запрос начат, пользователь: ${userName}, режим: ${mode}`);
  
  // Определяем порядок моделей: сначала выбранная пользователем, потом остальные
  const allModels: AIModelType[] = [
    'qwen/qwen3.5-122b-a10b',
    'stepfun-ai/step-3.5-flash',
    'abacusai/dracarys-llama-3.1-70b-instruct'
  ];
  const modelsToAttempt = [modelType, ...allModels.filter(m => m !== modelType)];

  // Создаем промпт один раз для всех попыток
  let systemPrompt = `Ты — Коко, добрый и поддерживающий попугай-терапевт. Отвечай по-русски, коротко и тепло, 3-5 предложений максимум. Никакого пиратского стиля.`;
  
  if (mode === 'shared' && secretKnowledge) {
    const safeSecret = secretKnowledge.length > 600 ? secretKnowledge.slice(-600) : secretKnowledge;
    systemPrompt += ` У тебя есть общий контекст беседы с партнёрами: "${safeSecret}". Никогда не говори "она сказала" или "он сказал". Используй контекст, чтобы задавать мягкие терапевтические вопросы.`;
  }

  const recentHistory = conversationHistory.slice(-8);
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt }
  ];

  for (const msg of recentHistory) {
    messages.push({
      role: msg.role === 'koko' ? 'assistant' : 'user',
      content: msg.text
    });
  }
  messages.push({ role: 'user', content: message });

  for (const currentModel of modelsToAttempt) {
    const modelStart = performance.now();
    try {
      console.log(`🧠 [KOKO] Попытка модели: ${currentModel}`);
      
      const response = await nvidiaClient.chat.completions.create({
        model: currentModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 450,
      });

      const result = response.choices[0]?.message?.content;
      if (result && result.trim().length > 0) {
        const duration = performance.now() - startTime;
        const modelDuration = performance.now() - modelStart;
        console.log(`✅ [KOKO] Успех! Модель: ${currentModel}, время модели: ${modelDuration.toFixed(0)}мс, общее время: ${duration.toFixed(0)}мс`);
        return result;
      }
      
    } catch (err) {
      const modelDuration = performance.now() - modelStart;
      console.error(`❌ [KOKO] Ошибка модели ${currentModel} (${modelDuration.toFixed(0)}мс):`, err);
    }
  }

  const totalDuration = performance.now() - startTime;
  console.error(`💥 [KOKO] Все модели упали, общее время: ${totalDuration.toFixed(0)}мс`);
  return 'Понимаю, давай поговорим. Я здесь, чтобы поддержать тебя.';
}
