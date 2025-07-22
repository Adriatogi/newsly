# Newsly

**AI-Powered News Analysis Platform for Bias Detection and Misinformation Identification**

## 🎥 Demo Video

**[Watch the Full Demo](https://drive.google.com/file/d/1cCP9_8S4QDNVAmcdFcWceVyu34LwihJx/view?pli=1)** - See Newsly in action with live article analysis and bias detection!

---

## Abstract

Newsly is an innovative news analysis platform that leverages advanced artificial intelligence to help users critically evaluate news content. The platform combines state-of-the-art natural language processing models to detect political bias, identify logical fallacies, and provide contextual analysis of news articles. Through a React Native mobile application and FastAPI backend, users can analyze articles from any URL or browse a curated feed of analyzed news content.

The system employs specialized AI models including Political Bias BERT for bias detection, Facebook BART for summarization, and Llama 3.1 for topic extraction and contextualization. By identifying nine different types of logical fallacies and providing detailed explanations, Newsly empowers users to become more discerning news consumers in an era of information overload and misinformation.

---

## 📱 Features

### Core Analysis Capabilities
- **Political Bias Detection**: AI-powered classification of articles as left, center, or right-leaning with confidence scores
- **Logical Fallacy Identification**: Detection of 9 types of logical fallacies including:
  - Ad Hominem attacks
  - Fear mongering
  - False dichotomy
  - Emotion-based fallacies
  - Non sequitur arguments
  - Scapegoating
  - Discrediting sources
  - And more...
- **AI Summarization**: Intelligent article summaries using BART models
- **Topic Extraction**: Automatic identification and categorization of main topics
- **Contextualization**: Historical and cultural context for better understanding
- **Source Credibility Assessment**: Evaluation of article sources and their reliability

### Mobile App Features
- **News Feed**: Browse curated, pre-analyzed articles with filtering by category
- **URL Analysis**: Paste any news URL for real-time analysis
- **User Profiles**: Personal accounts with authentication via Supabase
- **Bookmarking System**: Save articles for later reading
- **Search & Filtering**: Find articles by topic, author, or keywords
- **Dark/Light Mode**: Adaptive UI with user preference support
- **Analytics Integration**: User behavior tracking with PostHog

---

## 🏗️ Architecture

### Backend (FastAPI)
```
fastapi-backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── server.py            # Article processing logic
│   ├── ml_newsly.py         # Local ML model implementations
│   ├── ml_modal.py          # Modal GPU-accelerated functions
│   ├── db.py                # Supabase database operations
│   ├── newsly_types.py      # Data models and type definitions
│   ├── prompts.py           # LLM prompts for analysis
│   ├── utils.py             # Utility functions
│   └── clients.py           # External API clients
├── cli.py                   # Command-line interface
├── requirements.txt         # Python dependencies
└── Dockerfile              # Container configuration
```

### Frontend (React Native + Expo)
```
newsly-frontend/
├── app/
│   ├── tabs/
│   │   ├── feed/            # News feed screens
│   │   ├── urlSearch/       # URL analysis interface
│   │   └── profile/         # User profile management
│   └── _layout.tsx          # Root layout and navigation
├── components/
│   ├── Auth.tsx             # Authentication components
│   └── NewsCard.tsx         # Article display components
├── lib/
│   ├── articles.ts          # Article data models and API
│   ├── supabase.ts          # Database client
│   └── analytics.ts         # PostHog analytics
└── assets/                  # Images, fonts, and static files
```

### Technology Stack

**Backend Technologies:**
- **FastAPI**: Modern Python web framework for building APIs
- **Modal**: Cloud platform for running GPU-accelerated ML models
- **Supabase**: PostgreSQL database with real-time capabilities
- **Hugging Face Transformers**: Pre-trained AI models for NLP tasks
- **Newspaper4k**: Web scraping library for article extraction

**Frontend Technologies:**
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and toolchain
- **TypeScript**: Type-safe JavaScript development
- **React Navigation**: Navigation library for mobile screens

**AI/ML Models:**
- **Political Bias BERT** (`bucketresearch/politicalBiasBERT`): Specialized model for political bias detection
- **BART Large CNN** (`facebook/bart-large-cnn`): Abstractive text summarization
- **Llama 3.1 8B Instruct** (`meta-llama/Llama-3.1-8B-Instruct`): Topic extraction and contextualization

**Infrastructure:**
- **Modal**: GPU computing platform for ML model deployment
- **AWS App Runner**: Containerized application hosting
- **Supabase**: Backend-as-a-Service for database and authentication
- **PostHog**: Product analytics and user tracking

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Expo CLI
- Supabase account
- Modal account (for ML models)
- Hugging Face account (for model access)

### Backend Setup

1. **Clone and navigate to the backend directory:**
   ```bash
   cd fastapi-backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.template .env
   ```
   Fill in the required environment variables in `.env`:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Supabase service role key
   - `HF_TOKEN`: Hugging Face API token
   - `TOGETHER_API_KEY`: Together AI API key
   - `MODAL_TOKEN_ID` and `MODAL_TOKEN_SECRET`: Modal authentication

5. **Run the FastAPI server:**
   ```bash
   fastapi dev app/main.py
   ```

6. **Deploy Modal functions (optional, for GPU acceleration):**
   ```bash
   modal deploy app/ml_modal.py
   ```

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd newsly-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file with:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_POSTHOG_KEY=your_posthog_key
   ```

4. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

5. **Run on device:**
   - **iOS**: `npx expo start --ios` (requires Xcode)
   - **Android**: `npx expo start --android` (requires Android Studio)
   - **Web**: `npx expo start --web`

---

## 🛠️ Usage

### API Endpoints

**Analyze Article:**
```bash
POST /articles/analyze
Content-Type: application/json

{
  "url": "https://example.com/news-article"
}
```

**Test Logical Fallacies:**
```bash
POST /articles/analyze/logical-fallacies
Content-Type: application/json

{
  "url": "https://example.com/news-article"
}
```

### CLI Usage

The backend includes a powerful CLI tool for batch processing and testing:

```bash
# Analyze a single article
python3 cli.py process-article "https://example.com/news-article" --json-output

# Run in test mode (uses mock responses)
python3 cli.py process-article "https://example.com/news-article" --test

# Parse article without analysis
python3 cli.py parse "https://example.com/news-article"

# Get help
python3 cli.py --help
```

### Mobile App Usage

1. **Browse Feed**: View curated articles with analysis results
2. **Search Articles**: Use the search functionality to find specific content
3. **Analyze URLs**: Paste any news URL in the URL Search tab for real-time analysis
4. **User Account**: Create an account to save bookmarks and track reading history
5. **Article Details**: Tap on any article to view detailed analysis including bias scores, logical fallacies, and contextualization

---

## 🧠 AI Analysis Pipeline

### 1. Article Extraction
- Web scraping using Newspaper4k library
- Content parsing and cleaning
- Metadata extraction (author, date, source)

### 2. Parallel Analysis Processing
The system runs multiple AI models simultaneously for efficiency:

- **Summarization**: BART model generates concise article summaries
- **Bias Detection**: Political Bias BERT classifies political lean with confidence scores
- **Topic Extraction**: Llama 3.1 identifies main topics and themes
- **Logical Fallacy Detection**: Specialized prompts identify 9 types of fallacies
- **Contextualization**: AI generates historical and cultural context
- **Categorization**: Articles are tagged into 13 predefined categories

### 3. Results Compilation
All analysis results are combined into a comprehensive report including:
- Article summary and key topics
- Political bias score and explanation
- Detected logical fallacies with quotes and explanations
- Contextualization paragraph
- Source credibility assessment

---

## 📊 Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

- **articles**: Stores article content and analysis results
- **profiles**: User profile information
- **bookmarks**: User-saved articles
- **analytics_events**: User interaction tracking

---

## 🔧 Development

### Backend Development
- **Local Testing**: Use `--test` flag for mock responses
- **Modal Functions**: Deploy ML models to Modal for GPU acceleration  
- **Database**: Supabase provides real-time PostgreSQL with built-in auth

### Frontend Development
- **Expo Dev Tools**: Built-in debugging and testing capabilities
- **Hot Reloading**: Instant updates during development
- **Cross-Platform**: Single codebase for iOS, Android, and web


## 🤝 Contributing

## Our Team
|<img src="https://github.com/user-attachments/assets/58aa7bf9-577e-4221-a694-0c015e367347" width="100" alt="Avi Udash">|<img src="https://github.com/user-attachments/assets/5c289950-8688-422e-a5c2-b9796334779d" width="100" alt="Adrian Gamarra Lafuente">|<img src="https://github.com/user-attachments/assets/bd320945-bfd9-4e39-a2b1-d4ef6c608962" width="150" alt="Andrew Bempong">|<img src="https://github.com/user-attachments/assets/cce615e1-e911-49b5-8f16-e17ea532b88a" width="140" alt="Sabino Hernandez">|          |
|----------|----------|----------|----------|----------|
| Avi Udash| Adrian Gamarra Lafuente| Andrew Bempong | Sabino Hernandez | Elina Mirbaha |

This project was developed by Stanford CS194 Team 2:
- Adrian Gamarra Lafuente
- Andrew Bempong
- Avi Udash
- Sabino Hernandez
- Elina Mirbaha
