// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };
// ===== Interfaces =====








// ===== Module 01 — Introduction to Software Engineering =====
import { whatIsSoftware } from './topics/WhatIsSoftware';
import { softwareEngineeringOverview } from './topics/SoftwareEngineeringOverview';
import { softwareDevelopmentLifecycle } from './topics/SoftwareDevelopmentLifecycle';
import { sdlcModels } from './topics/SdlcModels';
import { waterfallModel } from './topics/WaterfallModel';
import { agileMethodology } from './topics/AgileMethodology';
import { scrumFramework } from './topics/ScrumFramework';
import { kanbanMethod } from './topics/KanbanMethod';
import { devOpsOverview } from './topics/DevOpsOverview';
import { productVsProject } from './topics/ProductVsProject';
import { developmentVsProduction } from './topics/DevelopmentVsProduction';

// ===== Module 02 — Requirements Engineering =====
import { functionalRequirements } from './topics/FunctionalRequirements';
import { nonFunctionalRequirements } from './topics/NonFunctionalRequirements';
import { businessRequirements } from './topics/BusinessRequirements';
import { userStories } from './topics/UserStories';
import { acceptanceCriteria } from './topics/AcceptanceCriteria';
import { useCases } from './topics/UseCases';
import { requirementConstraints } from './topics/RequirementConstraints';
import { requirementAssumptions } from './topics/RequirementAssumptions';
import { requirementDependencies } from './topics/RequirementDependencies';
import { requirementsTraceability } from './topics/RequirementsTraceability';

// ===== Module 03 — Engineering Practices =====
import { codingStandards } from './topics/CodingStandards';
import { namingConventionsPractice } from './topics/NamingConventionsPractice';
import { codeReview } from './topics/CodeReview';
import { refactoring } from './topics/Refactoring';
import { technicalDebt } from './topics/TechnicalDebt';
import { engineeringDocumentation } from './topics/EngineeringDocumentation';
import { versionControl } from './topics/VersionControl';
import { branchingStrategies } from './topics/BranchingStrategies';
import { releaseManagement } from './topics/ReleaseManagement';
import { incidentManagement } from './topics/IncidentManagement';
import { rootCauseAnalysis } from './topics/RootCauseAnalysis';

// ===== Module 04 — Development Lifecycle =====
import { requirementStage } from './topics/RequirementStage';
import { designStage } from './topics/DesignStage';
import { developmentStage } from './topics/DevelopmentStage';
import { testingStage } from './topics/TestingStage';
import { buildStage } from './topics/BuildStage';
import { deploymentStage } from './topics/DeploymentStage';
import { monitoringStage } from './topics/MonitoringStage';
import { maintenanceStage } from './topics/MaintenanceStage';
import { retirementStage } from './topics/RetirementStage';

// ===== Course Data =====
export const SoftwareFoundations: Course[] = [
  {
    id: 'software-foundations',
    name: 'Software Fundamentals',
    icon: 'Layers',

    subTopics: [
      {
        id: 'intro-to-software-engineering',
        name: 'Introduction to Software Engineering',
        topics: [
          whatIsSoftware,
          softwareEngineeringOverview,
          softwareDevelopmentLifecycle,
          sdlcModels,
          waterfallModel,
          agileMethodology,
          scrumFramework,
          kanbanMethod,
          devOpsOverview,
          productVsProject,
          developmentVsProduction
        ]
      },
      {
        id: 'requirements-engineering',
        name: 'Requirements Engineering',
        topics: [
          functionalRequirements,
          nonFunctionalRequirements,
          businessRequirements,
          userStories,
          acceptanceCriteria,
          useCases,
          requirementConstraints,
          requirementAssumptions,
          requirementDependencies,
          requirementsTraceability
        ]
      },
      {
        id: 'engineering-practices',
        name: 'Engineering Practices',
        topics: [
          codingStandards,
          namingConventionsPractice,
          codeReview,
          refactoring,
          technicalDebt,
          engineeringDocumentation,
          versionControl,
          branchingStrategies,
          releaseManagement,
          incidentManagement,
          rootCauseAnalysis
        ]
      },
      {
        id: 'development-lifecycle-stages',
        name: 'Development Lifecycle',
        topics: [
          requirementStage,
          designStage,
          developmentStage,
          testingStage,
          buildStage,
          deploymentStage,
          monitoringStage,
          maintenanceStage,
          retirementStage
        ]
      }
    ],

    cheatNotes: [
      'SDLC - Software Development Lifecycle, the structured process from idea to retirement',
      'Waterfall - Sequential, phase-gated SDLC model with little rework flexibility',
      'Agile - Iterative SDLC approach delivering working software in short cycles',
      'Scrum - Agile framework using fixed-length sprints, a Scrum Master, and a Product Owner',
      'Kanban - Agile-adjacent method visualizing work-in-progress on a board with WIP limits',
      'DevOps - Culture/practice unifying development and operations for faster, safer releases',
      'Functional Requirement - Describes what the system should DO',
      'Non-Functional Requirement - Describes system qualities like performance, security, scalability',
      'User Story - Short requirement written from the user perspective: As a... I want... so that...',
      'Acceptance Criteria - Conditions a user story must satisfy to be considered done',
      'Technical Debt - The implied cost of rework caused by choosing a quick/easy solution now',
      'Code Review - Peer examination of code changes before merging, catches bugs and spreads knowledge',
      'Version Control - System for tracking and managing changes to source code over time',
      'CI/CD - Continuous Integration/Continuous Deployment, automating build-test-release',
      'Root Cause Analysis - Structured process for finding the true underlying cause of an incident'
    ],

    interviewQuestions: [
      {
        company: 'General Software Engineering',
        questions: [
          'What is the Software Development Lifecycle and why is it important?',
          'What is the difference between Agile and Waterfall?',
          'Explain Scrum roles and ceremonies.',
          'What is the difference between functional and non-functional requirements?',
          'How do you write a good user story with acceptance criteria?',
          'What is technical debt and how do you manage it?',
          'What makes a good code review?',
          'Explain the difference between a bug found in development vs production.',
          'What is root cause analysis and when do you use it?',
          'Describe your ideal branching strategy for a team of 10 engineers.'
        ]
      }
    ]
  }
];
