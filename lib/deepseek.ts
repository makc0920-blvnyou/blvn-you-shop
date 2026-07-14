import OpenAI from 'openai'
import { CONSULTANT_PROMPT, WRITER_PROMPT } from '@/agents/consultant'

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1',
})

export async function chatWithAgent(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  agent: 'consultant' | 'writer'
) {
  const systemPrompt = agent === 'consultant' ? CONSULTANT_PROMPT : WRITER_PROMPT

  try {
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-v4-flash',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    })
    return response.choices[0].message.content
  } catch (error) {
    console.error('DeepSeek API error:', error)
    return 'Мяу... что-то пошло не так. Попробуй еще раз позже! 🐱'
  }
}
