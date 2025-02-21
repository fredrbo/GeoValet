import React from 'react';
import {View, Text, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import { CarInfo } from '../../types/carInfo';
import styles from './CarInfoModalStyles'; 

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
    
    setErrorMessage(''); 
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

export default CarInfoModal; 