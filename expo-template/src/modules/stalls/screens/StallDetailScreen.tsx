// ============================================================
// STALL DETAIL SCREEN — Full stall page with menu & order flow
// Flow: StallList → StallDetail → Menu → [Order / WhatsApp]
// ============================================================
import React, { useState } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, Linking,
  StyleSheet, Alert,
} from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { ThemeText, ThemeBadge, ThemeButton, ThemeDivider } from '../../../components/UIKit';
import { Stall, MenuItem } from '../services/stallTypes';

interface Props {
  stall: Stall;
  onBack: () => void;
}

// ── Menu Item Row ──────────────────────────────────────────
function MenuItemRow({
  item,
  count,
  onAdd,
  onRemove,
}: {
  item: MenuItem;
  count: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.menuRow, { borderBottomColor: theme.textSecondary + '18' }]}>
      <View style={styles.menuLeft}>
        <View style={[styles.vegDot, { backgroundColor: item.isVeg ? '#22C55E' : '#EF4444' }]} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ThemeText variant="body">{item.emoji} {item.name}</ThemeText>
            {item.isPopular && <ThemeBadge label="POPULAR" color={theme.accent} />}
          </View>
          <ThemeText variant="caption" secondary>{item.description}</ThemeText>
          <ThemeText variant="body" style={{ color: theme.primary, marginTop: 2 }}>₹{item.price}</ThemeText>
        </View>
      </View>

      {/* Quantity control */}
      <View style={styles.qtyControl}>
        {count > 0 ? (
          <>
            <TouchableOpacity
              onPress={onRemove}
              style={[styles.qtyBtn, { backgroundColor: theme.primary + '22', borderRadius: theme.radius / 2 }]}
            >
              <Text style={{ color: theme.primary, fontWeight: '700' }}>−</Text>
            </TouchableOpacity>
            <ThemeText variant="body" style={{ minWidth: 20, textAlign: 'center' }}>{count}</ThemeText>
            <TouchableOpacity
              onPress={onAdd}
              style={[styles.qtyBtn, { backgroundColor: theme.primary, borderRadius: theme.radius / 2 }]}
            >
              <Text style={{ color: '#FFF', fontWeight: '700' }}>+</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={onAdd}
            style={[styles.addBtn, { borderColor: theme.primary, borderRadius: theme.radius / 2 }]}
          >
            <ThemeText variant="caption" style={{ color: theme.primary }}>ADD</ThemeText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Order Summary Sheet ────────────────────────────────────
function OrderSummary({
  stall,
  cart,
  onOrder,
  onClose,
}: {
  stall: Stall;
  cart: Record<string, number>;
  onOrder: (method: 'whatsapp' | 'call' | 'mock' | 'upi') => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  const cartItems = stall.menu.filter((item) => (cart[item.id] ?? 0) > 0);
  const total = cartItems.reduce((sum, item) => sum + item.price * cart[item.id], 0);

  return (
    <View style={[styles.orderSheet, { backgroundColor: theme.surface }]}>
      <View style={styles.sheetHandle} />
      <ThemeText variant="subheading" style={{ marginBottom: 12 }}>Order Summary</ThemeText>

      {cartItems.map((item) => (
        <View key={item.id} style={styles.summaryRow}>
          <ThemeText variant="body">{item.emoji} {item.name} ×{cart[item.id]}</ThemeText>
          <ThemeText variant="body" style={{ color: theme.primary }}>₹{item.price * cart[item.id]}</ThemeText>
        </View>
      ))}

      <ThemeDivider />
      <View style={styles.summaryRow}>
        <ThemeText variant="subheading">Total</ThemeText>
        <ThemeText variant="subheading" style={{ color: theme.primary }}>₹{total}</ThemeText>
      </View>

      <ThemeText variant="caption" secondary style={{ marginTop: 8, marginBottom: 16 }}>
        Choose how you'd like to place your order:
      </ThemeText>

      <View style={{ gap: 10 }}>
        <ThemeButton onPress={() => onOrder('upi')} fullWidth>
          💳 Pay with UPI (₹{total})
        </ThemeButton>
        {stall.contact.whatsapp && (
          <ThemeButton onPress={() => onOrder('whatsapp')} variant="ghost" fullWidth>
            📱 Order via WhatsApp
          </ThemeButton>
        )}
        <ThemeButton onPress={() => onOrder('call')} variant="ghost" fullWidth>
          📞 Call to Order: {stall.contact.phone}
        </ThemeButton>
        <ThemeButton onPress={onClose} variant="ghost" fullWidth>
          Back to Menu
        </ThemeButton>
      </View>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────
import { useUPIPayment } from '../../../hooks/useUPIPayment';

export function StallDetailScreen({ stall, onBack }: Props) {
  const theme = useTheme();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showOrder, setShowOrder] = useState(false);
  const { initiatePayment } = useUPIPayment();

  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = stall.menu.find((m) => m.id === id);
    return sum + (item?.price ?? 0) * qty;
  }, 0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const addItem = (id: string) =>
    setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  const removeItem = (id: string) =>
    setCart((prev) => {
      const newQty = (prev[id] ?? 0) - 1;
      if (newQty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQty };
    });

  const handleOrder = async (method: 'whatsapp' | 'call' | 'mock' | 'upi') => {
    if (method === 'upi') {
      const res = await initiatePayment({
        payeeAddress: 'test@upi', // Replace with real UPI ID from stall config
        payeeName: stall.name,
        amount: cartTotal.toString(),
        transactionNote: `Order from ${stall.name}`
      });
      if (res.success) {
        Alert.alert('Payment Initiated', `Opening UPI App to pay ₹${cartTotal}`);
      }
    } else if (method === 'whatsapp' && stall.contact.whatsapp) {
      const itemList = stall.menu
        .filter((m) => cart[m.id] > 0)
        .map((m) => `${m.name} ×${cart[m.id]} (₹${m.price * cart[m.id]})`)
        .join('\n');
      const msg = `Hi! I'd like to order from ${stall.name}:\n\n${itemList}\n\nTotal: ₹${cartTotal}\nPlaced via TechFest App`;
      Linking.openURL(`whatsapp://send?phone=${stall.contact.whatsapp}&text=${encodeURIComponent(msg)}`);
    } else if (method === 'call') {
      Linking.openURL(`tel:${stall.contact.phone}`);
    } else {
      Alert.alert('Order Placed! ✅', `Your order of ₹${cartTotal} from ${stall.name} has been sent.`);
    }
    setShowOrder(false);
    setCart({});
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      {/* ── Hero Area ──────────────────────────────── */}
      <View style={[styles.hero, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={{ color: theme.primary, fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.heroContent}>
          <Text style={{ fontSize: 52 }}>{stall.emoji}</Text>
          <View style={{ flex: 1 }}>
            <ThemeText variant="heading">{stall.name}</ThemeText>
            <ThemeText variant="caption" secondary>{stall.description}</ThemeText>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6. }}>
              <Text style={{ color: '#F59E0B', fontSize: 13 }}>⭐ {stall.rating}</Text>
              <ThemeText variant="caption" secondary>({stall.reviewCount} reviews)</ThemeText>
            </View>
          </View>
        </View>

        {/* Info strips */}
        <View style={styles.infoStrip}>
          <View style={styles.infoItem}>
            <Text style={{ fontSize: 14 }}>📍</Text>
            <ThemeText variant="caption" secondary>{stall.location}</ThemeText>
          </View>
          <View style={styles.infoItem}>
            <Text style={{ fontSize: 14 }}>🕐</Text>
            <ThemeText variant="caption" secondary>{stall.timings}</ThemeText>
          </View>
          <View style={styles.infoItem}>
            <Text style={{ fontSize: 14 }}>💰</Text>
            <ThemeText variant="caption" secondary>{stall.priceRange}</ThemeText>
          </View>
        </View>
      </View>

      {/* ── Menu ───────────────────────────────────── */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={styles.menuSection}>
          <ThemeText variant="subheading" style={{ marginBottom: 4 }}>Menu</ThemeText>
          <ThemeText variant="caption" secondary style={{ marginBottom: 12 }}>
            Tap ADD to add items. WhatsApp / Call to place order.
          </ThemeText>
          {stall.menu.map((item) => (
            <MenuItemRow
              key={item.id}
              item={item}
              count={cart[item.id] ?? 0}
              onAdd={() => addItem(item.id)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Sticky Cart Button ─────────────────────── */}
      {cartCount > 0 && !showOrder && (
        <View style={[styles.cartBar, { backgroundColor: theme.primary }]}>
          <Text style={styles.cartText}>{cartCount} item{cartCount > 1 ? 's' : ''} added</Text>
          <TouchableOpacity onPress={() => setShowOrder(true)}>
            <Text style={styles.cartCta}>View Order · ₹{cartTotal} →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Order Sheet ────────────────────────────── */}
      {showOrder && (
        <OrderSummary
          stall={stall}
          cart={cart}
          onOrder={handleOrder}
          onClose={() => setShowOrder(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16 },
  backBtn: { marginBottom: 12 },
  heroContent: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', marginBottom: 16 },
  infoStrip: { gap: 6 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuSection: { padding: 16 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  menuLeft: { flex: 1, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  vegDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  addBtn: { paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1.5 },
  cartBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 28 },
  cartText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  cartCta: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  orderSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 20 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#555', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
});
