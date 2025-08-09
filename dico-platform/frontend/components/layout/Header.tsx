'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WalletConnect } from "@/components/web3/WalletConnect"
import { cn } from "@/lib/utils"
import { motion } from 'framer-motion'

interface HeaderProps {
  activeProjectsCount?: number
}

export function Header({ activeProjectsCount = 0 }: HeaderProps) {
  const pathname = usePathname()

  const navigationItems = [
    {
      title: "Projects",
      href: "/",
      description: "Browse active crowdfunding projects"
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      description: "Manage your investments and portfolio"
    },
    {
      title: "Create Project",
      href: "/project/create",
      description: "Launch your own crowdfunding campaign"
    }
  ]

  return (
    <motion.header 
      className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <motion.h1 
                className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                Dico Platform
              </motion.h1>
            </Link>
            
            {activeProjectsCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeProjectsCount} Active Projects
              </Badge>
            )}
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                          pathname === item.href && "bg-accent text-accent-foreground"
                        )}
                      >
                        {item.title}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Actions Section */}
          <div className="flex items-center space-x-4">
            <WalletConnect />
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header