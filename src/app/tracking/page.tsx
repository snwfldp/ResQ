
"use client";

import { useState, useEffect } from "react";
import type { Ambulance } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Siren, User, Hospital, Route, Watch, ListFilter } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const initialMockAmbulances: Ambulance[] = [
  { id: "AMB001", callSign: "Medic 1", currentLocation: "34.0522° N, 118.2437° W", status: "en_route_to_hospital", assignedPatientId: "PAT087", destinationHospitalId: "HOS001", crew: ["J. Doe", "A. Smith"] },
  { id: "AMB002", callSign: "Rescue 2", currentLocation: "34.0550° N, 118.2500° W", status: "at_incident", assignedPatientId: "PAT088", crew: ["B. Jones", "C. Miller"] },
  { id: "AMB003", callSign: "Medic 3", currentLocation: "Near City Park", status: "available", crew: ["D. Wilson", "E. Garcia"] },
  { id: "AMB004", callSign: "Unit 4", currentLocation: "Downtown Sector 5", status: "en_route_to_incident", crew: ["F. Brown", "G. Lee"] },
  { id: "AMB005", callSign: "Rescue 5", currentLocation: "Highway 101, Exit 12", status: "at_hospital", destinationHospitalId: "HOS002", crew: ["H. Davis", "I. Rodriguez"] },
];

type StatusFilter = {
  available: boolean;
  en_route_to_incident: boolean;
  at_incident: boolean;
  en_route_to_hospital: boolean;
  at_hospital: boolean;
  unavailable: boolean;
}

export default function AmbulanceTrackingPage() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>(initialMockAmbulances);
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>({
    available: true,
    en_route_to_incident: true,
    at_incident: true,
    en_route_to_hospital: true,
    at_hospital: true,
    unavailable: true,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulances(prevAmbulances =>
        prevAmbulances.map(amb => {
          // Simple mock update: randomly change status or location slightly
          if (Math.random() < 0.1) {
            const statuses: Ambulance['status'][] = ["available", "en_route_to_incident", "at_incident", "en_route_to_hospital", "at_hospital"];
            return { ...amb, status: statuses[Math.floor(Math.random() * statuses.length)] };
          }
          return amb;
        })
      );
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusBadgeVariant = (status: Ambulance['status']) => {
    switch (status) {
      case "available": return "default"; // Green in many themes or primary
      case "en_route_to_incident":
      case "en_route_to_hospital": return "secondary"; // Yellow
      case "at_incident":
      case "at_hospital": return "outline"; // Blue or neutral
      case "unavailable": return "destructive"; // Red
      default: return "secondary";
    }
  };

  const filteredAmbulances = ambulances.filter(amb => statusFilter[amb.status]);

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]"> {/* Adjust height as needed */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card className="flex-grow shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Live Ambulance Map</CardTitle>
            <CardDescription>Real-time locations of active ambulances. (Map is a placeholder)</CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-7rem)]"> {/* Adjust height for map content */}
            <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              <Image 
                src="https://placehold.co/800x600.png" 
                alt="Live Map Placeholder" 
                width={800} 
                height={600}
                className="object-cover w-full h-full"
                data-ai-hint="city street map" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 flex flex-col gap-6">
        <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Ambulance Fleet</CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                        <ListFilter className="mr-2 h-4 w-4" /> Filter
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {Object.keys(statusFilter).map((statusKey) => (
                        <DropdownMenuCheckboxItem
                            key={statusKey}
                            checked={statusFilter[statusKey as keyof StatusFilter]}
                            onCheckedChange={(checked) =>
                            setStatusFilter((prev) => ({ ...prev, [statusKey]: checked }))
                            }
                        >
                            {statusKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto"> {/* Scrollable list */}
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Call Sign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredAmbulances.map((amb) => (
                    <TableRow key={amb.id} onClick={() => setSelectedAmbulance(amb)} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{amb.callSign}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(amb.status)}
                         className={amb.status === 'available' ? 'bg-green-500 hover:bg-green-600 text-white' : 
                                    amb.status === 'unavailable' ? 'bg-red-500 hover:bg-red-600 text-white' :
                                    (amb.status === 'en_route_to_hospital' || amb.status === 'en_route_to_incident') ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''
                                   }>
                        {amb.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedAmbulance(amb); }}>Details</Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            {filteredAmbulances.length === 0 && <p className="text-center text-muted-foreground py-4">No ambulances match filter.</p>}
            </CardContent>
        </Card>

        {selectedAmbulance && (
          <Card className="shadow-xl flex-grow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center"><Siren className="mr-2 h-5 w-5 text-primary" /> {selectedAmbulance.callSign} Details</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedAmbulance(null)}><XCircle className="h-5 w-5" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>Location:</strong> <span className="ml-1">{selectedAmbulance.currentLocation}</span></div>
              <div className="flex items-center"><Watch className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>Status:</strong> <span className="ml-1">{selectedAmbulance.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></div>
              <div className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>Crew:</strong> <span className="ml-1">{selectedAmbulance.crew.join(", ")}</span></div>
              {selectedAmbulance.assignedPatientId && <div className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>Patient ID:</strong><span className="ml-1">{selectedAmbulance.assignedPatientId}</span></div>}
              {selectedAmbulance.destinationHospitalId && <div className="flex items-center"><Hospital className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>Destination:</strong><span className="ml-1">{selectedAmbulance.destinationHospitalId}</span></div>}
              <Button variant="outline" className="w-full mt-2"><Route className="mr-2 h-4 w-4" /> View Route Details</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
