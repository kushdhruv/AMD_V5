// ============================================================
// SHARED UI KIT — Theme-driven atomic components.
// ZERO hardcoded colors. All components bind to useTheme().
// ============================================================
import React from 'react';
import {
  Text,
  TextStyle,
  View,
  ViewStyle,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

// ── ThemeText ─────────────────────────────────────────────
type TextVariant = 'heading' | 'subheading' | 'body' | 'caption' | 'label';

interface ThemeTextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  style?: StyleProp<TextStyle>;
  secondary?: boolean;
}

export function ThemeText({
  children,
  variant = 'body',
  style,
  secondary = false,
}: ThemeTextProps) {
  const theme = useTheme();

  const variantStyles: Record<TextVariant, TextStyle> = {
    heading: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
    subheading: { fontSize: 18, fontWeight: '600' },
    body: { fontSize: 14, fontWeight: '400', lineHeight: 22 },
    caption: { fontSize: 12, fontWeight: '400', lineHeight: 18 },
    label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  };

  return (
    <Text
      style={[
        variantStyles[variant],
        { color: secondary ? theme.textSecondary : theme.textPrimary },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// ── ThemeButton ───────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ThemeButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export function ThemeButton({
  onPress,
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
}: ThemeButtonProps) {
  const theme = useTheme();

  const getBackground = () => {
    switch (variant) {
      case 'primary': return theme.primary;
      case 'secondary': return theme.secondary;
      case 'ghost': return 'transparent';
      case 'danger': return '#DC2626';
    }
  };

  const getBorderColor = () => {
    if (variant === 'ghost') return theme.primary;
    return 'transparent';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.buttonBase,
        {
          backgroundColor: getBackground(),
          borderColor: getBorderColor(),
          borderRadius: theme.radius / 1.5,
          opacity: disabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        variant === 'ghost' && { borderWidth: 1.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? theme.primary : '#FFFFFF'} size="small" />
      ) : (
        <Text
          style={{
            color: variant === 'ghost' ? theme.primary : '#FFFFFF',
            fontSize: 14,
            fontWeight: '600',
          }}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ── ThemeCard ─────────────────────────────────────────────
interface ThemeCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevated?: boolean;
}

export function ThemeCard({ children, style, onPress, elevated = false }: ThemeCardProps) {
  const theme = useTheme();

  const cardContent = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderRadius: theme.radius,
          shadowColor: theme.primary,
          shadowOpacity: elevated ? 0.15 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

// ── ThemeBadge ────────────────────────────────────────────
interface ThemeBadgeProps {
  label: string;
  color?: string;
}

export function ThemeBadge({ label, color }: ThemeBadgeProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: (color ?? theme.primary) + '22', borderRadius: theme.radius / 2 },
      ]}
    >
      <Text style={{ color: color ?? theme.primary, fontSize: 11, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
}

// ── ThemeDivider ─────────────────────────────────────────
export function ThemeDivider() {
  const theme = useTheme();
  return (
    <View style={{ height: 1, backgroundColor: theme.textSecondary + '22', marginVertical: 8 }} />
  );
}

// ── ThemeInput ──────────────────────────────────────────
import { TextInput, TextInputProps } from 'react-native';

export function ThemeInput(props: TextInputProps) {
  const theme = useTheme();
  return (
    <TextInput
      {...props}
      style={[
        {
          backgroundColor: theme.background,
          color: theme.textPrimary,
          padding: 16,
          borderRadius: theme.radius / 1.5,
          fontSize: 14,
          fontWeight: '500',
        },
        props.style,
      ]}
      placeholderTextColor={theme.textSecondary + '88'}
    />
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
});
