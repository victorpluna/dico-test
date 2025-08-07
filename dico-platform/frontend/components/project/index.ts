// Project components barrel export file

// Main components
export { default as ProjectCard } from "./ProjectCard";
export { default as ProjectForm } from "./ProjectForm";
export { default as ProgressBar } from "./ProgressBar";
export { default as CountdownTimer } from "./CountdownTimer";

// Types
export type {
  // Base interfaces
  Project,
  FundingDetails,
  Timeline,
  Milestone,
  ProjectCreator,
  Backer,
  VerificationStatus,
  VerificationBadge,
  ProjectUpdate,
  Tokenomics,
  TokenDistribution,
  VestingSchedule,
  TimeRemaining,

  // Component props
  ProjectCardProps,
  ProjectFormProps,
  ProjectFormData,
  FormValidationState,
  ProgressBarProps,
  ProgressMilestone,
  CountdownTimerProps,

  // Utility types
  UrgencyLevel,
  FormStep,
  StepConfig,
  ProjectStatus,
  AnimationConfig,
  SizeConfig,
  UrgencyColorConfig,

  // API types
  CreateProjectRequest,
  CreateProjectResponse,
  GetProjectResponse,
  InvestInProjectRequest,
  InvestInProjectResponse,

  // Web3 types
  Web3ContextType,
  ContractConfig,

  // Error types
  FormError,
  ValidationResult,

  // Event types
  ProjectCreatedEvent,
  FundingReceivedEvent,
  MilestoneReachedEvent,
  ProjectCompletedEvent,

  // Hook types
  UseProjectReturn,
  UseProjectsReturn,
  UseCountdownReturn,

  // Filter types
  ProjectFilters,
  ProjectSortOptions,
  PaginationOptions,
} from "./types";

// Constants
export { FORM_STEPS, MILESTONE_PERCENTAGES, URGENCY_THRESHOLDS } from "./types";
