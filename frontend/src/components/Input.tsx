import React, { useState } from 'react';
import { TextInput, Text, View, TextInputProps, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../theme/colors';

interface InputProps extends TextInputProps {
	label: string;
	error?: string;
	helperText?: string;
	containerStyle?: ViewStyle;
	leftAdornment?: React.ReactNode;
	rightAdornment?: React.ReactNode;
}

export function Input({ label, error, helperText, containerStyle, leftAdornment, rightAdornment, ...props }: InputProps) {
	const [focused, setFocused] = useState(false);

	return (
		<View style={[styles.wrapper, containerStyle as any]}>
				<Text style={styles.label}>{label}</Text>

				<View style={[
					styles.inputContainer,
					focused && styles.inputFocused,
					error && styles.inputError,
					!leftAdornment && { paddingLeft: spacing.md },
				]}>
					{leftAdornment}
					<TextInput
						style={styles.textInput}
						placeholderTextColor={colors.text.tertiary}
						onFocus={() => setFocused(true)}
						onBlur={() => setFocused(false)}
						{...props}
					/>
					{rightAdornment}
				</View>

				{error && <Text style={styles.error}>{error}</Text>}
				{helperText && <Text style={styles.helperText}>{helperText}</Text>}
			</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		marginBottom: spacing.lg,
	},

	label: {
		color: colors.text.secondary,
		fontWeight: typography.weights.medium,
		marginBottom: spacing.xs,
		fontSize: typography.sizes.sm,
	},

	inputContainer: {
		backgroundColor: colors.neutral.white,
		borderWidth: 1,
		borderColor: colors.neutral[200],
		borderRadius: radius.md,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 0,
		paddingVertical: spacing.sm,
		...shadows.sm,
		minHeight: 48,
	},

	inputFocused: {
		borderColor: colors.primary.base,
		borderWidth: 1.5,
		backgroundColor: colors.neutral.white,
		...shadows.md,
	},

	inputError: {
		borderColor: colors.error,
		backgroundColor: '#fce8ea',
	},

	textInput: {
		color: colors.text.primary,
		fontSize: typography.sizes.base,
		fontWeight: typography.weights.normal,
		flex: 1,
		paddingHorizontal: 0,
		paddingVertical: 0,
		height: '100%',
		includeFontPadding: false,
	},

	error: {
		color: colors.error,
		marginTop: spacing.sm,
		fontSize: typography.sizes.xs,
		fontWeight: typography.weights.medium,
	},

	helperText: {
		color: colors.text.tertiary,
		marginTop: spacing.sm,
		fontSize: typography.sizes.xs,
	},
});
