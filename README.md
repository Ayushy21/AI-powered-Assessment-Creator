# 🧠 VedaAI — AI-Powered Assessment Creator

> Generate professional, structured exam papers in seconds using AI.

VedaAI is a full-stack web application that leverages **Google Gemini AI** to automatically generate high-quality assessment papers. Teachers can specify subject, grade, difficulty, question types, and even upload reference material — the AI handles the rest.

---

## ✨ Features

- **🤖 AI-Powered Generation** — Uses Google Gemini 1.5 Flash to create structured, pedagogically sound question papers
- **📝 Multiple Question Types** — MCQ, Short Answer, Long Answer, True/False, Fill-in-the-Blanks
- **📊 Customizable Assessments** — Set title, subject, grade, marks, difficulty, and number of questions
- **📄 File Upload Support** — Upload reference material (PDF, DOC, TXT) to generate context-aware questions
- **⚡ Real-time Progress** — Live status updates via WebSocket while the paper is being generated
- **🗂️ Dashboard** — View all created assessments with stats and status tracking
- **📥 PDF Export** — Download generated papers as formatted PDFs
- **🚀 Background Processing** — BullMQ job queue ensures reliable, non-blocking paper generation
- **💾 Redis Caching** — Generated papers are cached for fast retrieval

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **TypeScript** | Type-safe development |
| **Google Gemini AI** | AI-powered question generation |
| **MongoDB + Mongoose** | Database & ODM |
| **Redis + BullMQ** | Job queue & caching |
| **Socket.IO** | Real-time WebSocket events |
| **Multer** | File upload handling |

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type-safe development |
| **Zustand** | Lightweight state management |
| **Socket.IO Client** | Real-time updates |
| **Lucide React** | Icon library |
| **html2pdf.js** | PDF export |

---

## 📁 Project Structure

```
AI-powered-Assessment-Creator/
├── client/                    # Next.js frontend
│   ├── src/
│   │   ├── app/               # Pages (Dashboard, Create, Assessment View)
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Assessment/    # Question paper display components
│   │   │   ├── CreateAssignment/  # Multi-step form components
│   │   │   └── ui/            # Base UI components (Button, Input, etc.)
│   │   ├── lib/               # API client & Socket.IO setup
│   │   ├── store/             # Zustand state management
│   │   └── styles/            # Global CSS styles
│   └── package.json
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── config/            # Database & Redis configuration
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # Gemini AI service
│   │   ├── queues/            # BullMQ job queue & worker
│   │   ├── socket/            # Socket.IO event handlers
│   │   ├── types/             # TypeScript type definitions
│   │   └── index.ts           # Server entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local or Atlas)
- **Redis** (local or cloud)
- **Google Gemini API Key** — [Get one here](https://aistudio.google.com/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/Ayushy21/AI-powered-Assessment-Creator.git
cd AI-powered-Assessment-Creator
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_HOST=localhost
REDIS_PORT=6379
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:3100
```

Start the server:

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd client
npm install
npm run dev
```

### 4. Open in browser

Navigate to **http://localhost:3100** and start creating assessments!

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/assignments` | List all assignments |
| `GET` | `/api/assignments/:id` | Get assignment by ID |
| `POST` | `/api/assignments` | Create a new assignment |
| `POST` | `/api/upload` | Upload reference file |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `generation:started` | Server → Client | Paper generation has begun |
| `generation:completed` | Server → Client | Paper generated successfully |
| `generation:failed` | Server → Client | Generation failed with error |

---

## 🔧 How It Works

1. **Teacher fills the form** — Title, subject, grade, question types, difficulty, marks, and optionally uploads reference material
2. **Assignment is saved** — Details are stored in MongoDB with `pending` status
3. **Job is queued** — A BullMQ job is created for background processing
4. **AI generates the paper** — The worker sends a structured prompt to Gemini 1.5 Flash
5. **Real-time updates** — Socket.IO notifies the frontend of progress
6. **Paper is cached** — The generated paper is stored in MongoDB and cached in Redis
7. **Teacher views/downloads** — The structured paper can be viewed and exported as PDF

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Ayushy21">Ayushy21</a>
</p>
