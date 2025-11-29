# 🎓 PostCraft AI – LinkedIn Post Generator
![Platform](https://img.shields.io/badge/Platform-Web-blue.svg)
![Tech](https://img.shields.io/badge/Frontend-React%20%7C%20Tailwind-orange.svg)
![Language](https://img.shields.io/badge/Language-JavaScript-yellow.svg)
![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)
[![Netlify Status](https://api.netlify.com/api/v1/badges/4d92ca7b-a246-4778-89ed-4d26412ce5ee/deploy-status)](https://app.netlify.com/projects/postcraft-ai-app/deploys)

**PostCraft AI** is an AI-powered web application that helps professionals craft engaging LinkedIn posts tailored to their audience and goals. Users input content ideas, select audience types (e.g., professionals), fields of interest (e.g., marketing), and themes, then generate optimized posts with previews, relevant hashtags, and copy options. Built with React for dynamic UI and integrated with the Groq API for fast AI content generation, it streamlines social media content creation.

🔗 **Live Project**: <https://postcraft-ai.netlify.app/>

---

## 🚀 Features
### 🎯 **AI Post Generation**
- Generate personalized LinkedIn posts from scratch, rewritten text, or image prompts using Groq API.
- Supports themes/goals like "Inform" for educational content or "Engage" for interactive discussions.

### 👥 **Audience Targeting**
- Customize for audience types (e.g., Professionals) and ranges (e.g., 25-35 years).
- Tailor content to fields like Marketing, Tech, or Finance for relevance.

### 📝 **Input & Output Panels**
- Easy input fields for content ideas, with options to source from scratch, rewrite existing text, or image-based prompts.
- Real-time preview of generated posts in a LinkedIn-style card, plus auto-suggested hashtags.

### 🔄 **AI Options & Assistance**
- Integrated AI assistant for guided prompts and refinements.
- Copy-all button for quick export to clipboard; responsive design for mobile/desktop use.

### 🚀 **Seamless Deployment**
- Hosted on Netlify for instant access—no setup required for end-users.

---

## 🛠️ Tech Stack
- **Frontend**: React – For interactive components and state management
- **Styling**: Tailwind CSS – Utility-first CSS for rapid, responsive design
- **AI Integration**: Groq API – Fast, efficient content generation
- **Build Tool**: Vite – Modern bundler for quick development and builds
- **Other**: HTML, JavaScript, ESLint for code quality

---

## 📂 Project Structure
```
postcraft-ai-app/
    ├── public/ # Static assets (e.g., index.html, images)
    ├── src/ # Source code
    │   ├── components/ # Reusable React components (e.g., InputPanel, Preview)
    │   ├── App.jsx # Main app component
    │   └── main.jsx # Entry point
    ├── .gitignore # Git exclusions
    ├── README.md # Project documentation
    ├── eslintrc.js # ESLint config
    ├── index.html # Root HTML file
    ├── package.json # Dependencies and scripts
    ├── postcss.config.js # PostCSS setup for Tailwind
    └── vite.config.js # Vite configuration
```

---

## 🧪 Installation & Setup
### 📋 Prerequisites
- Node.js (v18 or higher) and npm/yarn
- A modern web browser (e.g., Chrome, Firefox)

### 🧑‍💻 Steps to run
1. **Clone the repository**
   ```bash
   git clone https://github.com/Preveen369/postcraft-ai-app.git
   cd postcraft-ai-app
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up Groq API** (optional for local dev)
   - Add your Groq API key to environment variables (e.g., `.env` file: `VITE_GROQ_API_KEY=your_key_here`).
4. **Start the development server**
   ```bash
   npm run dev
   ```
   - Open [http://localhost:5173](http://localhost:5173) in your browser.

For production: Build with `npm run build` and deploy to Netlify or Vercel.

---

## 🤝 Contributing
Pull requests are welcome! Feel free to fork the repository and suggest improvements.

Steps to contribute:
```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature-name
# 3. Commit your changes
git commit -m "Add feature description"
# 4. Push to GitHub
git push origin feature-name
# 5. Open a Pull Request
```

---

## 📧 Contact
For queries or suggestions:
- 📩 Email: spreveen123@gmail.com
- 🌐 LinkedIn: www.linkedin.com/in/preveen-s-17250529b/
  
---

## 🌟 Show Your Support
If you like this project, please consider giving it a ⭐ on GitHub!
