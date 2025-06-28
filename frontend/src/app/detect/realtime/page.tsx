'use client'

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoIcon, Upload, AlertCircle, ArrowLeft, Save, X, Rocket, Satellite, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toast } from "sonner";

export default function RealtimeDetection(){
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResults, setDetectionResults] = useState<any>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [savingToInventory, setSavingToInventory] = useState(false);
  
  const uploadVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check if it's a video file
      if (!file.type.startsWith('video/')) {
        setError("Please select a valid video file");
        return;
      }
      
      setUploadedVideo(file);
      setError("");
      
      // Create preview and set it
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Preview the video
      if (uploadVideoRef.current) {
        uploadVideoRef.current.src = objectUrl;
      }
    }
  };
  
  const analyzeVideo = async () => {
    if (!uploadedVideo) {
      setError("Please select a video file first");
      return;
    }
    
    setIsAnalyzing(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedVideo);
      
      const response = await fetch('http://localhost:8000/detect-video', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze video');
      }
      
      const data = await response.json();
      setDetectionResults(data);
      setCurrentFrameIndex(0);
      toast.success(`Analysis complete: ${Object.keys(data.class_counts).length} object types detected`);
      
    } catch (err: any) {
      console.error("Error analyzing video:", err);
      setError(err.message || 'Failed to analyze video');
      toast.error("Error analyzing video. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const showNextFrame = () => {
    if (!detectionResults || !detectionResults.processed_frames) return;
    setCurrentFrameIndex((prev) => 
      prev < detectionResults.processed_frames.length - 1 ? prev + 1 : prev
    );
  };
  
  const showPreviousFrame = () => {
    setCurrentFrameIndex((prev) => prev > 0 ? prev - 1 : 0);
  };

  const resetVideoAnalysis = () => {
    setDetectionResults(null);
    setUploadedVideo(null);
    setCurrentFrameIndex(0);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (uploadVideoRef.current) uploadVideoRef.current.src = '';
  };
  
  const handleAddToInventory = async () => {
    if (!detectionResults || !detectionResults.class_counts) return;
    
    setSavingToInventory(true);
    
    try {
      // Map detected class names to database item names based on classes.txt
      // These must match EXACTLY what's in the database
      const classToItemMap: Record<string, string> = {
        'FireExtinguisher': 'Fire Extinguisher',
        'ToolBox': 'Toolbox',
        'OxygenTank': 'Oxygen Tank'
      };
      
      // Prepare detected items from class counts
      const detectedItems: Record<string, number> = {};
      
      // Convert class_counts to proper format
      Object.entries(detectionResults.class_counts).forEach(([className, count]) => {
        const itemName = classToItemMap[className] || className;
        detectedItems[itemName] = count as number;
      });
      
      console.log('Detected items:', detectedItems);

      const detectionsArray = Object.entries(detectionResults.class_counts).flatMap(
        ([className, count]) =>
          Array.from({ length: count as number }, () => ({ class_name: className }))
      );

      const res = await fetch('/api/add-to-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detections: detectionsArray })
      });

      if (!res.ok) {
        const data = await res.json();
        console.error('Error updating inventory:', data);
        toast.error('Failed to update inventory');
      } else {
        toast.success('Inventory updated successfully!');
        router.push('/home');
      }
    } catch (error) {
      console.error('Error adding to inventory:', error);
      toast.error('Failed to update inventory');
    } finally {
      setSavingToInventory(false);
    }
  };
  
  const handleCancel = () => {
    resetVideoAnalysis();
    router.push('/home');
  };

  useEffect(() => {
    return () => {
      // Clean up preview URL
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);
  
  return(
    <>
      <NavBar />
      <div className="py-18 px-35 star-field">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/home" className="flex items-center mb-5 cursor-pointer gap-1 text-purple-300 hover:text-purple-400 transition-all duration-300">
                <ArrowLeft size={18}/> Back to Mission Control
              </Link>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Video Mission Analysis
              </h1>
              <p className="text-purple-300 mt-2">Detect objects from uploaded mission videos</p>
            </div>
            <Badge variant="outline" className="px-3 py-1 bg-purple-900/20 border-purple-400 text-purple-300">
              {detectionResults ? 'Mission Complete' : 'Ready for Launch'}
            </Badge>
        </div>
          
          <Separator className="bg-purple-400/20" />
        
          <Card className="cosmic-border nebula-gradient">
          <CardHeader>
              <CardTitle className="text-purple-300 flex items-center gap-2">
                <VideoIcon className="h-5 w-5" />
                Video Upload Mission
              </CardTitle>
              <CardDescription className="text-purple-200">
              Upload a video file to detect objects.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <label htmlFor="video" className="text-purple-300">Select mission video</label>
                  <input
                    ref={fileInputRef}
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    disabled={isAnalyzing}
                    className="cursor-pointer bg-purple-900/20 border-purple-400/30 text-purple-300 rounded-md p-2"
                  />
                </div>
                
                {error && (
                  <div className="p-4 bg-red-900/20 border border-red-400/30 rounded-lg">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}
                
                {preview && (
                  <div className="border border-purple-400/30 rounded-md overflow-hidden bg-purple-900/20">
                          <video 
                            ref={uploadVideoRef}
                            controls
                      className="w-full"
                      style={{ maxHeight: '300px' }}
                          />
                          </div>
                        )}
                
                <div className="flex gap-3">
                  <Button 
                    onClick={analyzeVideo} 
                    disabled={!uploadedVideo || isAnalyzing}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 pulse-glow"
                  >
                    {isAnalyzing ? (
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
                  </Button>
                  
                  {detectionResults && (
                        <Button 
                      onClick={resetVideoAnalysis}
                      variant="outline"
                      className="border-purple-400/30 text-purple-300 hover:bg-purple-900/20"
                    >
                      <X className="mr-2 h-4 w-4" /> Reset
                        </Button>
                  )}
                      </div>
                
                {isAnalyzing && (
                  <div className="space-y-2">
                    <Progress value={50} />
                    <p className="text-purple-300 text-sm">Analyzing mission video...</p>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {detectionResults && (
            <Card className="cosmic-border nebula-gradient">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Mission Results
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Analysis complete with {Object.keys(detectionResults.class_counts).length} object types detected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-purple-900/30 border border-purple-400/20 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-purple-300 mb-3">Object Counts</h3>
                      <div className="space-y-2">
                        {Object.entries(detectionResults.class_counts).map(([className, count]) => (
                          <div key={className} className="flex justify-between items-center">
                            <span className="text-purple-200">{className}</span>
                            <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-400/30">
                              {count as number}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {detectionResults.processed_frames && (
                      <div className="bg-purple-900/30 border border-purple-400/20 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-purple-300 mb-3">Frame Navigation</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                      <Button 
                              onClick={showPreviousFrame}
                              disabled={currentFrameIndex === 0}
                        size="sm"
                              variant="outline"
                              className="border-purple-400/30 text-purple-300 hover:bg-purple-900/20"
                            >
                              Previous
                            </Button>
                            <span className="text-purple-300">
                              Frame {currentFrameIndex + 1} of {detectionResults.processed_frames.length}
                            </span>
                            <Button 
                        onClick={showNextFrame} 
                              disabled={currentFrameIndex >= detectionResults.processed_frames.length - 1}
                              size="sm"
                              variant="outline"
                              className="border-purple-400/30 text-purple-300 hover:bg-purple-900/20"
                      >
                        Next
                      </Button>
                    </div>
                          
                          {detectionResults.processed_frames[currentFrameIndex] && (
                            <img
                              src={`data:image/jpeg;base64,${detectionResults.processed_frames[currentFrameIndex]}`}
                              alt={`Frame ${currentFrameIndex + 1}`}
                              className="w-full border border-purple-400/30 rounded-lg"
                            />
                )}
              </div>
                      </div>
                    )}
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
          </CardContent>
        </Card>
          )}
        </div>
      </div>
    </>
  )
}