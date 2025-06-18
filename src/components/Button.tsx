import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { ACCENT_COLOR, TEXT_COLOR } from "../constants/colors";
import {
  BORDER_RADIUS_MEDIUM,
  FONT_SIZE_MEDIUM,
  SPACING_MEDIUM,
} from "../constants/sizes";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  outline?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  outline = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        outline ? styles.outlineButton : {},
        disabled || loading ? styles.disabledButton : {},
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={outline ? ACCENT_COLOR : TEXT_COLOR}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            outline ? styles.outlineButtonText : {},
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: ACCENT_COLOR,
    paddingVertical: SPACING_MEDIUM,
    paddingHorizontal: SPACING_MEDIUM * 2,
    borderRadius: BORDER_RADIUS_MEDIUM,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: TEXT_COLOR,
    fontSize: FONT_SIZE_MEDIUM,
    fontWeight: "bold",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: ACCENT_COLOR,
  },
  outlineButtonText: {
    color: ACCENT_COLOR,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default Button;
