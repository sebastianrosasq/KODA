import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';

import { useReducedMotion } from '@/hooks/use-reduced-motion';

export function KodaReveal({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reducedMotion = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(10));

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(reducedMotion ? 0 : 10);
    const animations = [
      Animated.timing(opacity, {
        toValue: 1,
        delay,
        duration: reducedMotion ? 160 : 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ];

    if (!reducedMotion) {
      animations.push(
        Animated.timing(translateY, {
          toValue: 0,
          delay,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      );
    }

    const animation = Animated.parallel(animations);
    animation.start();
    return () => animation.stop();
  }, [delay, opacity, reducedMotion, translateY]);

  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}
