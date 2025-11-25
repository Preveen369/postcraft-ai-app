/*
  groqService.js
  - Handles all Groq API calls for PostCraft AI
  - Used by PostGenerator and Assistant components
  - Optimized for crisp, LinkedIn-catchy posts
  - Models: llama-3.3-70b (general) and llama-4-scout-17b (image analysis)
*/

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

// Check if API key is configured
if (!GROQ_API_KEY) {
  console.warn('⚠️ VITE_GROQ_API_KEY is not set. Groq API calls will fail. Please add it to .env.local')
}

/**
 * Call Groq API with streaming or non-streaming response
 * @param {string} model - Model ID (e.g., 'llama-3.3-70b-versatile' or 'llama-4-scout-17b-16e-instruct')
 * @param {Array} messages - Chat message array with { role, content }
 * @param {number} maxTokens - Max tokens in response (default: 1024)
 * @param {object} opts - Options: { temperature }
 * @returns {Promise<string>} - Generated text response
 */
export async function callGroqAPI(model, messages, maxTokens = 1024, opts = {}) {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key is not configured. Please add VITE_GROQ_API_KEY to .env.local')
  }

  // Lower temperature for more deterministic outputs (better for structured posts)
  const temperature = typeof opts.temperature === 'number' ? opts.temperature : 0.35

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Groq API Error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Groq API Error:', error)
    throw error
  }
}

/**
 * Try to parse JSON from model output. If the model adds extra text, attempt to
 * extract the JSON substring between the first { and the last }.
 * Returns parsed object or null on failure.
 */
export function parseJsonSafe(text) {
  if (!text || typeof text !== 'string') return null
  try {
    return JSON.parse(text)
  } catch (e) {
    // Attempt to extract JSON substring
    const first = text.indexOf('{')
    const last = text.lastIndexOf('}')
    if (first !== -1 && last !== -1 && last > first) {
      const sub = text.slice(first, last + 1)
      try {
        return JSON.parse(sub)
      } catch (err) {
        return null
      }
    }
    return null
  }
}

/**
 * Generate post from scratch using llama-4-scout-17b
 * Optimized for LinkedIn: crisp, catchy, professional
 * @param {string} content - User's content/idea
 * @param {string} field - Field of interest
 * @param {string} audience - Target audience
 * @param {string} theme - Theme/Goal
 * @param {object} metrics - { wordCount, optimize }
 * @returns {Promise<object>} - { text, hashtags, headline }
 */
export async function generatePostFromScratch(content, field, audience, theme, metrics = {}) {
  const wordCount = metrics.wordCount || '100'
  const optimize = metrics.optimize !== false // default true

  let promptText = `You are an expert at crafting LinkedIn posts from ideas.

INSTRUCTIONS:
- Extract the key message from the idea
- Create a professional, engaging LinkedIn post (under ${wordCount} words)
- Include 2-3 relevant hashtags
- Incorporate user context if provided
- Keep the tone professional yet engaging
${optimize ? '- Optimize for engagement: include a strong call-to-action, use questions to drive comments, and use line breaks for readability.' : ''}
- Metrics: 
  - Target word count: ${wordCount}
  - Optimize for engagement: ${optimize ? 'Yes' : 'No'}

INPUT:
- Idea: ${content}
- Field: ${field}
- Audience: ${audience}
- Goal: ${theme}

OUTPUT: Return ONLY valid JSON with these keys: extractedText, headline, post, hashtags (array).`

  const messages = [{ role: 'user', content: promptText }]
  const response = await callGroqAPI('meta-llama/llama-4-scout-17b-16e-instruct', messages, 512, { temperature: 0.28 })

  const parsed = parseJsonSafe(response)
  if (parsed) {
    return {
      text: parsed.post?.trim() || '',
      hashtags: parsed.hashtags || [],
      extractedText: parsed.extractedText || '',
      headline: parsed.headline || '',
    }
  }

  return { text: response, hashtags: [], extractedText: '', headline: '' }
}

/**
 * Rewrite existing content using llama-4-scout-17b
 * Optimized for LinkedIn: crisp, engaging, professional
 * @param {string} existingContent - Content to rewrite
 * @param {string} field - Field of interest
 * @param {string} audience - Target audience
 * @param {string} theme - Theme/Goal
 * @param {object} metrics - { wordCount, optimize }
 * @returns {Promise<object>} - { text, hashtags, headline }
 */
export async function rewritePost(existingContent, field, audience, theme, metrics = {}) {
  const wordCount = metrics.wordCount || '100'
  const optimize = metrics.optimize !== false // default true

  let promptText = `You are an expert LinkedIn editor. Rewrite the content below to be more crisp, catchy, and compelling for LinkedIn readers.

INSTRUCTIONS:
- Extract the key message from the content
- Create a professional, engaging LinkedIn post (under ${wordCount} words)
- Include 2-3 relevant hashtags
- Incorporate user context if provided
- Keep the tone professional yet engaging
${optimize ? '- Optimize for engagement: include a strong call-to-action, use questions to drive comments, and use line breaks for readability.' : ''}
- Metrics: 
  - Target word count: ${wordCount}
  - Optimize for engagement: ${optimize ? 'Yes' : 'No'}

ORIGINAL CONTENT:
${existingContent}

CONTEXT:
- Field: ${field}
- Audience: ${audience}
- Goal: ${theme}

OUTPUT: Return ONLY valid JSON with these keys: extractedText, headline, post, hashtags (array).`

  const messages = [{ role: 'user', content: promptText }]
  const response = await callGroqAPI('meta-llama/llama-4-scout-17b-16e-instruct', messages, 512, { temperature: 0.3 })

  const parsed = parseJsonSafe(response)
  if (parsed) {
    return {
      text: parsed.post?.trim() || '',
      hashtags: parsed.hashtags || [],
      extractedText: parsed.extractedText || '',
      headline: parsed.headline || '',
    }
  }

  return { text: response, hashtags: [], extractedText: '', headline: '' }
}

