import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator, Alert, Linking, Modal, TextInput } from 'react-native';
import { useLocalEventTickets, useLocalUserTickets } from '../../../hooks/useLocalData';
import { useTheme } from '../../../theme/ThemeProvider';
import { ThemeText, ThemeInput } from '../../../components/UIKit';
import { Ticket as TicketIcon, Zap, CreditCard, Send, CheckCircle } from 'lucide-react-native';
import { supabase } from '../../../services/supabaseClient';
import { useConfigStore, useEventConfig, useDemoMode } from '../../../store/configStore';
import * as WebBrowser from 'expo-web-browser';

const BACKEND_URL = 'http://localhost:3000'; // Update this for physical devices

export function TicketsScreen() {
  const { data: tickets, loading: ticketsLoading, refetch } = useLocalEventTickets();
  const { data: userOwnedTickets } = useLocalUserTickets();
  const theme = useTheme();
  const event = useEventConfig();
  const config = useConfigStore((state) => state.config);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  
  // UPI Payment Proof State
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  const handlePurchase = async (ticket: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Sign In Required', 'Please sign in to purchase tickets.');
        return;
      }

      const projectId = config.project_id || config.id;
      if (!projectId) {
          Alert.alert("Configuration Error", "Event ID not found. Please restart the app.");
          return;
      }

      // ── Handle Free Tickets ──
      if (ticket.price === 0) {
        setPurchasing(ticket.id);
        const { error } = await supabase.from('user_tickets').insert({
          user_id: user.id,
          event_id: projectId,
          ticket_id: ticket.id,
          qr_code: `FREE-${Date.now()}`,
          status: 'successful',
          user_email: user.email
        });

        if (error) throw error;
        Alert.alert('Success', 'Free ticket claimed successfully! View it in your profile.');
        refetch();
        setPurchasing(null);
        return;
      }

      // ── Handle Direct UPI ──
      if (ticket.upi_id) {
        // Strict UPI URI formatting: 2 decimal places, encoded names
        const amount = Number(ticket.price).toFixed(2);
        const upiUrl = `upi://pay?pa=${ticket.upi_id}&pn=${encodeURIComponent(event.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(ticket.name)}`;
        
        try {
          // Skip canOpenURL trap on Android 11+ and attempt to force open
          await Linking.openURL(upiUrl);
          
          // Show proof submission modal if intent was handled by the OS
          setSelectedTicket(ticket);
          setShowProofModal(true);
        } catch (error) {
          console.error('[UPI Intent Error]:', error);
          Alert.alert(
            'No UPI App Found', 
            'We couldn\'t find a UPI app like GPay, PhonePe, or Paytm on your phone. Please install one to continue.'
          );
        }
        return;
      }

      // ── Handle Razorpay (Fallback if no upi_id) ──
      setPurchasing(ticket.id);
      const response = await fetch(`${BACKEND_URL}/api/checkout/razorpay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: ticket.price,
          app_id: projectId,
          user_id: user.id,
          ticket_id: ticket.id,
          receipt: `rcpt_${Date.now()}`
        })
      });

      const order = await response.json();
      if (!response.ok) throw new Error(order.error || 'Failed to create payment order');

      const checkoutUrl = `${BACKEND_URL}/checkout/razorpay?orderId=${order.id}&amount=${order.amount}&name=${encodeURIComponent(event.name)}&description=${encodeURIComponent(ticket.name)}`;
      await WebBrowser.openBrowserAsync(checkoutUrl);
      
      Alert.alert('Payment Initiated', 'Once completed, your ticket will appear in the Profile tab.');
    } catch (error: any) {
      console.error('[Purchase Error]:', error);
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
        setPurchasing(null);
    }
  };

  const submitPaymentProof = async () => {
    // Standard UPI UTRs are 12 digits.
    const cleanUTR = utrNumber.trim();
    if (!cleanUTR || cleanUTR.length !== 12) {
        return Alert.alert("Invalid UTR", "Please enter the exact 12-digit Transaction ID / UTR number from your payment app.");
    }

    setIsSubmittingProof(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const projectId = config.project_id || config.id;
        
        const { error } = await supabase.from('user_tickets').insert({
            user_id: user?.id,
            user_email: user?.email,
            event_id: projectId,
            ticket_id: selectedTicket.id,
            status: 'pending',
            proof_utr: utrNumber
        });

        if (error) throw error;

        Alert.alert("Submitted!", "Your payment is under review. The ticket will appear in your profile once the admin approves it.");
        setShowProofModal(false);
        setUtrNumber("");
        refetch();
    } catch (err: any) {
        Alert.alert("Error", err.message);
    } finally {
        setIsSubmittingProof(false);
    }
  };

  if (ticketsLoading && (!tickets || tickets.length === 0)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={ticketsLoading} onRefresh={refetch} tintColor={theme.primary} />}
    >
      <View style={styles.header}>
        <ThemeText variant="heading" style={{ fontSize: 32 }}>GET YOUR</ThemeText>
        <ThemeText variant="heading" style={{ fontSize: 32, color: theme.primary }}>ACCESS</ThemeText>
      </View>

      <View style={styles.grid}>
        {tickets.map(ticket => (
          <View key={ticket.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.primary + '30' }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                <TicketIcon size={24} color={theme.primary} />
              </View>
              <ThemeText variant="heading" style={{ fontSize: 28 }}>
                {ticket.price > 0 ? `₹${ticket.price}` : 'FREE'}
              </ThemeText>
            </View>
            
            <ThemeText variant="subheading" style={styles.name}>{ticket.name}</ThemeText>
            <ThemeText variant="body" secondary style={styles.description}>{ticket.description}</ThemeText>

            {(() => {
              const isOwned = userOwnedTickets?.some((ut: any) => ut.ticket_id === ticket.id && (ut.status === 'successful' || ut.status === 'pending'));
              
              return (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: isOwned ? theme.surface : theme.primary, borderColor: isOwned ? theme.primary + '40' : 'transparent', borderWidth: isOwned ? 1 : 0 }]}
                  onPress={() => !isOwned && handlePurchase(ticket)}
                  disabled={purchasing !== null || isOwned}
                >
                  {purchasing === ticket.id ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <>
                      {isOwned ? <CheckCircle size={20} color="#10B981" style={{ marginRight: 8 }} /> : (ticket.upi_id ? <Zap size={20} color="#000" style={{ marginRight: 8 }} /> : <CreditCard size={20} color="#000" style={{ marginRight: 8 }} />)}
                      <ThemeText style={[styles.buttonText, { color: isOwned ? '#10B981' : '#000' }]}>
                        {isOwned ? 'ALREADY OWNED' : (ticket.price === 0 ? 'CLAIM PASS' : ticket.upi_id ? 'PAY VIA UPI' : 'BUY NOW')}
                      </ThemeText>
                    </>
                  )}
                </TouchableOpacity>
              );
            })()}
          </View>
        ))}
      </View>

      {/* Verification Modal */}
      <Modal visible={showProofModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <ThemeText variant="heading" style={{ color: theme.primary }}>PAYMENT PROOF</ThemeText>
            <ThemeText variant="body" secondary style={{ textAlign: 'center', marginVertical: 15 }}>
              Enter the 12-digit UTR/Transaction ID from your UPI app so the admin can verify your payment.
            </ThemeText>
            
            <ThemeInput
              placeholder="12-digit UTR Number"
              value={utrNumber}
              onChangeText={setUtrNumber}
              keyboardType="number-pad"
              style={{ width: '100%', marginBottom: 20 }}
            />

            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: theme.primary }]}
              onPress={submitPaymentProof}
              disabled={isSubmittingProof}
            >
              {isSubmittingProof ? <ActivityIndicator color="#000" /> : (
                <>
                  <Send size={18} color="#000" style={{ marginRight: 8 }} />
                  <ThemeText style={styles.buttonText}>SUBMIT FOR REVIEW</ThemeText>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowProofModal(false)} style={{ marginTop: 20 }}>
              <ThemeText variant="caption" secondary>Close & Submit Later</ThemeText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  header: { marginBottom: 32, alignItems: 'center', paddingVertical: 20 },
  grid: { gap: 20 },
  card: { borderRadius: 32, padding: 24, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  iconContainer: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 22, marginBottom: 8 },
  description: { marginBottom: 24, lineHeight: 22 },
  button: { flexDirection: 'row', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', width: '100%' },
  buttonText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 32, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  input: { width: '100%', height: 60, borderRadius: 16, borderWidth: 1, paddingHorizontal: 20, fontSize: 18, fontWeight: '700', marginBottom: 20 },
  submitButton: { flexDirection: 'row', height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', width: '100%' },
  footer: { height: 100 }
});
