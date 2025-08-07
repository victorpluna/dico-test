# Dico Platform - Animation Specifications

## Executive Summary

This document provides comprehensive Framer Motion animation specifications for all interactive elements and micro-interactions in the Dico platform. Every animation is designed to enhance user experience while maintaining professional appearance and trust-building aesthetics.

---

## Animation Principles

### Design Philosophy
- **Subtle & Professional**: Animations should enhance, not distract
- **Performance-Focused**: All animations optimized for 60fps performance
- **Trust-Building**: Smooth, predictable animations that build confidence
- **Accessibility-First**: Respects `prefers-reduced-motion` settings
- **Purposeful**: Every animation serves a functional purpose

### Timing Guidelines
- **Micro-interactions**: 150-300ms (hover, focus, clicks)
- **Component entrances**: 400-600ms (cards, modals appearing)
- **Layout changes**: 500-800ms (form steps, page transitions)
- **Complex animations**: 800-1200ms (progress bars, success states)

### Easing Functions
```javascript
const easingPresets = {
  // Standard UI interactions
  easeOut: [0.0, 0.0, 0.2, 1],
  
  // Bouncy, playful animations
  backOut: [0.34, 1.56, 0.64, 1],
  
  // Smooth, professional transitions
  smooth: [0.25, 0.46, 0.45, 0.94],
  
  // Quick, snappy feedback
  snap: [0.25, 1, 0.5, 1],
  
  // Gentle, organic motion
  gentle: [0.25, 0.8, 0.25, 1]
}
```

---

## 1. ProjectCard Animations

### Card Container Animation

#### Initial Load Animation
```jsx
const projectCardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95 
  },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.1, // Staggered entrance
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
}

// Usage
<motion.div 
  className="project-card"
  variants={projectCardVariants}
  initial="hidden"
  animate="visible"
  custom={cardIndex}
>
```

#### Hover Interactions
```jsx
const cardHoverVariants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    borderColor: "rgba(229, 231, 235, 0.5)"
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    borderColor: "rgba(96, 165, 250, 0.6)",
    transition: {
      duration: 0.2,
      ease: [0.25, 1, 0.5, 1]
    }
  },
  tap: {
    scale: 0.98,
    y: -2,
    transition: {
      duration: 0.1,
      ease: [0.25, 1, 0.5, 1]
    }
  }
}

// Usage
<motion.div
  variants={cardHoverVariants}
  initial="rest"
  whileHover="hover"
  whileTap="tap"
>
```

### Progress Bar Animation

#### Animated Fill with Delay
```jsx
const progressBarVariants = {
  initial: { 
    width: 0,
    opacity: 0.7
  },
  animate: (progressPercentage) => ({
    width: `${progressPercentage}%`,
    opacity: 1,
    transition: {
      width: {
        duration: 1.2,
        ease: [0.0, 0.0, 0.2, 1],
        delay: 0.3 // Wait for card entrance
      },
      opacity: {
        duration: 0.4,
        delay: 0.2
      }
    }
  })
}

// Shimmer effect animation
const shimmerVariants = {
  animate: {
    x: ['-100%', '300%'],
    transition: {
      x: {
        repeat: Infinity,
        duration: 2,
        ease: 'easeInOut',
        repeatDelay: 1
      }
    }
  }
}
```

### Trust Signals Animation

#### Verification Badge Entrance
```jsx
const badgeVariants = {
  hidden: { 
    scale: 0,
    rotate: -180,
    opacity: 0 
  },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      delay: 0.6,
      duration: 0.4,
      ease: [0.34, 1.56, 0.64, 1] // Bouncy entrance
    }
  }
}

// Pulse animation for active status
const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
}
```

### Glassmorphism Glow Effect

#### Hover Glow Animation
```jsx
const glowVariants = {
  rest: {
    opacity: 0,
    scale: 0.8
  },
  hover: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.8, 0.25, 1]
    }
  }
}

// Animated background gradient
const gradientVariants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 3,
      ease: 'easeInOut',
      repeat: Infinity
    }
  }
}
```

