<div align="center">

<img src="https://img.shields.io/badge/Phase-I%20Web%20Portal-0ea5e9?style=for-the-badge" />
<img src="https://img.shields.io/badge/Frontend-React.js%20%7C%20Tailwind%20CSS-61DAFB?style=for-the-badge&logo=react" />
<img src="https://img.shields.io/badge/Backend-Flask%20%7C%20Python-3776AB?style=for-the-badge&logo=python" />
<img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql" />
<img src="https://img.shields.io/badge/License-All%20Rights%20Reserved-red?style=for-the-badge" />

# 🌐 SPRMP — Smart Polio Record and Monitoring Portal
### Phase I: Web Portal

**Final Year Project · BS Computer Science**  
Wisdom Degree College for Women, Channan, Gujrat 
*Affiliated with the University of the Punjab, Lahore*

**Submitted by:**  
Raqeeba Yasin — Roll No. 092873  
Uma Ammara — Roll No. 092869

**Supervised by:** Dr. Muhammad Adeel

---

</div>

## 📌 What Is SPRMP?

**SPRMP (Smart Polio Record and Monitoring Portal)** is a full-stack health informatics system designed to digitise, centralise, and monitor Pakistan's national polio vaccination programme — from administrative oversight down to field-level data entry.

Pakistan is one of the last countries in the world where wild poliovirus continues to circulate. The ongoing challenge in eradication is not just coverage — it is **visibility**. District health officers cannot act on data they cannot see, and fragmented paper-based records from field campaigns arrive too slowly and too inaccurately to drive real-time decisions. SPRMP solves this by providing a unified, role-aware digital platform that connects every tier of the programme: administrators who configure the system, district health coordinators (UCMOs) who monitor campaign progress, and field workers who record vaccinations on the ground.

> **SPRMP is a domain-specific system engineered for the operational realities of Pakistan's anti-polio programme — not a repurposed generic health application.**

The system is delivered in two phases:

| Phase | Deliverable | Description |
|---|---|---|
| **Phase I** | **Web Portal** | **Admin dashboard, UCMO analytics console, ChatBot, RBAC management — the focus of this repository** |
| Phase II | Mobile Application | Field Worker data-entry app for house-to-house vaccination campaigns |

---

## 🎯 Phase I — Scope and Purpose

Phase I delivers the **SPRMP Web Portal** — the administrative and analytical nerve centre of the entire system. It serves two of the three user roles defined in SPRMP's access hierarchy and provides the management layer that makes field operations coherent and traceable.

The Web Portal solves three concrete problems:

1. **Fragmented campaign oversight** — UCMOs previously had no single view of district-level vaccination progress. The portal's analytics dashboard aggregates data from all field records in real time, enabling coordinators to identify coverage gaps, track missed cases, and monitor refusal trends.

2. **Unstructured user management** — Admins can provision, update, and deactivate field worker and UCMO accounts directly from the portal, replacing manual credential management processes.

3. **Inaccessible programme data** — The ChatBot interface (partially implemented) provides a natural-language query layer over programme data, allowing non-technical stakeholders to ask questions without navigating raw dashboards.

---

## 🗂️ Repository Structure

```
SPRMP-WebPortal/
│
├── frontend/
│   ├── src/
│   │   ├── pages/              # Route-level page components (Dashboard, Analytics, Users, Login)
│   │   ├── components/         # Reusable UI components (Charts, Tables, Modals, Navbar, Sidebar)
│   │   ├── context/            # Auth context, role-guard wrappers, global state
│   │   ├── api/                # Axios service layer — all Flask API calls
│   │   ├── hooks/              # Custom React hooks (useAuth, useFetch, useAnalytics)
│   │   └── assets/             # Images, icons, and static resources
│   ├── public/                 # Static HTML entry point and favicon
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── package.json            # Node dependencies
│
├── backend/
│   ├── app.py                  # Application entry point and route registration
│   ├── models/                 # SQLAlchemy ORM models (User, Child, Vaccination, Campaign)
│   ├── routes/                 # Modular Flask route blueprints
│   ├── auth/                   # JWT authentication and RBAC middleware
│   ├── chatbot/                # ChatBot module (partial implementation)
│   └── encryption/             # AES encryption/decryption utilities
│
├── database/
│   ├── schema.sql              # Full PostgreSQL schema
│   └── seed.sql                # Sample data for development and testing
│
├── docs/                       # Phase I technical documentation
├── .env.example                # Environment variable template (no secrets committed)
├── requirements.txt            # Python backend dependencies
├── package.json                # Root-level Node dependencies
└── README.md                   # This file
```

