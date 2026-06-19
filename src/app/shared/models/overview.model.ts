export interface DashboardOverviewResponse {
    availableMicrobuses: number;
    incomingMicrobuses: number;
    completedTripsToday: number;
    totalPassengersToday: number;

    demandByRoute: DemandOnRoute[];
    tripsOverTime: TripHourCount[];
    liveRouteQueues: LiveRouteQueue[];
}

export interface DemandOnRoute {
    destinationName: string;
    passengerCount: number;
}

export interface TripHourCount {
    hour: string;
    tripCount: number;
}

export interface LiveRouteQueue {
    destinationName: string;
    microbusesReady: number;
}