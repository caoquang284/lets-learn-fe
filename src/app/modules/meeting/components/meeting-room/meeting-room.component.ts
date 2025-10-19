import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu'; // Thêm nếu dùng Angular Material cho menu
import { WhiteboardComponent } from '../whiteboard/whiteboard.component';

interface Participant {
  name: string;
  color: string;
  isMicOn: boolean;
  role: string;
}

interface Message {
  sender: string;
  text: string;
  time: string;
}

interface WhiteboardAction {
  type: 'draw' | 'clear' | 'text' | 'shape';
  data: any;
  timestamp: number;
  userId: string;
}

@Component({
  selector: 'app-meeting-room',
  standalone: true,
  imports: [CommonModule, FormsModule, MatMenuModule, WhiteboardComponent], // Thêm MatMenuModule nếu dùng
  templateUrl: './meeting-room.component.html',
  styleUrls: ['./meeting-room.component.scss']
})
export class MeetingRoomComponent implements OnDestroy {
  isMicOn = true;
  isCameraOn = false;
  isChatOpen = false;
  isParticipantsOpen = true; // Mặc định mở participants
  isScreenSharing = false;
  isSpeaking = false;
  isWhiteboardOpen = false;
  messages: Message[] = [];
  whiteboardActions: WhiteboardAction[] = []; // Store all whiteboard actions for real-time sync
  participants: Participant[] = [
    { name: 'You', color: '#3b82f6', isMicOn: true, role: 'Host' }
  ];
  draft = '';
  currentUser = 'You'; // Giả lập

  // Video element để hiển thị camera của chính mình
  @ViewChild('selfVideo') selfVideoRef?: ElementRef<HTMLVideoElement>;

  // Media/WebAudio state
  private audioStream?: MediaStream;
  private videoStream?: MediaStream;
  private screenStream?: MediaStream;
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private dataArray?: Uint8Array;
  private speakingTimer?: number;

  // Screen share video element
  @ViewChild('screenVideo') screenVideoRef?: ElementRef<HTMLVideoElement>;

  get otherParticipants(): Participant[] {
    return this.participants.filter(p => p.name !== this.currentUser);
  }
  get isAlone(): boolean {
    return this.otherParticipants.length === 0;
  }
  get self(): Participant {
    return (
      this.participants.find(p => p.name === this.currentUser) ||
      { name: this.currentUser, color: '#3b82f6', isMicOn: this.isMicOn, role: 'Host' }
    );
  }

