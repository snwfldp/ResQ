
"use client";

import { useState, useEffect } from "react";
import type { Ambulance } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Siren, User, Hospital, Route, Watch, ListFilter, XCircle } from "lucide-react";
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
  { id: "AMB-SL-001", callSign: "Seoul EMS 101", currentLocation: "37.5665° N, 126.9780° E (Near Seoul City Hall)", status: "en_route_to_hospital", assignedPatientId: "PAT-240728-087", destinationHospitalId: "HOS_SNUH", crew: ["Kim Min-jun", "Lee Su-jin"] },
  { id: "AMB-SL-002", callSign: "Gangnam EMS 202", currentLocation: "37.4979° N, 127.0276° E (Gangnam Station Crossroad)", status: "at_incident", assignedPatientId: "PAT-240728-088", crew: ["Park Seo-jun", "Choi Ye-na"] },
  { id: "AMB-SL-003", callSign: "Jongno EMS 303", currentLocation: "Near Jongno 3-ga Station", status: "available", crew: ["Jung Ha-yoon", "Yoon Ji-hoo"] },
  { id: "AMB-SL-004", callSign: "Songpa Rapid 404", currentLocation: "Towards Lotte World Tower, Jamsil", status: "en_route_to_incident", crew: ["Kang Tae-hyun", "Bae Su-min"] },
  { id: "AMB-SL-005", callSign: "Mapo Support 505", currentLocation: "Hongik Univ. Station", status: "at_hospital", destinationHospitalId: "HOS_SEVERANCE", crew: ["Hong Gil-dong", "Sung Chun-hyang"] },
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
          if (Math.random() < 0.1) {
            const statuses: Ambulance['status'][] = ["available", "en_route_to_incident", "at_incident", "en_route_to_hospital", "at_hospital", "unavailable"];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            let newDestinationHospitalId = amb.destinationHospitalId;
            if ((newStatus === 'en_route_to_hospital' || newStatus === 'at_hospital') && !newDestinationHospitalId) {
                const mockHospitalIds = ["HOS_SNUH", "HOS_SEVERANCE", "HOS_ASAN", "HOS_SAMSUNG", "HOS_STMARY"];
                newDestinationHospitalId = mockHospitalIds[Math.floor(Math.random() * mockHospitalIds.length)];
            } else if (newStatus === 'available' || newStatus === 'en_route_to_incident' || newStatus === 'at_incident') {
                newDestinationHospitalId = undefined;
            }
            return { ...amb, status: newStatus, destinationHospitalId: newDestinationHospitalId };
          }
          if (amb.status === 'en_route_to_incident' || amb.status === 'en_route_to_hospital') {
            const latPart = parseFloat(amb.currentLocation.split("°")[0]);
            const lonPart = parseFloat(amb.currentLocation.split(",")[1]?.split("°")[0] || "127");
            const newLat = (latPart + (Math.random() - 0.5) * 0.001).toFixed(4);
            const newLon = (lonPart + (Math.random() - 0.5) * 0.001).toFixed(4);
            return { ...amb, currentLocation: `${newLat}° N, ${newLon}° E` };
          }
          return amb;
        })
      );
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  const getStatusBadgeVariant = (status: Ambulance['status']) => {
    switch (status) {
      case "available": return "default"; 
      case "en_route_to_incident":
      case "en_route_to_hospital": return "secondary"; 
      case "at_incident":
      case "at_hospital": return "outline"; 
      case "unavailable": return "destructive"; 
      default: return "secondary";
    }
  };
  
  const getStatusEnglish = (status: Ambulance['status']) => {
    switch (status) {
        case "available": return "Available";
        case "en_route_to_incident": return "En Route to Incident";
        case "at_incident": return "At Incident Scene";
        case "en_route_to_hospital": return "En Route to Hospital";
        case "at_hospital": return "At Hospital";
        case "unavailable": return "Unavailable";
        default: return status;
    }
  }

  const filteredAmbulances = ambulances.filter(amb => statusFilter[amb.status]);

  const hospitalIdToName: { [key: string]: string } = {
    "HOS_SNUH": "서울대학교병원",
    "HOS_SEVERANCE": "세브란스병원",
    "HOS_ASAN": "서울아산병원",
    "HOS_SAMSUNG": "삼성서울병원",
    "HOS_STMARY": "서울성모병원",
    "HOS_KUANAM": "고려대학교 안암병원",
    "HOS_KHU": "경희대학교병원"
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]"> 
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card className="flex-grow shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Real-time Ambulance Map</CardTitle>
            <CardDescription>Live location of active ambulances (Map is a placeholder)</CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-7rem)]"> 
            <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              <Image 
                src="https://placehold.co/800x600.png" 
                alt="Real-time map placeholder" 
                width={800} 
                height={600}
                className="object-cover w-full h-full"
                data-ai-hint="seoul city map ambulance" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 flex flex-col gap-6">
        <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Ambulance List</CardTitle>
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
                            {getStatusEnglish(statusKey as Ambulance['status'])}
                        </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto"> 
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Call Sign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
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
                        {getStatusEnglish(amb.status)}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedAmbulance(amb); }}>Details</Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            {filteredAmbulances.length === 0 && <p className="text-center text-muted-foreground py-4">No ambulances match the filter.</p>}
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
              <div className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>Current Location:</strong> <span className="ml-1">{selectedAmbulance.currentLocation}</span></div>
              <div className="flex items-center"><Watch className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>Status:</strong> <span className="ml-1">{getStatusEnglish(selectedAmbulance.status)}</span></div>
              <div className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>Crew:</strong> <span className="ml-1">{selectedAmbulance.crew.join(", ")}</span></div>
              {selectedAmbulance.assignedPatientId && <div className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>Patient ID:</strong><span className="ml-1">{selectedAmbulance.assignedPatientId}</span></div>}
              {selectedAmbulance.destinationHospitalId && <div className="flex items-center"><Hospital className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>Destination:</strong><span className="ml-1">{hospitalIdToName[selectedAmbulance.destinationHospitalId] || selectedAmbulance.destinationHospitalId}</span></div>}
              <Button variant="outline" className="w-full mt-2"><Route className="mr-2 h-4 w-4" /> View Route Details</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

    