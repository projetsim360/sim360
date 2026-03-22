-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('ZERO_EXPERIENCE', 'BEGINNER', 'RECONVERSION', 'REINFORCEMENT');

-- CreateEnum
CREATE TYPE "ScenarioType" AS ENUM ('GREENFIELD', 'BROWNFIELD');

-- CreateEnum
CREATE TYPE "EmailPriority" AS ENUM ('URGENT', 'HIGH', 'NORMAL', 'LOW');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('UNREAD', 'READ', 'RESPONDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "UserDeliverableStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'EVALUATED', 'REVISED', 'PENDING_APPROVAL', 'VALIDATED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DeliverableDelegationType" AS ENUM ('SELF_PRODUCED', 'DELEGATED');

-- CreateEnum
CREATE TYPE "DeliverableTemplateDifficulty" AS ENUM ('DISCOVERY', 'STANDARD', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ReferenceDocumentCategory" AS ENUM ('TEMPLATE', 'STANDARD', 'BEST_PRACTICE', 'GLOSSARY');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CultureType" AS ENUM ('STRICT', 'AGILE', 'COLLABORATIVE');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('PENDING', 'PROFILING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- AlterEnum
ALTER TYPE "SimulationStatus" ADD VALUE 'ONBOARDING';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'MENTOR';

-- AlterTable
ALTER TABLE "scenarios" ADD COLUMN     "brownfield_context" JSONB,
ADD COLUMN     "scenario_type" "ScenarioType" NOT NULL DEFAULT 'GREENFIELD',
ADD COLUMN     "starting_phase_order" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "linkedin_data" JSONB,
    "cv_data" JSONB,
    "cv_file_url" TEXT,
    "questionnaire_data" JSONB,
    "aptitude_test_data" JSONB,
    "profile_type" "ProfileType",
    "diagnostic_data" JSONB,
    "skills" JSONB,
    "suggested_sector" TEXT,
    "selected_sector" TEXT,
    "suggested_difficulty" TEXT,
    "custom_project_data" JSONB,
    "onboarding_step" TEXT DEFAULT 'not_started',
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulated_emails" (
    "id" TEXT NOT NULL,
    "simulation_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "sender_role" TEXT NOT NULL,
    "sender_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "priority" "EmailPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "EmailStatus" NOT NULL DEFAULT 'UNREAD',
    "phase_order" INTEGER NOT NULL,
    "trigger_type" TEXT,
    "trigger_id" TEXT,
    "user_response" TEXT,
    "response_score" INTEGER,
    "response_feedback" TEXT,
    "responded_at" TIMESTAMP(3),
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simulated_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_badges" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "simulation_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scenario_title" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "global_score" INTEGER NOT NULL,
    "competency_scores" JSONB NOT NULL,
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "improvements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "debriefing_summary" TEXT,
    "cv_suggestions" JSONB,
    "share_token" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "duration_minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competency_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pmo_conversations" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pmo_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pmo_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pmo_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_deliverables" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "templateId" TEXT,
    "phaseOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "status" "UserDeliverableStatus" NOT NULL DEFAULT 'DRAFT',
    "revisionNumber" INTEGER NOT NULL DEFAULT 0,
    "maxRevisions" INTEGER NOT NULL DEFAULT 3,
    "dueDate" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "lastSavedAt" TIMESTAMP(3),
    "meetingId" TEXT,
    "delegation_type" "DeliverableDelegationType" NOT NULL DEFAULT 'SELF_PRODUCED',
    "assigned_to_member_id" TEXT,
    "assigned_to_role" TEXT,
    "approval_chain" JSONB,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_deliverables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliverable_approvals" (
    "id" TEXT NOT NULL,
    "deliverable_id" TEXT NOT NULL,
    "reviewer_member_id" TEXT,
    "reviewer_role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliverable_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliverable_evaluations" (
    "id" TEXT NOT NULL,
    "deliverableId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "grade" TEXT NOT NULL,
    "positives" TEXT[],
    "improvements" TEXT[],
    "missingElements" TEXT[],
    "incorrectElements" TEXT[],
    "recommendations" TEXT[],
    "pmiOutputsCovered" TEXT[],
    "pmiOutputsMissing" TEXT[],
    "aiGeneratedCR" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliverable_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliverable_templates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "phase" "PhaseType" NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "evaluationCriteria" JSONB NOT NULL,
    "pmiProcess" TEXT,
    "difficulty" "DeliverableTemplateDifficulty" NOT NULL DEFAULT 'STANDARD',
    "referenceExample" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deliverable_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliverable_template_versions" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "phase" "PhaseType" NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "evaluationCriteria" JSONB NOT NULL,
    "pmiProcess" TEXT,
    "difficulty" "DeliverableTemplateDifficulty" NOT NULL,
    "referenceExample" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliverable_template_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_documents" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ReferenceDocumentCategory" NOT NULL,
    "phase" "PhaseType",
    "pmiProcess" TEXT,
    "content" TEXT NOT NULL,
    "term" TEXT,
    "example" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reference_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_document_versions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ReferenceDocumentCategory" NOT NULL,
    "phase" "PhaseType",
    "pmiProcess" TEXT,
    "content" TEXT NOT NULL,
    "term" TEXT,
    "example" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reference_document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_reviews" (
    "id" TEXT NOT NULL,
    "evaluation_id" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "human_score" INTEGER NOT NULL,
    "leadership_score" INTEGER,
    "diplomacy_score" INTEGER,
    "posture_score" INTEGER,
    "feedback" TEXT NOT NULL,
    "recommendations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentoring_sessions" (
    "id" TEXT NOT NULL,
    "simulation_id" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "learner_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'DEBRIEFING',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentoring_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentoring_messages" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentoring_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_campaigns" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "recruiter_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "job_title" TEXT NOT NULL,
    "job_description" TEXT NOT NULL,
    "required_skills" JSONB NOT NULL,
    "experience_level" TEXT NOT NULL,
    "project_types" TEXT[],
    "culture" "CultureType" NOT NULL DEFAULT 'COLLABORATIVE',
    "culture_description" TEXT,
    "internal_documents" JSONB,
    "max_candidates" INTEGER,
    "published_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "generated_scenario_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_results" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "simulation_id" TEXT,
    "status" "CandidateStatus" NOT NULL DEFAULT 'PENDING',
    "current_phase" INTEGER,
    "abandoned_phase" INTEGER,
    "global_score" INTEGER,
    "hard_skills_score" INTEGER,
    "soft_skills_score" INTEGER,
    "reliability_score" INTEGER,
    "adaptability_score" INTEGER,
    "leadership_score" INTEGER,
    "competency_scores" JSONB,
    "report_360" JSONB,
    "ai_justification" TEXT,
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weaknesses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "match_percentage" INTEGER,
    "interview_guide" JSONB,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "user_profiles_tenant_id_idx" ON "user_profiles"("tenant_id");

-- CreateIndex
CREATE INDEX "user_profiles_user_id_idx" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "simulated_emails_simulation_id_idx" ON "simulated_emails"("simulation_id");

-- CreateIndex
CREATE INDEX "simulated_emails_tenant_id_idx" ON "simulated_emails"("tenant_id");

-- CreateIndex
CREATE INDEX "simulated_emails_simulation_id_status_idx" ON "simulated_emails"("simulation_id", "status");

-- CreateIndex
CREATE INDEX "simulated_emails_simulation_id_phase_order_idx" ON "simulated_emails"("simulation_id", "phase_order");

-- CreateIndex
CREATE UNIQUE INDEX "competency_badges_share_token_key" ON "competency_badges"("share_token");

-- CreateIndex
CREATE INDEX "competency_badges_user_id_idx" ON "competency_badges"("user_id");

-- CreateIndex
CREATE INDEX "competency_badges_simulation_id_idx" ON "competency_badges"("simulation_id");

-- CreateIndex
CREATE INDEX "competency_badges_tenant_id_idx" ON "competency_badges"("tenant_id");

-- CreateIndex
CREATE INDEX "competency_badges_share_token_idx" ON "competency_badges"("share_token");

-- CreateIndex
CREATE UNIQUE INDEX "pmo_conversations_simulationId_key" ON "pmo_conversations"("simulationId");

-- CreateIndex
CREATE INDEX "pmo_conversations_simulationId_idx" ON "pmo_conversations"("simulationId");

-- CreateIndex
CREATE INDEX "pmo_messages_conversationId_createdAt_idx" ON "pmo_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "user_deliverables_simulationId_idx" ON "user_deliverables"("simulationId");

-- CreateIndex
CREATE INDEX "user_deliverables_simulationId_phaseOrder_idx" ON "user_deliverables"("simulationId", "phaseOrder");

-- CreateIndex
CREATE INDEX "user_deliverables_status_idx" ON "user_deliverables"("status");

-- CreateIndex
CREATE INDEX "user_deliverables_delegation_type_idx" ON "user_deliverables"("delegation_type");

-- CreateIndex
CREATE INDEX "deliverable_approvals_deliverable_id_idx" ON "deliverable_approvals"("deliverable_id");

-- CreateIndex
CREATE INDEX "deliverable_evaluations_deliverableId_idx" ON "deliverable_evaluations"("deliverableId");

-- CreateIndex
CREATE INDEX "deliverable_templates_tenantId_idx" ON "deliverable_templates"("tenantId");

-- CreateIndex
CREATE INDEX "deliverable_templates_phase_type_difficulty_idx" ON "deliverable_templates"("phase", "type", "difficulty");

-- CreateIndex
CREATE INDEX "deliverable_templates_isActive_idx" ON "deliverable_templates"("isActive");

-- CreateIndex
CREATE INDEX "deliverable_template_versions_templateId_idx" ON "deliverable_template_versions"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "deliverable_template_versions_templateId_version_key" ON "deliverable_template_versions"("templateId", "version");

-- CreateIndex
CREATE INDEX "reference_documents_tenantId_idx" ON "reference_documents"("tenantId");

-- CreateIndex
CREATE INDEX "reference_documents_category_phase_idx" ON "reference_documents"("category", "phase");

-- CreateIndex
CREATE INDEX "reference_documents_isActive_idx" ON "reference_documents"("isActive");

-- CreateIndex
CREATE INDEX "reference_document_versions_documentId_idx" ON "reference_document_versions"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "reference_document_versions_documentId_version_key" ON "reference_document_versions"("documentId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "mentor_reviews_evaluation_id_key" ON "mentor_reviews"("evaluation_id");

-- CreateIndex
CREATE INDEX "mentor_reviews_evaluation_id_idx" ON "mentor_reviews"("evaluation_id");

-- CreateIndex
CREATE INDEX "mentor_reviews_mentor_id_idx" ON "mentor_reviews"("mentor_id");

-- CreateIndex
CREATE INDEX "mentor_reviews_tenant_id_idx" ON "mentor_reviews"("tenant_id");

-- CreateIndex
CREATE INDEX "mentoring_sessions_simulation_id_idx" ON "mentoring_sessions"("simulation_id");

-- CreateIndex
CREATE INDEX "mentoring_sessions_mentor_id_idx" ON "mentoring_sessions"("mentor_id");

-- CreateIndex
CREATE INDEX "mentoring_sessions_learner_id_idx" ON "mentoring_sessions"("learner_id");

-- CreateIndex
CREATE INDEX "mentoring_sessions_tenant_id_idx" ON "mentoring_sessions"("tenant_id");

-- CreateIndex
CREATE INDEX "mentoring_messages_session_id_created_at_idx" ON "mentoring_messages"("session_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_campaigns_slug_key" ON "recruitment_campaigns"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_campaigns_generated_scenario_id_key" ON "recruitment_campaigns"("generated_scenario_id");

-- CreateIndex
CREATE INDEX "recruitment_campaigns_tenant_id_idx" ON "recruitment_campaigns"("tenant_id");

-- CreateIndex
CREATE INDEX "recruitment_campaigns_recruiter_id_idx" ON "recruitment_campaigns"("recruiter_id");

-- CreateIndex
CREATE INDEX "recruitment_campaigns_status_idx" ON "recruitment_campaigns"("status");

-- CreateIndex
CREATE INDEX "recruitment_campaigns_slug_idx" ON "recruitment_campaigns"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_results_simulation_id_key" ON "candidate_results"("simulation_id");

-- CreateIndex
CREATE INDEX "candidate_results_campaign_id_idx" ON "candidate_results"("campaign_id");

-- CreateIndex
CREATE INDEX "candidate_results_user_id_idx" ON "candidate_results"("user_id");

-- CreateIndex
CREATE INDEX "candidate_results_status_idx" ON "candidate_results"("status");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_results_campaign_id_user_id_key" ON "candidate_results"("campaign_id", "user_id");

-- CreateIndex
CREATE INDEX "scenarios_scenario_type_idx" ON "scenarios"("scenario_type");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulated_emails" ADD CONSTRAINT "simulated_emails_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "simulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_badges" ADD CONSTRAINT "competency_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_badges" ADD CONSTRAINT "competency_badges_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "simulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pmo_conversations" ADD CONSTRAINT "pmo_conversations_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "simulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pmo_messages" ADD CONSTRAINT "pmo_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "pmo_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_deliverables" ADD CONSTRAINT "user_deliverables_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "simulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_deliverables" ADD CONSTRAINT "user_deliverables_assigned_to_member_id_fkey" FOREIGN KEY ("assigned_to_member_id") REFERENCES "project_team_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverable_approvals" ADD CONSTRAINT "deliverable_approvals_deliverable_id_fkey" FOREIGN KEY ("deliverable_id") REFERENCES "user_deliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverable_evaluations" ADD CONSTRAINT "deliverable_evaluations_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "user_deliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverable_template_versions" ADD CONSTRAINT "deliverable_template_versions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "deliverable_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reference_document_versions" ADD CONSTRAINT "reference_document_versions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "reference_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_reviews" ADD CONSTRAINT "mentor_reviews_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "deliverable_evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_reviews" ADD CONSTRAINT "mentor_reviews_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentoring_sessions" ADD CONSTRAINT "mentoring_sessions_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "simulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentoring_sessions" ADD CONSTRAINT "mentoring_sessions_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentoring_sessions" ADD CONSTRAINT "mentoring_sessions_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentoring_messages" ADD CONSTRAINT "mentoring_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "mentoring_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_campaigns" ADD CONSTRAINT "recruitment_campaigns_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_campaigns" ADD CONSTRAINT "recruitment_campaigns_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_campaigns" ADD CONSTRAINT "recruitment_campaigns_generated_scenario_id_fkey" FOREIGN KEY ("generated_scenario_id") REFERENCES "scenarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_results" ADD CONSTRAINT "candidate_results_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "recruitment_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_results" ADD CONSTRAINT "candidate_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_results" ADD CONSTRAINT "candidate_results_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "simulations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