---

## ⚙️ Technology Stack

### Frontend

| Technology | Version | Role |
|---|---|---|
| React.js | 18.x | Component-based SPA framework |
| Tailwind CSS | 3.x | Utility-first CSS framework for responsive styling |
| React Router | 6.x | Client-side routing and protected route management |
| Axios | 1.x | HTTP client for Flask API communication |
| Recharts | 2.x | Data visualisation library for analytics dashboards |

### Backend

| Technology | Version | Role |
|---|---|---|
| Python | 3.11+ | Backend language |
| Flask | 3.x | Lightweight REST API framework |
| SQLAlchemy | 2.x | ORM layer for PostgreSQL |
| Flask-JWT-Extended | — | JSON Web Token authentication |
| PyCryptodome | — | AES encryption for data in transit |

### Database

| Technology | Role |
|---|---|
| PostgreSQL 15 | Primary relational database — stores all user, child, vaccination, and campaign records |

---

## 🔐 Security Architecture

Health records are among the most sensitive categories of personal data. SPRMP's security model treats protection as a first-class architectural concern, not a layer added after functionality is complete.

### Role-Based Access Control (RBAC)

SPRMP enforces a strict three-role access hierarchy. The Web Portal serves the Admin and UCMO roles exclusively — no field worker functionality is exposed through the web interface.

| Role | Capabilities | Portal Access |
|---|---|---|
| **Admin** | Full system control — user provisioning, campaign configuration, data management, system monitoring | ✅ Full access | Future Planned |
| **UCMO** | Read-only analytics — district-level vaccination statistics, missed-case reports, campaign progress tracking | ✅ Analytics and reports only |✅|
| **Field Worker** | Data entry — child registration, vaccination recording, missed-case flagging | Data-Entry Access on Web and Mobile |✅|

Role enforcement is applied at three layers: the JWT middleware on every API endpoint, the React Router protected-route wrappers in the frontend, and the database query filters that scope data to the authenticated user's jurisdiction.

### AES Encryption

All sensitive data transmitted between the frontend and the Flask API is encrypted using **AES (Advanced Encryption Standard)**. This ensures that intercepted network traffic cannot be read without the encryption key — a critical property for a system handling child health records.

### JWT Authentication

All API endpoints require a valid **JSON Web Token**. Unauthenticated requests receive a `401 Unauthorized` response. Tokens are short-lived, with silent refresh to maintain session continuity without requiring repeated logins during extended administrative sessions.

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed on your development machine:

- Node.js v18+ and npm
- Python 3.11+
- PostgreSQL 15

### 1. Clone the Repository

```bash
git clone https://github.com/RaqeebaYasin/SPRMP-WebPortal.git
cd SPRMP-WebPortal
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your database credentials, JWT secret, and AES key. **Never commit `.env` to version control.**

### 3. Set Up the Backend

```bash
cd backend
pip install -r requirements.txt
```

Initialise the database:

```bash
psql -U postgres -f database/schema.sql
psql -U postgres -f database/seed.sql   
```

Start the Flask development server:

```bash
flask run --host=0.0.0.0 --port=5000
```

### 4. Set Up the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The portal will be available at `http://localhost:5173` by default.

---

## 🖥️ Core Features — Web Portal

### Admin Dashboard
The Admin user lands on a command-centre view of the system: active campaigns, registered users by role, total vaccination records, and recent system activity. All administrative operations — user management, campaign configuration, and data oversight — are accessible from this panel. Planned for Future.

