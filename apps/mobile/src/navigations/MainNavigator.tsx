import { NavigationContainer } from "@react-navigation/native";
import TabNavigator from "./TabNavigator";

export default function MainNavigator() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}
