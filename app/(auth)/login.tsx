// ============================================
// Sahaara — Login Screen
// ============================================

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../src/components/ui/Text';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Divider } from '../../src/components/ui/Shared';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { isValidEmail } from '../../src/utils/validation';

export default function LoginScreen() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = isValidEmail(email) && password.length >= 6;

  const handleLogin = async () => {
    if (!isValid) return;
    setError(null);
    setLoading(true);

    const { error: authError } = await signInWithEmail(email, password);
    if (authError) {
      setError(authError);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Branding */}
          <View style={styles.branding}>
            <View style={styles.logoContainer}>
              <Text variant="h1" color={colors.primary} align="center">
                🤝
              </Text>
            </View>
            <Text variant="h1" align="center" style={styles.appName}>
              Sahaara
            </Text>
            <Text
              variant="bodyLarge"
              color={colors.textSecondary}
              align="center"
              style={styles.tagline}
            >
              Your caregiving companion
            </Text>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text variant="body" color={colors.error} align="center">
                {error}
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              rightIcon={
                <Text variant="caption" color={colors.primary}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              disabled={!isValid}
              fullWidth
              size="lg"
              style={styles.loginButton}
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text variant="caption" color={colors.textTertiary} style={styles.dividerText}>
              or
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In */}
          <Button
            title="Continue with Google"
            onPress={async () => {
              setError(null);
              setGoogleLoading(true);
              const { error: googleError } = await signInWithGoogle();
              if (googleError) {
                setError(googleError);
              }
              setGoogleLoading(false);
            }}
            variant="outline"
            fullWidth
            size="lg"
            loading={googleLoading}
            icon={<Text>🔵</Text>}
          />

          {/* Sign up link */}
          <View style={styles.signupRow}>
            <Text variant="body" color={colors.textSecondary}>
              Don't have an account?{' '}
            </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text variant="bodyMedium" color={colors.primary}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  branding: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  appName: {
    marginBottom: spacing.xs,
  },
  tagline: {
    marginTop: spacing.xs,
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.base,
  },
  form: {
    marginBottom: spacing.xl,
  },
  loginButton: {
    marginTop: spacing.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: spacing.base,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing['2xl'],
  },
});
