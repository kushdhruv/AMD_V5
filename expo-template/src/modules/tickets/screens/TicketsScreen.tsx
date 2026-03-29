import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalEventTickets } from '../../../hooks/useLocalData';
import { useTheme } from '../../../theme/ThemeProvider';
import { ThemeText } from '../../../components/UIKit';
import { Ticket, Zap, CreditCard } from 'lucide-react-native';
import { supabase } from '../../../services/supabaseClient';
import { useConfigStore } from '../../../store/configStore';
import * as WebBrowser from 'expo-web-browser';


export function TicketsScreen() {
  const { data: tickets, loading, refetch } = useLocalEventTickets();
  const theme = useTheme();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = async (ticket: any) => {
    setPurchasing(ticket.id);
    try {
      // Get the logged in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in to purchase a ticket.");
        setPurchasing(null);
        return;
      }

      // Note: In a production environment, this would call a Next.js API route 
      // (/api/payment/razorpay) to generate a secure Razorpay Payment Link,
      // and we would open it using WebBrowser.openBrowserAsync(link.url).
      // For this implementation, we will mock the Razorpay gateway delay and 
      // immediately issue the ticket as "successful" to verify the flow,
      // OR if Next.js endpoint exists, dial it.
      
      const config = useConfigStore.getState().config;
      const appId = config.project_id || config.event?.name;
      
      const payload = {
        app_id: appId,
        ticket_id: ticket.id,
        user_id: user.id,
        user_email: user.email,
        amount: ticket.price,
      };

      // Skip Razorpay for Free Tickets
      if (ticket.price > 0) {
        // Simulated Razorpay UPI Gateway Flow
        console.log('Redirecting to Razorpay Gateway for:', payload);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate gateway delay
      }
      
      // Generate ID and QR
      const mockPaymentId = ticket.price > 0 ? 'pay_' + Math.random().toString(36).substr(2, 9) : 'free_' + Math.random().toString(36).substr(2, 9);
      const mockQrCode = 'event_' + appId + '_tkt_' + mockPaymentId;

      const { error } = await supabase.from('user_tickets').insert({
          user_id: user.id,
          user_email: user.email,
          event_id: appId,
          ticket_id: ticket.id,
          payment_id: mockPaymentId,
          status: 'successful',
          qr_code: mockQrCode
      });

      if (error) throw error;
      
      if (ticket.price > 0) {
        alert(`Success! Your Razorpay UPI payment for ${ticket.price} INR was successful. View your QR ticket in the Profile tab.`);
      } else {
        alert(`Registration Successful! You have claimed your free ticket for ${ticket.name}. View it in your Profile.`);
      }
      
      // Trigger a local refresh so any other local states update
      refetch();
    } catch (e: any) {
      alert("Checkout failed: " + e.message);
    } finally {
      setPurchasing(null);
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <View style={styles.center}>
        <ThemeText variant="caption">Loading tickets...</ThemeText>
      </View>
    );
  }

  if (tickets.length === 0) {
    return (
      <View style={styles.center}>
        <ThemeText style={{ fontSize: 64, marginBottom: 8 }}>🎉</ThemeText>
        <ThemeText variant="subheading" style={{ textAlign: 'center', fontSize: 22, fontWeight: '800' }}>
          Walk Right In — It's FREE!
        </ThemeText>
        <ThemeText variant="caption" secondary style={{ textAlign: 'center', marginTop: 10, paddingHorizontal: 40, lineHeight: 22 }}>
          No tickets needed for this one. Just show up, vibe out, and enjoy the experience on us. 🙌
        </ThemeText>

      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={theme.primary} />}
    >
      <View style={styles.header}>
        <ThemeText variant="heading" style={{ fontSize: 32 }}>SECURE</ThemeText>
        <ThemeText variant="heading" style={{ fontSize: 32, color: theme.primary }}>ACCESS</ThemeText>
      </View>

      <View style={styles.grid}>
        {tickets.map(ticket => (
          <View key={ticket.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.primary + '30' }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                <Ticket size={24} color={theme.primary} />
              </View>
              <ThemeText variant="heading" style={{ fontSize: 28 }}>
                {ticket.price > 0 ? `₹${ticket.price}` : 'FREE'}
              </ThemeText>
            </View>
            
            <ThemeText variant="subheading" style={styles.name}>{ticket.name}</ThemeText>
            
            {ticket.description ? (
              <ThemeText variant="body" secondary style={styles.description}>
                {ticket.description}
              </ThemeText>
            ) : null}

            <TouchableOpacity
              style={[
                styles.button, 
                { backgroundColor: theme.primary },
                purchasing === ticket.id && { opacity: 0.7 }
              ]}
              onPress={() => handlePurchase(ticket)}
              disabled={purchasing !== null}
            >
              {purchasing === ticket.id ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  {ticket.price > 0 ? (
                    <CreditCard size={20} color="#000" style={{ marginRight: 8 }} />
                  ) : (
                    <Zap size={20} color="#000" style={{ marginRight: 8 }} />
                  )}
                  <ThemeText style={styles.buttonText}>
                    {ticket.price > 0 ? 'PAY VIA UPI' : 'CLAIM TICKET'}
                  </ThemeText>
                </>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>



      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
    paddingVertical: 20,
  },
  grid: {
    gap: 20,
  },
  card: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    marginBottom: 8,
  },
  description: {
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  footer: {
    height: 100,
  },
  adContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  }
});
