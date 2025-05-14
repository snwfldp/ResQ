
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
  { id: "AMB-SL-001", callSign: "서울응급 101", currentLocation: "37.5665° N, 126.9780° E (서울시청 부근)", status: "en_route_to_hospital", assignedPatientId: "PAT-240728-087", destinationHospitalId: "HOS_SNUH", crew: ["김민준", "이수진"] },
  { id: "AMB-SL-002", callSign: "강남구급 202", currentLocation: "37.4979° N, 127.0276° E (강남역 사거리)", status: "at_incident", assignedPatientId: "PAT-240728-088", crew: ["박서준", "최예나"] },
  { id: "AMB-SL-003", callSign: "종로구급 303", currentLocation: "종로3가역 인근", status: "available", crew: ["정하윤", "윤지후"] },
  { id: "AMB-SL-004", callSign: "송파기동 404", currentLocation: "잠실 롯데월드타워 방향", status: "en_route_to_incident", crew: ["강태현", "배수민"] },
  { id: "AMB-SL-005", callSign: "마포지원 505", currentLocation: "홍대입구역", status: "at_hospital", destinationHospitalId: "HOS_SEVERANCE", crew: ["홍길동", "성춘향"] },
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
            // If changing to a hospital-related status, assign a mock hospital
            let newDestinationHospitalId = amb.destinationHospitalId;
            if ((newStatus === 'en_route_to_hospital' || newStatus === 'at_hospital') && !newDestinationHospitalId) {
                const mockHospitalIds = ["HOS_SNUH", "HOS_SEVERANCE", "HOS_ASAN", "HOS_SAMSUNG", "HOS_STMARY"];
                newDestinationHospitalId = mockHospitalIds[Math.floor(Math.random() * mockHospitalIds.length)];
            } else if (newStatus === 'available' || newStatus === 'en_route_to_incident' || newStatus === 'at_incident') {
                newDestinationHospitalId = undefined; // Clear destination if not hospital related
            }
            return { ...amb, status: newStatus, destinationHospitalId: newDestinationHospitalId };
          }
          // Simulate location change for en_route ambulances
          if (amb.status === 'en_route_to_incident' || amb.status === 'en_route_to_hospital') {
            // This is a very simplistic location update, replace with actual GPS data if available
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
  
  const getStatusKorean = (status: Ambulance['status']) => {
    switch (status) {
        case "available": return "출동가능";
        case "en_route_to_incident": return "현장출동중";
        case "at_incident": return "현장도착";
        case "en_route_to_hospital": return "병원이송중";
        case "at_hospital": return "병원도착";
        case "unavailable": return "출동불가";
        default: return status;
    }
  }

  const filteredAmbulances = ambulances.filter(amb => statusFilter[amb.status]);

  // Map hospital IDs to names for display
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
            <CardTitle className="text-2xl">실시간 구급차 현황 지도</CardTitle>
            <CardDescription>운행 중인 구급차의 실시간 위치 (지도는 플레이스홀더입니다)</CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-7rem)]"> 
            <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              <Image 
                src="https://placehold.co/800x600.png" 
                alt="실시간 지도 플레이스홀더" 
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
                <CardTitle className="text-xl">구급차 목록</CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                        <ListFilter className="mr-2 h-4 w-4" /> 필터
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>상태별 필터</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {Object.keys(statusFilter).map((statusKey) => (
                        <DropdownMenuCheckboxItem
                            key={statusKey}
                            checked={statusFilter[statusKey as keyof StatusFilter]}
                            onCheckedChange={(checked) =>
                            setStatusFilter((prev) => ({ ...prev, [statusKey]: checked }))
                            }
                        >
                            {getStatusKorean(statusKey as Ambulance['status'])}
                        </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto"> 
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>호출부호</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">동작</TableHead>
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
                        {getStatusKorean(amb.status)}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedAmbulance(amb); }}>상세정보</Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            {filteredAmbulances.length === 0 && <p className="text-center text-muted-foreground py-4">필터와 일치하는 구급차가 없습니다.</p>}
            </CardContent>
        </Card>

        {selectedAmbulance && (
          <Card className="shadow-xl flex-grow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center"><Siren className="mr-2 h-5 w-5 text-primary" /> {selectedAmbulance.callSign} 상세정보</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedAmbulance(null)}><XCircle className="h-5 w-5" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>현재위치:</strong> <span className="ml-1">{selectedAmbulance.currentLocation}</span></div>
              <div className="flex items-center"><Watch className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>상태:</strong> <span className="ml-1">{getStatusKorean(selectedAmbulance.status)}</span></div>
              <div className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>탑승대원:</strong> <span className="ml-1">{selectedAmbulance.crew.join(", ")}</span></div>
              {selectedAmbulance.assignedPatientId && <div className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>환자ID:</strong><span className="ml-1">{selectedAmbulance.assignedPatientId}</span></div>}
              {selectedAmbulance.destinationHospitalId && <div className="flex items-center"><Hospital className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>목적병원:</strong><span className="ml-1">{hospitalIdToName[selectedAmbulance.destinationHospitalId] || selectedAmbulance.destinationHospitalId}</span></div>}
              <Button variant="outline" className="w-full mt-2"><Route className="mr-2 h-4 w-4" /> 경로 상세보기</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
