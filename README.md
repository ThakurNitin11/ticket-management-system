# 🎫 Enterprise Ticket Management & AI Operations Platform

An enterprise-grade, AI-powered customer support and operations platform built with **Next.js 16 (Turbopack)**, **React 19**, **Prisma ORM 7**, **PostgreSQL with pgvector**, and **Google Gemini AI**.

The platform helps support teams manage customer tickets, automate responses, monitor SLA performance, manage knowledge-base articles, detect agent collisions, and make better operational decisions using AI.

**Live Demo:** Coming Soon • **Repository:** https://github.com/ThakurNitin11/ticket-management-system

---

## 🌟 Key Features

### 1. 🤖 AI Knowledge First-Responder

The AI First-Responder helps support teams quickly handle common customer issues.

* Generates personalized solutions for customer queries.
* Uses semantic vector search to find relevant Knowledge Base articles.
* Uses **pgvector** for similarity-based knowledge retrieval.
* Uses Google Gemini AI to generate customer-friendly responses.
* Sends automated email responses for supported queries.
* Keeps unresolved tickets active for human support when AI cannot provide a reliable solution.

---

### 2. 🧠 Horizon AI — Operations Advisor

Horizon AI provides administrators with operational insights and scenario-based analysis.

* Daily operational briefing.
* System health score from 0–100.
* Queue and workload analysis.
* Bottleneck detection.
* Root-cause analysis.
* What-if scenario simulation.
* SLA impact estimation.
* Generates tactical mitigation plans for operational problems.

Example scenarios include:

* 500 payment-failure tickets during a product launch.
* 50% staff availability reduction.
* Sudden increase in customer support requests.
* SLA queue overload.

---

### 3. 📊 Automated Executive Reports

The platform automatically generates operational reports for administrators.

#### Daily EOD Report

Generated every day at **7:00 PM IST**.

Includes:

* Total ticket volume.
* Resolved tickets.
* Pending tickets.
* Resolution rate.
* SLA status.
* Operational summary.
* CSV report attachment.

#### Weekly Executive Report

Generated every Monday at **9:00 AM IST**.

Includes:

* 7-day ticket statistics.
* KPI summary.
* Agent workload.
* Agent efficiency leaderboard.
* SLA compliance.
* Pending queue analysis.
* CSV spreadsheet attachment.

The administrator email address is configured through environment variables instead of being hard-coded in the project documentation.

---

### 4. ⚡ Database-Backed Agent Collision Detection

The system prevents multiple support agents from unknowingly working on the same ticket.

* Stores active agent presence in PostgreSQL.
* Tracks which agents are viewing a ticket.
* Works across browsers and serverless environments.
* Displays active viewer information.
* Shows collision warnings when multiple agents access the same ticket.

---

### 5. 🛡️ Multi-Level Ticket Escalation

Tickets can be escalated across multiple support levels.

* **L1** — First-level support.
* **L2** — Advanced technical/support team.
* **L3** — Senior or specialist support.

Each escalation can include:

* Internal handover notes.
* Agent notifications.
* Email CC notifications.
* Ticket history tracking.
* SLA monitoring.

---

### 6. ⏱️ SLA Breach Monitoring

The system continuously monitors ticket SLA deadlines.

When an SLA is breached:

* The ticket is detected automatically.
* An escalation event is triggered.
* Administrators receive an alert.
* The ticket remains available for further action.

---

### 7. 📥 Automated Email-to-Ticket System

The platform can automatically convert incoming customer emails into support tickets.

Features include:

* IMAP-based email synchronization.
* Automatic ticket creation.
* Attachment extraction.
* Conversation/thread matching.
* Follow-up email handling.
* Duplicate email detection.
* Unique `emailMessageId` tracking.

The email synchronization service periodically checks the configured inbox for new customer messages.

---

### 8. ✨ High-Fidelity Loading Experience

The application uses custom shimmering skeleton loaders to provide a smoother user experience.

Skeleton states are implemented across major application areas including:

* `/tickets`
* `/tickets/[id]`
* `/users`
* `/horizon`
* `/knowledge`
* `/profile`

The goal is to minimize layout shifts while application data is loading.

---

# 🛠️ Technology Stack

| Layer             | Technology                          |
| ----------------- | ----------------------------------- |
| Framework         | Next.js 16.3, App Router, Turbopack |
| Frontend          | React 19                            |
| Styling           | Tailwind CSS 4                      |
| UI Icons          | Lucide React                        |
| Charts            | Recharts                            |
| Database          | PostgreSQL                          |
| Vector Search     | pgvector                            |
| ORM               | Prisma ORM 7                        |
| AI                | Google Gemini                       |
| Authentication    | JWT with `jose`                     |
| Password Security | `bcryptjs`                          |
| Email             | Nodemailer                          |
| IMAP              | ImapFlow                            |
| Deployment        | Vercel                              |
| Language          | TypeScript                          |

---

# 📂 Project Structure

