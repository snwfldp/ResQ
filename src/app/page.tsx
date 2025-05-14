
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, AlertTriangle, ArrowRight, Bell, Hospital, ListChecks, MapPin, Siren, Users, Waypoints, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const stats = [
    { title: "Active Incidents", value: "12", icon: AlertTriangle, color: "text-destructive" },
    { title: "Ambulances Available", value: "28", icon: Siren, color: "text-green-500" },
    { title: "Hospitals Online", value: "7", icon: Hospital, color: "text-blue-500" },
    { title: "Pending Requests", value: "3", icon: Bell, color: "text-yellow-500" },
  ];

  const quickActions = [
    { label: "New Emergency Dispatch", href: "/emergency-dispatch", icon: Zap },
    { label: "View Hospital Portal", href: "/hospital-portal", icon: ListChecks },
    { label: "Track Ambulances", href: "/tracking", icon: MapPin },
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">ResQ Command Center</CardTitle>
          <CardDescription>Real-time overview of emergency medical operations.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Welcome to the ResQ platform. Monitor critical activities and manage resources efficiently.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">Updated just now</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access key platform features quickly.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"> {/* Adjusted grid to 3 cols */}
          {quickActions.map((action) => (
            <Link href={action.href} key={action.label} passHref>
              <Button variant="outline" className="w-full justify-start text-left h-auto py-3 shadow-sm hover:shadow-md transition-shadow">
                <action.icon className="mr-3 h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="font-semibold">{action.label}</span>
                  <span className="text-xs text-muted-foreground">Go to {action.label.toLowerCase()}</span>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current operational status of ResQ services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                <span>AI Services</span>
              </div>
              <span className="text-sm font-medium text-green-500">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                <span>Hospital Network</span>
              </div>
              <span className="text-sm font-medium text-green-500">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <span>Ambulance GPS</span>
              </div>
              <span className="text-sm font-medium text-yellow-500">Degraded Performance</span>
            </div>
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                <span>Communication Channels</span>
              </div>
              <span className="text-sm font-medium text-green-500">Operational</span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Live Map Overview</CardTitle>
             <CardDescription>Snapshot of current ambulance and hospital locations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="Map Placeholder" 
                width={600} 
                height={400} 
                className="rounded-md object-cover"
                data-ai-hint="city map" 
              />
            </div>
             <Button variant="secondary" className="w-full mt-4">
              Go to Full Map View <MapPin className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    