### User Management (Admin Only)
Admins provision field worker and UCMO accounts, assign district jurisdictions, reset credentials, and deactivate accounts when personnel leave the programme. All changes are logged with a timestamp and the acting Admin's identity for audit purposes. Planned for Future.

### UCMO Analytics Console
UCMOs access a data visualisation dashboard showing:
- Vaccination coverage rates by district and campaign round
- Missed case and refusal breakdowns by area
- Trend charts across campaign rounds for longitudinal programme monitoring
- Child registration statistics by age cohort

All analytics are read-only. UCMOs can view and export reports but cannot modify any underlying records.

### Campaign Management (Admin Only Future Planned)
Admins configure vaccination campaigns — defining the campaign round, target districts, assigned field workers, and start/end dates. Campaign configurations propagate to the Mobile Application, ensuring field workers operate within the correct campaign context when recording vaccinations.

### ChatBot Interface *(Future Planned)*
A ChatBot module is integrated into the Web Portal as a partial implementation. It provides a conversational query interface over programme data, allowing authorised users to ask questions in natural language rather than navigating through dashboards. The ChatBot was developed as an exploratory feature within the project scope and is documented as a partial implementation in the formal FYP report.

### Secure Authentication
The Web Portal enforces role-aware login — users are redirected to their respective dashboard upon successful authentication, and all protected routes verify role claims on every navigation event. Attempting to access a route outside one's permitted role results in an immediate redirect to the login screen.

---

## 🔗 Relationship to Phase II (Mobile Application)

The Web Portal is the management and monitoring layer of SPRMP. The data it analyses and manages originates from the **Phase II Mobile Application**, used by field workers during vaccination campaigns.

The two phases share:

- A **single PostgreSQL database** — vaccination records created via mobile are instantly available in the Web Portal's analytics
- The **same Flask REST API backend** — both applications call the same endpoints; RBAC determines what each role can read or write
- **Consistent RBAC enforcement** — roles provisioned by the Admin in the Web Portal govern what the Mobile Application can access

Neither phase is functionally complete without the other. The Web Portal without the Mobile Application has no field data to analyse. The Mobile Application without the Web Portal has no administrative infrastructure to operate within.

---

## 👩‍💻 Authors

| Name | Roll Number | Contribution |
|---|---|---|
| **Raqeeba Yasin** | 092873 | Project Collaborator |
| **Uma Ammara** | 092869 | Project Collaborator |

**Supervisor:** Dr. Muhammad Adeel  
**Institution:** Wisdom Degree College for Women, Channan  
**University Affiliation:** University of the Punjab, Lahore  
**Programme:** BS Computer Science

---

## ⚠️ Copyright and Usage Restrictions

**© 2025-2026 Raqeeba Yasin and Uma Ammara. All Rights Reserved.**

This repository and all of its contents — including but not limited to source code, system architecture, database schema, API design, UI design, documentation, and all associated assets — are the original intellectual property of the authors.

**The following are strictly prohibited without prior written permission from the authors:**

- Copying, reproducing, or redistributing any part of this codebase
- Using this project or any portion thereof in academic submissions, coursework, or projects of any kind
- Adapting, modifying, or building upon this work for any purpose — academic, commercial, or personal
- Presenting this work or any derivative work as your own

This project is submitted as a Final Year Project to Wisdom Degree College for Women, Channan (affiliated with the University of the Punjab, Lahore) for academic evaluation purposes only. No licence — express or implied — is granted to any third party for any use of this work.

> **Plagiarism and code theft are academic offences. Any unauthorised use of this project will be reported to the relevant academic institution and, where applicable, pursued under applicable intellectual property law.**

For academic collaboration enquiries, contact the authors through official university channels only.

---

## 📄 Documentation

Full technical documentation covering both Phase I and Phase II — including requirements specification, system architecture, detailed design, implementation, testing, and deployment — is maintained as the formal FYP report submitted to the university.

Documentation queries should be directed to the authors or supervisor via official channels.

---

<div align="center">

*Built with purpose. Designed for Pakistan.*  
**SPRMP — Smart Polio Record and Monitoring Portal**

</div>
