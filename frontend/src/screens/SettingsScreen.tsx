import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../theme/colors';

export default function SettingsScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  function handleOpenProfile() {
    if (user?.role === 'ORGANIZER') {
      navigation.navigate('OrganizerProfile');
      return;
    }

    if (user?.role === 'FAMILY_MEMBER') {
      navigation.navigate('FamilyProfile');
      return;
    }

    navigation.navigate('Dashboard');
  }

  function handleContactSupport() {
    Alert.alert('Support', 'Please contact your organizer or the support team for help with your account.');
  }

  function handleAboutApp() {
    Alert.alert('About', 'The funeral management system helps organizers and families manage requests, sessions, and payments in one place.');
  }

  function handlePrivacyTips() {
    Alert.alert('Privacy', 'Keep your account secure by protecting your phone access, using strong passwords, and reviewing updates to your profile information.');
  }

  function handleQuickGuide() {
    Alert.alert('Quick guide', 'Use the dashboard for daily tasks, your profile for account details, and support if you need help with a request or session.');
  }

  function handleViewSessions() {
    navigation.navigate('Sessions');
  }

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
        },
      },
    ]);
  }

  return (
    <Screen>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <Button title="← Back" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account details, profile, and support options.</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>{user?.role || 'Unknown'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{user?.fullName || 'Not provided'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>{user?.status || 'Unknown'}</Text>
          </View>
        </Card>

        {user?.role !== 'SUPER_ADMIN' ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Quick access</Text>
            <View style={styles.actions}>
              <Button title="Open my profile" variant="secondary" onPress={handleOpenProfile} />
              <Button title="Go to dashboard" variant="secondary" onPress={() => navigation.navigate('Dashboard')} />
              <Button title="View sessions" variant="secondary" onPress={handleViewSessions} />
            </View>
          </Card>
        ) : null}

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Helpful guidance</Text>
          <View style={styles.actions}>
            <Button title="Quick guide" variant="secondary" onPress={handleQuickGuide} />
            <Button title="Privacy tips" variant="secondary" onPress={handlePrivacyTips} />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Support</Text>
          <View style={styles.actions}>
            <Button title="Contact support" variant="secondary" onPress={handleContactSupport} />
            <Button title="About this app" variant="secondary" onPress={handleAboutApp} />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Account actions</Text>
          <View style={styles.actions}>
            <Button title="Logout" variant="danger" onPress={handleLogout} />
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.black, color: colors.text.primary },
  subtitle: { color: colors.text.secondary, marginTop: 6 },
  card: { marginBottom: 16, padding: spacing.lg, borderRadius: radius.lg },
  cardTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text.primary, marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  infoLabel: { color: colors.text.secondary },
  infoValue: { color: colors.text.primary, fontWeight: typography.weights.semibold, textAlign: 'right', flexShrink: 1 },
  actions: { gap: spacing.sm },
});
