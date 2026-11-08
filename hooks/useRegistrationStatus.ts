'use client';

import { useState, useEffect } from 'react';
import { isRegistrationOpen, getStoredCountdown, saveCountdown, getLiveBroadcastChannel } from '@/lib/storage';
import { api } from '@/lib/api';


export function useRegistrationStatus() {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // 1. Initial state from local storage / cache
    setIsOpen(isRegistrationOpen());

    // 2. Fetch public settings from server in background
    api.public.getSettings().then((res) => {
      if (res?.success && res.data && typeof res.data.registrationOpen === 'boolean') {
        const serverOpen = res.data.registrationOpen;
        setIsOpen(serverOpen);
        const current = getStoredCountdown();
        if (current.isRegistrationOpen !== serverOpen) {
          saveCountdown({
            ...current,
            isRegistrationOpen: serverOpen,
            eventStatus: serverOpen ? 'REGISTRATIONS OPEN' : (res.data.eventStatus || current.eventStatus),
          });
        }
      }
    }).catch(() => {});

    const handleUpdate = () => {
      setIsOpen(isRegistrationOpen());
    };

    window.addEventListener('cst_countdown_updated', handleUpdate);
    window.addEventListener('cst_registration_status_changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    const channel = getLiveBroadcastChannel();
    const handleChannelMsg = (event: MessageEvent) => {
      if (event.data?.type === 'CST_REGISTRATION_STATUS_UPDATE') {
        if (typeof event.data.isOpen === 'boolean') {
          setIsOpen(event.data.isOpen);
        } else {
          setIsOpen(isRegistrationOpen());
        }
      }
    };
    channel?.addEventListener('message', handleChannelMsg);

    return () => {
      window.removeEventListener('cst_countdown_updated', handleUpdate);
      window.removeEventListener('cst_registration_status_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      channel?.removeEventListener('message', handleChannelMsg);
    };
  }, []);

  return { isOpen, loading };
}

