import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region, Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';

interface CarMarker {
  latitude: number;
  longitude: number;
  carInfo: {
    plate: string;
    model: string;
    parkedTime: string;
    parkedBy: string;
  };
}

const MOCK_CAR_INFO = [
  {
    plate: "ABC-1234",
    model: "Toyota Corolla",
    parkedTime: "2h 30min",
    parkedBy: "João Silva"
  },
  {
    plate: "XYZ-9876",
    model: "Honda Civic",
    parkedTime: "45min",
    parkedBy: "Maria Santos"
  },
  {
    plate: "DEF-5678",
    model: "Volkswagen Golf",
    parkedTime: "1h 15min",
    parkedBy: "Pedro Oliveira"
  }
];

const MapScreen: React.FC = () => {
  const mapRef = React.useRef<MapView>(null);
  const [location, setLocation] = useState<Region>({
    latitude: -23.550520,
    longitude: -46.633308,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markers, setMarkers] = useState<CarMarker[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarMarker | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const currentLocation = await Location.getCurrentPositionAsync({});
    const newLocation = {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    setLocation(newLocation);
  };

  const handleMarkLocation = async () => {
    const currentLocation = await Location.getCurrentPositionAsync({});
    const mockInfo = MOCK_CAR_INFO[markers.length % MOCK_CAR_INFO.length]; // Cicla pelos carros mockados
    
    setMarkers(prev => [...prev, {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      carInfo: mockInfo
    }]);
  };

  const handleClearMarkers = () => {
    setMarkers([]);
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

  const handleMarkerPress = (marker: CarMarker) => {
    setSelectedCar(marker);
    setModalVisible(true);
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
            coordinate={marker}
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
            onPress={handleClearMarkers}
          >
            <Text style={styles.buttonText}>Limpar Marcadores</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Informações do Veículo</Text>
                  <TouchableOpacity 
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {selectedCar && (
                  <View style={styles.carInfoContainer}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Placa:</Text>
                      <Text style={styles.infoValue}>{selectedCar.carInfo.plate}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Modelo:</Text>
                      <Text style={styles.infoValue}>{selectedCar.carInfo.model}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Tempo:</Text>
                      <Text style={styles.infoValue}>{selectedCar.carInfo.parkedTime}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Manobrista:</Text>
                      <Text style={styles.infoValue}>{selectedCar.carInfo.parkedBy}</Text>
                    </View>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  markerContainer: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  markerText: {
    fontSize: 20,
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#4CAF50',
  },
  calloutInfo: {
    gap: 5,
  },
  calloutText: {
    fontSize: 14,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 22,
    color: '#666',
  },
  carInfoContainer: {
    gap: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default MapScreen; 