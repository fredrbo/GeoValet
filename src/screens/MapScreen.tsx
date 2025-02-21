import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Image } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import CarInfoModal from '../components/Map/CarInfoModal';
import { CarInfo } from '../types/carInfo';
import ConfirmationModal from '../components/Map/ConfirmationModal';

const MapScreen: React.FC = () => {
  const mapRef = React.useRef<MapView>(null);
  const [location, setLocation] = useState<Region>({
    latitude: -23.2237, // Coordenadas de São José dos Campos
    longitude: -45.9009,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markers, setMarkers] = useState<CarInfo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarInfo | null>(null);
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  useEffect(() => {
    getCurrentLocation();
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

  const handleSaveCarInfo = (carInfo: CarInfo) => {
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
    
    setMarkers(prev => [...prev, updatedCarInfo]);
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
        showsUserLocation={true}
        showsMyLocationButton={false}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.7,
  },
  myLocationButton: {
    position: 'absolute',
    right: 20,
    bottom: Dimensions.get('window').height * 0.35,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  myLocationButtonText: {
    fontSize: 24,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MapScreen; 