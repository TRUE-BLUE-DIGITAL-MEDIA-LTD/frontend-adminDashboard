import { useEffect, useState } from "react";
import {
  ResponseGetSimCardActiveService,
  SSEGetSimCardActiveService,
} from "../services/simCard/simCard";
import { MessageOnSimcard, SimCard } from "../models";

type Props = {
  setUnavailableSlot: React.Dispatch<
    React.SetStateAction<{ slot: string; deviceUserId: string }[]>
  >;
  setActiveSimcard: React.Dispatch<
    React.SetStateAction<ResponseGetSimCardActiveService>
  >;
  setTrackingUnreadMessage: React.Dispatch<
    React.SetStateAction<{ id: string }[]>
  >;
  showInfo: ({
    message,
    sim,
  }: {
    message: MessageOnSimcard | undefined;
    sim: SimCard;
  }) => void;
};
const useSSEWithRetry = ({
  setUnavailableSlot,
  setActiveSimcard,
  setTrackingUnreadMessage,
  showInfo,
}: Props) => {
  const [retryInterval, setRetryInterval] = useState<number | null>(null); // Dynamic retry interval
  const retryDelay = 5000; // Retry delay in milliseconds

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectToSSE = () => {
      console.log("Attempting to connect to SSE...");
      eventSource = SSEGetSimCardActiveService();

      // Specific event handler
      eventSource.addEventListener(
        "active-sim-cards",
        (event: MessageEvent) => {
          try {
            const data = JSON.parse(
              event.data,
            ) as ResponseGetSimCardActiveService;
            setActiveSimcard(() => data);

            setUnavailableSlot(() =>
              data?.map((sim) => {
                return {
                  slot: sim.portNumber.split(".")[0],
                  deviceUserId: sim.deviceUserId,
                };
              }),
            );

            data.forEach((sim) => {
              sim.messages?.forEach((message) => {
                if (!message.isRead) {
                  setTrackingUnreadMessage((prev) => {
                    if (prev.find((track) => track.id === message.id))
                      return prev;
                    showInfo({ message: message, sim: sim });
                    return [...prev, { id: message.id }];
                  });
                }
              });
            });
          } catch (err) {
            console.error("Error parsing active-sim-cards event data:", err);
          }
        },
      );

      // Error handling
      eventSource.onerror = (err) => {
        console.error("SSE Error:", err);
        eventSource?.close(); // Close the current connection
        setRetryInterval(retryDelay); // Trigger a retry
      };
    };

    // Retry logic
    if (retryInterval !== null) {
      const retryTimeout = setTimeout(() => {
        eventSource?.close(); // Close the current connection
        setRetryInterval(null); // Reset the retry interval
        connectToSSE(); // Attempt to reconnect
      }, retryInterval);

      return () => clearTimeout(retryTimeout); // Cleanup timeout
    }

    // Initial SSE connection
    connectToSSE();

    // Cleanup on component unmount
    return () => {
      eventSource?.close();
      console.log("EventSource closed.");
    };
  }, [retryInterval]);

  return null; // Hook doesn't return anything; side effect only
};

export default useSSEWithRetry;
