import {
    pgTable, text, serial, integer, boolean, timestamp,
    jsonb, real, index
} from 'drizzle-orm/pg-core';
import { vector } from 'drizzle-orm/pg-core'; // requires drizzle-orm >= 0.30

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────
export const users = pgTable("users", {
    id: text("id").primaryKey(), // from Supabase Auth
    email: text("email").notNull().unique(),
    fullName: text("full_name"),
    masterResume: jsonb("master_resume"),       // Full parsed master resume JSON
    masterResumeText: text("master_resume_text"), // Plain text for embedding/search
    linkedinUrl: text("linkedin_url"),
    githubUrl: text("github_url"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// ─────────────────────────────────────────────
// LLM CONFIGS (BYOK — Bring Your Own Key)
// ─────────────────────────────────────────────
export const llmConfigs = pgTable("llm_configs", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    provider: text("provider").notNull(),         // "openai" | "anthropic" | "openrouter" etc.
    encryptedApiKey: text("encrypted_api_key").notNull(), // AES-256 encrypted before storage
    label: text("label"),                          // User-visible label e.g. "My OpenAI key"
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

// ─────────────────────────────────────────────
// JOBS (Job Tracker)
// ─────────────────────────────────────────────
export const jobs = pgTable("jobs", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    companyName: text("company_name").notNull(),
    roleName: text("role_name").notNull(),
    sourceUrl: text("source_url"),                // Job posting URL
    jdText: text("jd_text"),                      // Full raw job description text
    jdAnalysisId: text("jd_analysis_id"),         // MongoDB ObjectId ref to jd_analyses collection
    status: text("status").default("tracking"),   // tracking | applied | interviewing | offered | rejected | withdrawn
    appliedAt: timestamp("applied_at"),
    interviewDate: timestamp("interview_date"),
    notes: text("notes"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    location: text("location"),
    isRemote: boolean("is_remote").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// ─────────────────────────────────────────────
// BULLETS (Master Bullet Library)
// ─────────────────────────────────────────────
export const bullets = pgTable("bullets", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    originalText: text("original_text").notNull(),
    embedding: vector("embedding", { dimensions: 384 }), // all-MiniLM-L6-v2 embeddings
    skills: text("skills").array(),                       // Skills detected in this bullet
    metrics: text("metrics").array(),                     // Extracted numbers/percentages
    sectionType: text("section_type"),                    // "experience" | "project" | "education"
    company: text("company"),
    role: text("role"),
    startDate: text("start_date"),
    endDate: text("end_date"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    embeddingIdx: index("bullets_embedding_idx").using("hnsw", table.embedding.op("vector_cosine_ops")),
}));

// ─────────────────────────────────────────────
// RESUMES (Generated Resume Log)
// ─────────────────────────────────────────────
export const resumes = pgTable("resumes", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    jobId: integer("job_id").references(() => jobs.id),
    pdfUrl: text("pdf_url").notNull(),             // GCP Cloud Storage URL
    latexSource: text("latex_source"),             // Raw LaTeX for re-compilation
    forgeScore: real("forge_score"),               // Numeric score from ForgeScoreAgent
    forgeScoreDetails: jsonb("forge_score_details"), // Full score breakdown JSON
    rewrittenBullets: jsonb("rewritten_bullets"),  // Array of rewritten bullet strings
    workflowId: text("workflow_id"),               // MongoDB agent_workflows ref
    createdAt: timestamp("created_at").defaultNow(),
});

// ─────────────────────────────────────────────
// COVER LETTERS (Generated Cover Letter Log)
// ─────────────────────────────────────────────
export const coverLetters = pgTable("cover_letters", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    jobId: integer("job_id").references(() => jobs.id),
    content: text("content").notNull(),            // Full cover letter markdown
    pdfUrl: text("pdf_url"),                       // Optional PDF version
    workflowId: text("workflow_id"),
    createdAt: timestamp("created_at").defaultNow(),
});

// ─────────────────────────────────────────────
// CONTACTS (Personal CRM)
// ─────────────────────────────────────────────
export const contacts = pgTable("contacts", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    jobId: integer("job_id").references(() => jobs.id),
    name: text("name").notNull(),
    title: text("title"),
    company: text("company"),
    email: text("email"),
    linkedinUrl: text("linkedin_url"),
    contactType: text("contact_type"),             // "recruiter" | "hiring_manager" | "team_lead" | "other"
    outreachSent: boolean("outreach_sent").default(false),
    outreachDate: timestamp("outreach_date"),
    responseReceived: boolean("response_received").default(false),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
});

// ─────────────────────────────────────────────
// INTERVIEW SESSIONS
// ─────────────────────────────────────────────
export const interviewSessions = pgTable("interview_sessions", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    jobId: integer("job_id").references(() => jobs.id),
    sessionType: text("session_type"),             // "behavioral" | "technical" | "mixed"
    questionsGenerated: jsonb("questions_generated"), // Array of questions from QuestionGeneratorAgent
    answersAndFeedback: jsonb("answers_and_feedback"), // Array of { question, transcription, starAnalysis, qualitativeFeedback }
    overallScore: real("overall_score"),
    audioStoragePaths: text("audio_storage_paths").array(), // GCP Cloud Storage paths for audio files
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow(),
});

// ─────────────────────────────────────────────
// USER JOB SEARCHES (Job Alert Agent Config)
// ─────────────────────────────────────────────
export const userJobSearches = pgTable("user_job_searches", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    searchName: text("search_name"),               // User-facing label e.g. "ML Engineer NYC"
    roles: text("roles").array().notNull(),        // e.g. ["ML Engineer", "AI Engineer"]
    locations: text("locations").array(),
    keywords: text("keywords").array(),
    seniority: text("seniority"),                  // "entry" | "mid" | "senior" | "staff"
    isRemote: boolean("is_remote"),
    isActive: boolean("is_active").default(true),
    lastCheckedAt: timestamp("last_checked_at"),
    seenJobIds: text("seen_job_ids").array().default([]), // De-duplicates across alert runs
    createdAt: timestamp("created_at").defaultNow(),
});

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────
export const notifications = pgTable("notifications", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    type: text("type").notNull(),                  // "new_job_alert" | "company_event_alert"
    channel: text("channel").array().notNull(),    // ["telegram", "web_push", "email"]
    payload: jsonb("payload").notNull(),
    isRead: boolean("is_read").default(false),
    deliveredAt: timestamp("delivered_at"),
    createdAt: timestamp("created_at").defaultNow(),
});
