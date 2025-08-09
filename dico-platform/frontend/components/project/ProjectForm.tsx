"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import ProjectCard from "./ProjectCard";
import { useProjectStore, useToast, globalActions } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Zod validation schemas
const whitepaperSchema = z
  .string()
  .regex(/^ipfs:\/\/.*/, "Must be a valid IPFS URL");
const projectPlanSchema = z
  .string()
  .regex(/^ipfs:\/\/.*/, "Must be a valid IPFS URL");
const solidityCodeSchema = z
  .string()
  .min(50, "Smart contract code is required");
const ownFundingSchema = z.number().min(0.1, "Minimum own funding is 0.1 ETH");
const targetFundingSchema = z
  .number()
  .min(1, "Minimum target funding is 1 ETH");
const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address");

interface FormData {
  whitepaperUrl: string;
  projectPlanUrl: string;
  smartContractCode: string;
  ownFunding: number;
  targetFunding: number;
  fundingAddress: string;
  projectName: string;
}

interface ValidationState {
  field: string;
  status: "idle" | "validating" | "valid" | "error";
  message?: string;
}

const ProjectForm = () => {
  // Store hooks
  const {
    projectDraft,
    draftAutoSaveEnabled,
    lastAutoSave,
    loading,
    error,
    saveDraft,
    loadDraft,
    clearDraft,
    createProject,
  } = useProjectStore();

  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [validationStates, setValidationStates] = useState<
    Record<string, "idle" | "validating" | "valid" | "error">
  >({});
  const [isValid, setIsValid] = useState(false);
  const { toast } = useToast();

  // Auto-save status for UI feedback
  const autoSaveStatus = loading ? "saving" : "idle";

  // Local state
  const [currentStep, setCurrentStep] = useState(2);
  const [formData, setFormData] = useState<FormData>({
    whitepaperUrl: "",
    projectPlanUrl: "",
    smartContractCode: "",
    ownFunding: 0,
    targetFunding: 0,
    fundingAddress: "",
    projectName: "",
  });
  const [compilationStatus, setCompilationStatus] = useState<
    "idle" | "compiling" | "success" | "error"
  >("idle");

  const totalSteps = 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Auto-save functionality with store integration
  useEffect(() => {
    if (!draftAutoSaveEnabled) return;

    const timer = setTimeout(() => {
      saveDraft(formData);
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, draftAutoSaveEnabled, saveDraft]);

  // Load draft on component mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setFormData((prev) => ({ ...prev, ...draft }));
    }
  }, [loadDraft]);

  const validateField = useCallback(async (field: string, value: any) => {
    setValidationStates((prev) => ({ ...prev, [field]: "validating" }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));

    try {
      switch (field) {
        case "whitepaperUrl":
          whitepaperSchema.parse(value);
          // Simulate IPFS validation
          await new Promise((resolve) => setTimeout(resolve, 1500));
          break;
        case "projectPlanUrl":
          projectPlanSchema.parse(value);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          break;
        case "smartContractCode":
          solidityCodeSchema.parse(value);
          break;
        case "ownFunding":
          ownFundingSchema.parse(Number(value));
          break;
        case "targetFunding":
          targetFundingSchema.parse(Number(value));
          break;
        case "fundingAddress":
          addressSchema.parse(value);
          break;
      }
      setValidationStates((prev) => ({ ...prev, [field]: "valid" }));
    } catch (error) {
      const message =
        error instanceof z.ZodError
          ? error.errors[0].message
          : "Validation failed";
      setFormErrors((prev) => ({ ...prev, [field]: message }));
      setValidationStates((prev) => ({ ...prev, [field]: "error" }));
    }
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (value && value.toString().length > 0) {
      validateField(field, value);
    }
  };

  const compileContract = async () => {
    setCompilationStatus("compiling");
    // Simulate compilation
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setCompilationStatus("success");
  };

  const getValidationState = (field: string) => {
    const status = validationStates[field] || "idle";
    return {
      status,
      message: formErrors[field] || "",
    };
  };

  // Animation variants
  const formSectionVariants = {
    hidden: {
      opacity: 0,
      x: 100,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        duration: 0.4,
        ease: [0.25, 1, 0.5, 1],
      },
    },
  };

  const progressVariants = {
    initial: {
      width: "0%",
    },
    animate: {
      width: `${progressPercentage}%`,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const stepIndicatorVariants = {
    inactive: {
      scale: 1,
      backgroundColor: "rgb(229, 231, 235)",
      borderColor: "rgb(209, 213, 219)",
      color: "rgb(107, 114, 128)",
    },
    active: {
      scale: 1.1,
      backgroundColor: "180 39.3939% 93.5294%",
      borderColor: "181.2000 37.3134% 26.2745%",
      color: "180 39.3939% 93.5294%",
      transition: {
        duration: 0.3,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
    completed: {
      scale: 1,
      backgroundColor: "hsl(var(--primary))",
      borderColor: "hsl(var(--primary))",
      color: "rgb(255, 255, 255)",
      transition: {
        duration: 0.3,
        ease: [0.25, 1, 0.5, 1],
      },
    },
  };

  const validationVariants = {
    idle: {
      borderColor: "rgb(209, 213, 219)",
      backgroundColor: "rgb(255, 255, 255)",
    },
    validating: {
      borderColor: "rgb(59, 130, 246)",
      backgroundColor: "rgb(239, 246, 255)",
      transition: { duration: 0.2 },
    },
    valid: {
      borderColor: "rgb(34, 197, 94)",
      backgroundColor: "rgb(240, 253, 244)",
      transition: {
        duration: 0.3,
        ease: [0.25, 1, 0.5, 1],
      },
    },
    error: {
      borderColor: "rgb(239, 68, 68)",
      backgroundColor: "rgb(254, 242, 242)",
      x: [-2, 2, -2, 2, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  const skinInGamePercentage =
    formData.targetFunding > 0
      ? Math.round((formData.ownFunding / formData.targetFunding) * 100)
      : 0;

  const handleSubmit = async () => {
    if (!isValid) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    try {
      await globalActions.createProject(formData);
      clearDraft();
      clearForm();
      toast.success("Project created successfully!");
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header & Progress */}
      <div className="text-center pb-8 border-b border-border">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Create Your Project
        </h1>
        <p className="text-lg text-muted-foreground">
          Share your vision with the world
        </p>

        {/* Progress Indicator */}
        <div className="mb-8 mt-6">
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-4">
          {["Documentation", "Technical", "Economics", "Funding", "Review"].map(
            (label, index) => {
              const stepNumber = index + 1;
              const status =
                stepNumber < currentStep
                  ? "completed"
                  : stepNumber === currentStep
                  ? "active"
                  : "inactive";

              return (
                <div
                  key={stepNumber}
                  className="flex flex-col items-center space-y-2"
                >
                  <motion.div
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors duration-200"
                    variants={stepIndicatorVariants}
                    animate={status}
                  >
                    {stepNumber < currentStep ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      stepNumber
                    )}
                  </motion.div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {label}
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Project Documentation */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                className="space-y-6"
                variants={formSectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Project Documentation
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Provide essential documents that establish trust and
                    credibility
                  </p>
                </div>

                {/* Project Name */}
                <div className="space-y-2">
                  <Label htmlFor="project-name" className="text-card-foreground">
                    Project Name <span className="text-destructive">*</span>
                    <span className="block text-xs text-muted-foreground font-normal">
                      The name of your project
                    </span>
                  </Label>
                  <Input
                    type="text"
                    id="project-name"
                    value={formData.projectName}
                    onChange={(e) =>
                      handleInputChange("projectName", e.target.value)
                    }
                    placeholder="Enter your project name"
                    className="text-base"
                    required
                  />
                </div>

                {/* White Paper URL */}
                <div className="space-y-2">
                  <Label htmlFor="whitepaper-url" className="text-card-foreground">
                    White Paper URL <span className="text-destructive">*</span>
                    <span className="block text-xs text-muted-foreground font-normal">
                      IPFS link to your project white paper
                    </span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="url"
                      id="whitepaper-url"
                      value={formData.whitepaperUrl}
                      onChange={(e) =>
                        handleInputChange("whitepaperUrl", e.target.value)
                      }
                      className="pr-12 font-mono text-sm"
                      placeholder="ipfs://QmYourWhitepaperHash"
                      pattern="^ipfs://.*"
                      required
                    />

                    {/* Validation Indicator */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {getValidationState("whitepaperUrl").status ===
                        "validating" && (
                        <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                      )}
                      {getValidationState("whitepaperUrl").status ===
                        "valid" && (
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      {getValidationState("whitepaperUrl").status ===
                        "error" && (
                        <svg
                          className="w-5 h-5 text-destructive"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4m0 4h.01"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div id="whitepaper-help" className="text-xs text-muted-foreground">
                    Upload your white paper to IPFS and paste the link here.
                    We'll validate the document automatically.
                  </div>

                  {getValidationState("whitepaperUrl").status === "error" && (
                    <div
                      id="whitepaper-error"
                      className="flex items-center space-x-2 text-sm text-destructive"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01"
                        />
                      </svg>
                      <span>{getValidationState("whitepaperUrl").message}</span>
                    </div>
                  )}

                  {getValidationState("whitepaperUrl").status === "valid" && (
                    <motion.div
                      className="bg-green-50 border border-green-200 rounded-lg p-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{
                        duration: 0.4,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900">
                            White Paper Verified
                          </p>
                          <p className="text-xs text-green-700">
                            PDF • 2.4 MB • 24 pages
                          </p>
                        </div>
                        <a
                          href="#"
                          className="text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          Preview
                        </a>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Project Plan URL */}
                <div className="space-y-2">
                  <label
                    htmlFor="project-plan-url"
                    className="block text-sm font-medium text-card-foreground"
                  >
                    Project Plan URL <span className="text-red-500">*</span>
                    <span className="block text-xs text-gray-500 font-normal">
                      IPFS link to your detailed project roadmap
                    </span>
                  </label>
                  <div className="relative">
                    <motion.input
                      type="url"
                      id="project-plan-url"
                      value={formData.projectPlanUrl}
                      onChange={(e) =>
                        handleInputChange("projectPlanUrl", e.target.value)
                      }
                      className="w-full px-4 py-3 pr-12 border border-input rounded-lg placeholder:text-muted-foreground text-foreground text-base font-mono text-sm focus:ring-2 focus:ring-ring focus:border-primary transition-colors duration-200"
                      placeholder="ipfs://QmYourProjectPlanHash"
                      pattern="^ipfs://.*"
                      required
                      variants={validationVariants}
                      animate={getValidationState("projectPlanUrl").status}
                    />

                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {getValidationState("projectPlanUrl").status ===
                        "validating" && (
                        <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                      )}
                      {getValidationState("projectPlanUrl").status ===
                        "valid" && (
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Technical Implementation */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                className="space-y-6"
                variants={formSectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Technical Implementation
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Provide your smart contract code and technical
                    specifications
                  </p>
                </div>

                {/* Smart Contract Code */}
                <div className="space-y-2">
                  <Label
                    htmlFor="smart-contract-code"
                    className="text-card-foreground"
                  >
                    Smart Contract Code <span className="text-red-500">*</span>
                    <span className="block text-xs text-gray-500 font-normal">
                      Solidity code for your token contract
                    </span>
                  </Label>

                  <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600">
                    {/* Code Editor Header */}
                    <div className="flex items-center justify-between p-3 bg-muted border-b border-border">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          contract.sol
                        </span>
                        <div className="compilation-status">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                              compilationStatus === "success"
                                ? "bg-green-50 text-green-700"
                                : compilationStatus === "compiling"
                                ? "bg-blue-100 text-blue-600"
                                : compilationStatus === "error"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mr-1 ${
                                compilationStatus === "success"
                                  ? "bg-green-400"
                                  : compilationStatus === "compiling"
                                  ? "bg-blue-400 animate-pulse"
                                  : compilationStatus === "error"
                                  ? "bg-red-400"
                                  : "bg-gray-400"
                              }`}
                            />
                            {compilationStatus === "success"
                              ? "Compiled"
                              : compilationStatus === "compiling"
                              ? "Compiling..."
                              : compilationStatus === "error"
                              ? "Error"
                              : "Not compiled"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                        >
                          Templates
                        </button>
                        <button
                          type="button"
                          onClick={compileContract}
                          disabled={compilationStatus === "compiling"}
                          className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded disabled:opacity-50"
                        >
                          {compilationStatus === "compiling"
                            ? "Compiling..."
                            : "Compile"}
                        </button>
                      </div>
                    </div>

                    {/* Code Editor Content */}
                    <div className="relative">
                      <Textarea
                        id="smart-contract-code"
                        value={formData.smartContractCode}
                        onChange={(e) =>
                          handleInputChange("smartContractCode", e.target.value)
                        }
                        className="p-4 pl-12 font-mono text-sm leading-relaxed resize-none border-none outline-none min-h-[300px]"
                        placeholder={`pragma solidity ^0.8.0;

contract YourToken {
    // Your smart contract code here
}`}
                        rows={20}
                        required
                      />

                      {/* Line Numbers */}
                      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r border-gray-200 flex flex-col text-xs text-gray-500 font-mono pt-4">
                        {Array.from({ length: 20 }, (_, i) => (
                          <div
                            key={i + 1}
                            className="h-6 flex items-center justify-end pr-2"
                          >
                            {i + 1}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Code Editor Actions */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          Lines: {formData.smartContractCode.split("\n").length}
                        </span>
                        <span>
                          Characters: {formData.smartContractCode.length}
                        </span>
                        <span>Solidity ^0.8.0</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                        >
                          Format Code
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded"
                        >
                          Security Audit
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Compilation Results */}
                  {compilationStatus === "success" && (
                    <motion.div
                      className="bg-green-50 border border-green-200 rounded-lg p-4"
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      transition={{
                        duration: 0.5,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm font-medium text-green-900">
                          Compilation Successful
                        </span>
                      </div>
                      <div className="text-xs text-green-700 space-y-1">
                        <p>Contract size: 4.2 KB</p>
                        <p>Gas estimate: 1,247,832</p>
                        <p>Optimization: Enabled</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Economic Model */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                className="space-y-6"
                variants={formSectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Economic Model
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Define your tokenomics and economic structure
                  </p>
                </div>

                {/* Tokenomics Visualization */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Token Distribution
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm text-gray-700">
                          Public Sale (40%)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm text-gray-700">
                          Team (20%)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                        <span className="text-sm text-gray-700">
                          Development (25%)
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        <span className="text-sm text-gray-700">
                          Marketing (10%)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="text-sm text-gray-700">
                          Reserve (5%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Funding Structure */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                className="space-y-6"
                variants={formSectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Funding Structure
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Set your funding goals and demonstrate commitment
                  </p>
                </div>

                {/* Own Funding Amount */}
                <div className="space-y-2">
                  <Label htmlFor="own-funding" className="text-gray-700">
                    Your Own Funding (ETH){" "}
                    <span className="text-red-500">*</span>
                    <span className="block text-xs text-gray-500 font-normal">
                      Amount you'll invest in your own project
                    </span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      id="own-funding"
                      value={formData.ownFunding || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "ownFunding",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="px-4 py-4 pr-16 text-2xl font-semibold text-right"
                      placeholder="0.00"
                      min="0.1"
                      step="0.01"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-lg font-semibold text-gray-700">
                        ETH
                      </span>
                    </div>
                  </div>

                  {/* Skin-in-game Indicator */}
                  {formData.ownFunding > 0 && formData.targetFunding > 0 && (
                    <motion.div
                      className="bg-blue-50 rounded-lg p-3"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">
                          Skin-in-game percentage:
                        </span>
                        <span className="text-sm font-bold text-blue-900">
                          {skinInGamePercentage}%
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        Shows investors your commitment to the project's success
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Target Funding Amount */}
                <div className="space-y-2">
                  <Label htmlFor="target-funding" className="text-gray-700">
                    Target Funding Amount (ETH){" "}
                    <span className="text-red-500">*</span>
                    <span className="block text-xs text-gray-500 font-normal">
                      Total amount you want to raise
                    </span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      id="target-funding"
                      value={formData.targetFunding || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "targetFunding",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="px-4 py-4 pr-16 text-2xl font-semibold text-right"
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-lg font-semibold text-gray-700">
                        ETH
                      </span>
                    </div>
                  </div>

                  {/* Market Context */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Market Context
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">
                          Similar projects avg:
                        </span>
                        <span className="font-medium text-gray-900 ml-2">
                          150 ETH
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          Success rate at this level:
                        </span>
                        <span className="font-medium text-green-600 ml-2">
                          78%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Funding Address */}
                <div className="space-y-2">
                  <Label htmlFor="funding-address" className="text-gray-700">
                    Funding Address <span className="text-red-500">*</span>
                    <span className="block text-xs text-gray-500 font-normal">
                      Ethereum address that will receive funds
                    </span>
                  </Label>
                  <div className="flex space-x-3">
                    <Input
                      type="text"
                      id="funding-address"
                      value={formData.fundingAddress}
                      onChange={(e) =>
                        handleInputChange("fundingAddress", e.target.value)
                      }
                      className="flex-1 font-mono text-sm"
                      placeholder="0x..."
                      pattern="^0x[a-fA-F0-9]{40}$"
                      required
                    />
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Connect Wallet
                    </button>
                  </div>

                  <div className="text-xs text-gray-500">
                    Supports ENS names (e.g., yourname.eth)
                  </div>

                  {/* Multi-sig Recommendation */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <svg
                        className="w-4 h-4 text-amber-600 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="text-sm">
                        <p className="font-medium text-amber-900 mb-1">
                          Multi-signature Recommended
                        </p>
                        <p className="text-amber-700">
                          Consider using a multi-sig wallet for enhanced
                          security and trust.
                        </p>
                        <a
                          href="#"
                          className="text-amber-600 hover:text-amber-700 font-medium"
                        >
                          Learn more
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Preview & Review */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                className="space-y-6"
                variants={formSectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Preview & Review
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Review your project before submission
                  </p>
                </div>

                {/* Project Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Project Preview
                    </h3>
                    <p className="text-sm text-gray-600">
                      This is how your project will appear to investors
                    </p>
                  </div>

                  {/* Live Preview of ProjectCard */}
                  <div className="max-w-sm">
                    <ProjectCard
                      projectName={formData.projectName || "Your Project Name"}
                      currentFunding={0}
                      targetFunding={formData.targetFunding || 100}
                      timeRemaining={{ days: 30, hours: 0, minutes: 0 }}
                      ownFunding={formData.ownFunding || 0}
                      backers={0}
                      verified={true}
                      lastUpdated="now"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Auto-save Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <motion.div
              className="flex items-center space-x-2"
              variants={{
                saving: {
                  opacity: [1, 0.5, 1],
                  scale: [1, 0.95, 1],
                  transition: { duration: 1, ease: "easeInOut" },
                },
                saved: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] },
                },
              }}
              animate={autoSaveStatus}
            >
              <motion.div
                className={`w-2 h-2 rounded-full ${
                  autoSaveStatus === "saving" ? "bg-blue-400" : "bg-green-400"
                }`}
                variants={{
                  hidden: { scale: 0, rotate: -90 },
                  visible: {
                    scale: 1,
                    rotate: 0,
                    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
                  },
                }}
                initial="hidden"
                animate="visible"
              />
              <span className="text-sm font-medium text-muted-foreground">
                {lastAutoSave ? "Auto-saved" : "No changes"}
              </span>
            </motion.div>
            <p className="text-xs text-gray-500 mt-1">
              {lastAutoSave
                ? `Last saved ${Math.round(
                    (Date.now() - lastAutoSave.getTime()) / 60000
                  )} minutes ago`
                : "No changes to save"}
            </p>
          </div>

          {/* Progress Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Progress Summary
            </h3>
            <div className="space-y-2">
              {[
                "Documentation",
                "Technical Details",
                "Economics",
                "Funding",
                "Review",
              ].map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isCurrent = stepNumber === currentStep;

                return (
                  <div key={stepNumber} className="flex items-center space-x-2">
                    {isCompleted ? (
                      <>
                        <svg
                          className="w-4 h-4 text-muted-foreground"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-muted-foreground">
                          ✓ {step}
                        </span>
                      </>
                    ) : isCurrent ? (
                      <>
                        <svg
                          className="w-4 h-4 text-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                        <span className="text-sm text-foreground">
                          → {step}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        <span className="text-sm text-gray-500">○ {step}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-accent rounded-lg border color-border p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Need Help?
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Our support team is here to help you create a successful project.
            </p>
            <div className="space-y-2">
              <a
                href="#"
                className="block text-xs text-muted-foreground hover:text-blue-700 font-medium"
              >
                Project Creation Guide
              </a>
              <a
                href="#"
                className="block text-xs text-muted-foreground hover:text-blue-700 font-medium"
              >
                Smart Contract Templates
              </a>
              <a
                href="#"
                className="block text-xs text-muted-foreground hover:text-blue-700 font-medium"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Action Panel (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-green-600 font-medium">
              {lastAutoSave ? "Auto-saved" : "No changes"}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" className="px-6 py-3 text-base">
              Save Draft
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 text-base"
            >
              ← Previous
            </Button>
            {currentStep < totalSteps ? (
              <Button
                onClick={() =>
                  setCurrentStep(Math.min(totalSteps, currentStep + 1))
                }
                className="px-6 py-3 text-base"
              >
                Next →
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !isValid}
                className="px-6 py-3 text-base bg-green-500 hover:bg-green-600"
              >
                {loading ? "Submitting..." : "Submit Project"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;
