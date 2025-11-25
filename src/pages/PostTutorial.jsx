
import React, { useState } from 'react'

export default function PostTutorial() {
  const [modalImg, setModalImg] = useState(null)
  const handleImgClick = (src) => setModalImg(src)
  const closeModal = () => setModalImg(null)
  return (
    <div className="max-w-4xl mx-auto">
      {/* Vignette/Lightbox Modal */}
      {modalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={closeModal}>
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-60 bg-white bg-opacity-90 rounded-full p-2 shadow-lg hover:bg-red-100 transition flex items-center justify-center"
            aria-label="Close preview"
            style={{ width: 40, height: 40, fontSize: 28, fontWeight: 'bold', border: 'none', cursor: 'pointer', padding: 0 }}
            onMouseDown={e => e.stopPropagation()}
            onClickCapture={e => { e.stopPropagation(); closeModal(); }}
          >
            <span className="w-full h-full flex items-center justify-center">×</span>
          </button>
          <img src={modalImg} alt="Preview" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border-4 border-white" />
        </div>
      )}
      <header className="mb-6">
        <h2 className="text-2xl font-semibold">How to Use PostCraft AI</h2>
        <p className="text-gray-600 mt-2">A quick illustrated guide to posting and chatting effectively on this platform.</p>
      </header>

      <section className="bg-white p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-bold mb-2">1. Generate a LinkedIn Post</h3>
        <ol className="list-decimal ml-6 space-y-2">
          <li>
            <span className="font-medium">Choose a content source:</span> Select <b>From Scratch</b>, <b>Rewrite Existing</b>, or <b>From Image</b>.
            <div className="flex mt-1 gap-2">
              <img
                src="/context-options.png"
                alt="From Scratch"
                className="w-100 h-24 rounded bg-gray-50 cursor-pointer transition hover:shadow-lg"
                onClick={() => handleImgClick('/context-options.png')}
              />
            </div>
          </li>
          <li>
            <span className="font-medium">Fill in the details:</span> Enter your idea, upload an image, or paste content. Adjust <b>Field</b>, <b>Audience</b>, <b>Theme</b>, and <b>Word Count</b> as needed.
          </li>
          <li>
            <span className="font-medium">Click <b>Generate Post</b>:</span> The AI will create a LinkedIn-optimized post. Use <b>Regenerate</b> for more options.
          </li>
          <li>
            <span className="font-medium">Copy and use:</span> Click <b>Copy All</b> to copy your post and hashtags for LinkedIn.
          </li>
        </ol>
      </section>

      <section className="bg-white p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-bold mb-2">2. Chat with the AI Assistant</h3>
        <ol className="list-decimal ml-6 space-y-2">
          <li>
            <span className="font-medium">Ask questions:</span> Use the chat box to ask for post feedback, headline ideas, or LinkedIn strategy tips.
          </li>
          <li>
            <span className="font-medium">Quick questions:</span> Click a suggested question for instant advice.
          </li>
          <li>
            <span className="font-medium">View illustrated answers:</span> The assistant can reply with structured cards, tips, or JSON-formatted content for easy reading.
          </li>
        </ol>
      </section>

      <section className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-bold mb-2">3. Tips for Best Results</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>Be specific with your prompts for more tailored posts.</li>
          <li>Use <b>Regenerate</b> to explore different phrasings and styles.</li>
          <li>Try the <b>From Image</b> mode to turn screenshots or infographics into posts.</li>
          <li>Ask the assistant for engagement tips, hashtag suggestions, or content ideas.</li>
        </ul>
        <div className="mt-4 flex flex-col sm:flex-row gap-4 w-full overflow-x-auto p-2">
          <img
            src="/chat-example.png"
            alt="Chat Example"
            className="w-full sm:flex-1 max-w-full sm:max-w-[48%] h-48 sm:h-56 object-contain border rounded bg-gray-50 mx-auto cursor-pointer transition hover:shadow-lg"
            onClick={() => handleImgClick('/chat-example.png')}
          />
          <img
            src="/post-example.png"
            alt="Post Example"
            className="w-full sm:flex-1 max-w-full sm:max-w-[48%] h-48 sm:h-56 object-contain border rounded bg-gray-50 mx-auto cursor-pointer transition hover:shadow-lg"
            onClick={() => handleImgClick('/post-example.png')}
          />
        </div>
      </section>
    </div>
  )
}

