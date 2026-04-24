import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { COLORS, RADIUS } from "@/src/theme/theme.config";

type TabSpec = {
  routeName: string;
  title: string;
  iconFocused: keyof typeof Ionicons.glyphMap;
  iconUnfocused: keyof typeof Ionicons.glyphMap;
};

const TAB_SPECS: TabSpec[] = [
  { routeName: "dashboard",    title: "Home",    iconFocused: "grid",          iconUnfocused: "grid-outline" },
  { routeName: "transactions", title: "Txns",    iconFocused: "swap-vertical", iconUnfocused: "swap-vertical-outline" },
  { routeName: "accounts",     title: "Wallets", iconFocused: "wallet",        iconUnfocused: "wallet-outline" },
  { routeName: "loans",        title: "Loans",   iconFocused: "cash",          iconUnfocused: "cash-outline" },
  { routeName: "profile",      title: "Profile", iconFocused: "person",        iconUnfocused: "person-outline" },
];

interface TabButtonProps {
  iconFocused: keyof typeof Ionicons.glyphMap;
  iconUnfocused: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
  onPress: () => void;
}

const TabButton = ({ iconFocused, iconUnfocused, label, focused, onPress }: TabButtonProps) => {
  const pillWidth = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(pillWidth, {
      toValue: focused ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [focused, pillWidth]);

  const widthInterp = pillWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [44, 96],
  });

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.selectionAsync().catch(() => {});
        }
        onPress();
      }}
      hitSlop={6}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <Animated.View
        style={{
          width: widthInterp,
          height: 40,
          borderRadius: 20,
          backgroundColor: focused ? COLORS.primaryLight : "transparent",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 10,
          overflow: "hidden",
        }}
      >
        <Ionicons
          name={focused ? iconFocused : iconUnfocused}
          size={focused ? 19 : 22}
          color={focused ? COLORS.primary : COLORS.textMuted}
        />
        {focused && (
          <Text
            numberOfLines={1}
            style={{
              marginLeft: 5,
              color: COLORS.primary,
              fontSize: 12,
              fontWeight: "700",
              letterSpacing: 0.1,
            }}
          >
            {label}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

const AddFab = ({ onPress }: { onPress: () => void }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 28, bounciness: 0 }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 10 }).start();

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        }
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={10}
      style={{ marginHorizontal: 6 }}
    >
      <Animated.View
        style={{
          transform: [{ scale }],
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: COLORS.primary,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 10,
          marginTop: -28,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 5,
            left: 5,
            right: 5,
            bottom: 5,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.25)",
          }}
        />
        <Ionicons name="add" size={26} color={COLORS.white} />
      </Animated.View>
    </Pressable>
  );
};

export default function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const tabByRoute = new Map(TAB_SPECS.map((t) => [t.routeName, t]));

  const orderedRoutes = TAB_SPECS
    .map((spec) => state.routes.find((r) => r.name === spec.routeName))
    .filter(Boolean) as typeof state.routes;

  const currentFocusedRouteName = state.routes[state.index]?.name;

  // Split: 2 left | FAB | 3 right
  // const leftTabs = orderedRoutes.slice(0, 2);
  // const rightTabs = orderedRoutes.slice(2);

  const handleNavigate = (routeName: string) => {
    const event = navigation.emit({
      type: "tabPress",
      target: routeName,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) {
      navigation.navigate(routeName as never);
    }
  };

  const handleAdd = () => {
    // TODO: push to your add-transaction modal when ready
    router.push("/(app)/(tabs)/transactions" as never);
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: insets.bottom > 0 ? insets.bottom - 4 : 12,
        paddingHorizontal: 16,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 520,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.98)",
          borderRadius: RADIUS.xl,
          paddingHorizontal: 20,
          paddingVertical: 4,
          borderWidth: 1,
          borderColor: "rgba(15,27,45,0.06)",
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
          elevation: 16,
        }}
      >
        {orderedRoutes.map((route) => {
          const spec = tabByRoute.get(route.name)!;
          const focused = route.name === currentFocusedRouteName;
          return (
            <TabButton
              key={route.name}
              iconFocused={spec.iconFocused}
              iconUnfocused={spec.iconUnfocused}
              label={spec.title}
              focused={focused}
              onPress={() => handleNavigate(route.name)}
            />
          );
        })}
  
        {/* {rightTabs.map((route) => {
          const spec = tabByRoute.get(route.name)!;
          const focused = route.name === currentFocusedRouteName;
          return (
            <TabButton
              key={route.name}
              iconFocused={spec.iconFocused}
              iconUnfocused={spec.iconUnfocused}
              label={spec.title}
              focused={focused}
              onPress={() => handleNavigate(route.name)}
            />
          );
        })} */}
      </View>
    </View>
  );
}
