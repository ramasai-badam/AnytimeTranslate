import { Tabs } from 'expo-router';
import { Languages } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Translator',
          tabBarIcon: ({ size, color }) => (
            <Languages size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}