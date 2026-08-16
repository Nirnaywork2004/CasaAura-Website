# 🏠 CasaAura – Premium Home Decor

> A modern full-stack e-commerce website for discovering and shopping premium home decor products.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

## 📌 Overview

**CasaAura** is a full-stack e-commerce project focused on premium home decor. It combines a modern React frontend with a Node.js/Express backend and MongoDB for data management.

The project was initially developed with **Google AI Studio** and synchronized to GitHub for version control and further development.

## ✨ Features

- 🛍️ Premium home-decor product browsing
- 🔎 Product discovery and catalog experience
- 🛒 E-commerce-oriented shopping workflow
- 👤 User authentication foundation
- 🔐 JWT-based authentication support
- 🔑 Password hashing with bcrypt
- 🗄️ MongoDB database integration through Mongoose
- 🤖 Google Gemini API integration
- 📱 Responsive modern UI
- ⚡ Vite-powered development and production build
- 🧩 React component-based architecture
- 🎨 Tailwind CSS styling
- 🚀 Express backend API

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Motion

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcryptjs
- CORS
- dotenv

### AI
- Google Gemini API via `@google/genai`

### Development Tools
- Vite
- TypeScript
- TSX
- esbuild
- Git & GitHub

## 📂 Project Structure

```text
CasaAura-Website/
│
├── assets/
│   └── .aistudio/
│
├── server/
│   ├── config/
│   ├── seeds/
│   └── ...
│
├── src/
│   └── ...
│
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Nirnaywork2004/CasaAura-Website.git
cd CasaAura-Website
```

### 2. Install dependencies

Using npm:

```bash
npm install
```

Or, if you use Bun:

```bash
bun install
```

### 3. Configure environment variables

Create your local environment file from the example:

```bash
cp .env.example .env
```

On Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

Add the required values to `.env`. Never commit real API keys, database passwords, JWT secrets, or other private credentials.

### 4. Run the development server

```bash
npm run dev
```

Or:

```bash
bun run dev
```

The project will start using the development script defined in `package.json`.

## 📦 Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development environment |
| `npm run build` | Build the frontend and bundled server |
| `npm start` | Start the production server after building |
| `npm run seed` | Seed product data |
| `npm run server:dev` | Start the backend development server |
| `npm run preview` | Preview the Vite production build |
| `npm run lint` | Run TypeScript type checking |

## 🔐 Environment Variables

The repository includes `.env.example` files to show the expected configuration without exposing secrets.

Typical project configuration may include values for:

```text
MONGODB_URI
JWT_SECRET
GEMINI_API_KEY
```

Use the exact variable names provided by the project's `.env.example` files.

> ⚠️ **Security:** Never upload `.env` files containing real credentials to GitHub.

## 🌐 Live Demo

The project can be previewed through the Google AI Studio deployment:

**CasaAura – Premium Home Decor**

https://casaaura-premium-home-decor.ai.studio

## 📸 Screenshots

Add screenshots of the main pages here as the project UI is finalized.

Example:

```text
screenshots/
├── home.png
├── products.png
├── product-details.png
└── dashboard.png
```

Then reference them in this README:

```markdown
![CasaAura Home Page](screenshots/home.png)
```

## 🔄 Development Workflow

```text
Google AI Studio
       ↓
   Development
       ↓
   GitHub Sync
       ↓
CasaAura-Website Repository
       ↓
 Further Development
       ↓
 Build / Deploy
```

## 🎯 Future Improvements

- [ ] Payment gateway integration
- [ ] Complete order management
- [ ] Wishlist functionality
- [ ] Advanced product filtering
- [ ] Product reviews and ratings
- [ ] Admin dashboard
- [ ] Improved authentication and authorization
- [ ] Automated testing
- [ ] CI/CD with GitHub Actions
- [ ] Production deployment

## 👨‍💻 Author

**Nirnay Mondal**

GitHub:  
https://github.com/Nirnaywork2004

## 📄 License

This project is currently intended for educational and portfolio purposes.
