// 병원과 Emergency Dispatch 간 통신을 위한 타입과 이벤트 시스템
import type { PatientAdmissionRequest } from "@/types";

// 알림 타입 정의
export type HospitalNotificationType = 'ACCEPTED' | 'REJECTED' | 'DIVERTED';

export interface HospitalNotification {
  type: HospitalNotificationType;
  request: PatientAdmissionRequest;
  timestamp: string;
  message?: string;
  id: string; // 알림 고유 ID 추가
  isRead?: boolean; // 읽음 상태 추가
}

// 로컬 스토리지 키
const NOTIFICATIONS_STORAGE_KEY = 'resq_notifications';

// 이벤트 리스너 타입 정의
type NotificationListener = (notification: HospitalNotification) => void;

// 알림 서비스 클래스
class HospitalNotificationService {
  private listeners: NotificationListener[] = [];

  constructor() {
    // 페이지 로드 시 로컬 스토리지 체크 및 이벤트 설정
    if (typeof window !== 'undefined') {
      // 스토리지 이벤트 리스너 설정
      window.addEventListener('storage', this.handleStorageChange);
    }
  }

  // 스토리지 변경 감지 핸들러
  private handleStorageChange = (event: StorageEvent) => {
    if (event.key === NOTIFICATIONS_STORAGE_KEY && event.newValue) {
      try {
        const newNotifications = JSON.parse(event.newValue);
        
        // 가장 최근 알림 가져오기
        if (newNotifications.length > 0) {
          const latestNotification = newNotifications[0];
          // 모든 리스너에게 알림
          this.broadcastToListeners(latestNotification);
        }
      } catch (error) {
        console.error('Error parsing storage notification:', error);
      }
    }
  };

  private broadcastToListeners(notification: HospitalNotification): void {
    this.listeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  // 리스너 등록
  public subscribe(listener: NotificationListener): () => void {
    this.listeners.push(listener);
    
    // 구독 취소 함수 반환
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // 알림 발생
  public notify(notification: HospitalNotification): void {
    // ID가 없는 경우 생성
    if (!notification.id) {
      notification.id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // 기존 알림 불러오기
    const existingNotifications = this.getNotifications();
    
    // 알림 저장 (맨 앞에 추가)
    const updatedNotifications = [notification, ...existingNotifications];
    this.saveNotifications(updatedNotifications);
    
    // 리스너에게 알림
    this.broadcastToListeners(notification);
  }

  // 로컬 스토리지에서 모든 알림 불러오기
  public getNotifications(): HospitalNotification[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading notifications from storage:', error);
      return [];
    }
  }

  // 로컬 스토리지에 알림 저장
  private saveNotifications(notifications: HospitalNotification[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      // 최근 20개만 유지
      const trimmedNotifications = notifications.slice(0, 20);
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(trimmedNotifications));
    } catch (error) {
      console.error('Error saving notifications to storage:', error);
    }
  }

  // 알림을 읽음으로 표시
  public markAsRead(notificationId: string): void {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    this.saveNotifications(updatedNotifications);
  }

  // 모든 알림 읽음으로 표시
  public markAllAsRead(): void {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
    this.saveNotifications(updatedNotifications);
  }
}

// 싱글턴 인스턴스 생성
export const hospitalNotificationService = new HospitalNotificationService(); 