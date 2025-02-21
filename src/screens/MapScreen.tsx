import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import CarInfoModal from '../components/Map/CarInfoModal';
import { CarInfo } from '../types/carInfo';
import ConfirmationModal from '../components/Map/ConfirmationModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './MapScreenStyles'; 

const MapScreen: React.FC = () => {
  const mapRef = React.useRef<MapView>(null);
  const [location, setLocation] = useState<Region>({
    latitude: -23.2237, 
    longitude: -45.9009,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markers, setMarkers] = useState<CarInfo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarInfo | null>(null);
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  const loadMarkersFromStorage = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@car_markers');
      if (jsonValue != null) {
        const loadedMarkers: CarInfo[] = JSON.parse(jsonValue).map((marker: CarInfo) => ({
          ...marker,
          timestamp: new Date(marker.timestamp),
        }));
        setMarkers(loadedMarkers);
      }
    } catch (e) {
      console.error("Erro ao carregar marcadores:", e);
    }
  };

  useEffect(() => {
    getCurrentLocation();
    loadMarkersFromStorage(); // Carregar marcadores ao iniciar
  }, []);

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setLocation(newLocation);
    } catch (error) {
      setLocation({
        latitude: -23.2237, // Coordenadas de São José dos Campos
        longitude: -45.9009,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  const handleMarkLocation = () => {
    setSelectedCar({
      plate: '',
      color: '',
      model: '',
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: new Date(),
    });
    setModalVisible(true);
  };

  const handleMarkerPress = (marker: CarInfo) => {
    setSelectedCar(marker);
    setModalVisible(true);
  };

  // Função para salvar marcadores no AsyncStorage
  const saveMarkersToStorage = async (markers: CarInfo[]) => {
    try {
      const jsonValue = JSON.stringify(markers);
      await AsyncStorage.setItem('@car_markers', jsonValue);
    } catch (e) {
      console.error("Erro ao salvar marcadores:", e);
    }
  };

  const handleSaveCarInfo = async (carInfo: CarInfo) => {
    const existingCar = markers.find(marker => 
      marker.latitude === location.latitude && marker.longitude === location.longitude
    );

    if (existingCar) {
      alert('Não é possível cadastrar 2 carros no mesmo lugar. Por favor, remova o carro anterior ou cadastre em outra vaga.'); 
      return; 
    }

    const updatedCarInfo = {
      ...carInfo,
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: new Date(),
    };
    
    const newMarkers = [...markers, updatedCarInfo];
    setMarkers(newMarkers);
    await saveMarkersToStorage(newMarkers); // Salvar no AsyncStorage
    setModalVisible(false);
  };

  const handleGoToCurrentLocation = async () => {
    const currentLocation = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  const handleClearMarkers = () => {
    setMarkers([]);
    setConfirmationVisible(false);
  };

  const handleRemoveCar = (carInfo: CarInfo) => {
    setMarkers(prev => prev.filter(marker => marker.plate !== carInfo.plate));
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={location}
        showsUserLocation={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            onPress={() => handleMarkerPress(marker)}
          >
            <Image 
              source={require('./../assets/images/car-icon.png')}
              style={{ width: 40, height: 40 }}
            />
          </Marker>
        ))}
      </MapView>
      <TouchableOpacity 
        style={styles.myLocationButton}
        onPress={handleGoToCurrentLocation}
      >
        <Text style={styles.myLocationButtonText}>📍</Text>
      </TouchableOpacity>
      <View style={styles.bottomContainer}>
        <Text style={styles.welcomeText}>Bem-vindo ao Geo Vallet!</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleMarkLocation}>
            <Text style={styles.buttonText}>Marcar Localização</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.clearButton]} 
            onPress={() => setConfirmationVisible(true)}
          >
            <Text style={styles.buttonText}>Limpar Marcadores</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CarInfoModal
        visible={modalVisible}
        carInfo={selectedCar}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveCarInfo}
        onRemove={handleRemoveCar}
      />

      <ConfirmationModal
        visible={confirmationVisible}
        onClose={() => setConfirmationVisible(false)}
        onConfirm={handleClearMarkers}
      />
    </View>
  );
};

export default MapScreen; 