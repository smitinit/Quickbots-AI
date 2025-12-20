# Quick Bot AI - Complete Project Flow & Architecture

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Complete Flow Diagrams](#complete-flow-diagrams)
5. [Key Components](#key-components)
6. [Data Flow](#data-flow)
7. [Authentication Flow](#authentication-flow)
8. [Chatbot Widget Flow](#chatbot-widget-flow)
9. [Realtime Updates Flow](#realtime-updates-flow)
10. [API Routes](#api-routes)
11. [Database Schema](#database-schema)

---

## 🎯 Project Overview

**Quick Bot AI** is a multi-tenant SaaS platform for creating, configuring, and managing AI-powered chatbots. The platform allows users to:

- Create and customize chatbots with unique personalities
- Configure UI settings (themes, colors, behavior)
- Manage bot settings, runtime configurations, and API keys
- Embed chatbots as widgets on websites
- Real-time updates to chatbot configurations

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Clerk Authentication Provider                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Supabase Provider (with JWT)                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Main App Routes                                       │  │
│  │  - /bots (dashboard)                                    │  │
│  │  - /bots/[slug]/* (bot management)                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  @qb/quickbot Package (Widget)                         │  │
│  │  - Embedded chatbot widget                            │  │
│  │  - Standalone package                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Database                        │
│  - bots                                                     │
│  - bot_configs                                              │
│  - bot_settings                                             │
│  - bot_runtime_settings                                     │
│  - bot_ui_settings                                          │
│  - api_keys                                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Gemini AI (via Vercel AI SDK)           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI** (Radix UI components)
- **Framer Motion** (animations)
- **React Hook Form** + **Zod** (form validation)

### Backend

- **Next.js API Routes** (serverless functions)
- **Supabase** (PostgreSQL database + Realtime)
- **Clerk** (authentication)
- **Google Gemini 2.0 Flash** (AI model via Vercel AI SDK)

### Package Management

- **Monorepo** (workspaces)
- **@qb/quickbot** (internal package for chatbot widget)

---

## 🔄 Complete Flow Diagrams

### 1. Application Initialization Flow

```
User visits app
    │
    ▼
┌─────────────────────────────────────┐
│  Root Layout (layout.tsx)          │
│  - ClerkProvider                    │
│  - SupabaseProvider                 │
│  - ThemeProvider                    │
│  - Chatbot widget (hardcoded)       │
└─────────────────────────────────────┘
    │
    ├─► Clerk Authentication
    │   └─► JWT token for Supabase
    │
    ├─► Supabase Client Creation
    │   └─► Anon key + Clerk JWT
    │
    └─► Chatbot Widget Initialization
        └─► Fetches config from /api/config/[bot_id]
```

### 2. Bot Management Flow

```
User navigates to /bots
    │
    ▼
┌─────────────────────────────────────┐
│  BotsList Component                 │
│  - Fetches user's bots from Supabase│
│  - Displays bot cards               │
└─────────────────────────────────────┘
    │
    ▼
User clicks on a bot
    │
    ▼
┌─────────────────────────────────────┐
│  /bots/[slug]/layout.tsx            │
│  - BotLayoutClient                  │
│    └─► Fetches full bot data        │
│       - bot                         │
│       - bot_configs                 │
│       - bot_settings                │
│       - bot_runtime_settings        │
│       - api_keys                    │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Tab Navigation                     │
│  - Configure                       │
│  - Settings                        │
│  - Advance                         │
│  - QuickBots API                  │
│  - Danger Zone                     │
└─────────────────────────────────────┘
```

### 3. Chatbot Widget Flow

```
Chatbot Component Mounts
    │
    ▼
┌─────────────────────────────────────┐
│  Chatbot.tsx                        │
│  1. Fetches config from API         │
│     GET /api/config/[bot_id]        │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  API Route: /api/config/[bot_id]   │
│  1. Validates bot_id                │
│  2. Fetches bot profile             │
│  3. Fetches bot_ui_settings         │
│  4. Filters allowed fields          │
│  5. Signs payload with ECDSA        │
│  6. Returns {ui_settings, signature}│
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  fetchBotConfig()                   │
│  1. Parses response with Zod        │
│  2. Verifies ECDSA signature        │
│  3. Transforms to camelCase         │
│  4. Returns uiSettings              │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  ChatbotPreview.tsx                 │
│  - Renders chat UI                  │
│  - Handles open/close/expand       │
│  - Manages email prompt             │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  ChatInterface.tsx                  │
│  - Message display                  │
│  - Input handling                   │
│  - File upload                      │
│  - Emoji picker                    │
│  - Markdown rendering               │
└─────────────────────────────────────┘
```

### 4. Chat Message Flow

```
User sends message
    │
    ▼
┌─────────────────────────────────────┐
│  ChatInterface.handleSend()          │
│  - Validates email (if required)    │
│  - Adds message to state            │
│  - Prepares FormData/JSON           │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  POST /api/chat/[bot_id]            │
│  1. Validates bot_id                │
│  2. Parses request (JSON/FormData)   │
│  3. Authenticates (API key or none)  │
│  4. Loads bot profile               │
│  5. Builds system prompt            │
│  6. Streams response from Gemini    │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Google Gemini AI                   │
│  - Processes message                │
│  - Generates response               │
│  - Streams back to client           │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  ChatInterface displays stream       │
│  - Updates message in real-time      │
│  - Renders markdown                  │
└─────────────────────────────────────┘
```

### 5. Realtime Updates Flow

```
User updates UI settings in Preview Form
    │
    ▼
┌─────────────────────────────────────┐
│  previewFormLayout.tsx              │
│  - Submits form data                │
│  - Calls updatePreview()            │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  usePreviewActions.updatePreview()  │
│  - Converts to snake_case           │
│  - Filters allowed fields           │
│  - Updates bot_ui_settings table    │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Supabase Realtime                  │
│  - Triggers UPDATE event            │
│  - Broadcasts to subscribers         │
└─────────────────────────────────────┘
    │
    ├─► Preview Form Subscription
    │   └─► Updates form state
    │
    └─► Chatbot Widget Subscription
        └─► Fetches new config
            └─► Updates UI
```

---

## 🧩 Key Components

### 1. **SupabaseProvider** (`src/providers/SupabaseProvider.tsx`)

- Creates authenticated Supabase client
- Uses Clerk JWT token for authentication
- Provides client via React Context

### 2. **BotLayoutClient** (`src/components/bot-layout-client.tsx`)

- Fetches complete bot data
- Provides bot context to children
- Exposes refetch function on window object

### 3. **Chatbot** (`packages/quickbot/src/Chatbot.tsx`)

- Main widget component
- Fetches and validates config
- Subscribes to realtime updates
- Renders ChatbotPreview

### 4. **ChatbotPreview** (`packages/quickbot/src/ChatbotPreview.tsx`)

- Renders chat UI (floating button, windows)
- Handles auto-open, auto-greet
- Manages email prompt flow
- Position and theme styling

### 5. **ChatInterface** (`packages/quickbot/src/ChatInterface.tsx`)

- Core chat functionality
- Message display and input
- File upload, emoji picker
- Markdown rendering
- Timestamp display

### 6. **PreviewFormLayout** (`src/features/preview/previewFormLayout.tsx`)

- Form for editing UI settings
- Live preview of chatbot
- Realtime subscription for updates
- Split-pane layout

---

## 📊 Data Flow

### Database Tables

1. **bots**

   - Core bot information
   - `bot_id` (UUID, primary key)
   - `user_id` (Clerk user ID)
   - `name`, `description`, etc.

2. **bot_configs**

   - Bot personality and behavior
   - `greetings`, `personality`, `temperature`, etc.

3. **bot_settings**

   - General bot settings
   - Various configuration options

4. **bot_runtime_settings**

   - Runtime-specific settings
   - Performance and behavior tuning

5. **bot_ui_settings** ⭐ (Critical for widget)

   - UI customization
   - `theme`, `chatbot_name`, `welcome_message`
   - `quick_questions`, `position`
   - `auto_open_delay_ms`, `auto_greet_on_open`
   - `ask_email_before_chat`, `show_timestamps`
   - `persist_chat`

6. **api_keys**
   - API keys for server-to-server access
   - Hashed tokens

### Data Transformation

```
Database (snake_case)
    │
    ▼
API Route (filters allowed fields)
    │
    ▼
ECDSA Signature
    │
    ▼
Client (Zod validation)
    │
    ▼
Transform to camelCase
    │
    ▼
React Components (camelCase)
```

---

## 🔐 Authentication Flow

### User Authentication (Clerk)

```
1. User signs in via Clerk
2. ClerkProvider manages session
3. SupabaseProvider gets JWT token:
   session.getToken({ template: "supabase" })
4. Supabase client created with:
   - Anon key
   - Authorization: Bearer <JWT>
5. RLS policies enforce user access
```

### Widget Authentication (ECDSA)

```
1. Widget requests config from /api/config/[bot_id]
2. Server signs payload with private key
3. Widget verifies signature with public key
4. No user authentication required for widget
5. Signature ensures config integrity
```

### API Key Authentication

```
1. Server-to-server requests include:
   Authorization: Bearer <api_key>
2. Server looks up API key in database
3. Verifies bot_id matches
4. Allows access to chat endpoint
```

---

## 🤖 Chatbot Widget Flow

### Initialization

```
1. <QuickBot botId="..." /> mounts
2. useEffect fetches config:
   - Calls fetchBotConfig(botId)
   - GET /api/config/[bot_id]
3. Validates response:
   - Zod schema validation
   - ECDSA signature verification
4. Transforms data:
   - snake_case → camelCase
   - Adds theme pack
5. Sets uiSettings state
6. Subscribes to realtime updates
7. Renders ChatbotPreview
```

### User Interaction

```
1. User clicks floating button
2. Chat opens (if autoOpenDelayMs > 0, auto-opens)
3. If autoGreetOnOpen: shows welcome message
4. If askEmailBeforeChat:
   - User can send message first
   - Then prompted for email
   - Email validated with regex
5. User types message
6. Message sent to /api/chat/[bot_id]
7. Response streamed back
8. Message displayed with markdown
9. If showTimestamps: timestamp shown
```

### Features

- **Auto-open**: Opens after `autoOpenDelayMs`
- **Auto-greet**: Shows welcome message on open
- **Email prompt**: Collects email before chat (if enabled)
- **File upload**: Images and files supported
- **Emoji picker**: Always enabled
- **Markdown**: Always enabled
- **Timestamps**: Optional display
- **Quick questions**: Clickable preset questions
- **Themes**: 5 themes (modern, classic, minimal, bubble, retro)

---

## 🔄 Realtime Updates Flow

### Preview Form Subscription

```
1. previewFormLayout.tsx mounts
2. useEffect sets up subscription:
   supabase.channel(`ui-settings-${bot_id}`)
     .on("postgres_changes", {
       event: "*",
       table: "bot_ui_settings",
       filter: `bot_id=eq.${bot_id}`
     })
3. On update:
   - Checks if local update (isLocalUpdateRef)
   - Compares timestamps
   - Updates form state
4. Cleanup on unmount
```

### Widget Subscription

```
1. Chatbot.tsx subscribes after initial load
2. subscribeToBotUpdates():
   - Creates Supabase client (anon key, no JWT)
   - Subscribes to bot_ui_settings updates
   - On update: fetches new config
   - Updates uiSettings state
3. Polling fallback:
   - Polls every 2 seconds
   - Ensures updates are received
4. Cleanup on unmount
```

### Update Process

```
1. User saves in Preview Form
2. updatePreview() updates database
3. Supabase Realtime broadcasts UPDATE
4. Both subscriptions receive event:
   - Preview form: Updates form state
   - Widget: Fetches new config
5. Widget re-renders with new settings
```

---

## 🛣️ API Routes

### GET `/api/config/[bot_id]`

**Purpose**: Provides signed bot UI configuration to widget

**Flow**:

1. Validates `bot_id`
2. Fetches bot profile and UI settings
3. Filters to allowed fields only
4. Signs payload with ECDSA P-256
5. Returns `{ ui_settings, signature }`

**Security**:

- ECDSA signature ensures integrity
- No authentication required (public endpoint)
- Whitelist prevents unauthorized fields

### POST `/api/chat/[bot_id]`

**Purpose**: Handles chat messages and streams AI responses

**Flow**:

1. Validates `bot_id` and message
2. Supports JSON or FormData (for files)
3. Authenticates (API key or none for widget)
4. Loads bot profile
5. Builds system prompt from config
6. Streams response from Google Gemini

**Authentication**:

- Optional: `Authorization: Bearer <api_key>` for server-to-server
- Widget requests: No auth (authenticated via config signature)

**Features**:

- File upload support (images, PDFs, etc.)
- Streaming responses
- Multi-modal (text + images)

---

## 📁 Project Structure

```
quick-bot-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── config/        # Config endpoint
│   │   │   └── chat/          # Chat endpoint
│   │   ├── bots/              # Bot management pages
│   │   │   └── [slug]/        # Individual bot routes
│   │   └── layout.tsx          # Root layout
│   ├── components/            # React components
│   │   ├── bot-*.tsx          # Bot-related components
│   │   └── ui/                # Shadcn UI components
│   ├── features/              # Feature modules
│   │   ├── preview/           # Preview form
│   │   ├── config/            # Config form
│   │   └── ...
│   ├── lib/                   # Utilities
│   │   ├── client/            # Client-side actions
│   │   ├── db/                # Database helpers
│   │   ├── supabase/          # Supabase config
│   │   └── ...
│   ├── providers/             # Context providers
│   │   └── SupabaseProvider.tsx
│   └── types/                 # TypeScript types
│
└── packages/
    └── quickbot/              # Chatbot widget package
        ├── src/
        │   ├── Chatbot.tsx
        │   ├── ChatbotPreview.tsx
        │   └── ChatInterface.tsx
        └── lib/
            ├── api/            # API client
            ├── crypto/         # Signature verification
            ├── realtime/       # Realtime subscriptions
            ├── themes/         # Theme packs
            └── validators.tsx  # Zod schemas
```

---

## 🔑 Key Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ECDSA Keys (for config signing)
QUICKBOT_PRIVATE_KEY_RAW=
NEXT_PUBLIC_QUICKBOT_PUBLIC_KEY=

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY=
```

---

## 🎨 Theme System

### Theme Packs

Each theme has predefined colors:

- **modern**: Blue/gray professional
- **classic**: Traditional colors
- **minimal**: Clean, simple
- **bubble**: Playful, rounded
- **retro**: Vintage aesthetic

### Theme Properties

- `backgroundColor`: Chat background
- `headerColor`: Header background
- `accentColor`: User message bubbles
- `textColor`: Text color
- `borderColor`: Border colors

---

## 🚀 Deployment Considerations

1. **Monorepo**: Build `@qb/quickbot` package before deploying
2. **Environment Variables**: All keys must be set
3. **Clerk Template**: Must have "supabase" JWT template
4. **Supabase RLS**: Policies must allow authenticated access
5. **Realtime**: Must be enabled on `bot_ui_settings` table

---

## 🔍 Debugging Tips

1. **Realtime not working**: Check Supabase credentials in quickbot client
2. **Config errors**: Verify ECDSA keys match
3. **RLS errors**: Check Clerk JWT template exists
4. **Widget not loading**: Check browser console for fetch errors
5. **Signature verification fails**: Ensure allowed fields match

---

## 📝 Summary

This is a **multi-tenant SaaS platform** for AI chatbots with:

- ✅ **User authentication** via Clerk
- ✅ **Database** via Supabase (PostgreSQL)
- ✅ **Realtime updates** via Supabase Realtime
- ✅ **AI chat** via Google Gemini
- ✅ **Embeddable widget** via `@qb/quickbot` package
- ✅ **Secure config** via ECDSA signatures
- ✅ **Multi-tenant** via user_id isolation

The architecture separates concerns:

- **Main app**: Bot management UI
- **Widget package**: Standalone chatbot widget
- **API routes**: Server-side logic
- **Realtime**: Live configuration updates