---

## 2. InvestModal Animations

### Modal Container Animation

#### Modal Entrance/Exit
```jsx
const modalOverlayVariants = {
  hidden: {
    opacity: 0,
    backdropFilter: "blur(0px)"
  },
  visible: {
    opacity: 1,
    backdropFilter: "blur(8px)",
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: {
      duration: 0.2,
      ease: [0.25, 1, 0.5, 1]
    }
  }
}

const modalContentVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
      ease: [0.25, 1, 0.5, 1]
    }
  }
}
```

### Step Transitions

#### Step-by-Step Flow Animation
```jsx
const stepTransitionVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
      opacity: { duration: 0.3 }
    }
  },
  exit: (direction) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    transition: {
      x: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
      opacity: { duration: 0.3 }
    }
  })
}
```

### Input Field Animations

#### ETH Amount Input Focus
```jsx
const ethInputVariants = {
  rest: {
    scale: 1,
    borderColor: "rgb(209, 213, 219)",
    boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)"
  },
  focus: {
    scale: 1.01,
    borderColor: "rgb(59, 130, 246)",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    transition: {
      duration: 0.2,
      ease: [0.25, 1, 0.5, 1]
    }
  },
  error: {
    scale: 1,
    borderColor: "rgb(239, 68, 68)",
    boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)",
    x: [-2, 2, -2, 2, 0],
    transition: {
      x: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  }
}
```

#### Validation State Animations
```jsx
const validationIconVariants = {
  hidden: {
    scale: 0,
    rotate: -90,
    opacity: 0
  },
  success: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.34, 1.56, 0.64, 1]
    }
  },
  error: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    x: [-1, 1, -1, 1, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  }
}

// Loading spinner animation
const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: "linear",
      repeat: Infinity
    }
  }
}
```

### Transaction Processing States

#### Processing Animation
```jsx
const processingVariants = {
  initial: {
    opacity: 0,
    scale: 0.8
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const processingSpinnerVariants = {
  animate: {
    rotate: [0, 360],
    scale: [1, 1.1, 1],
    transition: {
      rotate: {
        duration: 2,
        ease: "linear",
        repeat: Infinity
      },
      scale: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  }
}
```

#### Success State Animation
```jsx
const successVariants = {
  initial: {
    opacity: 0,
    scale: 0.5
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1]
    }
  }
}

const checkmarkVariants = {
  hidden: {
    pathLength: 0,
    opacity: 0
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 0.6,
        ease: [0.25, 1, 0.5, 1],
        delay: 0.2
      },
      opacity: {
        duration: 0.3,
        delay: 0.2
      }
    }
  }
}

// Confetti animation for success
const confettiVariants = {
  animate: {
    y: [0, -100, 100],
    x: [0, Math.random() * 200 - 100],
    rotate: [0, 360],
    opacity: [1, 1, 0],
    transition: {
      duration: 2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}
```

#### Error State Animation
```jsx
const errorVariants = {
  initial: {
    opacity: 0,
    x: -20
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1]
    }
  }
}

const errorShakeVariants = {
  animate: {
    x: [-4, 4, -4, 4, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  }
}
```

---

## 3. ProjectForm Animations

### Form Section Transitions

#### Multi-Step Form Navigation
```jsx
const formSectionVariants = {
  hidden: {
    opacity: 0,
    x: 100,
    position: "absolute",
    width: "100%"
  },
  visible: {
    opacity: 1,
    x: 0,
    position: "relative",
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    x: -100,
    position: "absolute",
    width: "100%",
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1]
    }
  }
}
```

### Progress Indicator Animation

