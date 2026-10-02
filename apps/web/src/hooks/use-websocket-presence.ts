'use client';

import * as React from 'react';

export function useWebsocketPresence(channelName: string) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [onlineCount, setOnlineCount] = React.useState(0);

  React.useEffect(() => {
    // Foundation stub for WebSocket connection to NestJS gateway
    setIsConnected(true);
    setOnlineCount(1);

    return () => {
      setIsConnected(false);
    };
  }, [channelName]);

  return { isConnected, onlineCount };
}
