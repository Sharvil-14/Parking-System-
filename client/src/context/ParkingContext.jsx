import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { locationsAPI, slotsAPI } from '../services/api';

const ParkingContext = createContext();

export const ParkingProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'entry' | 'exit' | 'payment' | 'receipt' | 'reservation'
  const [modalData, setModalData] = useState(null);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await locationsAPI.getAll();
      setLocations(res.data);
      if (res.data.length > 0 && !selectedLocation) {
        setSelectedLocation(res.data[0]);
      } else if (selectedLocation) {
        const updated = res.data.find(l => String(l._id) === String(selectedLocation._id));
        if (updated) setSelectedLocation(updated);
      }
    } catch (err) {
      console.error('Error fetching parking locations:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedLocation]);

  const fetchSlotsForLocation = useCallback(async (locationId) => {
    if (!locationId) return;
    try {
      const res = await slotsAPI.getByLocation(locationId);
      setSlots(res.data);
    } catch (err) {
      console.error('Error fetching slots:', err);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetchSlotsForLocation(selectedLocation._id);
    }
  }, [selectedLocation, fetchSlotsForLocation]);

  const openModal = (type, data = null) => {
    setModalData(data);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  const refreshData = async () => {
    await fetchLocations();
    if (selectedLocation) {
      await fetchSlotsForLocation(selectedLocation._id);
    }
  };

  return (
    <ParkingContext.Provider value={{
      locations,
      selectedLocation,
      setSelectedLocation,
      slots,
      loading,
      searchQuery,
      setSearchQuery,
      activeModal,
      modalData,
      openModal,
      closeModal,
      refreshData,
      fetchSlotsForLocation
    }}>
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => useContext(ParkingContext);
