import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

interface TextInputFieldProps extends TextInputProps {
  label?: string;                     // optional label above input
  error?: string;                     // error message
  secure?: boolean;                   // password input
  icon?: React.ReactNode;             // left-side icon
  returnKeyType?: "next" | "done";    // keyboard return key
  onSubmitEditing?: () => void;       // action on "next" or "done"
  inputRef?: React.RefObject<TextInput>; // pass refs to chain focus
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secure = false,
  keyboardType = "default",
  error,
  icon,
  returnKeyType = "done",
  onSubmitEditing,
  inputRef,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-4 w-full">
      {/* Label */}
      {label && (
        <Text className="mb-1 text-sm text-gray-400 font-medium">{label}</Text>
      )}

      {/* Input Wrapper */}
      <View
        className={`flex-row items-center px-4 py-3 rounded-2xl bg-gray-800 border
          ${error ? "border-red-500" : "border-transparent"}`}
      >
        {/* Left Icon */}
        {icon && <View className="mr-2">{icon}</View>}

        {/* Input */}
        <TextInput
          ref={inputRef}
          className="flex-1 text-white"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secure && !showPassword}
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChangeText}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={returnKeyType === "done"}
          {...rest}
        />

        {/* Password Toggle */}
        {secure && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={20} color="#9CA3AF" />
            ) : (
              <Eye size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
};

export default TextInputField;
