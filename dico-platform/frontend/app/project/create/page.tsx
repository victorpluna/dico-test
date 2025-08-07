'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ProjectForm } from '@/components/project'
import { WalletConnect } from '@/components/web3/WalletConnect'
import { useWalletConnection } from '@/lib/web3/hooks'
import { ProjectFormData } from '@/components/project/types'

export default function CreateProject() {
  const { isConnected, address } = useWalletConnection()
  const [currentStep] = useState<1 | 2 | 3>(1)
  const [formData, setFormData] = useState<Partial<ProjectFormData>>({})
  const [savedDrafts, setSavedDrafts] = useState<Array<{id: string, name: string, data: Partial<ProjectFormData>, savedAt: Date}>>([])

  // Load saved drafts on component mount
  useEffect(() => {
    const drafts = localStorage.getItem('dico-project-drafts')
    if (drafts) {
      try {
        const parsedDrafts = JSON.parse(drafts).map((draft: Record<string, unknown>) => ({
          ...draft,
          savedAt: new Date(draft.savedAt)
        }))
        setSavedDrafts(parsedDrafts)
      } catch (error) {
        console.error('Error loading drafts:', error)
      }
    }
  }, [])

  // Auto-save functionality
  const handleAutoSave = (data: Partial<ProjectFormData>) => {
    setFormData(data)
    
    // Save to localStorage as draft
    if (data.projectName) {
      const draft = {
        id: Date.now().toString(),
        name: data.projectName,
        data,
        savedAt: new Date()
      }
      
      const updatedDrafts = savedDrafts.filter(d => d.name !== data.projectName)
      updatedDrafts.unshift(draft)
      
      setSavedDrafts(updatedDrafts.slice(0, 5)) // Keep only 5 most recent drafts
      localStorage.setItem('dico-project-drafts', JSON.stringify(updatedDrafts.slice(0, 5)))
    }
  }

  // Handle form submission
  const handleSubmit = async (data: ProjectFormData) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first')
      return
    }

    try {
      // In production, this would call the actual API
      console.log('Submitting project:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Clear the draft after successful submission
      const updatedDrafts = savedDrafts.filter(d => d.name !== data.projectName)
      setSavedDrafts(updatedDrafts)
      localStorage.setItem('dico-project-drafts', JSON.stringify(updatedDrafts))
      
      // Redirect to project page (simulate)
      alert('Project created successfully! Redirecting...')
      // In production: router.push(`/project/${newProjectId}`)
      
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Error creating project. Please try again.')
    }
  }

  // Load draft
  const loadDraft = (draft: typeof savedDrafts[0]) => {
    setFormData(draft.data)
  }

  // Delete draft
  const deleteDraft = (draftId: string) => {
    const updatedDrafts = savedDrafts.filter(d => d.id !== draftId)
    setSavedDrafts(updatedDrafts)
    localStorage.setItem('dico-project-drafts', JSON.stringify(updatedDrafts))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80">
                Dico Platform
              </Link>
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm text-gray-500">
                <Link href="/" className="hover:text-blue-600">Projects</Link>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900 font-medium">Create Project</span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {!isConnected && (
                <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  Connect wallet to create project
                </div>
              )}
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your <span className="text-blue-600">DeFi Project</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Launch your innovative DeFi project on our transparent platform. 
            Connect with investors, showcase your vision, and build the future of finance.
          </p>

          {/* Step Progress Indicator */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                    currentStep >= step 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Project Info</span>
              <span>Preview</span>
              <span>Deploy</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Saved Drafts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Drafts</h3>
              
              {savedDrafts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No saved drafts yet</p>
                  <p className="text-xs text-gray-400 mt-1">Your progress will be auto-saved</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedDrafts.map((draft) => (
                    <div key={draft.id} className="group border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{draft.name}</p>
                          <p className="text-xs text-gray-500">
                            {draft.savedAt.toLocaleDateString()} at {draft.savedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => loadDraft(draft)}
                            className="p-1 text-blue-600 hover:text-blue-700"
                            title="Load draft"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteDraft(draft.id)}
                            className="p-1 text-red-600 hover:text-red-700"
                            title="Delete draft"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Help Section */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Need Help?</h4>
                <div className="space-y-2 text-xs text-blue-700">
                  <div className="flex items-center space-x-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Read our Project Guide</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>View Example Projects</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2V10a2 2 0 012-2h8z" />
                    </svg>
                    <span>Join Our Discord</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content - Project Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
              {/* Wallet Connection Requirement */}
              {!isConnected && (
                <div className="p-8 border-b border-gray-200">
                  <div className="flex items-center justify-center space-x-3 p-6 bg-orange-50 rounded-lg border border-orange-200">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h3 className="text-lg font-semibold text-orange-900">Wallet Connection Required</h3>
                      <p className="text-orange-700">
                        To create a project and lock your commitment funds, you need to connect your Web3 wallet.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Project Form */}
              <ProjectForm
                initialData={formData}
                onSave={handleAutoSave}
                onSubmit={handleSubmit}
                className={!isConnected ? 'opacity-50 pointer-events-none' : ''}
              />
            </div>
          </motion.div>
        </div>

        {/* Additional Information Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.25 8.25V9a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9v10.125c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Projects Only</h3>
            <p className="text-gray-600 text-sm">
              Every project goes through our verification process to ensure transparency and legitimacy for investors.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Creator Commitment</h3>
            <p className="text-gray-600 text-sm">
              Lock your own funds to demonstrate commitment and align your interests with your investors.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Launch</h3>
            <p className="text-gray-600 text-sm">
              Get your project live and start raising funds within 24-48 hours after verification approval.
            </p>
          </div>
        </motion.div>

        {/* Success Stories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Join Successful Projects</h3>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Projects launched on Dico Platform have raised over $10M and achieved an average success rate of 75%.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">$10M+</div>
              <div className="text-blue-100">Total Raised</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">150+</div>
              <div className="text-blue-100">Projects Launched</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">75%</div>
              <div className="text-blue-100">Success Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}