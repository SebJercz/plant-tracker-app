import '../global.css';
import 'expo-dev-client';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Icon } from '@roninoss/icons';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, View, Text } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeToggle } from '~/components/ThemeToggle';
import { cn } from '~/lib/cn';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';
import { useStore } from '~/store/store';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />
      {/* WRAP YOUR APP WITH ANY ADDITIONAL PROVIDERS HERE */}
      {/* <ExampleProvider> */}

      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <ActionSheetProvider>
            <NavThemeProvider value={NAV_THEME[colorScheme]}>
              <Stack screenOptions={SCREEN_OPTIONS}>
                <Stack.Screen name="index" options={INDEX_OPTIONS} />
                <Stack.Screen name="modal" options={MODAL_OPTIONS} />
              </Stack>
            </NavThemeProvider>
          </ActionSheetProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>

      {/* </ExampleProvider> */}
    </>
  );
}

const SCREEN_OPTIONS = {
  animation: 'ios_from_right', // for android
} as const;

const INDEX_OPTIONS = {
  headerLargeTitle: true,
  title: 'Plant Tracker',
  headerRight: () => <HeaderButtons />,
} as const;

function HeaderButtons() {
  const { colors } = useColorScheme();
  const { debugTimeOffset, setDebugTimeOffset } = useStore();

  const handleTimeForward = () => {
    setDebugTimeOffset(debugTimeOffset + 1);
  };

  const handleTimeBackward = () => {
    setDebugTimeOffset(debugTimeOffset - 1);
  };

  const handleResetTime = () => {
    setDebugTimeOffset(0);
  };

  return (
    <View className="flex-row items-center gap-2">
      {/* Debug Time Travel Buttons */}
      <Pressable onPress={handleTimeBackward} className="opacity-80">
        {({ pressed }) => (
          <View className={cn(pressed ? 'opacity-50' : 'opacity-90', 'w-6 h-6 items-center justify-center')}>
            <Text style={{ color: colors.grey, fontSize: 16, fontWeight: 'bold' }}>◀</Text>
          </View>
        )}
      </Pressable>
      
      <Pressable onPress={handleTimeForward} className="opacity-80">
        {({ pressed }) => (
          <View className={cn(pressed ? 'opacity-50' : 'opacity-90', 'w-6 h-6 items-center justify-center')}>
            <Text style={{ color: colors.grey, fontSize: 16, fontWeight: 'bold' }}>▶</Text>
          </View>
        )}
      </Pressable>
      
      {/* Reset Time Button */}
      {debugTimeOffset !== 0 && (
        <Pressable onPress={handleResetTime} className="opacity-80">
          {({ pressed }) => (
            <View className={cn(pressed ? 'opacity-50' : 'opacity-90', 'w-6 h-6 items-center justify-center')}>
              <Text style={{ color: colors.grey, fontSize: 16, fontWeight: 'bold' }}>⟲</Text>
            </View>
          )}
        </Pressable>
      )}
      
      {/* Settings Button */}
      <Link href="/modal" asChild>
        <Pressable className="opacity-80">
          {({ pressed }) => (
            <View className={cn(pressed ? 'opacity-50' : 'opacity-90')}>
              <Icon name="cog-outline" color={colors.foreground} />
            </View>
          )}
        </Pressable>
      </Link>
    </View>
  );
}

const MODAL_OPTIONS = {
  presentation: 'modal',
  animation: 'fade_from_bottom', // for android
  title: 'Settings',
  headerRight: () => <ThemeToggle />,
} as const;