#### Step Progress Bar
```jsx
const progressVariants = {
  initial: {
    width: "0%"
  },
  animate: (step) => ({
    width: `${(step / 5) * 100}%`,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
}

const stepIndicatorVariants = {
  inactive: {
    scale: 1,
    backgroundColor: "rgb(229, 231, 235)",
    borderColor: "rgb(209, 213, 219)",
    color: "rgb(107, 114, 128)"
  },
  active: {
    scale: 1.1,
    backgroundColor: "rgb(59, 130, 246)",
    borderColor: "rgb(37, 99, 235)",
    color: "rgb(255, 255, 255)",
    transition: {
      duration: 0.3,
      ease: [0.34, 1.56, 0.64, 1]
    }
  },
  completed: {
    scale: 1,
    backgroundColor: "rgb(34, 197, 94)",
    borderColor: "rgb(22, 163, 74)",
    color: "rgb(255, 255, 255)",
    transition: {
      duration: 0.3,
      ease: [0.25, 1, 0.5, 1]
    }
  }
}
```

### Form Field Animations

#### IPFS Validation Animation
```jsx
const ipfsValidationVariants = {
  idle: {
    borderColor: "rgb(209, 213, 219)",
    backgroundColor: "rgb(255, 255, 255)"
  },
  validating: {
    borderColor: "rgb(59, 130, 246)",
    backgroundColor: "rgb(239, 246, 255)",
    transition: {
      duration: 0.2
    }
  },
  valid: {
    borderColor: "rgb(34, 197, 94)",
    backgroundColor: "rgb(240, 253, 244)",
    transition: {
      duration: 0.3,
      ease: [0.25, 1, 0.5, 1]
    }
  },
  error: {
    borderColor: "rgb(239, 68, 68)",
    backgroundColor: "rgb(254, 242, 242)",
    x: [-2, 2, -2, 2, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  }
}

// IPFS preview entrance
const previewVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    marginTop: 0
  },
  visible: {
    opacity: 1,
    height: "auto",
    marginTop: 8,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}
```

### Code Editor Animations

#### Syntax Highlighting Animation
```jsx
const syntaxHighlightVariants = {
  animate: {
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
}

const compilationVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    height: 0
  },
  visible: {
    opacity: 1,
    y: 0,
    height: "auto",
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}
```

### Auto-save Indicator

#### Save Status Animation
```jsx
const autosaveVariants = {
  saving: {
    opacity: [1, 0.5, 1],
    scale: [1, 0.95, 1],
    transition: {
      duration: 1,
      ease: "easeInOut"
    }
  },
  saved: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 1, 0.5, 1]
    }
  }
}

const saveIndicatorVariants = {
  hidden: {
    scale: 0,
    rotate: -90
  },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.3,
      ease: [0.34, 1.56, 0.64, 1]
    }
  }
}
```

---

## 4. CountdownTimer Animations

### Real-time Number Updates

#### Flip Animation for Number Changes
```jsx
const numberFlipVariants = {
  initial: {
    rotateX: 0,
    opacity: 1
  },
  flip: {
    rotateX: [0, 90, 0],
    opacity: [1, 0, 1],
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      times: [0, 0.5, 1]
    }
  }
}

// Staggered animation for multiple digits
const timerSegmentVariants = {
  animate: (delay) => ({
    transition: {
      staggerChildren: 0.1,
      delayChildren: delay
    }
  })
}
```

### Urgency State Transitions

#### Color Transition Animations
```jsx
const urgencyTransitionVariants = {
  healthy: {
    backgroundColor: "rgb(240, 253, 244)",
    borderColor: "rgb(34, 197, 94)",
    color: "rgb(22, 101, 52)",
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  warning: {
    backgroundColor: "rgb(255, 251, 235)",
    borderColor: "rgb(245, 158, 11)",
    color: "rgb(146, 64, 14)",
    scale: 1.02,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  critical: {
    backgroundColor: "rgb(254, 242, 242)",
    borderColor: "rgb(239, 68, 68)",
    color: "rgb(153, 27, 27)",
    scale: [1, 1.05, 1],
    transition: {
      scale: {
        duration: 1,
        ease: "easeInOut",
        repeat: Infinity
      },
      backgroundColor: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }
}
```

