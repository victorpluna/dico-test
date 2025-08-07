'use client'

import { useState, useEffect } from 'react'
import ProjectCard from './ProjectCard'
import ProjectForm from './ProjectForm'
import ProgressBar from './ProgressBar'
import CountdownTimer from './CountdownTimer'
import InvestModal from '../web3/InvestModal'
import { useResponsive, announceToScreenReader } from './ResponsiveWrapper'

// Demo data
const mockProjects = [
  {
    projectName: 'DeFi Protocol',
    logo: undefined,
    currentFunding: 325.5,
    targetFunding: 500,
    timeRemaining: { days: 23, hours: 14, minutes: 32 },
    ownFunding: 25,
    backers: 127,
    verified: true,
    lastUpdated: '2 hours ago'
  },
  {
    projectName: 'NFT Marketplace',
    logo: undefined,
    currentFunding: 89.2,
    targetFunding: 200,
    timeRemaining: { days: 45, hours: 8, minutes: 15 },
    ownFunding: 15,
    backers: 43,
    verified: true,
    lastUpdated: '30 minutes ago'
  },
  {
    projectName: 'Gaming Platform',
    logo: undefined,
    currentFunding: 156.8,
    targetFunding: 300,
    timeRemaining: { days: 6, hours: 22, minutes: 8 },
    ownFunding: 20,
    backers: 89,
    verified: false,
    lastUpdated: '1 hour ago'
  }
]

