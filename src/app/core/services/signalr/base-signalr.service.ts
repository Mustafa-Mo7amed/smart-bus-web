import { inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth.service';

export abstract class BaseSignalRService {
  protected connection: signalR.HubConnection | null = null;
  private authService = inject(AuthService);


  constructor(
    private hubPath: string,
    private requiresAuth: boolean = false,
  ) {}

  private getHubUrl(): string {
    const origin = new URL(environment.hubURL).origin;
    return `${origin}${this.hubPath}`;
  }

  async start(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const builder = new signalR.HubConnectionBuilder()
      .withUrl(this.getHubUrl(), {
        // If the hub requires auth, pass the JWT token
        ...(this.requiresAuth && {
          accessTokenFactory: () => this.authService.getToken() ?? '',
        }),
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning);

    this.connection = builder.build();

    this.registerEvents(this.connection);

    await this.connection.start();
  }

  async stop(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        // Connection may already be closed
      }
      this.connection = null;
    }
  }

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  protected abstract registerEvents(connection: signalR.HubConnection): void;
}
