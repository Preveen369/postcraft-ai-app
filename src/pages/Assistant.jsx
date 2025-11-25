// Render JSON content as JSX components (copied from PostGenerator.jsx)
function renderJsonAsJSX(parsedContent) {
  if (!parsedContent) return null
  const elements = []
  if (parsedContent.headline) {
    elements.push(
      <div key="headline" className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-blue-600 font-medium">HEADLINE</span>
          <span className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded">JSX</span>
        </div>
        <h2 className="text-sm text-blue-800 font-semibold">{parsedContent.headline}</h2>
      </div>
    )
  }
  if (parsedContent.post) {
    elements.push(
      <div key="post" className="bg-gray-50 p-3 rounded-lg border mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600 font-medium">POST CONTENT</span>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">JSX</span>
        </div>
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{parsedContent.post}</div>
      </div>
    )
  }
  if (parsedContent.hashtags && Array.isArray(parsedContent.hashtags) && parsedContent.hashtags.length > 0) {
    elements.push(
      <div key="hashtags" className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-purple-600 font-medium">HASHTAGS</span>
          <span className="text-xs text-purple-500 bg-purple-100 px-2 py-1 rounded">JSX Array</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {parsedContent.hashtags.map((hashtag, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
            >
              {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
            </span>
          ))}
        </div>
      </div>
    )
  }
  return elements.length > 0 ? <div className="space-y-0">{elements}</div> : null
}
// Utility: Clean and parse JSON from various formats (copied from PostGenerator.jsx)
function cleanAndParseJson(text) {
  if (!text || typeof text !== 'string') return null
  let cleanText = text.trim()
  if (
    cleanText.startsWith('```json\n') ||
    cleanText.startsWith('```json') ||
    cleanText.startsWith('```javascript') ||
    cleanText.startsWith('Here is the output:\n```json') ||
    cleanText.startsWith('```JSON') ||
    cleanText.startsWith('```Json') ||
    cleanText.startsWith('```JSON\n') ||
    cleanText.startsWith('```')
  ) {
    cleanText = cleanText.replace(/^```(json|json\n|Json|JSON|answer|ans|txt|text|code|output)?\s*/i, '').replace(/```\s*$/, '')
  }
  const firstBrace = cleanText.indexOf('{')
  const lastBrace = cleanText.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleanText = cleanText.slice(firstBrace, lastBrace + 1)
  }
  try {
    const obj = JSON.parse(cleanText)
    function removeHook(o) {
      if (o && typeof o === 'object') {
        if (Array.isArray(o)) {
          o.forEach(removeHook)
        } else {
          if (o.hasOwnProperty('hook')) {
            delete o.hook
          }
          Object.values(o).forEach(removeHook)
        }
      }
    }
    removeHook(obj)
    return obj
  } catch (e) {
    return null
  }
}
import React, { useState, useRef, useEffect } from 'react'
import Avatar from '../components/Avatar'
import { chatWithAssistant } from '../services/groqService'

// Quick question chips for the assistant intro
const quickQuestions = [
  'How can I improve my post?',
  "What's the best time to post?",
  'Can you suggest a catchy headline?',
  'How do I grow my audience?',
]

// Sample threads
const sampleThreads = [
  { id: 1, title: 'Engagement strategies', time: '2 hours ago' },
  { id: 2, title: 'Content calendar best practices', time: '1 day ago' },
  { id: 3, title: 'LinkedIn algorithm insights', time: '3 days ago' },
]

export default function Assistant() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'assistant', text: "Hello! I'm your PostCraft AI Assistant. I can help you refine your posts, answer questions about content strategy, and provide engagement insights. How can I help you today?" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /**
   * Handle sending a message
   */
  async function handleSend() {
    if (!input.trim() || loading) return

    // Add user message
    const userMessage = { id: messages.length + 1, from: 'user', text: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      // Prepare messages for Groq API (convert to format Groq expects)
      const groqMessages = updatedMessages
        .filter((m) => m.from !== 'user' || m.text) // Only include messages with content
        .map((m) => ({
          role: m.from === 'user' ? 'user' : 'assistant',
          content: m.text,
        }))

      // Call Groq API
      const response = await chatWithAssistant(groqMessages)

      // Add assistant response
      const assistantMessage = {
        id: updatedMessages.length + 2,
        from: 'assistant',
        text: response,
      }
      setMessages([...updatedMessages, assistantMessage])
    } catch (err) {
      console.error('Chat Error:', err)
      setError(err.message || 'Failed to get response. Please try again.')

      // Add error message
      const errorMsg = {
        id: updatedMessages.length + 2,
        from: 'assistant',
        text: `Sorry, I encountered an error: ${err.message}. Please check your Groq API key and try again.`,
      }
      setMessages([...updatedMessages, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle quick question click
   */
  async function handleQuickQuestion(question) {
    setInput(question)
    // Automatically send after a short delay
    setTimeout(() => {
      const userMsg = { id: messages.length + 1, from: 'user', text: question }
      const updated = [...messages, userMsg]
      setMessages(updated)
      setInput('')
      setLoading(true)
      setError(null)

      chatWithAssistant(updated.map((m) => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text })))
        .then((response) => {
          const assistantMsg = { id: updated.length + 2, from: 'assistant', text: response }
          setMessages([...updated, assistantMsg])
        })
        .catch((err) => {
          console.error('Chat Error:', err)
          const errorMsg = { id: updated.length + 2, from: 'assistant', text: `Sorry, error: ${err.message}` }
          setMessages([...updated, errorMsg])
        })
        .finally(() => setLoading(false))
    }, 100)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-screen md:h-auto max-w-6xl mx-auto">
      {/* Left: Assistant Intro */}
      <aside className="bg-white p-5 rounded-lg border md:col-span-1">
        <h3 className="text-lg font-semibold mb-2">Welcome to your AI Assistant</h3>
        <p className="text-sm text-gray-600 mb-4">I can help you refine posts, answer strategy questions, and optimize content for engagement.</p>

        <div className="mb-4">
          <p className="text-xs text-gray-500 font-medium mb-2 uppercase">Quick Questions</p>
          <div className="space-y-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(q)}
                disabled={loading}
                className="w-full px-2 py-2 text-xs bg-gray-50 hover:bg-gray-100 disabled:opacity-50 rounded border text-left transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Threads section removed */}
      </aside>

      {/* Right: Chat Panel */}
      <section className="bg-white p-0 rounded-lg border md:col-span-2 flex flex-col h-[80vh] relative">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b mb-3 px-5 pt-5">
          <img
            src="/linkedin-icon.png"
            alt="LinkedIn"
            className="w-10 h-10 rounded-full object-contain bg-white border"
          />
          <div>
            <h3 className="font-medium">AI Assistant</h3>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs mx-5">
            {error}
          </div>
        )}

        {/* Messages (scrollable area) */}
        <div className="flex-1 overflow-y-auto space-y-3 px-5 pb-32" style={{ minHeight: 0 }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.from === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {/* If assistant, try to parse as JSON and render as card; else plain text */}
                {msg.from === 'assistant' && cleanAndParseJson(msg.text) ? (
                  renderJsonAsJSX(cleanAndParseJson(msg.text))
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed Input at bottom */}
        <div className="absolute bottom-0 left-0 w-full bg-white border-t flex gap-2 p-4">
          <input
            type="text"
            placeholder="Ask a question…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
            className="flex-1 border rounded-md p-2 text-sm disabled:opacity-50"
          />
          <button onClick={handleSend} disabled={loading} className="pc-btn-primary disabled:opacity-50">
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </section>
    </div>
  )
}
