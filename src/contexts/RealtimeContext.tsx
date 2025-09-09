import React, { createContext, useContext, useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../services/config';

type RealtimeContextType = {
  socket: Socket | null;
};

const RealtimeContext = createContext<RealtimeContextType>({ socket: null });

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  const [socket, setSocket] = React.useState<Socket | null>(null);

  useEffect(() => {
    const s = io(API_URL, {
      withCredentials: true,
      transports: ['websocket'],
    });
    setSocket(s);

    s.on('connect', () => {
      console.log('Conectado');
    });

    s.on('tasks:changed', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    });

    return () => {
      s.close();
    };
  }, [queryClient]);

  return (
    <RealtimeContext.Provider value={{ socket }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => useContext(RealtimeContext);