const ProjectDemo = () => {
  const [selectedProject, setSelectedProject] = useState(0)
  const [showInvestModal, setShowInvestModal] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [demoEndDate, setDemoEndDate] = useState<Date>(new Date())
  const { isMobile, isTablet, isDesktop } = useResponsive()

  useEffect(() => {
    // Set demo end date to 23 days from now
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 23)
    endDate.setHours(endDate.getHours() + 14)
    endDate.setMinutes(endDate.getMinutes() + 32)
    setDemoEndDate(endDate)
  }, [])

  const handleCardClick = (index: number) => {
    setSelectedProject(index)
    setShowInvestModal(true)
    announceToScreenReader(`Opening investment modal for ${mockProjects[index].projectName}`)
  }

  const handleInvestModalClose = () => {
    setShowInvestModal(false)
    announceToScreenReader('Investment modal closed')
  }

  const handleFormSubmit = (data: any) => {
    console.log('Project form submitted:', data)
    announceToScreenReader('Project successfully submitted for review')
    setShowProjectForm(false)
  }

  const handleCountdownComplete = () => {
    announceToScreenReader('Campaign funding period has ended')
  }

  const selectedProjectData = mockProjects[selectedProject]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Skip Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dico Project Components Demo</h1>
          <p className="text-xl text-gray-600 mb-8">
            Interactive demonstration of all project components with Web3 integration
          </p>
          
          {/* Device Info */}
          <div className="inline-flex items-center space-x-4 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg">
            <span>Viewing on: <strong>{isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</strong></span>
            <span>•</span>
            <span>Screen: {window.innerWidth}x{window.innerHeight}</span>
          </div>
        </header>

        <main id="main-content">
          {/* Navigation */}
          <nav className="mb-8" role="navigation" aria-label="Demo sections">
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setShowProjectForm(!showProjectForm)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                aria-pressed={showProjectForm}
              >
                {showProjectForm ? 'Hide' : 'Show'} Project Form
              </button>
            </div>
          </nav>

          {/* Project Form Section */}
          {showProjectForm && (
            <section className="mb-12" aria-labelledby="form-section-title">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 id="form-section-title" className="text-2xl font-bold text-gray-900 mb-6">
                  Create New Project
                </h2>
                <ProjectForm onSubmit={handleFormSubmit} />
              </div>
            </section>
          )}

          {/* Project Cards Grid */}
          <section className="mb-12" aria-labelledby="projects-section-title">
            <h2 id="projects-section-title" className="text-2xl font-bold text-gray-900 mb-6">
              Active Projects
            </h2>
            
            <div className={`grid gap-6 ${
              isMobile ? 'grid-cols-1' : 
              isTablet ? 'grid-cols-2' : 
              'grid-cols-3'
            }`}>
              {mockProjects.map((project, index) => (
                <ProjectCard
                  key={index}
                  {...project}
                  cardIndex={index}
                  onCardClick={() => handleCardClick(index)}
                />
              ))}
            </div>

            {/* Project Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                <div className="text-sm font-medium text-gray-600">Active Projects</div>
              </div>
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">571.5 ETH</div>
                <div className="text-sm font-medium text-gray-600">Total Raised</div>
              </div>
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">259</div>
                <div className="text-sm font-medium text-gray-600">Total Backers</div>
              </div>
            </div>
          </section>

          {/* Component Showcase */}
          <section className="mb-12" aria-labelledby="components-section-title">
            <h2 id="components-section-title" className="text-2xl font-bold text-gray-900 mb-6">
              Component Showcase
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Progress Bar Showcase */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Progress Bar Variants</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Default (Base height)</h4>
                    <ProgressBar
                      currentAmount={selectedProjectData.currentFunding}
                      targetAmount={selectedProjectData.targetFunding}
                      creatorStake={selectedProjectData.ownFunding}
                      backers={selectedProjectData.backers}
                      lastUpdated={selectedProjectData.lastUpdated}
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Success Variant (Thick)</h4>
                    <ProgressBar
                      currentAmount={450}
                      targetAmount={500}
                      creatorStake={30}
                      backers={200}
                      lastUpdated="just now"
                      height="thick"
                      variant="success"
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Warning Variant (Thin)</h4>
                    <ProgressBar
                      currentAmount={75}
                      targetAmount={200}
                      creatorStake={10}
                      backers={25}
                      lastUpdated="1 hour ago"
                      height="thin"
                      variant="warning"
                    />
                  </div>
                </div>
              </div>

              {/* Countdown Timer Showcase */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Countdown Timer Variants</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Inline Format (Large)</h4>
                    <CountdownTimer
                      endDate={demoEndDate}
                      size="large"
                      format="inline"
                      onComplete={handleCountdownComplete}
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Block Format</h4>
                    <CountdownTimer
                      endDate={demoEndDate}
                      size="base"
                      format="block"
                      onComplete={handleCountdownComplete}
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Compact Format</h4>
                    <CountdownTimer
                      endDate={demoEndDate}
                      size="small"
                      format="compact"
                      showSeconds
                      onComplete={handleCountdownComplete}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Responsive Test Section */}
          <section className="mb-12" aria-labelledby="responsive-section-title">
            <h2 id="responsive-section-title" className="text-2xl font-bold text-gray-900 mb-6">
              Responsive Design Test
            </h2>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-green-100 rounded-lg">
                  <h4 className="font-medium text-green-900">Mobile (&lt; 768px)</h4>
                  <p className="text-sm text-green-700">Single column layout</p>
                  <p className="text-xs text-green-600 mt-2">
                    Cards stack vertically, form fields become full-width
                  </p>
                </div>
                <div className="p-4 bg-blue-100 rounded-lg">
                  <h4 className="font-medium text-blue-900">Tablet (768px - 1024px)</h4>
                  <p className="text-sm text-blue-700">Two column layout</p>
                  <p className="text-xs text-blue-600 mt-2">
                    Balanced layout with some form optimization
                  </p>
                </div>
                <div className="p-4 bg-purple-100 rounded-lg">
                  <h4 className="font-medium text-purple-900">Desktop (&gt; 1024px)</h4>
                  <p className="text-sm text-purple-700">Three column layout</p>
                  <p className="text-xs text-purple-600 mt-2">
                    Full functionality with side-by-side form layout
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600">
                  Currently viewing on: <strong>{isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</strong>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Resize your browser window to test responsive behavior
                </p>
              </div>
            </div>
          </section>

          {/* Accessibility Information */}
          <section className="mb-12" aria-labelledby="accessibility-section-title">
            <h2 id="accessibility-section-title" className="text-2xl font-bold text-gray-900 mb-6">
              Accessibility Features
            </h2>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyboard Navigation</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Tab through interactive elements</li>
                    <li>• Enter/Space to activate buttons</li>
                    <li>• Escape to close modals</li>
                    <li>• Arrow keys for form navigation</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Screen Reader Support</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• ARIA labels and descriptions</li>
                    <li>• Live regions for dynamic updates</li>
                    <li>• Progress announcements</li>
                    <li>• Semantic HTML structure</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual Accessibility</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• High contrast color ratios (4.5:1+)</li>
                    <li>• Focus indicators on all interactive elements</li>
                    <li>• Respects reduced motion preferences</li>
                    <li>• Scalable text and interface elements</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Accessibility</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Required field indicators</li>
                    <li>• Clear error messages</li>
                    <li>• Field validation feedback</li>
                    <li>• Help text for complex fields</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-900 font-medium mb-2">Test with:</p>
                <p className="text-blue-800 text-sm">
                  Screen readers (NVDA, JAWS, VoiceOver), keyboard-only navigation, 
                  high contrast mode, and browser zoom up to 200%
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Investment Modal */}
        {showInvestModal && (
          <InvestModal
            isOpen={showInvestModal}
            onClose={handleInvestModalClose}
            project={{
              name: selectedProjectData.projectName,
              targetAmount: selectedProjectData.targetFunding,
              currentAmount: selectedProjectData.currentFunding
            }}
          />
        )}
      </div>
    </div>
  )
}

export default ProjectDemo