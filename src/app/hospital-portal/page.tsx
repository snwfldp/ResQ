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
import { hospitalNotificationService } from "@/lib/hospital-notification";

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

  // 페이지 로드 시 로컬 스토리지에서 이전 요청 상태 확인
  useEffect(() => {
    // 로컬 스토리지에서 이전 알림 확인
    const notifications = hospitalNotificationService.getNotifications();
    
    // 기존 요청 상태 업데이트
    if (notifications.length > 0) {
      // 요청 ID별로 가장 최신 상태 추출
      const latestStatusByRequestId = new Map<string, PatientAdmissionRequest>();
      
      notifications.forEach(notification => {
        const request = notification.request;
        if (!latestStatusByRequestId.has(request.id) || 
            new Date(notification.timestamp) > new Date(latestStatusByRequestId.get(request.id)!.requestTimestamp)) {
          latestStatusByRequestId.set(request.id, request);
        }
      });
      
      // 기존 요청 업데이트
      setRequests(prevRequests => 
        prevRequests.map(req => {
          const updatedReq = latestStatusByRequestId.get(req.id);
          return updatedReq && updatedReq.status !== 'pending' ? updatedReq : req;
        })
      );
    }

    // 구급대원 페이지에서 생성된 요청 확인
    if (typeof window !== 'undefined') {
      // 로컬 스토리지에서 모든 키 가져오기
      const allKeys = Object.keys(localStorage);
      
      // 병원 요청 키 필터링
      const requestKeys = allKeys.filter(key => key.startsWith('hospital_request_'));
      
      if (requestKeys.length > 0) {
        const newRequests: PatientAdmissionRequest[] = [];
        
        // 각 요청 처리
        requestKeys.forEach(key => {
          try {
            const requestData = localStorage.getItem(key);
            if (requestData) {
              const request = JSON.parse(requestData) as PatientAdmissionRequest;
              
              // 이 병원에 대한 요청만 표시
              if (request.hospitalId === THIS_HOSPITAL_NAME) {
                newRequests.push(request);
              }
            }
          } catch (error) {
            console.error('Error parsing request data:', error);
          }
        });
        
        // 새 요청 추가 (중복 방지)
        if (newRequests.length > 0) {
          setRequests(prevRequests => {
            const newRequestIds = new Set(newRequests.map(r => r.id));
            const filteredPrevRequests = prevRequests.filter(r => !newRequestIds.has(r.id));
            return [...newRequests, ...filteredPrevRequests.slice(0, 9)];
          });
          return; // 로컬 스토리지에서 요청을 찾았으면 추가 요청 생성하지 않음
        }
      }
    }
  }, []);

  const handleUpdateRequestStatus = (id: string, newStatus: 'accepted' | 'rejected', reason?: string) => {
    const updatedRequest = requests.find(req => req.id === id);
    if (!updatedRequest) return;

    const updatedRequests = requests.map(req =>
      req.id === id ? { ...req, status: newStatus, rejectionReason: newStatus === 'rejected' ? reason : undefined } : req
    );
    setRequests(updatedRequests);

    toast({
      title: `요청 ${newStatus === 'accepted' ? '수락됨' : '거부됨'}`,
      description: `환자 이송 요청 ${id}가 업데이트되었습니다.`,
      variant: newStatus === 'accepted' ? "default" : "destructive",
    });

    // 로컬 스토리지에서 요청 삭제 (처리 완료되었으므로)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`hospital_request_${id}`);
    }

    // 알림 생성 및 저장
    hospitalNotificationService.notify({
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: newStatus === 'accepted' ? 'ACCEPTED' : 'REJECTED',
      request: { 
        ...updatedRequest, 
        status: newStatus, 
        rejectionReason: newStatus === 'rejected' ? reason : undefined 
      },
      timestamp: new Date().toISOString(),
      message: newStatus === 'accepted' 
        ? `${THIS_HOSPITAL_NAME}에서 환자 이송 요청을 수락했습니다.` 
        : `${THIS_HOSPITAL_NAME}에서 환자 이송 요청을 거부했습니다. 사유: ${reason}`
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
    toast({ title: "데이터 새로고침 중...", description: "최신 이송 요청을 불러오는 중입니다." });
    
    // 구급대원 페이지에서 생성된 요청 확인
    if (typeof window !== 'undefined') {
      // 로컬 스토리지에서 모든 키 가져오기
      const allKeys = Object.keys(localStorage);
      
      // 병원 요청 키 필터링
      const requestKeys = allKeys.filter(key => key.startsWith('hospital_request_'));
      
      if (requestKeys.length > 0) {
        const newRequests: PatientAdmissionRequest[] = [];
        
        // 각 요청 처리
        requestKeys.forEach(key => {
          try {
            const requestData = localStorage.getItem(key);
            if (requestData) {
              const request = JSON.parse(requestData) as PatientAdmissionRequest;
              
              // 이 병원에 대한 요청만 표시
              if (request.hospitalId === THIS_HOSPITAL_NAME) {
                newRequests.push(request);
              }
            }
          } catch (error) {
            console.error('Error parsing request data:', error);
          }
        });
        
        // 새 요청 추가 (중복 방지)
        if (newRequests.length > 0) {
          setRequests(prevRequests => {
            const newRequestIds = new Set(newRequests.map(r => r.id));
            const filteredPrevRequests = prevRequests.filter(r => !newRequestIds.has(r.id));
            return [...newRequests, ...filteredPrevRequests.slice(0, 9)];
          });
          return; // 로컬 스토리지에서 요청을 찾았으면 추가 요청 생성하지 않음
        }
      }
    }
    
    // 로컬 스토리지에서 요청을 찾지 못한 경우, 임의의 요청 생성
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
        toast({ title: "데이터 새로고침 건너뜀", description: "대기 중인 요청이 너무 많습니다. 먼저 기존 요청을 처리하세요."});
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
              <CardTitle className="text-2xl">{THIS_HOSPITAL_NAME} - 환자 이송 관리 포털</CardTitle>
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
                <CardTitle className="text-sm font-medium">오늘 수락</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requests.filter(r => r.status === 'accepted').length}</div>
              </CardContent>
            </Card>
             <Card className="bg-red-500/10 border-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">오늘 거부</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requests.filter(r => r.status === 'rejected').length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">현재 병상 점유율</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85% <span className="text-xs text-muted-foreground">점유됨</span></div>
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
                <TableHead>예상시간</TableHead>
                <TableHead>요청 시간</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right w-[200px]">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRequests.map((req) => (
                <TableRow key={req.id} className={req.status === 'pending' ? 'bg-yellow-500/5' : ''}>
                  <TableCell className="font-medium">{req.id}</TableCell>
                  <TableCell>
                    {req.patientInfo.age && `${req.patientInfo.age}세 `}{req.patientInfo.gender || ''}
                    {req.patientInfo.briefHistory && <p className="text-xs text-muted-foreground">{req.patientInfo.briefHistory}</p>}
                     <p className="text-xs text-muted-foreground">사고 위치: {req.incidentLocation}</p>
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
                      {req.status === "pending" ? "대기 중" : req.status === "accepted" ? "수락됨" : "거부됨"}
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
                          <XCircle className="mr-1 h-4 w-4" /> 거부
                        </Button>
                      </div>
                    )}
                     {req.status !== "pending" && (
                        <span className="text-xs text-muted-foreground">처리됨</span>
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
            <DialogTitle>이송 요청 거부: {selectedRequest?.id}</DialogTitle>
            <DialogDescription>
              환자 이송 요청을 거부하는 이유를 입력해주세요. 이 정보는 응급의료센터와 구급차 재배정에 중요합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="rejectionReason">거부 사유</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="예: ICU 병상 부족, 전문의 부재, 병원 만원 등"
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
              거부 확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    