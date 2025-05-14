
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

const THIS_HOSPITAL_ID = "HOS_SNUH"; // 이 포털이 속한 병원 ID (서울대학교병원)
const THIS_HOSPITAL_NAME = "서울대학교병원";

const initialMockRequests: PatientAdmissionRequest[] = [
  { id: "REQ20240728001", patientInfo: { age: 58, gender: "남성", briefHistory: "심장 질환 기왕력" }, primarySymptoms: "극심한 흉통, 호흡곤란", vitalSigns: "BP: 160/100, HR: 110, SpO2: 92%", assessedCondition: "급성 심근경색 의심", incidentLocation: "종로구 대학로", ambulanceId: "AMB-SEO-012", etaToHospital: "12분", requestTimestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), status: "pending", hospitalId: THIS_HOSPITAL_ID },
  { id: "REQ20240728002", patientInfo: { age: 25, gender: "여성" }, primarySymptoms: "우하복부 통증, 발열", assessedCondition: "급성 충수염 의심", incidentLocation: "서대문구 신촌동", ambulanceId: "AMB-SEO-007", etaToHospital: "8분", requestTimestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), status: "pending", hospitalId: THIS_HOSPITAL_ID },
  { id: "REQ20240728003", patientInfo: { age: 72, gender: "남성", briefHistory: "사다리에서 낙상" }, primarySymptoms: "두부 외상, 의식 소실", assessedCondition: "외상성 뇌손상", incidentLocation: "강남구 삼성동", ambulanceId: "AMB-SEO-003", etaToHospital: "15분", requestTimestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), status: "accepted", hospitalId: THIS_HOSPITAL_ID },
  { id: "REQ20240728004", patientInfo: { age: 5, gender: "소아" }, primarySymptoms: "고열, 호흡 곤란", assessedCondition: "중증 천식 발작", incidentLocation: "송파구 잠실동", ambulanceId: "AMB-SEO-009", etaToHospital: "5분", requestTimestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(), status: "pending", hospitalId: THIS_HOSPITAL_ID },
  { id: "REQ20240728005", patientInfo: { age: 40, gender: "여성" }, primarySymptoms: "벌 쏘임 후 아나필락시스 쇼크", assessedCondition: "아나필락시스", incidentLocation: "마포구 연남동", ambulanceId: "AMB-SEO-005", etaToHospital: "7분", requestTimestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), status: "rejected", hospitalId: THIS_HOSPITAL_ID, rejectionReason: "중환자실 병상 부족" },
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
      title: `요청 ${newStatus === 'accepted' ? '수락됨' : '거절됨'}`,
      description: `환자 이송 요청 ${id}이(가) 업데이트되었습니다.`,
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
    toast({ title: "데이터 새로고침 중...", description: "최신 이송 요청을 가져옵니다." });
    const seoulDistricts = ["강남구", "서초구", "송파구", "종로구", "중구", "용산구", "마포구", "영등포구", "동작구", "관악구"];
    const randomDistrict = seoulDistricts[Math.floor(Math.random() * seoulDistricts.length)];
    
    const newMockRequest: PatientAdmissionRequest = { 
      id: `REQ${new Date().toISOString().slice(0,10).replace(/-/g,'')}${String(Math.floor(Math.random()*900)+100).padStart(3, '0')}`, 
      patientInfo: { age: Math.floor(Math.random()*70)+10, gender: Math.random() > 0.5 ? "남성" : "여성" }, 
      primarySymptoms: "새로운 긴급 증상", 
      assessedCondition: "위급", 
      incidentLocation: `${randomDistrict} 일대`,
      ambulanceId: `AMB-SEO-${String(Math.floor(Math.random()*20)+1).padStart(3, '0')}`, 
      etaToHospital: `${Math.floor(Math.random()*15)+5}분`, 
      requestTimestamp: new Date().toISOString(), 
      status: "pending", 
      hospitalId: THIS_HOSPITAL_ID 
    };
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    if (pendingCount < 5) {
      setRequests(prev => [newMockRequest, ...prev.filter(r => r.id !== newMockRequest.id).slice(0, 9)]);
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshRequests, 30000); 
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests]); 

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
              <CardTitle className="text-2xl">{THIS_HOSPITAL_NAME} - 병원 이송 관리 포털</CardTitle>
            </div>
            <CardDescription>실시간으로 들어오는 환자 이송 요청을 관리합니다. (대상 병원: {THIS_HOSPITAL_NAME})</CardDescription>
          </div>
          <Button onClick={refreshRequests} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> 새로고침
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="bg-yellow-500/10 border-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">대기 중인 요청</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingRequests.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">오늘 수락 건</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requests.filter(r => r.status === 'accepted').length}</div>
              </CardContent>
            </Card>
             <Card className="bg-red-500/10 border-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">오늘 거절 건</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requests.filter(r => r.status === 'rejected').length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">현재 병상 가동률</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85% <span className="text-xs text-muted-foreground">사용 중</span></div>
              </CardContent>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">요청 ID</TableHead>
                <TableHead>환자 정보</TableHead>
                <TableHead>주요 증상/상태</TableHead>
                <TableHead>이송 구급차</TableHead>
                <TableHead>도착예정(ETA)</TableHead>
                <TableHead>요청 시간</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right w-[200px]">조치</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRequests.map((req) => (
                <TableRow key={req.id} className={req.status === 'pending' ? 'bg-yellow-500/5' : ''}>
                  <TableCell className="font-medium">{req.id}</TableCell>
                  <TableCell>
                    {req.patientInfo.age && `${req.patientInfo.age}세 `}{req.patientInfo.gender || ''}
                    {req.patientInfo.briefHistory && <p className="text-xs text-muted-foreground">{req.patientInfo.briefHistory}</p>}
                     <p className="text-xs text-muted-foreground">발생위치: {req.incidentLocation}</p>
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
                      {req.status === "pending" ? "대기중" : req.status === "accepted" ? "수락됨" : "거절됨"}
                    </Badge>
                    {req.status === 'rejected' && req.rejectionReason && (
                        <p className="text-xs text-muted-foreground mt-1">사유: {req.rejectionReason}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === "pending" && (
                      <div className="space-x-2">
                        <Button variant="default" size="sm" onClick={() => handleUpdateRequestStatus(req.id, "accepted")} className="bg-green-500 hover:bg-green-600">
                          <CheckCircle className="mr-1 h-4 w-4" /> 수락
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => openRejectDialog(req)}>
                          <XCircle className="mr-1 h-4 w-4" /> 거절
                        </Button>
                      </div>
                    )}
                     {req.status !== "pending" && (
                        <span className="text-xs text-muted-foreground">조치 완료</span>
                     )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {requests.length === 0 && (
            <p className="text-center text-muted-foreground py-8">현재 이송 요청이 없습니다.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이송 요청 거절: {selectedRequest?.id}</DialogTitle>
            <DialogDescription>
              환자 이송 요청을 거절하는 사유를 입력해주세요. 이 정보는 EOC 및 구급차 경로 재지정에 중요하게 활용됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="rejectionReason">거절 사유</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="예: 중환자실 병상 부족, 해당 전문의 부재, 병원 수용 능력 초과 등"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>취소</Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedRequest && handleUpdateRequestStatus(selectedRequest.id, "rejected", rejectionReason)}
              disabled={!rejectionReason.trim()}
            >
              거절 확정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