### Urgency Indicators

#### Pulse Animation for Dots
```jsx
const urgencyDotVariants = {
  healthy: {
    scale: 1,
    opacity: 1,
    backgroundColor: "rgb(34, 197, 94)"
  },
  warning: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.8, 1],
    backgroundColor: "rgb(245, 158, 11)",
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity
    }
  },
  critical: {
    scale: [1, 1.5, 1],
    opacity: [1, 0.3, 1],
    backgroundColor: "rgb(239, 68, 68)",
    transition: {
      duration: 0.8,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
}
```

### Block Format Animations

#### Timer Block Entrance
```jsx
const timerBlockVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9
  },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.1,
      duration: 0.4,
      ease: [0.34, 1.56, 0.64, 1]
    }
  })
}

const progressBarVariants = {
  initial: {
    scaleX: 0,
    originX: 0
  },
  animate: (progress) => ({
    scaleX: progress / 100,
    transition: {
      duration: 1,
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.5
    }
  })
}
```

---

## 5. ProgressBar Animations

### Progressive Fill Animation

#### Animated Progress Fill
```jsx
const progressFillVariants = {
  initial: {
    width: 0,
    opacity: 0.8
  },
  animate: (progressPercentage) => ({
    width: `${progressPercentage}%`,
    opacity: 1,
    transition: {
      width: {
        duration: 1.5,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.2
      },
      opacity: {
        duration: 0.5
      }
    }
  })
}

// Shimmer effect on progress bar
const shimmerVariants = {
  animate: {
    x: ['-100%', '200%'],
    opacity: [0, 1, 0],
    transition: {
      x: {
        duration: 1.5,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatDelay: 2
      },
      opacity: {
        duration: 1.5,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatDelay: 2
      }
    }
  }
}
```

### Milestone Animations

#### Milestone Marker States
```jsx
const milestoneVariants = {
  pending: {
    scale: 1,
    backgroundColor: "rgb(209, 213, 219)",
    borderColor: "rgb(156, 163, 175)",
    opacity: 0.6
  },
  approaching: {
    scale: [1, 1.2, 1],
    backgroundColor: "rgb(59, 130, 246)",
    borderColor: "rgb(37, 99, 235)",
    opacity: 1,
    transition: {
      scale: {
        duration: 1,
        ease: "easeInOut",
        repeat: Infinity
      },
      backgroundColor: {
        duration: 0.3,
        ease: [0.25, 1, 0.5, 1]
      }
    }
  },
  reached: {
    scale: [1, 1.3, 1.1],
    backgroundColor: "rgb(34, 197, 94)",
    borderColor: "rgb(22, 163, 74)",
    opacity: 1,
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1]
    }
  }
}

// Tooltip animations
const tooltipVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.25, 1, 0.5, 1]
    }
  }
}
```

### Success Celebration

#### Progress Complete Animation
```jsx
const progressCompleteVariants = {
  animate: {
    background: [
      "linear-gradient(to right, rgb(59, 130, 246), rgb(37, 99, 235))",
      "linear-gradient(to right, rgb(34, 197, 94), rgb(22, 163, 74))",
      "linear-gradient(to right, rgb(168, 85, 247), rgb(147, 51, 234))",
      "linear-gradient(to right, rgb(34, 197, 94), rgb(22, 163, 74))"
    ],
    scale: [1, 1.02, 1],
    boxShadow: [
      "0 0 0 0 rgba(34, 197, 94, 0)",
      "0 0 0 10px rgba(34, 197, 94, 0.1)",
      "0 0 0 20px rgba(34, 197, 94, 0)"
    ],
    transition: {
      background: {
        duration: 2,
        ease: "easeInOut"
      },
      scale: {
        duration: 0.8,
        ease: [0.34, 1.56, 0.64, 1]
      },
      boxShadow: {
        duration: 1.5,
        ease: "easeOut"
      }
    }
  }
}
```

### Live Updates Animation

