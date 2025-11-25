import React, { useState } from 'react'
import TagChip from '../components/TagChip'
import Toggle from '../components/Toggle'
import { generatePostFromScratch, rewritePost, generatePostFromImage, calculateEngagementScore, parseJsonSafe } from '../services/groqService'

/*
  PostGenerator Page
  - Integrated with Groq API
  - "From Scratch" & "Rewrite Existing": llama-3.3-70b-versatile
  - "From Image": llama-4-scout-17b-16e-instruct with optional prompt
  - Uses local state for UI interactions
*/
export default function PostGenerator() {
  const [field, setField] = useState('Marketing')
  const [audience, setAudience] = useState('Professionals')
  const [audienceRange, setAudienceRange] = useState(50)
  const [theme, setTheme] = useState('Inform')
  const [tab, setTab] = useState('scratch')
  const [optimize, setOptimize] = useState(true)
  const [wordCount, setWordCount] = useState('100')
  const [inputText, setInputText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePrompt, setImagePrompt] = useState('')

  const [generated, setGenerated] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)


  /**
   * Clean and parse JSON from various formats including code blocks
   */
  function cleanAndParseJson(text) {
    if (!text || typeof text !== 'string') return null
    
    // Remove code block markers (```json, ```, etc.)
    let cleanText = text.trim()
    
    // Handle various code block formats
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
    
    // Try to find JSON object boundaries
    const firstBrace = cleanText.indexOf('{')
    const lastBrace = cleanText.lastIndexOf('}')
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanText = cleanText.slice(firstBrace, lastBrace + 1)
    }
    
    try {
      const obj = JSON.parse(cleanText)
      // Remove 'hook' property at any level (top-level or nested)
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
      console.warn('Failed to parse JSON:', e)
      return null
    }
  }

  /**
   * Render JSON content as JSX components
   */
  function renderJsonAsJSX(parsedContent) {
    if (!parsedContent) return null
    
    const elements = []
    
    // Headline
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
    
    
    // Post Content
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
    
    // Hashtags
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

  /**
   * Handle file upload for image tab
   */
  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      // Validate image
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.')
        return
      }
      setImageFile(file)
      setError(null)
    }
  }

  /**
   * Convert image to base64 for API
   */
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Generate post based on current tab
   */
  async function handleGenerate() {
    setLoading(true)
    setError(null)

    try {
      let result

      if (tab === 'scratch') {
        if (!inputText.trim()) {
          setError('Please enter content to generate from.')
          setLoading(false)
          return
        }
        // Pass metrics to API
        result = await generatePostFromScratch(
          inputText,
          field,
          audience,
          theme,
          { wordCount, optimize }
        )
      } else if (tab === 'rewrite') {
        if (!inputText.trim()) {
          setError('Please paste existing content to rewrite.')
          setLoading(false)
          return
        }
        // Pass metrics to API
        result = await rewritePost(
          inputText,
          field,
          audience,
          theme,
          { wordCount, optimize }
        )
      } else if (tab === 'image') {
        if (!imageFile) {
          setError('Please select an image to analyze.')
          setLoading(false)
          return
        }
        const imageBase64 = await fileToBase64(imageFile)
        // Pass metrics to API
        result = await generatePostFromImage(
          imageBase64,
          imagePrompt,
          field,
          audience,
          theme,
          { wordCount, optimize }
        )
      }

      // Always attempt to parse JSON from response (handles code blocks, raw JSON, or plain text)
      let parsedContent = null;
      let rawJsonString = null;
      if (typeof result.text === 'string') {
        parsedContent = cleanAndParseJson(result.text);
        if (parsedContent) {
          rawJsonString = result.text;
        }
      }

      // Calculate engagement score
      const finalText = parsedContent ? 
        (parsedContent.post || '') :
        result.text;
      const score = calculateEngagementScore(finalText);

      setGenerated({
        text: finalText,
        hashtags: parsedContent ? (parsedContent.hashtags || []) : (result.hashtags || []),
        headline: parsedContent ? parsedContent.headline : result.headline,
        // ...existing code...
        post: parsedContent ? parsedContent.post : null,
        rawJson: rawJsonString,
        parsedContent: parsedContent,
        score,
        isParsed: !!parsedContent,
      });
    } catch (err) {
      console.error('Generation Error:', err)
      setError(err.message || 'Failed to generate post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Copy all content (post + hashtags) to clipboard
   */
  function handleCopyAll() {
    if (!generated) return
    const postContent = generated.text || ''
    const hashtagsText = generated.hashtags.length > 0 ? `\n\n${generated.hashtags.join(' ')}` : ''
    const allText = `${postContent}${hashtagsText}`
    navigator.clipboard.writeText(allText)
    alert('Copied to clipboard!')
  }

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold">Craft Your Perfect Post</h2>
        <p className="text-sm text-gray-600 mt-1">Create engaging LinkedIn posts tailored to your audience and goals using AI.</p>
      </header>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Input Panel */}
        <section className="md:col-span-2 bg-white p-5 rounded-lg border">
          <h3 className="font-medium mb-3">Input Panel</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-sm text-gray-700">Field of Interest</label>
              <select value={field} onChange={(e) => setField(e.target.value)} className="w-full mt-1 border rounded-md p-2 bg-white">
                <option>Money Exchange</option>
                <option>Forex Currencies</option>
                <option>Travels & Tourism</option>
                <option>Marketing</option>
                <option>Technology</option>
                <option>Business</option>
                <option>Motivation</option>
                <option>Finance</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Audience Type</label>
              <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full mt-1 border rounded-md p-2 bg-white">
                <option>Professionals</option>
                <option>Members</option>
                <option>Founders</option>
                <option>Students</option>
                <option>Executives</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center justify-between text-sm text-gray-700">
              <span>Audience Range</span>
              <span className="text-sm text-gray-500">{audienceRange}%</span>
            </label>
            <input type="range" min="0" max="100" value={audienceRange} onChange={(e) => setAudienceRange(Number(e.target.value))} className="w-full mt-2" />
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-700">Theme / Goal</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full mt-1 border rounded-md p-2 bg-white">
              <option>Inform</option>
              <option>Motivate</option>
              <option>Engage</option>
              <option>Promote</option>
              <option>Inspire</option>
            </select>
          </div>

          <div className="mb-4">
            <h4 className="font-medium mb-2">Content Source</h4>
            <div className="flex gap-2 mb-3 flex-wrap">
              <button onClick={() => setTab('scratch')} className={`px-3 py-1 rounded text-sm ${tab === 'scratch' ? 'bg-sky-50 border border-sky-200' : 'bg-gray-50 border'}`}>
                From Scratch
              </button>
              <button onClick={() => setTab('rewrite')} className={`px-3 py-1 rounded text-sm ${tab === 'rewrite' ? 'bg-sky-50 border border-sky-200' : 'bg-gray-50 border'}`}>
                Rewrite Existing
              </button>
              <button onClick={() => setTab('image')} className={`px-3 py-1 rounded text-sm ${tab === 'image' ? 'bg-sky-50 border border-sky-200' : 'bg-gray-50 border'}`}>
                From Image
              </button>
            </div>

            {/* From Scratch Tab */}
            {tab === 'scratch' && (
              <textarea placeholder="Enter your content idea here..." value={inputText} onChange={(e) => setInputText(e.target.value)} className="w-full h-40 border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            )}

            {/* Rewrite Existing Tab */}
            {tab === 'rewrite' && (
              <textarea placeholder="Paste your existing content here..." value={inputText} onChange={(e) => setInputText(e.target.value)} className="w-full h-40 border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            )}

            {/* From Image Tab */}
            {tab === 'image' && (
              <div className="space-y-3">
                <div className="border-dashed border-2 border-gray-200 p-6 rounded-md">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
                  <p className="text-sm text-gray-500 mt-2">
                    {imageFile ? `✓ Image selected: ${imageFile.name}` : 'Select an image to extract text and generate a post.'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-700">Optional: Add context or prompt (optional)</label>
                  <textarea
                    placeholder="e.g., Focus on the statistics shown, mention the trend..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="w-full h-20 border rounded-md p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <h4 className="font-medium mb-2">AI Options</h4>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <Toggle label="Optimize for Engagement" checked={optimize} onChange={setOptimize} />
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Word Count</label>
                <select value={wordCount} onChange={(e) => setWordCount(e.target.value)} className="border rounded-md p-1 bg-white">
                  <option value="50">~50</option>
                  <option value="100">~100</option>
                  <option value="200">~200</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`pc-btn-primary disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? 'Generating...' : 'Generate Post'}
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="pc-btn-secondary disabled:opacity-50"
            >
              Regenerate
            </button>
            <span className="text-sm font-semibold text-sky-700 select-none" style={{cursor:'default'}}>
              Ask the Assistant about this post
            </span>
          </div>
        </section>

        {/* Right: Preview & Hashtags */}
        <aside className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium mb-3">Preview & Hashtags</h4>

          {/* Post Preview Section */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 flex-shrink-0 text-sm font-medium">
                {imageFile ? '📷' : (
                  <img
                    src="/linkedin-icon.png"
                    alt="LinkedIn"
                    className="w-8 h-8 object-contain"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Post Preview</p>

              </div>
            </div>
            
            {generated ? (
              <div className="space-y-3">
                {/* Show JSX Components by default if parsed content exists */}
                {generated.isParsed ? (
                  renderJsonAsJSX(generated.parsedContent)
                ) : (
                  /* Fallback Clean Preview Display */
                  <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {generated.text || 'No content generated'}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-200 text-center">
                <p className="text-sm text-gray-500">Your generated post will appear here.</p>
              </div>
            )}
          </div>

          {/* Hashtags Section - Only show when not in JSX mode or no hashtags in JSX */}
          <div className="mb-4">
            {generated && !generated.isParsed && generated.hashtags && generated.hashtags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {generated.hashtags.map((hashtag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
                  </span>
                ))}
              </div>
            ) : generated?.isParsed ? (
              <p className="text-xs text-gray-500 text-center">Hashtags displayed in JSX components above</p>
            ) : !generated ? (
              <p className="text-sm text-gray-400">Hashtags will appear here after generation.</p>
            ) : (
              <p className="text-sm text-gray-400">No hashtags generated</p>
            )}
          </div>

          {/* Copy All Button */}
          <button 
            onClick={handleCopyAll} 
            disabled={!generated} 
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg border text-sm font-medium transition-colors disabled:cursor-not-allowed mb-4"
          >
            Copy All
          </button>

          {/* Engagement Score */}
          {generated && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Engagement Score</span>
                <span className="text-lg font-bold text-gray-900">{generated.score}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    generated.score >= 75 ? 'bg-green-500' : generated.score >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${generated.score}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                {generated.score >= 75 ? '✓ Excellent' : generated.score >= 50 ? '~ Good' : '⚠ Fair'}
              </p>
            </div>
          )}

          {/* Tips Section */}
          {generated && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Tips for Better Engagement</h5>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  Start with a strong opening in the first line.
                  
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  Use 2–3 relevant hashtags.
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  Include a clear call-to-action.
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  Keep it between 50-200 words.
                </li>
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}