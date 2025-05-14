
"use client";

import { useState, useEffect } from "react";
import type { PatientAdmissionRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertTriangle, Users, ArrowUpDown, RefreshCw, Hospital } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const THIS_HOSPITAL_ID = "HOS_SNUH"; // This portal's hospital ID (서울대학교병원)
const THIS_HOSPITAL_NAME = "서울대학교병원"; // Seoul National University Hospital

const initialMockRequests: PatientAdmissionRequest[] = [
  { id: "REQ20240728001", patientInfo: { age: 58, gender: "Male", briefHistory: "History of heart disease" }, primarySymptoms: "Severe chest pain, dyspnea", vitalSigns: "BP: 160/100, HR: 110, SpO2: 92%", assessedCondition: "Suspected AMI", incidentLocation: "Jongno-gu Daehak-ro", ambulanceId: "AMB-SEO-012", etaToHospital: "12 min", requestTimestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), status: "pending", hospitalId: THIS_HOSPITAL_ID },
  { id: "REQ20240728002", patientInfo: { age: 25, gender: "Female" }, primarySymptoms: "RUQ pain, fever", assessedCondition: "Suspected acute appendicitis", incidentLocation: "Seodaemun-gu Sinchon-dong", ambulanceId: "AMB-SEO-007", etaToHospital: "8 min", requestTimestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), status: "pending", hospitalId: THIS_HOSPITAL_ID },
  { id: "REQ20240728003", patientInfo: { age: 72, gender: "Male", briefHistory: "Fell from ladder" }, primarySymptoms: "Head trauma, loss of consciousness", assessedCondition: "Traumatic brain injury", incidentLocation: "Gangnam-gu Samsung-dong", ambulanceId: "AMB-SEO-003", etaToHospital: "15 min", requestTimestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), status: "accepted", hospitalId: THIS_HOSPITAL_ID },
  { id: "REQ20240728004", patientInfo: { age: 5, gender: "Child (Male)" }, primarySymptoms: "High fever, difficulty breathing", assessedCondition: "Severe asthma attack", incidentLocation: "Songpa-gu Jamsil-dong", ambulanceId: "AMB-SEO-009", etaToHospital: "5 min", requestTimestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(), status: "pending", hospitalId: THIS_HOSPITAL_ID },
  { id: "REQ20240728005", patientInfo: { age: 40, gender: "Female" }, primarySymptoms: "Anaphylactic shock after bee sting", assessedCondition: "Anaphylaxis", incidentLocation: "Mapo-gu Yeonnam-dong", ambulanceId: "AMB-SEO-005", etaToHospital: "7 min", requestTimestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), status: "rejected", hospitalId: THIS_HOSPITAL_ID, rejectionReason: "ICU bed shortage" },
];

