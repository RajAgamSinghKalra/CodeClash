import NavBar from '@/components/NavBar'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Database, Zap, Target, TrendingUp, Shield, Satellite, Rocket } from 'lucide-react'

function LandingPage() {
  return (
    <>
    <NavBar/>
    <div className="min-h-screen w-full star-field">
      <div className='min-h-screen w-full gap-8 flex flex-col items-center justify-center relative px-6 py-20'>
        {/* Floating space elements - simplified */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating absolute top-20 left-20 w-4 h-4 bg-blue-400 rounded-full opacity-60"></div>
          <div className="floating absolute top-40 right-32 w-3 h-3 bg-purple-400 rounded-full opacity-80" style={{animationDelay: '1s'}}></div>
          <div className="floating absolute bottom-32 left-32 w-5 h-5 bg-pink-400 rounded-full opacity-70" style={{animationDelay: '2s'}}></div>
          <div className="floating absolute bottom-20 right-20 w-2 h-2 bg-cyan-400 rounded-full opacity-90" style={{animationDelay: '3s'}}></div>
        </div>

        {/* Main content */}
        <div className="text-center z-10 nebula-gradient p-8 rounded-3xl backdrop-blur-sm max-w-4xl">
          <h3 className='border rounded-xl text-sm border-purple-400 px-4 py-2 mb-6 bg-purple-900/20 text-purple-300'>🚀 Welcome to the Future</h3>
          <div className="text-center">
            <h1 className='text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4'>
              SpaceSavers
            </h1>
            <p className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto'>
              Advanced AI-Powered Safety Equipment Detection System for Space Missions
            </p>
          </div>
          <Link 
            href='/home' 
            className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105'
          >
            Launch Mission Control
          </Link>
        </div>

        {/* CodeClash Description */}
        <div className="z-10 nebula-gradient p-8 rounded-3xl backdrop-blur-sm max-w-4xl">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            CodeClash 2.0 Project
          </h2>
          <p className="text-lg text-gray-300 mb-6 leading-relaxed">
            CodeClash 2.0, set for 28 June 2025 at Google's Gurugram campus, is a student-run national hackathon that invites India's sharpest coders for a fast-paced, in-person showdown.
          </p>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Teams of two to four college students tackle multi-round challenges of growing complexity, coding solutions from scratch while drawing on pre-approved libraries and documented AI tools.
          </p>
        </div>

        {/* Technology Stack */}
        <div className="z-10 max-w-6xl w-full">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="cosmic-border hover:scale-105 transition-all duration-300 nebula-gradient">
              <CardHeader>
                <CardTitle className="text-xl text-purple-300 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Falcon AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  An AI-based dataset simulation application that allows you to make use of dualtwin and simulate realistic datasets for training robust machine learning models.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="cosmic-border hover:scale-105 transition-all duration-300 nebula-gradient">
              <CardHeader>
                <CardTitle className="text-xl text-purple-300 flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Dataset
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Comprehensive dataset of over 800 carefully curated images for training, featuring diverse safety equipment in various lighting conditions and orientations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="cosmic-border hover:scale-105 transition-all duration-300 nebula-gradient">
              <CardHeader>
                <CardTitle className="text-xl text-purple-300 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  YOLOv8
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  State-of-the-art object detection model chosen for its superior speed, accuracy, and real-time processing capabilities. Perfect for space mission safety requirements.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="cosmic-border hover:scale-105 transition-all duration-300 nebula-gradient">
              <CardHeader>
                <CardTitle className="text-xl text-purple-300 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Exceptional model performance with 97.2% mAP50 and 94.2% mAP50-95, achieving high precision and recall across all safety equipment classes.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Metrics Details */}
        <div className="z-10 nebula-gradient p-8 rounded-3xl backdrop-blur-sm max-w-4xl">
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Model Performance Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">Fire Extinguisher: 98.4% mAP50</span>
              </div>
              <div className="flex items-center gap-3">
                <Satellite className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">ToolBox: 97.0% mAP50</span>
              </div>
              <div className="flex items-center gap-3">
                <Rocket className="h-5 w-5 text-purple-400" />
                <span className="text-gray-300">Oxygen Tank: 96.1% mAP50</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-gray-300">
                <strong>Overall Performance:</strong><br/>
                • Precision: 98.4%<br/>
                • Recall: 92.1%<br/>
                • mAP50: 97.2%<br/>
                • mAP50-95: 94.2%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default LandingPage
