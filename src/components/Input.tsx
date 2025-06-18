import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ACCENT_COLOR,
  CARD_COLOR,
  ERROR_COLOR,
  TEXT_COLOR,
} from "../constants/colors";
import {
  BORDER_RADIUS_MEDIUM,
  FONT_SIZE_MEDIUM,
  SPACING_SMALL,
} from "../constants/sizes";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  secureTextEntry?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInput,
          error ? styles.errorInput : {},
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={24}
              color={TEXT_COLOR}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING_SMALL * 2,
  },
  label: {
    color: TEXT_COLOR,
    marginBottom: SPACING_SMALL,
    fontSize: FONT_SIZE_MEDIUM,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_COLOR,
    borderRadius: BORDER_RADIUS_MEDIUM,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: SPACING_SMALL * 2,
  },
  input: {
    flex: 1,
    color: TEXT_COLOR,
    fontSize: FONT_SIZE_MEDIUM,
    paddingVertical: SPACING_SMALL * 1.5,
  },
  focusedInput: {
    borderColor: ACCENT_COLOR,
  },
  errorInput: {
    borderColor: ERROR_COLOR,
  },
  errorText: {
    color: ERROR_COLOR,
    fontSize: FONT_SIZE_MEDIUM - 2,
    marginTop: SPACING_SMALL / 2,
  },
});

export default Input;
