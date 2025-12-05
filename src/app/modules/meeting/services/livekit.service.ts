import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Room, RoomEvent, RemoteParticipant, LocalParticipant, Track, DataPacket_Kind } from 'livekit-client';
import { environment } from '../../../../environments/environment';

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
  private dataReceivedSubject = new Subject<{ data: any; senderId: string }>();

  public connectionState$: Observable<LiveKitConnectionState> = this.connectionStateSubject.asObservable();
  public participantConnected$: Observable<RemoteParticipant> = this.participantConnectedSubject.asObservable();
  public participantDisconnected$: Observable<RemoteParticipant> = this.participantDisconnectedSubject.asObservable();
  public dataReceived$: Observable<{ data: any; senderId: string }> = this.dataReceivedSubject.asObservable();

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

      // Try to enable camera and microphone by default, but don't block if they fail
      let cameraEnabled = false;
      let microphoneEnabled = false;

      try {
        await this.room.localParticipant.setCameraEnabled(true);
        cameraEnabled = true;
        console.log('Camera enabled successfully');
      } catch (error) {
        console.warn('Failed to enable camera, continuing without camera:', error);
      }

      try {
        await this.room.localParticipant.setMicrophoneEnabled(true);
        microphoneEnabled = true;
        console.log('Microphone enabled successfully');
      } catch (error) {
        console.warn('Failed to enable microphone, continuing without microphone:', error);
      }

      if (!cameraEnabled && !microphoneEnabled) {
        console.warn('Joined meeting without camera and microphone');
      }

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
  async toggleVideo(enabled: boolean): Promise<boolean> {
    if (!this.room) return false;
    
    try {
      await this.room.localParticipant.setCameraEnabled(enabled);
      console.log(`Camera ${enabled ? 'enabled' : 'disabled'} successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to ${enabled ? 'enable' : 'disable'} camera:`, error);
      return false;
    }
  }

  /**
   * Enable/disable local audio
   */
  async toggleAudio(enabled: boolean): Promise<boolean> {
    if (!this.room) return false;
    
    try {
      await this.room.localParticipant.setMicrophoneEnabled(enabled);
      console.log(`Microphone ${enabled ? 'enabled' : 'disabled'} successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to ${enabled ? 'enable' : 'disable'} microphone:`, error);
      return false;
    }
  }

  /**
   * Enable/disable screen sharing
   */
  async toggleScreenShare(enabled: boolean): Promise<boolean> {
    if (!this.room) return false;
    
    try {
      await this.room.localParticipant.setScreenShareEnabled(enabled);
      console.log(`Screen share ${enabled ? 'enabled' : 'disabled'} successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to ${enabled ? 'enable' : 'disable'} screen share:`, error);
      return false;
    }
  }

  /**
   * Get current room instance
   */
  getRoom(): Room | null {
    return this.room;
  }

  /**
   * Send data to all participants (for whiteboard sync)
   */
  async sendData(data: any): Promise<void> {
    if (!this.room) {
      console.warn('Cannot send data: not connected to room');
      return;
    }

    try {
      const encoder = new TextEncoder();
      const dataString = JSON.stringify(data);
      const payload = encoder.encode(dataString);
      
      await this.room.localParticipant.publishData(payload, {
        reliable: true,
        destinationIdentities: [], // Empty array means broadcast to all
      });
      
      console.log('Data sent to all participants:', data);
    } catch (error) {
      console.error('Failed to send data:', error);
    }
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

    this.room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) => {
      try {
        const decoder = new TextDecoder();
        const dataString = decoder.decode(payload);
        const data = JSON.parse(dataString);
        console.log('Data received from', participant?.identity || 'unknown', data);
        this.dataReceivedSubject.next({ 
          data, 
          senderId: participant?.identity || 'unknown' 
        });
      } catch (error) {
        console.error('Failed to parse received data:', error);
      }
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
    this.dataReceivedSubject.complete();
  }
}
