import { inject, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, fromEvent, map, merge, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NetworkService {
  private readonly online$ = new BehaviorSubject(navigator.onLine);
  private readonly zone = inject(NgZone);

  constructor() {
    this.initListeners();
  }

  private initListeners() {
    this.zone.runOutsideAngular(() => {
      const online$ = fromEvent(window, 'online').pipe(map(() => true));
      const offline$ = fromEvent(window, 'offline').pipe(map(() => false));

      merge(online$, offline$).subscribe(() => {
        this.zone.run((status) => {
          this.online$.next(status);
        });
      });
    });
  }

  get isOnline$(): Observable<Boolean> {
    return this.online$.asObservable();
  }

  get isOnline(): Boolean {
    return this.online$.value;
  }
}
