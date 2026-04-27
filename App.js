import 'react-native-gesture-handler';
import './global.css';
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';

import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import GeradorDeSenha from './screens/GeradorDeSenha';
import Historico from './screens/Historico';
import { buscarToken, removerToken } from './services/storage';

const Stack = createNativeStackNavigator();

export default function App() {
  const [carregando, setCarregando] = useState(true);
  const [rotaInicial, setRotaInicial] = useState('SignIn');

  useEffect(() => {
    async function verificarLogin() {
      try {
        const token = await buscarToken();

        if (token) {
          setRotaInicial('GeradorDeSenha');
        } else {
          setRotaInicial('SignIn');
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
        setRotaInicial('SignIn');
      } finally {
        setCarregando(false);
      }
    }

    verificarLogin();
  }, []);

  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6FB3FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={rotaInicial}
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#6FB3FF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="SignIn"
          component={SignIn}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="GeradorDeSenha"
          component={GeradorDeSenha}
          options={({ navigation }) => ({
            title: 'Home',
            headerLeft: () => null,
            headerBackVisible: false,
            gestureEnabled: false,
            headerRight: () => (
              <Pressable
                onPress={async () => {
                  await removerToken();

                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'SignIn' }],
                  });
                }}
                style={{
                  paddingRight: 12,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    color: '#6FB3FF',
                    fontWeight: 'bold',
                    fontSize: 16,
                  }}
                >
                  Sair
                </Text>
              </Pressable>
            ),
          })}
        />

        <Stack.Screen
          name="Historico"
          component={Historico}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