  async toggleMic() {
    if (this.isMicOn) {
      // Turn off mic
      this.isMicOn = false;
      this.stopMic();
      return;
    }
    // Turn on mic with permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioStream = stream;
      this.isMicOn = true;
      this.startSpeakingDetection(stream);
    } catch (err) {
      console.error('Failed to access microphone:', err);
      alert('Cannot access microphone. Please check browser permissions.');
      this.isMicOn = false;
    }
  }

  async toggleCam() {
    if (this.isCameraOn) {
      // Turn off camera
      this.isCameraOn = false;
      this.stopCamera();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      this.videoStream = stream;
      this.isCameraOn = true;
      // Bind stream to video element
      setTimeout(() => {
        const videoEl = this.selfVideoRef?.nativeElement;
        if (videoEl) {
          videoEl.srcObject = stream;
          videoEl.muted = true; // tránh echo
          videoEl.play().catch(() => {/* ignore autoplay errors */});
        }
      });
    } catch (err) {
      console.error('Failed to access camera:', err);
      alert('Cannot access camera. Please check browser permissions.');
      this.isCameraOn = false;
    }
  }

  private startSpeakingDetection(stream: MediaStream) {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.dataArray = new Uint8Array(this.analyser.fftSize);
      source.connect(this.analyser);

      const updateSpeaking = () => {
        if (!this.analyser || !this.dataArray) return;
        // Một số môi trường TypeScript có sự khác biệt lib DOM, ép kiểu any để tránh lỗi type
        (this.analyser as any).getByteTimeDomainData(this.dataArray as any);
        // Tính RMS để phát hiện nói
        let sumSquares = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
          const v = (this.dataArray[i] - 128) / 128; // [-1,1]
          sumSquares += v * v;
        }
        const rms = Math.sqrt(sumSquares / this.dataArray.length);
        // Ngưỡng đơn giản, có thể tinh chỉnh
        const speaking = rms > 0.04;

        // Giảm nhấp nháy: giữ trạng thái nói ít nhất 250ms
        if (speaking) {
          this.isSpeaking = true;
          if (this.speakingTimer) window.clearTimeout(this.speakingTimer);
          this.speakingTimer = window.setTimeout(() => { this.isSpeaking = false; }, 250);
        }
        requestAnimationFrame(updateSpeaking);
      };
      requestAnimationFrame(updateSpeaking);
    } catch (e) {
      console.warn('AudioContext not available for speaking detection.', e);
    }
  }

  private stopMic() {
    try {
      this.audioStream?.getTracks().forEach(t => t.stop());
    } catch {}
    this.audioStream = undefined;
    this.isSpeaking = false;
    if (this.speakingTimer) window.clearTimeout(this.speakingTimer);
    try {
      this.analyser?.disconnect();
      this.audioContext?.close();
    } catch {}
    this.analyser = undefined;
    this.audioContext = undefined;
    this.dataArray = undefined;
  }

  private stopCamera() {
    try {
      this.videoStream?.getTracks().forEach(t => t.stop());
    } catch {}
    this.videoStream = undefined;
    const videoEl = this.selfVideoRef?.nativeElement;
    if (videoEl) {
      try { (videoEl.srcObject as MediaStream | null) = null; } catch {}
    }
  }

  async shareScreen() {
    if (this.isScreenSharing) {
      // Stop screen sharing
      this.stopScreenShare();
      return;
    }

    // Start screen sharing
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor', // Prefer full screen
        } as any,
        audio: false // Set to true if you want system audio
      });

      this.screenStream = stream;
      this.isScreenSharing = true;

      // Bind stream to video element
      setTimeout(() => {
        const videoEl = this.screenVideoRef?.nativeElement;
        if (videoEl) {
          videoEl.srcObject = stream;
          videoEl.muted = true;
          videoEl.play().catch(() => {/* ignore autoplay errors */});
        }
      });

      // Listen for when user stops sharing via browser UI
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopScreenShare();
      });

    } catch (err) {
      console.error('Failed to start screen sharing:', err);
      if ((err as any).name === 'NotAllowedError') {
        alert('Screen sharing permission denied.');
      } else {
        alert('Cannot share screen. Please try again.');
      }
      this.isScreenSharing = false;
    }
  }

  private stopScreenShare() {
    try {
      this.screenStream?.getTracks().forEach(t => t.stop());
    } catch {}
    this.screenStream = undefined;
    this.isScreenSharing = false;
    const videoEl = this.screenVideoRef?.nativeElement;
    if (videoEl) {
      try { (videoEl.srcObject as MediaStream | null) = null; } catch {}
    }
  }

  openWhiteboard() {
    this.isWhiteboardOpen = !this.isWhiteboardOpen;
  }

  // Handle whiteboard action from child component
  onWhiteboardAction(action: WhiteboardAction) {
    this.whiteboardActions.push(action);
    // In real app: broadcast to other participants via WebSocket/WebRTC
    console.log('Whiteboard action:', action);
  }

  leave() {
    if (confirm('Are you sure you want to leave the meeting?')) {
      history.back();
    }
  }

  send() {
    if (this.draft.trim()) {
      this.messages.push({
        sender: this.currentUser,
        text: this.draft.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      this.draft = '';
    }
  }

  toggleChat(force?: boolean) {
    if (force) {
      this.isChatOpen = true;
      this.isParticipantsOpen = false;
    } else {
      this.isChatOpen = !this.isChatOpen;
      if (this.isChatOpen) this.isParticipantsOpen = false;
    }
  }

  toggleParticipants(force?: boolean) {
    if (force) {
      this.isParticipantsOpen = true;
      this.isChatOpen = false;
    } else {
      this.isParticipantsOpen = !this.isParticipantsOpen;
      if (this.isParticipantsOpen) this.isChatOpen = false;
    }
  }

  closeSidebar() {
    this.isChatOpen = false;
    this.isParticipantsOpen = false;
  }

  // Dọn dẹp khi component bị hủy
  ngOnDestroy(): void {
    this.stopMic();
    this.stopCamera();
    this.stopScreenShare();
  }
}