export default function HospitalPortalPage() {
  const [requests, setRequests] = useState<PatientAdmissionRequest[]>(initialMockRequests);
  const [selectedRequest, setSelectedRequest] = useState<PatientAdmissionRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleUpdateRequestStatus = (id: string, newStatus: 'accepted' | 'rejected', reason?: string) => {
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === id ? { ...req, status: newStatus, rejectionReason: newStatus === 'rejected' ? reason : undefined } : req
      )
    );
    toast({
      title: `Request ${newStatus === 'accepted' ? 'Accepted' : 'Rejected'}`,
      description: `Patient transfer request ${id} has been updated.`,
      variant: newStatus === 'accepted' ? "default" : "destructive",
    });
    if (newStatus === 'rejected') {
      setIsRejectDialogOpen(false);
      setRejectionReason("");
    }
  };

  const openRejectDialog = (request: PatientAdmissionRequest) => {
    setSelectedRequest(request);
    setIsRejectDialogOpen(true);
  };

  const refreshRequests = () => {
    toast({ title: "Refreshing data...", description: "Fetching latest transfer requests." });
    const seoulDistricts = ["Gangnam-gu", "Seocho-gu", "Songpa-gu", "Jongno-gu", "Jung-gu", "Yongsan-gu", "Mapo-gu", "Yeongdeungpo-gu", "Dongjak-gu", "Gwanak-gu"];
    const randomDistrict = seoulDistricts[Math.floor(Math.random() * seoulDistricts.length)];
    
    const newMockRequest: PatientAdmissionRequest = { 
      id: `REQ${new Date().toISOString().slice(0,10).replace(/-/g,'')}${String(Math.floor(Math.random()*900)+100).padStart(3, '0')}`, 
      patientInfo: { age: Math.floor(Math.random()*70)+10, gender: Math.random() > 0.5 ? "Male" : "Female" }, 
      primarySymptoms: "New critical symptoms", 
      assessedCondition: "Critical", 
      incidentLocation: `${randomDistrict} area`,
      ambulanceId: `AMB-SEO-${String(Math.floor(Math.random()*20)+1).padStart(3, '0')}`, 
      etaToHospital: `${Math.floor(Math.random()*15)+5} min`, 
      requestTimestamp: new Date().toISOString(), 
      status: "pending", 
      hospitalId: THIS_HOSPITAL_ID 
    };
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    if (pendingCount < 5) { // Limit adding new requests if too many are pending
      setRequests(prev => [newMockRequest, ...prev.filter(r => r.id !== newMockRequest.id).slice(0, 9)]);
    } else {
        toast({ title: "Data Refresh Skipped", description: "Too many pending requests. Process existing ones first."});
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshRequests, 30000); 
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests]); // Add requests to dependency array to recalculate pendingCount correctly

  const pendingRequests = requests.filter(req => req.status === 'pending').sort((a,b) => new Date(b.requestTimestamp).getTime() - new Date(a.requestTimestamp).getTime());
  const otherRequests = requests.filter(req => req.status !== 'pending').sort((a,b) => new Date(b.requestTimestamp).getTime() - new Date(a.requestTimestamp).getTime());
  
  const sortedRequests = [...pendingRequests, ...otherRequests];

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Hospital className="h-7 w-7 text-primary" />
              <CardTitle className="text-2xl">{THIS_HOSPITAL_NAME} - Patient Transfer Management Portal</CardTitle>
            </div>
            <CardDescription>Manage incoming patient transfer requests in real-time. (Target Hospital: {THIS_HOSPITAL_NAME})</CardDescription>
          </div>
          <Button onClick={refreshRequests} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="bg-yellow-500/10 border-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingRequests.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accepted Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requests.filter(r => r.status === 'accepted').length}</div>
              </CardContent>
            </Card>
             <Card className="bg-red-500/10 border-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requests.filter(r => r.status === 'rejected').length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Bed Occupancy</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85% <span className="text-xs text-muted-foreground">Occupied</span></div>
              </CardContent>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Request ID</TableHead>
                <TableHead>Patient Info</TableHead>
                <TableHead>Primary Symptoms/Condition</TableHead>
                <TableHead>Transporting Ambulance</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Request Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[200px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRequests.map((req) => (
                <TableRow key={req.id} className={req.status === 'pending' ? 'bg-yellow-500/5' : ''}>
                  <TableCell className="font-medium">{req.id}</TableCell>
                  <TableCell>
                    {req.patientInfo.age && `${req.patientInfo.age} y/o `}{req.patientInfo.gender || ''}
                    {req.patientInfo.briefHistory && <p className="text-xs text-muted-foreground">{req.patientInfo.briefHistory}</p>}
                     <p className="text-xs text-muted-foreground">Incident Loc: {req.incidentLocation}</p>
                  </TableCell>
                  <TableCell>
                    {req.assessedCondition}
                    {req.primarySymptoms && <p className="text-xs text-muted-foreground">{req.primarySymptoms}</p>}
                  </TableCell>
                  <TableCell>{req.ambulanceId}</TableCell>
                  <TableCell>{req.etaToHospital}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(req.requestTimestamp), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <Badge variant={
                      req.status === "pending" ? "secondary" :
                      req.status === "accepted" ? "default" : 
                      "destructive" 
                    } className={
                      req.status === "accepted" ? "bg-green-500 hover:bg-green-600 text-white" : ""
                    }>
                      {req.status === "pending" ? "Pending" : req.status === "accepted" ? "Accepted" : "Rejected"}
                    </Badge>
                    {req.status === 'rejected' && req.rejectionReason && (
                        <p className="text-xs text-muted-foreground mt-1">Reason: {req.rejectionReason}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === "pending" && (
                      <div className="space-x-2">
                        <Button variant="default" size="sm" onClick={() => handleUpdateRequestStatus(req.id, "accepted")} className="bg-green-500 hover:bg-green-600">
                          <CheckCircle className="mr-1 h-4 w-4" /> Accept
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => openRejectDialog(req)}>
                          <XCircle className="mr-1 h-4 w-4" /> Reject
                        </Button>
                      </div>
                    )}
                     {req.status !== "pending" && (
                        <span className="text-xs text-muted-foreground">Actioned</span>
                     )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {requests.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No transfer requests at the moment.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transfer Request: {selectedRequest?.id}</DialogTitle>
            <DialogDescription>
              Please enter the reason for rejecting the patient transfer request. This information is crucial for EOC and ambulance rerouting.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="rejectionReason">Rejection Reason</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="E.g., ICU bed shortage, specialist unavailable, hospital at full capacity, etc."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedRequest && handleUpdateRequestStatus(selectedRequest.id, "rejected", rejectionReason)}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    