/**
 * Extract text from image and generate post using llama-4-scout-17b
 * Optimized for LinkedIn: insightful, engaging, professional
 * @param {string} imageBase64 - Base64 encoded image
 * @param {string} optionalPrompt - Optional additional prompt from user
 * @param {string} field - Field of interest
 * @param {string} audience - Target audience
 * @param {string} theme - Theme/Goal
 * @param {object} metrics - { wordCount, optimize }
 * @returns {Promise<object>} - { text, hashtags, extractedText, headline }
 */
export async function generatePostFromImage(imageBase64, optionalPrompt, field, audience, theme, metrics = {}) {
  const wordCount = metrics.wordCount || '100'
  const optimize = metrics.optimize !== false // default true

  let promptText = `You are an expert at extracting insights from images and crafting LinkedIn posts.

INSTRUCTIONS:
- Extract key insights or message from the image
- Create a professional, engaging LinkedIn post (under ${wordCount} words)
- Include 2-3 relevant hashtags
- Incorporate user context if provided
- Keep the tone professional yet engaging
${optimize ? '- Optimize for engagement: include a strong call-to-action, use questions to drive comments, and use line breaks for readability.' : ''}
- Metrics: 
  - Target word count: ${wordCount}
  - Optimize for engagement: ${optimize ? 'Yes' : 'No'}

INPUT:
- Image (please analyze)
${optionalPrompt ? `- User context: ${optionalPrompt}` : ''}
- Field: ${field}
- Audience: ${audience}
- Goal: ${theme}

OUTPUT: Return ONLY valid JSON with these keys: extractedText, headline, post, hashtags (array).`

  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: promptText,
        },
        {
          type: 'image_url',
          image_url: {
            url: imageBase64,
          },
        },
      ],
    },
  ]

  const response = await callGroqAPI('meta-llama/llama-4-scout-17b-16e-instruct', messages, 512, { temperature: 0.28 })

  const parsed = parseJsonSafe(response)
  if (parsed) {
    return {
      text: parsed.post?.trim() || '',
      hashtags: parsed.hashtags || [],
      extractedText: parsed.extractedText || '',
      headline: parsed.headline || '',
    }
  }

  return { text: response, hashtags: [], extractedText: '', headline: '' }
}

/**
 * Chat with Groq API using llama-3.3-70b
 * Optimized for strategy and content advice
 * @param {Array} messages - Conversation history with { role, content }
 * @returns {Promise<string>} - Assistant response
 */
export async function chatWithAssistant(messages) {
  const messagesWithSystem = [
    {
      role: 'system',
      content:
        'You are PostCraft AI Assistant, an expert in LinkedIn content strategy, copywriting, and social media marketing. Help users refine posts, answer strategy questions, and optimize content for engagement. Be concise (under 200 words), professional, and actionable. Provide specific examples when helpful.',
    },
    ...messages,
  ]

  const response = await callGroqAPI('llama-3.3-70b-versatile', messagesWithSystem, 512, { temperature: 0.6 })
  return response
}

/**
 * Calculate engagement score based on post content (LinkedIn-optimized heuristic)
 * @param {string} postText - The post content
 * @returns {number} - Score from 0-100
 */
export function calculateEngagementScore(postText) {
  if (!postText) return 0

  let score = 45 // Base score

  // Optimal word count for LinkedIn: 50-150 words
  const wordCount = postText.split(/\s+/).length
  if (wordCount >= 50 && wordCount <= 150) score += 20
  else if (wordCount >= 30 && wordCount <= 200) score += 10

  // Bonus for CTAs (very effective on LinkedIn)
  if (/connect|share|comment|discuss|learn|discover|join|reach out|let me know|thoughts/i.test(postText)) score += 15

  // Bonus for questions (drives comments)
  const questionCount = (postText.match(/\?/g) || []).length
  if (questionCount > 0) score += Math.min(questionCount * 5, 15)

  // Bonus for line breaks/whitespace (readability)
  const lineBreaks = (postText.match(/\n/g) || []).length
  if (lineBreaks > 2) score += 10

  // Bonus for emojis (professional use)
  if (/[\u{1F300}-\u{1F9FF}]/u.test(postText)) score += 5

  // Bonus for numbers/data (credibility)
  if (/\d+%|\d+x|#\d+|\d+,\d+/i.test(postText)) score += 10

  // Bonus for strong verbs (engagement)
  if (/transform|revolutionize|discover|unlock|empower|leverage|accelerate|scale/i.test(postText)) score += 10

  return Math.min(score, 100)
}

