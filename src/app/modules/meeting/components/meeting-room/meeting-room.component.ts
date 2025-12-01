import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LiveKitService, LiveKitConnectionState } from '../../services/livekit.service';
import { RemoteParticipant, RemoteTrack, RemoteTrackPublication, Track } from 'livekit-client';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GetMeetingToken } from '../../api/meeting.api';
import { WhiteboardComponent } from '../whiteboard/whiteboard.component';

@Component({
  selector: 'app-meeting-room',
  standalone: true,
  imports: [CommonModule, FormsModule, WhiteboardComponent],
  templateUrl: './meeting-room.component.html',
  styleUrls: ['./meeting-room-livekit.component.scss'],
  providers: [LiveKitService],
})
export class MeetingRoomComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('localAudio') localAudioElement!: ElementRef<HTMLAudioElement>;
  @ViewChild('whiteboard') whiteboardComponent!: WhiteboardComponent;
  @ViewChild('chatMessagesContainer') chatMessagesContainer!: ElementRef<HTMLDivElement>;

  connectionState: LiveKitConnectionState = {
    isConnecting: false,
    isConnected: false,
    error: null,
    room: null,
    localParticipant: null,
    remoteParticipants: [],
  };

  token: string = '';
  roomName: string = '';
  isVideoEnabled: boolean = true;
  isAudioEnabled: boolean = true;
  isLoadingToken: boolean = true;
  showWhiteboard: boolean = false;
  currentUserIdentity: string = 'You';
  showReactionPicker: boolean = false;
  reactions: Array<{ emoji: string; x: number; y: number; id: string; senderId: string }> = [];
  currentTime: string = '';
  speakingParticipants: Set<string> = new Set();
  isLocalSpeaking: boolean = false;
  showMeetingDetails: boolean = false;
  showParticipants: boolean = false;
  showChat: boolean = false;
  isHandRaised: boolean = false;
  raisedHands: Set<string> = new Set();
  chatMessages: Array<{ text: string; senderId: string; senderName: string; timestamp: Date }> = [];
  chatInputText: string = '';

  private destroy$ = new Subject<void>();
  remoteParticipantElements: Map<string, { video?: HTMLVideoElement; audio?: HTMLAudioElement }> = new Map();
  
  private topicId: string | null = null;
  private courseId: string | null = null;

  constructor(
    private liveKitService: LiveKitService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    // Initialize current time
    this.updateCurrentTime();
    setInterval(() => this.updateCurrentTime(), 1000);

    // Get route parameters
    this.topicId = this.route.snapshot.paramMap.get('topicId');
    
    // Try to get courseId from parent route first, then from navigation state
    this.courseId = this.route.parent?.snapshot.paramMap.get('courseId') || 
                    this.router.getCurrentNavigation()?.extras?.state?.['courseId'] ||
                    (window.history.state && window.history.state.courseId) || 
                    null;

    console.log('Meeting Room Init - TopicId:', this.topicId, 'CourseId:', this.courseId);

    // Attempt to auto-fetch token from backend
    await this.fetchTokenFromBackend();

    // Subscribe to connection state changes
    this.liveKitService.connectionState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.connectionState = state;
        
        // Attach local tracks when connected
        if (state.isConnected && state.localParticipant) {
          setTimeout(() => {
            this.attachLocalTracks();
            this.updateDeviceStates();
          }, 500);
        }
      });

    // Listen for remote participant events
    this.liveKitService.participantConnected$
      .pipe(takeUntil(this.destroy$))
      .subscribe((participant) => {
        this.handleRemoteParticipant(participant);
      });

    this.liveKitService.participantDisconnected$
      .pipe(takeUntil(this.destroy$))
      .subscribe((participant) => {
        this.remoteParticipantElements.delete(participant.identity);
      });

    // Listen for data messages (whiteboard actions)
    this.liveKitService.dataReceived$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ data, senderId }) => {
        console.log('Received data from', senderId, data);
        if (data.type === 'whiteboard') {
          this.handleWhiteboardAction(data);
        } else if (data.type === 'reaction') {
          this.handleReceivedReaction(data, senderId);
        } else if (data.type === 'raiseHand') {
          this.handleRaiseHand(data, senderId);
        } else if (data.type === 'chat') {
          this.handleChatMessage(data, senderId);
        }
      });

    // Setup speaking detection for local participant
    this.setupSpeakingDetection();
  }

  private setupSpeakingDetection(): void {
    // Check speaking status periodically
    setInterval(() => {
      if (this.connectionState.localParticipant) {
        this.isLocalSpeaking = this.connectionState.localParticipant.isSpeaking;
      }

      // Update remote participants speaking status
      this.connectionState.remoteParticipants.forEach(participant => {
        if (participant.isSpeaking) {
          this.speakingParticipants.add(participant.identity);
        } else {
          this.speakingParticipants.delete(participant.identity);
        }
      });
    }, 100);
  }

  async fetchTokenFromBackend(): Promise<void> {
    if (!this.topicId || !this.courseId) {
      console.error('Missing topicId or courseId');
      this.connectionState.error = 'Invalid meeting link. Missing required parameters.';
      this.isLoadingToken = false;
      return;
    }

    try {
      this.isLoadingToken = true;
      const response = await GetMeetingToken(this.topicId, this.courseId);
      
      this.token = response.token;
      this.roomName = response.roomName;
      
      // Auto-join with fetched token
      await this.joinRoom();
    } catch (error) {
      console.error('Failed to fetch token from backend:', error);
      this.connectionState.error = 'Failed to connect to meeting. Please try again later.';
    } finally {
      this.isLoadingToken = false;
    }
  }

  async joinRoom(): Promise<void> {
    if (!this.token.trim()) {
      this.connectionState.error = 'Invalid token. Please try again.';
      return;
    }

    try {
      await this.liveKitService.connect(this.token, this.roomName);
    } catch (error) {
      console.error('Failed to join room:', error);
      this.connectionState.error = 'Failed to join room. Please check your connection.';
    }
  }

  async leaveRoom(): Promise<void> {
    await this.liveKitService.disconnect();
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  async toggleVideo(): Promise<void> {
    const newState = !this.isVideoEnabled;
    const success = await this.liveKitService.toggleVideo(newState);
    
    if (success) {
      this.isVideoEnabled = newState;
    } else {
      console.warn('Failed to toggle video, keeping current state');
      // Show user-friendly message
      if (newState) {
        alert('Unable to access camera. Please check your camera permissions and try again.');
      }
    }
  }

  async toggleAudio(): Promise<void> {
    const newState = !this.isAudioEnabled;
    const success = await this.liveKitService.toggleAudio(newState);
    
    if (success) {
      this.isAudioEnabled = newState;
    } else {
      console.warn('Failed to toggle audio, keeping current state');
      // Show user-friendly message
      if (newState) {
        alert('Unable to access microphone. Please check your microphone permissions and try again.');
      }
    }
  }

  toggleWhiteboard(): void {
    this.showWhiteboard = !this.showWhiteboard;
  }

  toggleReactionPicker(): void {
    this.showReactionPicker = !this.showReactionPicker;
  }

  toggleMeetingDetails(): void {
    this.showMeetingDetails = !this.showMeetingDetails;
    if (this.showMeetingDetails) {
      this.showParticipants = false;
      this.showChat = false;
    }
  }

  toggleParticipants(): void {
    this.showParticipants = !this.showParticipants;
    if (this.showParticipants) {
      this.showMeetingDetails = false;
      this.showChat = false;
    }
  }

  toggleChat(): void {
    this.showChat = !this.showChat;
    if (this.showChat) {
      this.showMeetingDetails = false;
      this.showParticipants = false;
    }
  }

  sendReaction(emoji: string): void {
    const reaction = {
      type: 'reaction',
      emoji: emoji,
      timestamp: Date.now(),
      senderId: this.currentUserIdentity
    };

    // Send to all participants
    this.liveKitService.sendData(reaction);

    // Show locally
    this.displayReaction(emoji, this.currentUserIdentity);

    // Keep picker open for spam reactions
  }

  toggleRaiseHand(): void {
    this.isHandRaised = !this.isHandRaised;

    // Broadcast hand status to all participants
    const handStatus = {
      type: 'raiseHand',
      isRaised: this.isHandRaised,
      timestamp: Date.now(),
      senderId: this.currentUserIdentity
    };

    this.liveKitService.sendData(handStatus);

    // Update local raised hands set
    if (this.isHandRaised) {
      this.raisedHands.add(this.currentUserIdentity);
    } else {
      this.raisedHands.delete(this.currentUserIdentity);
    }
  }

  sendChatMessage(): void {
    if (!this.chatInputText.trim()) return;

    const message = {
      type: 'chat',
      text: this.chatInputText.trim(),
      senderName: this.getParticipantDisplayName(this.currentUserIdentity),
      timestamp: new Date(),
      senderId: this.currentUserIdentity
    };

    // Broadcast to all participants
    this.liveKitService.sendData(message);

    // Add to local messages
    this.chatMessages.push({
      text: message.text,
      senderId: this.currentUserIdentity,
      senderName: 'You',
      timestamp: message.timestamp
    });

    // Clear input
    this.chatInputText = '';

    // Scroll to bottom
    this.scrollChatToBottom();
  }

  private handleReceivedReaction(data: any, senderId: string): void {
    if (data.emoji) {
      this.displayReaction(data.emoji, senderId);
    }
  }

  private handleRaiseHand(data: any, senderId: string): void {
    if (data.isRaised) {
      this.raisedHands.add(senderId);
    } else {
      this.raisedHands.delete(senderId);
    }
  }

  private handleChatMessage(data: any, senderId: string): void {
    this.chatMessages.push({
      text: data.text,
      senderId: senderId,
      senderName: data.senderName || this.getParticipantDisplayName(senderId),
      timestamp: new Date(data.timestamp)
    });

    // Scroll to bottom
    this.scrollChatToBottom();
  }

  private displayReaction(emoji: string, senderId: string): void {
    // Generate random position in the upper portion of the screen
    const x = Math.random() * 80 + 10; // 10% to 90% from left
    const y = Math.random() * 30 + 10; // 10% to 40% from top

    const reactionId = `${Date.now()}-${Math.random()}`;
    
    this.reactions.push({
      emoji,
      x,
      y,
      id: reactionId,
      senderId
    });

    // Remove reaction after animation completes (3 seconds)
    setTimeout(() => {
      this.reactions = this.reactions.filter(r => r.id !== reactionId);
    }, 3000);
  }

  private updateCurrentTime(): void {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.currentTime = `${hours}:${minutes}`;
  }

  private updateDeviceStates(): void {
    if (!this.connectionState.localParticipant) return;

    // Check if camera track exists and is enabled
    const videoTrack = Array.from(
      this.connectionState.localParticipant.videoTrackPublications.values()
    ).find(pub => pub.track?.kind === Track.Kind.Video);

    // Check if audio track exists and is enabled
    const audioTrack = Array.from(
      this.connectionState.localParticipant.audioTrackPublications.values()
    ).find(pub => pub.track?.kind === Track.Kind.Audio);

    this.isVideoEnabled = videoTrack?.track ? !videoTrack.track.isMuted : false;
    this.isAudioEnabled = audioTrack?.track ? !audioTrack.track.isMuted : false;

    console.log('Device states updated - Video:', this.isVideoEnabled, 'Audio:', this.isAudioEnabled);
  }

  onWhiteboardAction(action: any): void {
    console.log('Local whiteboard action:', action);
    // Send action to all participants via data channel
    this.liveKitService.sendData({
      type: 'whiteboard',
      action: action
    });
  }

  private handleWhiteboardAction(data: any): void {
    if (data.type === 'whiteboard' && this.whiteboardComponent) {
      // Apply the remote action to local whiteboard
      this.applyRemoteWhiteboardAction(data.action);
    }
  }

  private applyRemoteWhiteboardAction(action: any): void {
    if (!this.whiteboardComponent) return;

    const canvas = this.whiteboardComponent.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    console.log('Applying remote action:', action);

    switch (action.type) {
      case 'draw':
        this.drawRemotePath(ctx, action.data);
        break;
      case 'clear':
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        break;
      case 'text':
        ctx.fillStyle = action.data.color;
        ctx.font = `${action.data.fontSize}px Arial`;
        ctx.fillText(action.data.text, action.data.x, action.data.y);
        break;
      case 'shape':
        this.drawRemoteShape(ctx, action.data);
        break;
    }
  }

  private drawRemotePath(ctx: CanvasRenderingContext2D, data: any): void {
    if (!data.path || data.path.length === 0) return;

    const path = data.path;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);

    for (let i = 1; i < path.length; i++) {
      ctx.strokeStyle = data.tool === 'eraser' ? '#FFFFFF' : path[i].color;
      ctx.lineWidth = data.tool === 'eraser' ? path[i].width * 2 : path[i].width;
      ctx.lineTo(path[i].x, path[i].y);
    }

    ctx.stroke();
    ctx.closePath();
  }

  private drawRemoteShape(ctx: CanvasRenderingContext2D, data: any): void {
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.width;
    ctx.beginPath();

    if (data.tool === 'line') {
      ctx.moveTo(data.startX, data.startY);
      ctx.lineTo(data.endX, data.endY);
      ctx.stroke();
    } else if (data.tool === 'rectangle') {
      const width = data.endX - data.startX;
      const height = data.endY - data.startY;
      ctx.strokeRect(data.startX, data.startY, width, height);
    } else if (data.tool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(data.endX - data.startX, 2) + Math.pow(data.endY - data.startY, 2)
      );
      ctx.arc(data.startX, data.startY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  private attachLocalTracks(): void {
    if (!this.connectionState.localParticipant) return;

    // Get video track
    const videoPublication = Array.from(
      this.connectionState.localParticipant.videoTrackPublications.values()
    ).find(pub => pub.track?.kind === Track.Kind.Video);

    // Get audio track
    const audioPublication = Array.from(
      this.connectionState.localParticipant.audioTrackPublications.values()
    ).find(pub => pub.track?.kind === Track.Kind.Audio);

    if (videoPublication?.track && this.localVideoElement) {
      videoPublication.track.attach(this.localVideoElement.nativeElement);
      console.log('Local video track attached');
    }

    if (audioPublication?.track && this.localAudioElement) {
      audioPublication.track.attach(this.localAudioElement.nativeElement);
      console.log('Local audio track attached');
    }
  }

  private handleRemoteParticipant(participant: RemoteParticipant): void {
    participant.trackPublications.forEach((publication: RemoteTrackPublication) => {
      if (publication.track) {
        this.attachRemoteTrack(publication.track, participant);
      }
    });

    participant.on('trackSubscribed', (track: RemoteTrack) => {
      this.attachRemoteTrack(track, participant);
    });
  }

  private attachRemoteTrack(track: RemoteTrack, participant: RemoteParticipant): void {
    setTimeout(() => {
      if (track.kind === Track.Kind.Video) {
        const videoElement = document.getElementById(`remote-video-${participant.identity}`) as HTMLVideoElement;
        if (videoElement) {
          track.attach(videoElement);
        }
      } else if (track.kind === Track.Kind.Audio) {
        const audioElement = document.getElementById(`remote-audio-${participant.identity}`) as HTMLAudioElement;
        if (audioElement) {
          track.attach(audioElement);
        }
      }
    }, 100);
  }

  getParticipantDisplayName(identity: string): string {
    return identity || 'Anonymous';
  }

  getInitial(name: string): string {
    if (!name) return 'A';
    return name.charAt(0).toUpperCase();
  }

  isParticipantVideoEnabled(participant: RemoteParticipant): boolean {
    const videoPublication = Array.from(participant.videoTrackPublications.values())
      .find(pub => pub.track?.kind === Track.Kind.Video);
    
    return videoPublication?.track ? !videoPublication.track.isMuted : false;
  }

  isParticipantSpeaking(participantIdentity: string): boolean {
    return this.speakingParticipants.has(participantIdentity);
  }

  isHandRaisedFor(identity: string): boolean {
    return this.raisedHands.has(identity);
  }

  private scrollChatToBottom(): void {
    setTimeout(() => {
      if (this.chatMessagesContainer?.nativeElement) {
        this.chatMessagesContainer.nativeElement.scrollTop = 
          this.chatMessagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.liveKitService.disconnect();
  }
}
