import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Hospital, Siren } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-4xl mb-12 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-4 text-primary">ResQ</h1>
        <p className="text-xl text-slate-600 mb-8">응급 의료 연결 시스템</p>
      </div>

      <div className="w-full max-w-4xl">
        <Card className="shadow-xl mb-8 border-primary/20 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl">사용자 유형 선택</CardTitle>
            <CardDescription>역할에 따라 적절한 인터페이스를 이용하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              {/* 구급대원 카드 */}
              <Link href="/emergency-dispatch" className="group">
                <Card className="h-full transition-all shadow-md hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-blue-500 overflow-hidden">
                  <div className="h-40 bg-blue-500 flex items-center justify-center overflow-hidden">
                    <Siren className="h-20 w-20 text-white opacity-75 group-hover:opacity-100 transition-all" />
                  </div>
                  <CardHeader>
                    <CardTitle className="group-hover:text-blue-500 transition-colors">구급대원용</CardTitle>
                    <CardDescription>
                      응급 환자 정보 입력 및 병원 추천, 환자 이송 요청을 관리합니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-center">• 환자 상태 AI 분석</li>
                      <li className="flex items-center">• 최적 병원 추천</li>
                      <li className="flex items-center">• 병원 수락/거부 알림</li>
                    </ul>
                    <Button className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white">
                      구급대원 인터페이스 입장
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* 병원 카드 */}
              <Link href="/hospital-portal" className="group">
                <Card className="h-full transition-all shadow-md hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-green-500 overflow-hidden">
                  <div className="h-40 bg-green-500 flex items-center justify-center overflow-hidden">
                    <Hospital className="h-20 w-20 text-white opacity-75 group-hover:opacity-100 transition-all" />
                  </div>
                  <CardHeader>
                    <CardTitle className="group-hover:text-green-500 transition-colors">병원용</CardTitle>
                    <CardDescription>
                      환자 이송 요청을 관리하고 구급대원과 실시간으로 소통합니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-center">• 실시간 이송 요청 수신</li>
                      <li className="flex items-center">• 요청 승인/거부 관리</li>
                      <li className="flex items-center">• 구급대원 피드백 제공</li>
                    </ul>
                    <Button className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white">
                      병원 포털 입장
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-8 text-slate-500">
          <p className="text-sm mb-2">© 2024 ResQ 응급 의료 연결 시스템</p>
          <div className="flex justify-center items-center space-x-2 mt-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-xs">이 시스템은 시연용으로, 실제 응급 상황에서는 112나 119로 즉시 전화하세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

    