import { getMatchEvents, type MatchEventWithDetails } from "@/database/events/get-events";
import { Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MatchEventsProps {
  matchUlid: string;
}

export async function MatchEvents({ matchUlid }: MatchEventsProps) {
  const result = await getMatchEvents(matchUlid);

  if (!result.success) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Erreur lors du chargement des événements
      </div>
    );
  }

  const events = result.events;

  if (events.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Aucun événement pour ce match
      </div>
    );
  }

  // Grouper les événements par minute pour un meilleur affichage
  const eventsByMinute = events.reduce((acc, event) => {
    const minute = event.minute;
    if (!acc[minute]) {
      acc[minute] = [];
    }
    acc[minute].push(event);
    return acc;
  }, {} as Record<number, MatchEventWithDetails[]>);

  // Trier les minutes par ordre décroissant (plus récent en premier)
  const sortedMinutes = Object.keys(eventsByMinute)
    .map(Number)
    .sort((a, b) => b - a);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "Essai":
        return "🏈";
      case "Transformation réussie":
        return "⚽";
      case "Transformation manquée":
        return "❌";
      case "Drop réussi":
        return "🎯";
      case "Drop manqué":
        return "🚫";
      case "Pénalité":
        return "⚠️";
      case "Coup franc":
        return "🆓";
      case "Pénalité réussie":
        return "🎯";
      case "Pénalité manquée":
        return "🚫";
      case "Carton jaune":
        return "🟨";
      case "Carton rouge":
        return "🟥";
      case "Remplacement":
        return "↔️";
      default:
        return "⚽";
    }
  };

  const getEventBadgeVariant = (eventType: string) => {
    if (eventType.includes("réussi") || eventType === "Essai") {
      return "default";
    }
    if (eventType.includes("manqué") || eventType.includes("Pénalité") || eventType.includes("Coup franc")) {
      return "secondary";
    }
    if (eventType.includes("Carton")) {
      return "destructive";
    }
    return "outline";
  };

  return (
    <div className="py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          {sortedMinutes.map((minute) => (
            <div key={minute} className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="relative flex items-start space-x-4">
                {/* Minute indicator */}
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-plaisir-primary text-white rounded-full font-bold text-sm">
                  {minute}'
                </div>
                
                {/* Events for this minute */}
                <div className="flex-1 space-y-2">
                  {eventsByMinute[minute].map((event) => (
                    <div
                      key={event.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-2xl">{getEventIcon(event.eventType.name)}</span>
                            <Badge variant={getEventBadgeVariant(event.eventType.name)}>
                              {event.eventType.name}
                            </Badge>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {event.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: event.team.club.primaryColor }}
                              ></div>
                              <span>{event.team.club.name}</span>
                            </div>
                            
                            {event.mainPlayer && (
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>
                                  {event.mainPlayer.firstname} {event.mainPlayer.lastname}
                                </span>
                              </div>
                            )}
                            
                            {event.secondPlayer && (
                              <div className="flex items-center space-x-1">
                                <span>→</span>
                                <User className="w-3 h-3" />
                                <span>
                                  {event.secondPlayer.firstname} {event.secondPlayer.lastname}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{minute}'</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}