import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import { CarInfo } from '../../types/carInfo';

interface Props {
  visible: boolean;
  carInfo?: CarInfo | null;
  onClose: () => void;
  onSave: (carInfo: CarInfo) => void;
  onRemove: (carInfo: CarInfo) => void;
}

const CarInfoModal: React.FC<Props> = ({ visible, carInfo, onClose, onSave, onRemove }) => {
  const [newCarInfo, setNewCarInfo] = React.useState<CarInfo>({
    plate: carInfo?.plate || '',
    color: carInfo?.color || '',
    model: carInfo?.model || '',
    latitude: carInfo?.latitude || 0,
    longitude: carInfo?.longitude || 0,
    timestamp: carInfo?.timestamp || new Date(),
  });

  const [errorMessage, setErrorMessage] = React.useState<string>('');

  const handleSave = () => {
    if (!newCarInfo.plate) {
      setErrorMessage('A placa é obrigatória.');
      return;
    }
    
    setErrorMessage(''); // Limpar mensagem de erro
    onSave(newCarInfo);
    setNewCarInfo({ plate: '', color: '', model: '', latitude: 0, longitude: 0, timestamp: new Date() }); // Resetar o estado
  };

  const calculateTimeParked = () => {
    if (carInfo) {
      const parkedDuration = Math.floor((new Date().getTime() - carInfo.timestamp.getTime()) / 60000); // Calcular em minutos
      return `${parkedDuration} minutos`;
    }
    return '';
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Informações do Veículo</Text>
              {carInfo && carInfo.plate !== '' ? (
                <View>
                  <Text style={styles.infoLabel}>Placa: {carInfo.plate}</Text>
                  <Text style={styles.infoLabel}>Cor: {carInfo.color}</Text>
                  <Text style={styles.infoLabel}>Modelo: {carInfo.model}</Text>
                  <Text style={styles.infoLabel}>Estacionado há: {calculateTimeParked()}</Text>
                  <TouchableOpacity 
                    onPress={() => onRemove(carInfo)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>Carro Entregue</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <TextInput
                    placeholder="Placa"
                    value={newCarInfo.plate}
                    onChangeText={text => setNewCarInfo({ ...newCarInfo, plate: text })}
                    style={styles.input}
                    maxLength={7}
                  />
                  <TextInput
                    placeholder="Cor"
                    value={newCarInfo.color}
                    onChangeText={text => setNewCarInfo({ ...newCarInfo, color: text })}
                    style={styles.input}
                  />
                  <TextInput
                    placeholder="Modelo"
                    value={newCarInfo.model}
                    onChangeText={text => setNewCarInfo({ ...newCarInfo, model: text })}
                    style={styles.input}
                  />
                  {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                  <TouchableOpacity 
                    onPress={handleSave}
                    style={styles.saveButton}
                  >
                    <Text style={styles.saveButtonText}>Salvar</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  closeButtonText: {
    fontSize: 22,
    color: '#666',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  removeButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CarInfoModal; 