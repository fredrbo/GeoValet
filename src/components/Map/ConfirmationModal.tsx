import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import styles from './ConfirmationModalStyles'; // Importando os estilos

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationModal: React.FC<Props> = ({ visible, onClose, onConfirm }) => {
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
              <Text style={styles.modalTitle}>Confirmar Limpeza</Text>
              <Text style={styles.modalMessage}>Você tem certeza que deseja limpar todos os marcadores?</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
                  <Text style={styles.buttonText}>Sim</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                  <Text style={styles.buttonText}>Não</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ConfirmationModal; 