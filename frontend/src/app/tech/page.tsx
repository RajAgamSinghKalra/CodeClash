'use client'
import React from 'react'
import NavBar from '@/components/NavBar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Database, 
  Target, 
  Zap, 
  BarChart3, 
  Image, 
  Cpu, 
  Globe,
  TrendingUp,
  Shield,
  Satellite,
  Rocket,
  Code,
  Layers
} from 'lucide-react'

export default function TechPage() {
  const technologies = [
    {
      name: 'Falcon AI',
      icon: Brain,
      description: 'An AI-based dataset simulation application that allows you to make use of dualtwin and simulate realistic datasets for training robust machine learning models.',
      features: ['Dataset Simulation', 'AI-Powered Generation', 'Realistic Data Creation', 'Training Optimization'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Dataset',
      icon: Database,
      description: 'Comprehensive dataset of over 800 carefully curated images for training, featuring diverse safety equipment in various lighting conditions and orientations.',
      features: ['800+ Images', 'Diverse Conditions', 'Safety Equipment', 'High Quality'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'YOLOv8',
      icon: Target,
      description: 'State-of-the-art object detection model chosen for its superior speed, accuracy, and real-time processing capabilities. Perfect for space mission safety requirements.',
      features: ['Real-time Detection', 'High Accuracy', 'Fast Processing', 'Space-Ready'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Performance Metrics',
      icon: TrendingUp,
      description: 'Exceptional model performance with 97.2% mAP50 and 94.2% mAP50-95, achieving high precision and recall across all safety equipment classes.',
      features: ['97.2% mAP50', '94.2% mAP50-95', 'High Precision', 'Excellent Recall'],
      color: 'from-orange-500 to-red-500'
    }
  ]

  const performanceData = [
    { name: 'Fire Extinguisher', mAP50: 98.4, precision: 97.8, recall: 95.5, icon: Shield },
    { name: 'ToolBox', mAP50: 97.0, precision: 97.5, recall: 88.3, icon: Satellite },
    { name: 'Oxygen Tank', mAP50: 96.1, precision: 99.8, recall: 92.4, icon: Rocket }
  ]

  return (
    <>
      <NavBar />
      <div className="min-h-screen w-full py-20 px-6 md:px-20 star-field">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Technology Stack
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover the cutting-edge technologies powering our AI-powered safety equipment detection system
          </p>
        </div>

        {/* Technology Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {technologies.map((tech, index) => (
            <Card key={index} className="cosmic-border hover:scale-105 transition-all duration-300 nebula-gradient">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${tech.color}`}>
                    <tech.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-purple-300">{tech.name}</CardTitle>
                    <CardDescription className="text-gray-300 mt-2">
                      {tech.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tech.features.map((feature, featureIndex) => (
                    <Badge key={featureIndex} variant="secondary" className="bg-purple-900/30 text-purple-300 border-purple-400/30">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Model Performance Analysis
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {performanceData.map((item, index) => (
              <Card key={index} className="cosmic-border nebula-gradient">
                <CardHeader>
                  <CardTitle className="text-xl text-purple-300 flex items-center gap-2">
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>mAP50</span>
                      <span>{item.mAP50}%</span>
                    </div>
                    <Progress value={item.mAP50} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Precision</span>
                      <span>{item.precision}%</span>
                    </div>
                    <Progress value={item.precision} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Recall</span>
                      <span>{item.recall}%</span>
                    </div>
                    <Progress value={item.recall} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Overall Performance Summary */}
        <div className="nebula-gradient p-8 rounded-3xl backdrop-blur-sm">
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Overall System Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">97.2%</div>
              <div className="text-gray-300">mAP50</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">94.2%</div>
              <div className="text-gray-300">mAP50-95</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">98.4%</div>
              <div className="text-gray-300">Precision</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-400 mb-2">92.1%</div>
              <div className="text-gray-300">Recall</div>
            </div>
          </div>
        </div>

        {/* CodeClash Project Info */}
        <div className="mt-16 nebula-gradient p-8 rounded-3xl backdrop-blur-sm">
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            CodeClash 2.0 Project
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-lg text-gray-300 mb-4 leading-relaxed">
                CodeClash 2.0, set for 28 June 2025 at Google's Gurugram campus, is a student-run national hackathon that invites India's sharpest coders for a fast-paced, in-person showdown.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Teams of two to four college students tackle multi-round challenges of growing complexity, coding solutions from scratch while drawing on pre-approved libraries and documented AI tools.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-purple-400" />
                <span className="text-gray-300">Student-run hackathon</span>
              </div>
              <div className="flex items-center gap-3">
                <Cpu className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">AI-powered solutions</span>
              </div>
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">Multi-round challenges</span>
              </div>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-pink-400" />
                <span className="text-gray-300">Growing complexity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 