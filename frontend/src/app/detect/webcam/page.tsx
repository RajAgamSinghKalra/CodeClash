'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Camera, Satellite, Zap } from 'lucide-react'

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

export default function WebcamDetection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const captureCanvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const detectingRef = useRef(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let interval: NodeJS.Timeout

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        setError('Unable to access webcam')
      }

      interval = setInterval(() => {
        if (!detectingRef.current) {
          captureAndDetect()
        }
      }, 1000)
    }

    startCamera()

    return () => {
      clearInterval(interval)
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  const captureAndDetect = async () => {
    if (!videoRef.current || !captureCanvasRef.current || !overlayCanvasRef.current) return

    detectingRef.current = true

    const video = videoRef.current
    const captureCanvas = captureCanvasRef.current
    const overlayCanvas = overlayCanvasRef.current
    captureCanvas.width = video.videoWidth
    captureCanvas.height = video.videoHeight
    overlayCanvas.width = video.videoWidth
    overlayCanvas.height = video.videoHeight

    const ctx = captureCanvas.getContext('2d')
    const overlayCtx = overlayCanvas.getContext('2d')
    if (!ctx || !overlayCtx) {
      detectingRef.current = false
      return
    }

    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height)

    captureCanvas.toBlob(async blob => {
      if (!blob) {
        detectingRef.current = false
        return
      }

      setLoading(true)
      setError('')

      const formData = new FormData()
      formData.append('file', new File([blob], 'frame.jpg', { type: 'image/jpeg' }))

      try {
        const response = await fetch('http://localhost:8000/detect', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Detection failed')
        }

        const data = await response.json()
        setResult(data)

        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
        overlayCtx.lineWidth = 3
        overlayCtx.strokeStyle = '#8b5cf6'
        overlayCtx.font = '16px sans-serif'
        overlayCtx.fillStyle = '#8b5cf6'

        data.detections.forEach((d: Detection) => {
          const [x1, y1, x2, y2] = d.bbox
          overlayCtx.strokeRect(x1, y1, x2 - x1, y2 - y1)
          overlayCtx.fillText(d.class_name, x1, y1 - 4)
        })
      } catch (e: any) {
        setError(e.message || 'Detection failed')
      } finally {
        setLoading(false)
        detectingRef.current = false
      }
    }, 'image/jpeg')
  }

  return (
    <>
      <NavBar />
      <div className="py-8 px-25 star-field">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/home"
              className="flex items-center mb-5 cursor-pointer gap-1 text-purple-300 hover:text-purple-400 transition-all duration-300"
            >
              <ArrowLeft size={18} /> Back to Mission Control
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Live Webcam Mission
            </h1>
            <p className="text-purple-300 mt-2">Real-time detection from your space camera</p>
          </div>
          <Badge variant="outline" className="px-3 py-1 bg-purple-900/20 border-purple-400 text-purple-300">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="floating">
                  <Satellite className="h-4 w-4" />
                </div>
                Scanning...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Ready
              </div>
            )}
          </Badge>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-400/30 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="border border-purple-400/30 rounded-md overflow-hidden relative bg-purple-900/20">
            <video ref={videoRef} autoPlay className="w-full" />
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
            <canvas ref={captureCanvasRef} className="hidden" />
            <div className="absolute top-2 left-2 bg-purple-600/80 text-white px-2 py-1 rounded-full text-xs">
              Live Feed
            </div>
          </div>

          <div className="bg-purple-900/20 border border-purple-400/30 rounded-lg p-6">
            {loading && (
              <div className="mb-4">
                <Progress className="mb-2" value={50} />
                <p className="text-purple-300 text-sm">Processing mission data...</p>
              </div>
            )}
            {result ? (
              <div>
                <h3 className="text-xl font-medium mb-4 text-purple-300 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Mission Results ({result.count})
                </h3>
                <img
                  src={`data:image/jpeg;base64,${result.image}`}
                  alt="Detection result"
                  className="border border-purple-400/30 mb-4 w-full object-contain rounded-lg"
                />
                <div className="space-y-2">
                  {result.detections.map((d, idx) => (
                    <div key={idx} className="flex justify-between py-2 px-3 bg-purple-900/30 rounded border border-purple-400/20">
                      <span className="text-purple-200">{d.class_name}</span>
                      <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-400/30">
                        {(d.confidence * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-300">No detections yet. Scanning in progress...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
