import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../api';

export const useGeofenceTracker = () => {
  const { currentUser } = useAuth();
  const { projects, showToast } = useApp();
  const intervalRef = useRef(null);

  useEffect(() => {
    // Only track if user is a manager or engineer (acting as supervisor)
    if (!currentUser || currentUser.role === 'owner') return;

    const startTracking = () => {
      // Find a project where this user is assigned as manager or supervisor
      const assignedProject = projects.find(p => 
        (p.managerId === currentUser.id || p.supervisorId === currentUser.id) &&
        p.status === 'active' &&
        p.geofence && p.geofence.lat && p.geofence.lng
      );

      if (!assignedProject) return;

      const pingLocation = () => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                await api.pingLocation({
                  lat: latitude,
                  lng: longitude,
                  projectId: assignedProject.id
                });
                console.log(`[Geofence] Pinged location for ${assignedProject.name}`);
              } catch (err) {
                console.error("[Geofence] Ping failed:", err);
              }
            },
            (error) => {
              console.error("[Geofence] Location error:", error);
              if (error.code === error.PERMISSION_DENIED) {
                 showToast('Location permission denied. Please enable it in browser settings.', 'error');
              }
            },
            { enableHighAccuracy: true }
          );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
      };

      // Prompt early explicitly so that native OS registers the request.
      pingLocation();

      // Ping every 2 minutes
      intervalRef.current = setInterval(pingLocation, 120000);
    };

    startTracking();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentUser, projects, showToast]);

  return null;
};
