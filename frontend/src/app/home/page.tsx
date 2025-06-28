'use client'
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

import { Check, CheckLine, TicketCheck, ToggleRight, Calendar, Clock, Rocket, Satellite, Shield, Zap } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface Scan {
  id: number;
  public_url: string;
  created_at: string;
  detection_count: number;
  detections: Array<{
    class_name: string;
  }>;
}

export default function Home(){
  const [fireExtinguishers, setFireExtinguishers] = useState(0);
  const [toolboxes, setToolboxes] = useState(0);
  const [oxygenTanks, setOxygenTanks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState(true);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  
  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        
        // Fetch items from the database
        const res = await fetch('/api/items')
        const data = await res.json()
        
        // Count items by type based on the image data
        if (data) {
          console.log(data);
          
          // Find items by name instead of array index
          const fireExtinguisher = data.find((item: any) => item.name.toLowerCase() === 'fire extinguisher');
          const toolbox = data.find((item: any) => item.name.toLowerCase() === 'toolbox');
          const oxygenTank = data.find((item: any) => item.name.toLowerCase() === 'oxygen tank');
          
          setFireExtinguishers(fireExtinguisher?.quantity || 0);
          setToolboxes(toolbox?.quantity || 0);
          setOxygenTanks(oxygenTank?.quantity || 0);
          
          // Check if any item is running low on stock
          if ((toolbox?.quantity || 0) < 10) {
            toast.warning("Toolboxes are running out of stock! Current quantity: " + (toolbox?.quantity || 0));
            toast.warning("Toolboxes are running out of stock! Current quantity: " + (toolbox?.quantity || 0));
          }
          
          if ((oxygenTank?.quantity || 0) < 10) {
            toast.warning("Oxygen tanks are running out of stock! Current quantity: " + (oxygenTank?.quantity || 0));
            toast.warning("Oxygen tanks are running out of stock! Current quantity: " + (oxygenTank?.quantity || 0));
          }
          
          if ((fireExtinguisher?.quantity || 0) < 10) {
            toast.warning("Fire extinguishers are running out of stock! Current quantity: " + (fireExtinguisher?.quantity || 0));
            toast.warning("Fire extinguishers are running out of stock! Current quantity: " + (fireExtinguisher?.quantity || 0));
          }
        }

        // Fetch recent scans
        const scanRes = await fetch('/api/uploaded-images')
        const scanData = await scanRes.json()

        if (scanData) {
          setRecentScans((scanData as Scan[]).slice(0, 6).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchItems();
  }, []);

  return (
    <>
      <NavBar/>
      <div className="min-h-screen w-full py-20 px-6 md:px-20 star-field">
        <div className="flex flex-wrap items-start mt-10 justify-start gap-6">
          <Card className="w-60 h-48 text-center cosmic-border hover:scale-105 transition-all duration-300 nebula-gradient">
            <CardHeader>
              <CardTitle className="text-xl text-purple-300 flex items-center justify-center gap-2">
                <Shield className="h-5 w-5" />
                Fire Extinguishers
              </CardTitle>
              <CardContent className="text-5xl font-bold text-blue-400">
                {loading ? "..." : fireExtinguishers}
              </CardContent>
            </CardHeader>
          </Card>
          
          <Card className="w-60 h-48 text-center cosmic-border hover:scale-105 transition-all duration-300 nebula-gradient">
            <CardHeader>
              <CardTitle className="text-xl text-purple-300 flex items-center justify-center gap-2">
                <Satellite className="h-5 w-5" />
                Toolboxes
              </CardTitle>
              <CardContent className="text-5xl font-bold text-pink-400">
                {loading ? "..." : toolboxes}
              </CardContent>
            </CardHeader>
          </Card>
          
          <Card className="w-60 h-48 text-center cosmic-border hover:scale-105 transition-all duration-300 nebula-gradient">
            <CardHeader>
              <CardTitle className="text-xl text-purple-300 flex items-center justify-center gap-2">
                <Rocket className="h-5 w-5" />
                Oxygen Tanks
              </CardTitle>
              <CardContent className="text-5xl font-bold text-cyan-400">
                {loading ? "..." : oxygenTanks}
              </CardContent>
            </CardHeader>
          </Card>
          
          <Card className="w-60 h-48 text-center cosmic-border hover:scale-105 transition-all duration-300 nebula-gradient">
            <CardHeader>
              <CardTitle className="text-xl text-purple-300 flex items-center justify-center gap-2">
                <Zap className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardContent className="text-2xl text-green-400 font-bold mt-5">
                {systemStatus ? "Active" : "Inactive"}
              </CardContent>
            </CardHeader>
          </Card>
        </div>
        
        <div className="w-full mt-16">
          <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Recent Mission Scans
          </h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Rocket className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-lg text-gray-300">Loading mission data...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentScans.map((scan, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 cosmic-border">
                  <div className="relative h-48 w-full">
                    <Image 
                      src={scan.public_url || '/placeholder-scan.jpg'} 
                      alt={`Scan ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 bg-purple-600/80 text-white px-2 py-1 rounded-full text-xs">
                      {scan.detection_count} detected
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Check className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-green-400">Processed</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-300">
                        Detected items: {scan.detection_count} item{scan.detection_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}