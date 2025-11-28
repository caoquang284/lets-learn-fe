import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Room, RoomEvent, RemoteParticipant, LocalParticipant, Track } from 'livekit-client';
import { environment } from 'environments/environment.development';

export interface LiveKitConnectionState {
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  room: Room | null;
  localParticipant: LocalParticipant | null;
  remoteParticipants: RemoteParticipant[];
}

@Injectable()
export class LiveKitService implements OnDestroy {
  private room: Room | null = null;
  private connectionStateSubject = new BehaviorSubject<LiveKitConnectionState>({
    isConnecting: false,
    isConnected: false,
    error: null,
    room: null,
    localParticipant: null,
    remoteParticipants: [],
  });

  private participantConnectedSubject = new Subject<RemoteParticipant>();
  private participantDisconnectedSubject = new Subject<RemoteParticipant>();

  public connectionState$: Observable<LiveKitConnectionState> = this.connectionStateSubject.asObservable();
  public participantConnected$: Observable<RemoteParticipant> = this.participantConnectedSubject.asObservable();
  public participantDisconnected$: Observable<RemoteParticipant> = this.participantDisconnectedSubject.asObservable();

  constructor() {}

  /**
   * Connect to LiveKit room with token
   */
  async connect(token: string, roomName?: string): Promise<void> {
    if (this.room?.state === 'connected') {
      console.warn('Already connected to a room');
      return;
    }

    this.updateConnectionState({ isConnecting: true, error: null });

    try {
      this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      this.setupRoomEventListeners();

      const room = roomName || environment.LIVEKIT_DEFAULT_ROOM;
      await this.room.connect(environment.LIVEKIT_WS_URL, token);

      console.log('Connected to room:', room);

      this.updateConnectionState({
        isConnecting: false,
        isConnected: true,
        room: this.room,
        localParticipant: this.room.localParticipant,
        remoteParticipants: Array.from(this.room.remoteParticipants.values()),
      });
    } catch (error: any) {
      console.error('Failed to connect to LiveKit room:', error);
      this.updateConnectionState({
        isConnecting: false,
        isConnected: false,
        error: error.message || 'Failed to connect to room',
      });
      throw error;
    }
  }

  /**
   * Disconnect from the current room
   */
  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
      this.updateConnectionState({
        isConnecting: false,
        isConnected: false,
        error: null,
        room: null,
        localParticipant: null,
        remoteParticipants: [],
      });
    }
  }

  /**
   * Enable/disable local video
   */
  async toggleVideo(enabled: boolean): Promise<void> {
    if (!this.room) return;
    await this.room.localParticipant.setCameraEnabled(enabled);
  }

  /**
   * Enable/disable local audio
   */
  async toggleAudio(enabled: boolean): Promise<void> {
    if (!this.room) return;
    await this.room.localParticipant.setMicrophoneEnabled(enabled);
  }

  /**
   * Get current room instance
   */
  getRoom(): Room | null {
    return this.room;
  }

  /**
   * Setup event listeners for room events
   */
  private setupRoomEventListeners(): void {
    if (!this.room) return;

    this.room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      console.log('Participant connected:', participant.identity);
      this.participantConnectedSubject.next(participant);
      this.updateRemoteParticipants();
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      console.log('Participant disconnected:', participant.identity);
      this.participantDisconnectedSubject.next(participant);
      this.updateRemoteParticipants();
    });

    this.room.on(RoomEvent.Disconnected, () => {
      console.log('Disconnected from room');
      this.updateConnectionState({
        isConnecting: false,
        isConnected: false,
        room: null,
        localParticipant: null,
        remoteParticipants: [],
      });
    });

    this.room.on(RoomEvent.Reconnecting, () => {
      console.log('Reconnecting to room...');
      this.updateConnectionState({ isConnecting: true });
    });

    this.room.on(RoomEvent.Reconnected, () => {
      console.log('Reconnected to room');
      this.updateConnectionState({ isConnecting: false, isConnected: true });
    });

    this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      console.log('Track subscribed:', track.kind, 'from', participant.identity);
    });
  }

  /**
   * Update remote participants list
   */
  private updateRemoteParticipants(): void {
    if (this.room) {
      this.updateConnectionState({
        remoteParticipants: Array.from(this.room.remoteParticipants.values()),
      });
    }
  }

  /**
   * Update connection state
   */
  private updateConnectionState(partial: Partial<LiveKitConnectionState>): void {
    this.connectionStateSubject.next({
      ...this.connectionStateSubject.value,
      ...partial,
    });
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.connectionStateSubject.complete();
    this.participantConnectedSubject.complete();
    this.participantDisconnectedSubject.complete();
  }
}