#### Update Pulse Indicator
```jsx
const updatePulseVariants = {
  animate: {
    scale: [1, 1.3, 1],
    opacity: [1, 0.6, 1],
    backgroundColor: [
      "rgb(34, 197, 94)",
      "rgb(59, 130, 246)",
      "rgb(34, 197, 94)"
    ],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
}

const updateTextVariants = {
  initial: {
    opacity: 0,
    x: -10
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 1, 0.5, 1]
    }
  }
}
```

---

## Loading States & Skeleton Animations

### Skeleton Screen Animations

#### Content Loading Skeletons
```jsx
const skeletonVariants = {
  animate: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
}

const skeletonShimmerVariants = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
}
```

### Loading Spinners

#### Various Loading Animations
```jsx
const loadingSpinnerVariants = {
  animate: {
    rotate: [0, 360],
    transition: {
      duration: 1,
      ease: "linear",
      repeat: Infinity
    }
  }
}

const dotsLoadingVariants = {
  animate: (index) => ({
    y: [0, -10, 0],
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 0.8,
      ease: "easeInOut",
      repeat: Infinity,
      delay: index * 0.2
    }
  })
}

const pulseLoadingVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.5, 1],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
}
```

---

## Page Transitions

### Route Animations

#### Page Entrance/Exit
```jsx
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.25, 1, 0.5, 1]
    }
  }
}
```

---

## Accessibility Considerations

### Reduced Motion Support

#### Conditional Animations
```jsx
import { useReducedMotion } from 'framer-motion'

const ComponentWithAnimation = () => {
  const shouldReduceMotion = useReducedMotion()
  
  const variants = shouldReduceMotion ? {
    // Static variants for users with reduced motion preference
    visible: { opacity: 1 },
    hidden: { opacity: 0 }
  } : {
    // Full animations for users who prefer motion
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5 } 
    },
    hidden: { 
      opacity: 0, 
      y: 20 
    }
  }
  
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
    />
  )
}
```

### Focus Management

#### Focus Animations
```jsx
const focusVariants = {
  focus: {
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.5)",
    transition: {
      duration: 0.2,
      ease: [0.25, 1, 0.5, 1]
    }
  },
  blur: {
    boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)",
    transition: {
      duration: 0.2,
      ease: [0.25, 1, 0.5, 1]
    }
  }
}
```

---

## Performance Optimizations

### Animation Performance

#### GPU Acceleration
```jsx
// Always use transform and opacity for smooth animations
const optimizedVariants = {
  initial: {
    opacity: 0,
    transform: "translateY(20px) scale(0.95)" // Composite layer
  },
  animate: {
    opacity: 1,
    transform: "translateY(0px) scale(1)",
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Use will-change for complex animations
const complexAnimationStyles = {
  willChange: "transform, opacity"
}
```

#### Animation Cleanup
```jsx
const AnimatedComponent = () => {
  const controls = useAnimation()
  
  useEffect(() => {
    // Start animation
    controls.start("animate")
    
    // Cleanup on unmount
    return () => {
      controls.stop()
    }
  }, [controls])
  
  return (
    <motion.div
      animate={controls}
      style={{ willChange: "auto" }} // Reset after animation
    />
  )
}
```

---

## Implementation Guidelines

### Best Practices

1. **Use Layout Animations Sparingly**: Layout animations can be expensive
2. **Prefer Transform Over Position Changes**: Use `transform: translate()` instead of changing `top/left`
3. **Batch State Updates**: Update multiple animation states together
4. **Use `willChange` Judiciously**: Only add when needed, remove after animation
5. **Test on Low-End Devices**: Ensure 60fps performance on mobile

### Animation Hooks

#### Custom Animation Hook
```jsx
import { useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

export const useScrollAnimation = () => {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })
  
  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])
  
  return [ref, controls]
}
```

This comprehensive animation specification provides all necessary Framer Motion configurations for creating smooth, professional, and accessible animations throughout the Dico platform.