```text
ticket-management-system/
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── cron/
│   │   │   ├── horizon/
│   │   │   ├── knowledge/
│   │   │   ├── reports/
│   │   │   ├── tickets/
│   │   │   └── users/
│   │   │
│   │   └── dashboard/
│   │       ├── horizon/
│   │       ├── knowledge/
│   │       ├── profile/
│   │       ├── tickets/
│   │       └── users/
│   │
│   ├── components/
│   │
│   └── lib/
│       ├── aiFirstResponder.ts
│       ├── auth.ts
│       ├── dailyReportService.ts
│       ├── email.ts
│       ├── emailSyncService.ts
│       ├── gemini.ts
│       ├── presenceStore.ts
│       ├── slaService.ts
│       └── weeklyReportService.ts
│
├── instrumentation.ts
├── middleware.ts
├── package.json
├── prisma.config.ts
├── next.config.ts
└── README.md
```

---

# 🚀 Getting Started Locally

## 1. Clone the Repository

```bash
git clone https://github.com/ThakurNitin11/ticket-management-system.git
cd ticket-management-system
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ticket_system?schema=public"

JWT_SECRET="your-secure-jwt-secret"

GEMINI_API_KEY="your-google-gemini-api-key"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="465"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Inbound IMAP Sync
IMAP_HOST="imap.gmail.com"
IMAP_PORT="993"
IMAP_USER="your-email@gmail.com"
IMAP_PASS="your-app-password"

NEXTAUTH_URL="http://localhost:3000"
```

> **Never commit your `.env` file or API keys to GitHub.**

---

# 🗄️ Database Setup

Make sure PostgreSQL is running locally.

Generate the Prisma client:

```bash
npx prisma generate
```

Push the database schema:

```bash
npx prisma db push
```

If you are using pgvector, make sure the PostgreSQL instance has the required vector extension configured.

---

# ▶️ Run the Application

Start the development server:

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

---

# 🧪 Production Build

To verify the production build:

```bash
npm run build
```

You can start the production server after a successful build:

```bash
npm start
```

---

# 🔐 Authentication & Security

The application uses:

* JWT-based authentication.
* Secure password hashing with `bcryptjs`.
* Protected dashboard routes.
* Server-side authentication checks.
* Environment-based secrets.
* Role-based staff management.

Sensitive credentials such as database passwords, Gemini API keys, SMTP credentials, IMAP credentials, and JWT secrets should always be stored in environment variables.

---

# 🤖 AI Architecture

The AI functionality is divided into multiple responsibilities.

### AI First-Responder Flow

```text
Customer Query
      ↓
Ticket / AI First Responder
      ↓
Knowledge Base Search
      ↓
Vector Similarity Search
      ↓
Relevant Knowledge Articles
      ↓
Google Gemini
      ↓
Generated Response
      ↓
Customer Email
```

### Horizon AI Operations Flow

```text
Support Data
     ↓
Horizon AI
     ↓
System Health Analysis
     ↓
Bottleneck Detection
     ↓
Root Cause Analysis
     ↓
What-If Simulation
     ↓
Mitigation Plan
```

---

# 📈 Main Application Areas

| Module     | Purpose                                      |
| ---------- | -------------------------------------------- |
| Dashboard  | Overall support and operational overview     |
| Tickets    | Ticket management and customer conversations |
| Users      | Staff and user management                    |
| Knowledge  | Internal Knowledge Base                      |
| Horizon AI | AI-powered operational analysis              |
| Reports    | Daily and weekly executive reports           |
| Profile    | Administrator settings                       |
| SLA        | SLA monitoring and escalation                |

---

# 📧 Automated Background Tasks

The application contains background services for:

* Daily executive reports.
* Weekly executive reports.
* SLA breach monitoring.
* Inbound email synchronization.
* Automated ticket processing.
* Agent presence tracking.

These services are designed to work with the application's server-side architecture and deployment environment.

---

# ☁️ Deployment

The application can be deployed using Vercel.

Before deployment, configure all required environment variables in the deployment platform.

Required configuration may include:

```text
DATABASE_URL
JWT_SECRET
GEMINI_API_KEY
EMAIL_HOST
EMAIL_PORT
EMAIL_USER
EMAIL_PASS
IMAP_HOST
IMAP_PORT
IMAP_USER
IMAP_PASS
NEXTAUTH_URL
```

After deploying the application, update the **Live Demo** link at the top of this README with your actual production URL.

---

# 🐛 Bug Reports & Contributions

If you find a bug or have an improvement suggestion, open an issue in the project repository:

`https://github.com/ThakurNitin11/ticket-management-system/issues`

Pull requests and constructive feedback are welcome.

---

# 📄 License

This project is licensed under the MIT License.

See the `LICENSE` file in the repository for more information.

---

## 👨‍💻 Project

**Enterprise Ticket Management & AI Operations Platform**

Repository:

`https://github.com/ThakurNitin11/ticket-management-system`
