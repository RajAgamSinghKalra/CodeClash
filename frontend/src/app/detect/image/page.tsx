'use client'

import { useState, useRef, FormEvent } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Upload, CheckCircle2, ImageIcon, ArrowBigLeft, ArrowLeft, Save, X, Rocket, Satellite, Zap } from 'lucide-react'
import NavBar from '@/components/NavBar'
import ModeToggle from '@/components/theme-switcher'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { log } from 'console'

interface Detection {
  class_id: number
  class_name: string
  confidence: number
  bbox: number[]
}

interface DetectionResult {
  detections: Detection[]
  image: string
  count: number
}

export default function DetectImage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [savingToInventory, setSavingToInventory] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const file = e.target.files[0]
    setSelectedFile(file)
    
    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    
    // Reset results
    setResult(null)
    setImageUrl(null)
  }

  const uploadToSupabase = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const data = await res.json()
        console.error('Error uploading file:', data)
        toast.error('Failed to upload image to storage')
        return null
      }

      const data = await res.json()
      return data.publicUrl as string
    } catch (error) {
      console.error('Error in upload process:', error)
      return null
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return
    
    setLoading(true)
    
    try {
      // First upload the file to Supabase Storage
      const imageUrl = await uploadToSupabase(selectedFile)
      setImageUrl(imageUrl)
      
      // Then send to detection API
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const response = await axios.post('http://localhost:8000/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setResult(response.data)
      console.log(response.data);
      
      // Update the detection count in the uploaded_images table via API
      if (imageUrl) {
        const res = await fetch('/api/update-detection-count', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            publicUrl: imageUrl,
            count: response.data.detections.length,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          console.error('Error updating detection count:', data)
        }
      }
    } catch (error) {
      console.error('Error detecting objects:', error)
      toast.error('Failed to detect objects. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToInventory = async () => {
    if (!result) return
    
    setSavingToInventory(true)
    
    try {
      // Map detected class names to database item names based on classes.txt
      // These must match EXACTLY what's in the database
      const classToItemMap: Record<string, string> = {
        'FireExtinguisher': 'Fire Extinguisher',
        'ToolBox': 'Toolbox',
        'OxygenTank': 'Oxygen Tank'
      }
      
      // Count occurrences of each item
      const detectedItems: Record<string, number> = {}
      
      result.detections.forEach(detection => {
        console.log('Detected class:', detection.class_name);
        const itemName = classToItemMap[detection.class_name] || detection.class_name
        detectedItems[itemName] = (detectedItems[itemName] || 0) + 1
      })
      
      console.log('Detected items:', detectedItems);
      
      const res = await fetch('/api/add-to-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detections: result.detections })
      })
      if (!res.ok) {
        const data = await res.json()
        console.error('Error updating inventory:', data)
        toast.error('Failed to update inventory')
      } else {
        toast.success('Inventory updated successfully!')
        router.push('/home')
      }
    } catch (error) {
      console.error('Error adding to inventory:', error)
      toast.error('Failed to update inventory')
    } finally {
      setSavingToInventory(false)
    }
  }

  const handleCancel = () => {
    router.push('/home')
  }
  
  return (
    <>
    <div className="py-8 px-25 p-6 star-field">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/home" className='flex items-center mb-5 cursor-pointer gap-1 text-purple-300 hover:text-purple-400 transition-all duration-300'> 
              <ArrowLeft size={18}/> Back to Mission Control
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Image Detection Mission
            </h1>
            <p className="text-purple-300 mt-2">Scan and analyze safety equipment from images</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="px-3 py-1 bg-purple-900/20 border-purple-400 text-purple-300">
              {result ? 'Mission Complete' : 'Ready for Launch'}
            </Badge>
            <ModeToggle/>
          </div>
        </div>
        
        <Separator className="bg-purple-400/20" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="h-full cosmic-border nebula-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <Upload size={18} />
                  Mission Upload
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Upload an image to detect safety equipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="image" className="text-purple-300">Select mission image</Label>
                    <div className="relative">
                      <Input
                        ref={fileInputRef}
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={loading}
                        className="cursor-pointer bg-purple-900/20 border-purple-400/30 text-purple-300"
                      />
                    </div>
                  </div>
                  
                  {preview ? (
                    <div className="relative w-full h-48 border border-purple-400/30 rounded-md overflow-hidden bg-purple-900/20">
                      <Image 
                        src={preview} 
                        alt="Preview" 
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-purple-400/30 rounded-md bg-purple-900/20">
                      <ImageIcon className="h-10 w-10 text-purple-400" />
                      <p className="text-sm text-purple-300 mt-2">No image selected</p>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    disabled={!selectedFile || loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 pulse-glow"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="floating">
                          <Rocket className="h-4 w-4" />
                        </div>
                        Processing Mission...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Satellite className="h-4 w-4" />
                        Launch Analysis
                      </div>
                    )}
                    {loading && <Progress className="mt-2" value={50} />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Tabs defaultValue="results" className="h-full">
              <TabsList className="grid grid-cols-2 mb-4 bg-purple-900/20">
                <TabsTrigger value="results" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Detection Results</TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Mission Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="results" className="h-full">
                <Card className="h-full cosmic-border nebula-gradient">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-300">
                      {result ? <CheckCircle2 size={18} className="text-green-400" /> : <AlertCircle size={18} className="text-yellow-400" />}
                      Mission Results
                    </CardTitle>
                    {result && (
                      <CardDescription className="text-purple-200">
                        {result.count} objects detected in the mission
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {result ? (
                      <div className="space-y-6">
                        <div className="relative w-full h-64 border border-purple-400/30 rounded-md overflow-hidden bg-purple-900/20">
                          <Image
                            src={`data:image/jpeg;base64,${result.image}`}
                            alt="Detection Result"
                            fill
                            className="object-contain"
                          />
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-3 text-purple-300">Detected Objects</h3>
                          <div className="space-y-3">
                            {result.detections.map((detection, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-purple-900/30 rounded-lg border border-purple-400/20">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-purple-600/20 border-purple-400 text-purple-300">
                                    {index + 1}
                                  </Badge>
                                  <span className="font-medium text-purple-200">{detection.class_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Progress 
                                    value={detection.confidence * 100} 
                                    className="w-24 h-2" 
                                  />
                                  <span className="text-sm text-purple-300 w-16">
                                    {(detection.confidence * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-3 justify-end pt-4">
                          <Button 
                            variant="outline" 
                            onClick={handleCancel}
                            disabled={savingToInventory}
                            className="border-purple-400/30 text-purple-300 hover:bg-purple-900/20"
                          >
                            <X className="mr-2 h-4 w-4" /> Cancel Mission
                          </Button>
                          <Button 
                            onClick={handleAddToInventory} 
                            disabled={savingToInventory}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 pulse-glow"
                          >
                            <Save className="mr-2 h-4 w-4" /> Add to Inventory
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-purple-400/30 rounded-md bg-purple-900/20">
                        <AlertCircle className="h-10 w-10 text-purple-400" />
                        <p className="text-purple-300 mt-2">Upload and analyze an image to see results</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="analytics" className="h-full">
                <Card className="h-full cosmic-border nebula-gradient">
                  <CardHeader>
                    <CardTitle className="text-purple-300">Mission Analytics</CardTitle>
                    <CardDescription className="text-purple-200">
                      Detailed analysis of detected objects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="cosmic-border nebula-gradient">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-purple-300">Total Objects</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-blue-400">{result.count}</div>
                            </CardContent>
                          </Card>
                          <Card className="cosmic-border nebula-gradient">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-purple-300">Confidence Level</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-pink-400">
                                {result.detections.length > 0 
                                  ? `${(result.detections.reduce((acc, det) => acc + det.confidence, 0) / result.detections.length * 100).toFixed(1)}%`
                                  : "N/A"
                                }
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-3 text-purple-300">Object Categories</h3>
                          <div className="space-y-2">
                            {Array.from(new Set(result.detections.map(d => d.class_name))).map((className, i) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-purple-900/30 rounded border border-purple-400/20">
                                <span className="text-purple-200">{className}</span>
                                <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-400/30">
                                  {result.detections.filter(d => d.class_name === className).length}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-3 justify-end pt-4">
                          <Button 
                            variant="outline" 
                            onClick={handleCancel}
                            disabled={savingToInventory}
                            className="border-purple-400/30 text-purple-300 hover:bg-purple-900/20"
                          >
                            <X className="mr-2 h-4 w-4" /> Cancel Mission
                          </Button>
                          <Button 
                            onClick={handleAddToInventory} 
                            disabled={savingToInventory}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 pulse-glow"
                          >
                            <Save className="mr-2 h-4 w-4" /> Add to Inventory
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-purple-400/30 rounded-md bg-purple-900/20">
                        <AlertCircle className="h-10 w-10 text-purple-400" />
                        <p className="text-purple-300 mt-2">No analytics available yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}