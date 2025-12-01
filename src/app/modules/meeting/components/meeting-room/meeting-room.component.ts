import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LiveKitService, LiveKitConnectionState } from '../../services/livekit.service';
import { RemoteParticipant, RemoteTrack, RemoteTrackPublication, Track } from 'livekit-client';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GetMeetingToken } from '../../api/meeting.api';

@Component({
  selector: 'app-meeting-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meeting-room.component.html',
  styleUrls: ['./meeting-room-livekit.component.scss'],
  providers: [LiveKitService],
})
export class MeetingRoomComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('localAudio') localAudioElement!: ElementRef<HTMLAudioElement>;

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
          setTimeout(() => this.attachLocalTracks(), 500);
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
    this.isVideoEnabled = !this.isVideoEnabled;
    await this.liveKitService.toggleVideo(this.isVideoEnabled);
  }

  async toggleAudio(): Promise<void> {
    this.isAudioEnabled = !this.isAudioEnabled;
    await this.liveKitService.toggleAudio(this.isAudioEnabled);
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.liveKitService.disconnect();
  }
}
