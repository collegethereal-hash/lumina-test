'use server';

import { chatWithKokoAI, AIModelType } from '@/lib/ai';

export async function chatWithKoko(
  message: string, 
  userId?: string, 
  mode: 'personal' | 'shared' = 'shared', 
  modelType: AIModelType = 'qwen/qwen3.5-122b-a10b',
  conversationHistory?: { role: 'user' | 'koko' | 'cindy' | 'grinch'; text: string }[],
  secretKnowledge: string = ''
) {
  try {
    console.log('Calling AI:', { modelType, messageLength: message.length, hasSecret: !!secretKnowledge });
    
    // Hardcoded defaults to work without Supabase
    const p1 = 'Гринч';
    const p2 = 'Синди Лу';
    const spaceName = 'Talia';

    // 2. Get User Name
    let userName = userId === 'Grinch' ? p1 : (userId === 'Cindy' ? p2 : 'Капитан');

    // 4. Call unified AI function
    const aiResponse = await chatWithKokoAI(
      message, 
      modelType, 
      p1, 
      p2, 
      spaceName, 
      userName, 
      mode, 
      secretKnowledge,
      conversationHistory || []
    );
    console.log('AI response received in action:', aiResponse.length);
    return aiResponse;
  } catch (error) {
    console.error('Koko AI Error in Action:', error);
    return 'Произошла ошибка с ИИ. Попробуй другую модель.';
  }
}
