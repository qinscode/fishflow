import * as Haptics from 'expo-haptics';
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/hooks/useThemeColor';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  icon?: string;
  duration?: number;
  visible: boolean;
  onHide: () => void;
}

export function Toast({
  type,
  title,
  message,
  icon,
  duration = 4000,
  visible,
  onHide,
}: ToastProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [isShowing, setIsShowing] = useState(false);

  const translateY = useSharedValue(-200);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: theme.colors.success || '#10B981',
          borderColor: theme.colors.success || '#059669',
          icon: icon || 'checkmark.circle.fill',
        };
      case 'error':
        return {
          backgroundColor: theme.colors.error,
          borderColor: theme.colors.error,
          icon: icon || 'xmark.circle.fill',
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.warning || '#F59E0B',
          borderColor: theme.colors.warning || '#D97706',
          icon: icon || 'exclamationmark.triangle.fill',
        };
      case 'info':
      default:
        return {
          backgroundColor: theme.colors.info || theme.colors.primary,
          borderColor: theme.colors.primary,
          icon: icon || 'info.circle.fill',
        };
    }
  };

  const hideToast = useCallback(() => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(-200, {
      duration: 300,
      easing: Easing.in(Easing.cubic),
    });
    scale.value = withTiming(0.8, { duration: 200 }, finished => {
      if (finished) {
        runOnJS(() => {
          setIsShowing(false);
          onHide();
        })();
      }
    });
  }, [opacity, translateY, scale, onHide]);

  useEffect(() => {
    if (visible && !isShowing) {
      setIsShowing(true);

      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(
          type === 'success'
            ? Haptics.NotificationFeedbackType.Success
            : type === 'error'
              ? Haptics.NotificationFeedbackType.Error
              : Haptics.NotificationFeedbackType.Warning
        );
      }

      // Show animation
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.back(1.1)),
      });
      scale.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.back(1.1)),
      });

      // Auto hide
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [
    visible,
    isShowing,
    type,
    duration,
    opacity,
    translateY,
    scale,
    hideToast,
  ]);

  const typeConfig = getTypeConfig();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  if (!visible && !isShowing) {
    return null;
  }

  return (
    <View
      style={[styles.container, { top: insets.top + 10 }]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor: typeConfig.backgroundColor,
            borderColor: typeConfig.borderColor,
          },
          animatedStyle,
        ]}
      >
        <View style={styles.content}>
          <IconSymbol
            name={typeConfig.icon as any}
            size={24}
            color="#FFFFFF"
            style={styles.icon}
          />

          <View style={styles.textContent}>
            <ThemedText
              type="subtitle"
              style={[styles.title, { color: '#FFFFFF' }]}
            >
              {title}
            </ThemedText>

            {message && (
              <ThemedText
                type="bodySmall"
                style={[styles.message, { color: '#FFFFFF' }]}
              >
                {message}
              </ThemedText>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toast, setToast] = useState<{
    type: ToastType;
    title: string;
    message?: string;
    icon?: string;
    duration?: number;
    visible: boolean;
  } | null>(null);

  const showToast = (options: {
    type: ToastType;
    title: string;
    message?: string;
    icon?: string;
    duration?: number;
  }) => {
    setToast({ ...options, visible: true });
  };

  const hideToast = () => {
    setToast(prev => (prev ? { ...prev, visible: false } : null));
  };

  const ToastComponent = toast ? (
    <Toast
      type={toast.type}
      title={toast.title}
      message={toast.message}
      icon={toast.icon}
      duration={toast.duration}
      visible={toast.visible}
      onHide={() => setToast(null)}
    />
  ) : null;

  return {
    showToast,
    hideToast,
    ToastComponent,
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    maxWidth: width - 40,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    opacity: 0.9,
  },
});
