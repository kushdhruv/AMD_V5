import { Linking, Alert } from 'react-native';

export interface UPIParams {
  payeeAddress: string;
  payeeName: string;
  transactionRef?: string;
  transactionNote?: string;
  amount: string;
  currency?: string;
}

export function useUPIPayment() {
  const initiatePayment = async (params: UPIParams) => {
    const { payeeAddress, payeeName, transactionRef, transactionNote, amount, currency = 'INR' } = params;
    
    // Construct standard UPI intent URI
    const upiUrl = `upi://pay?pa=${encodeURIComponent(payeeAddress)}&pn=${encodeURIComponent(payeeName)}&tr=${encodeURIComponent(transactionRef || '')}&tn=${encodeURIComponent(transactionNote || '')}&am=${amount}&cu=${currency}`;
    
    try {
      const supported = await Linking.canOpenURL(upiUrl);
      if (supported) {
        await Linking.openURL(upiUrl);
        return { success: true };
      } else {
        Alert.alert(
          'UPI Unavailable', 
          'No UPI app found on your device. Please install Google Pay, PhonePe, Paytm, or BHIM to pay.'
        );
        return { success: false, error: 'NO_APPS_FOUND' };
      }
    } catch (error) {
      console.error('UPI Integration Error:', error);
      Alert.alert('Payment Error', 'Failed to initiate UPI payment.');
      return { success: false, error };
    }
  };

  return { initiatePayment };
}
