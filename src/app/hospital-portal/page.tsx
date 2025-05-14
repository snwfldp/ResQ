
"use client";

import { useState, useEffect } from "react";
import type { PatientAdmissionRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertTriangle, Users, ArrowUpDown, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const initialMockRequests: PatientAdmissionRequest[] = [
  { id: "REQ001", patientInfo: { age: 58, gender: "Male", briefHistory: "Known cardiac issues" }, primarySymptoms: "Severe chest pain, shortness of breath", vitalSigns: "BP: 160/100, HR: 110, SpO2: 92%", assessedCondition: "Suspected Myocardial Infarction", ambulanceId: "AMB012", etaToHospital: "12 minutes", requestTimestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), status: "pending", hospitalId: "HOS001" },
  { id: "REQ002", patientInfo: { age: 25, gender: "Female" }, primarySymptoms: "Right lower quadrant abdominal pain, fever", assessedCondition: "Suspected Appendicitis", ambulanceId: "AMB007", etaToHospital: "8 minutes", requestTimestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), status: "pending", hospitalId: "HOS001" },
  { id: "REQ003", patientInfo: { age: 72, gender: "Male", briefHistory: "Fall from ladder" }, primarySymptoms: "Head injury, loss of consciousness", assessedCondition: "Traumatic Brain Injury", ambulanceId: "AMB003", etaToHospital: "15 minutes", requestTimestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), status: "accepted", hospitalId: "HOS001" },
  { id: "REQ004", patientInfo: { age: 5, gender: "Child" }, primarySymptoms: "High fever, difficulty breathing", assessedCondition: "Severe Asthma Attack", ambulanceId: "AMB009", etaToHospital: "5 minutes", requestTimestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(), status: "pending", hospitalId: "HOS001" },
  { id: "REQ005", patientInfo: { age: 40, gender: "Female" }, primarySymptoms: "Anaphylactic shock after bee sting", assessedCondition: "Anaphylaxis", ambulanceId: "AMB005", etaToHospital: "7 minutes", requestTimestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), status: "rejected", hospitalId: "HOS001", rejectionReason: "No ICU beds available" },
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
      description: `Patient admission request ${id} has been updated.`,
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
    // Simulate fetching new data
    toast({ title: "Refreshing data...", description: "Fetching latest admission requests." });
    // In a real app, you'd fetch from an API. Here we just re-set mock data with a slight change.
    const newMockRequest: PatientAdmissionRequest = { 
      id: `REQ${String(Math.floor(Math.random()*900)+100).padStart(3, '0')}`, 
      patientInfo: { age: Math.floor(Math.random()*70)+10, gender: Math.random() > 0.5 ? "Male" : "Female" }, 
      primarySymptoms: "New emergent symptoms", 
      assessedCondition: "Critical", 
      ambulanceId: `AMB${String(Math.floor(Math.random()*20)+1).padStart(3, '0')}`, 
      etaToHospital: `${Math.floor(Math.random()*15)+5} minutes`, 
      requestTimestamp: new Date().toISOString(), 
      status: "pending", 
      hospitalId: "HOS001" 
    };
    // Add new request only if not too many are pending already
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    if (pendingCount < 5) {
      setRequests(prev => [newMockRequest, ...prev.filter(r => r.id !== newMockRequest.id).slice(0, 9)]);
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshRequests, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests]); // Add requests to dependency array to avoid stale closure issues if refresh logic changes

  const pendingRequests = requests.filter(req => req.status === 'pending').sort((a,b) => new Date(b.requestTimestamp).getTime() - new Date(a.requestTimestamp).getTime());
  const otherRequests = requests.filter(req => req.status !== 'pending').sort((a,b) => new Date(b.requestTimestamp).getTime() - new Date(a.requestTimestamp).getTime());
  
  const sortedRequests = [...pendingRequests, ...otherRequests];

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Hospital Admission Portal</CardTitle>
            <CardDescription>Manage incoming patient admission requests in real-time.</CardDescription>
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
                <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85% <span className="text-xs text-muted-foreground">Full</span></div>
              </CardContent>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Request ID</TableHead>
                <TableHead>Patient Info</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRequests.map((req) => (
                <TableRow key={req.id} className={req.status === 'pending' ? 'bg-yellow-500/5' : ''}>
                  <TableCell className="font-medium">{req.id}</TableCell>
                  <TableCell>
                    {req.patientInfo.age && `${req.patientInfo.age}yo `}{req.patientInfo.gender || ''}
                    {req.patientInfo.briefHistory && <p className="text-xs text-muted-foreground">{req.patientInfo.briefHistory}</p>}
                  </TableCell>
                  <TableCell>
                    {req.assessedCondition}
                    {req.primarySymptoms && <p className="text-xs text-muted-foreground">{req.primarySymptoms}</p>}
                  </TableCell>
                  <TableCell>{req.etaToHospital}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(req.requestTimestamp), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <Badge variant={
                      req.status === "pending" ? "secondary" :
                      req.status === "accepted" ? "default" : // Using default for accepted to be primary color
                      "destructive" // Using destructive for rejected
                    } className={
                      req.status === "accepted" ? "bg-green-500 hover:bg-green-600 text-white" : ""
                    }>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
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
                        <span className="text-xs text-muted-foreground">No actions available</span>
                     )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {requests.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No admission requests at this time.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Admission Request: {selectedRequest?.id}</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this patient admission request. This information is crucial for EOC and ambulance rerouting.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="rejectionReason">Rejection Reason</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="E.g., No ICU beds available, specialist unavailable, at capacity..."
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
