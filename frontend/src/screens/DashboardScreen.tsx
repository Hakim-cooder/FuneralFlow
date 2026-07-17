import React, { useEffect, useState } from 'react';
import { Alert, Text, View, StyleSheet } from 'react-native';
import SafePressable from '../components/SafePressable';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors, radius, shadows, spacing, typography } from '../theme/colors';

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const [invoicedRequest, setInvoicedRequest] = useState<any | null>(null);

  useEffect(() => {
    async function loadInvoiced() {
      if (!user || user.role !== 'FAMILY_MEMBER') return;
      try {
        const { data } = await api.get('/requests');
        if (Array.isArray(data)) {
          const found = data.find((r: any) => r.status === 'INVOICED');
          setInvoicedRequest(found || null);
        }
      } catch (e) {
        // ignore silently
      }
    }
    loadInvoiced();
  }, [user]);

  if (!user || !user.role) {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Landing' }],
    });
    return null;
  }

  const role = user.role;

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
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
      {user?.role === 'FAMILY_MEMBER' && invoicedRequest ? (
        <Card style={styles.invoiceBanner}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.invoiceTitle}>Payment required</Text>
              <Text style={styles.invoiceText}>{`Your request for ${invoicedRequest.deceased_full_name} is awaiting payment. Pay now to unlock session creation.`}</Text>
            </View>
            <Button
              title={`Pay ₵ ${Number(invoicedRequest.calculated_total ?? invoicedRequest.budget ?? 0).toFixed(2)}`}
              onPress={() => navigation.navigate('PaymentGate', { purpose: 'INVOICE', amount: Number(invoicedRequest.calculated_total ?? invoicedRequest.budget ?? 0), requestId: invoicedRequest.id, title: 'Pay Organizer Invoice', subtitle: 'Complete your request payment to unlock session creation.' })}
            />
          </View>
        </Card>
      ) : null}
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerInfo}>
          <Text style={styles.greeting}>Hello, {user.fullName?.split(' ')[0]}</Text>
          <Text style={styles.subtitle}>Welcome to your dashboard</Text>
        </View>
        <Text style={styles.roleIcon}>
          {role === 'SUPER_ADMIN' ? '👑' : role === 'ORGANIZER' ? '👔' : '❤️'}
        </Text>
      </View>

      {/* Quick Info */}
      <View style={styles.quickInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Your Role</Text>
          <Text style={styles.infoValue}>{role}</Text>
        </View>
        <View style={styles.divider} />
        <View style={[styles.infoItem, styles.infoItemRight]}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={styles.statusBadge}>✓ Active</Text>
        </View>
      </View>

      {role !== 'SUPER_ADMIN' ? (
        <View style={styles.actionRow}>
          <Button
            title={role === 'ORGANIZER' ? 'Create Walk-in Request' : 'Create Request'}
            size="lg"
            onPress={() => {
              if (role === 'ORGANIZER') navigation.navigate('CreateRequest');
              else navigation.navigate('CreateRequest');
            }}
            style={styles.buttonFlex}
          />
          <Button
            title={role === 'ORGANIZER' ? 'View Sessions' : 'Grief Support'}
            variant="secondary"
            onPress={() => {
              if (role === 'ORGANIZER') navigation.navigate('Sessions');
              else navigation.navigate('GriefSupport');
            }}
            style={styles.buttonFlex}
          />
        </View>
      ) : null}

      {role === 'SUPER_ADMIN' ? (
        <View style={styles.accessRow}>
          <Tile
            icon="👥"
            title="Organizer Accounts"
            description="Manage organizer profiles and subscriptions"
            onPress={() => navigation.navigate('OrganizerAccounts')}
            style={styles.tileWide}
          />
          <Tile
            icon="👨‍👩‍👧‍👦"
            title="Family Accounts"
            description="Manage family profiles and sessions"
            onPress={() => navigation.navigate('FamilyAccounts')}
            style={styles.tileWide}
          />
        </View>
      ) : null}

      {/* Navigation Tiles */}
      <View style={styles.tilesContainer}>
        {role === 'SUPER_ADMIN' ? (
          <Admin navigation={navigation} />
        ) : role === 'ORGANIZER' ? (
          <Organizer navigation={navigation} />
        ) : (
          <Family navigation={navigation} />
        )}
      </View>

      <View style={styles.settingsRow}>
        <Button title="Settings" variant="ghost" onPress={() => navigation.navigate('Settings')} size="lg" />
      </View>

    </Screen>
  );
}

function Tile({ title, description, icon, onPress, style }: any) {
  return (
    <SafePressable
      style={({ pressed }: any) => [
        styles.tile,
        style,
        pressed && styles.tilePressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.tileHeader}>
        <Text style={styles.tileIcon}>{icon}</Text>
        <Text style={styles.tileTitle}>{title}</Text>
      </View>
      <Text style={styles.tileDescription}>{description}</Text>
      <View style={styles.tileFooter}>
        <Text style={styles.tileArrow}>→</Text>
      </View>
    </SafePressable>
  );
}

function Organizer({ navigation }: any) {
  return (
    <>
      <Tile
        icon="👔"
        title="Organizer Profile"
        description="View your phone, email, subscription status and unique Organizer Identifier."
        buttonTitle="Open Profile"
        onPress={() => navigation.navigate('OrganizerProfile')}
      />
      <Tile
        icon="📋"
        title="Requests Dashboard"
        description="Review service requests and generate invoices"
        onPress={() => navigation.navigate('Requests')}
      />
      <Tile
        icon="�"
        title="Service Reviews"
        description="View ratings and written reviews submitted for your services"
        onPress={() => navigation.navigate('OrganizerReviews')}
      />
      <Tile
        icon="🛍️"
        title="Service Catalog"
        description="Manage services, prices, and alternatives"
        onPress={() => navigation.navigate('ServiceCatalog')}
      />
      <Tile
        icon="📅"
        title="Funeral Sessions"
        description="Organize timelines, providers, and expenses"
        onPress={() => navigation.navigate('Sessions')}
      />
    </>
  );
}

function Family({ navigation }: any) {
  return (
    <>
      <Tile
      icon="👤"
      title="Family Profile"
      description="View your personal information, previous sessions, current sessions, account status, and logout options."
      buttonTitle="Open Profile"
      onPress={() => navigation.navigate('FamilyProfile')}
      />
      <Tile
        icon="✍️"
        title="Create Request"
        description="Connect with organizers and select plans"
        onPress={() => navigation.navigate('CreateRequest')}
      />
      <Tile
        icon="📅"
        title="My Sessions"
        description="View your current and past sessions"
        onPress={() => navigation.navigate('Sessions')}
      />
      <Tile
        icon="💝"
        title="Grief Support"
        description="Access resources and community support"
        onPress={() => navigation.navigate('GriefSupport')}
      />
      <Tile
        icon="💳"
        title="Payments"
        description="View outstanding payments for your requests"
        onPress={() => navigation.navigate('FamilyPayments')}
      />
    </>
  );
}

function Admin({ navigation }: any) {
  return (
    <>
      <Tile
        icon="📊"
        title="Platform Analytics"
        description="View users, payments, and statistics"
        onPress={() => navigation.navigate('Admin')}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: colors.primary.light,
    borderRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 190,
    ...shadows.md,
  },

  headerInfo: {
    flex: 1,
    marginRight: spacing.lg,
  },

  greeting: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral.white,
    marginBottom: spacing.sm,
  },

  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[200],
  },

  roleIcon: {
    fontSize: 40,
  },

  quickInfo: {
    backgroundColor: colors.background.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },

  infoItem: {
    flex: 1,
  },

  infoItemRight: {
    flex: 1,
    alignItems: 'center',
  },

  infoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },

  infoValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },

  statusBadge: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.success,
  },

  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
  },

  tilesContainer: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },

  settingsRow: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },

  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  buttonFlex: {
    flex: 1,
  },

  accessRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },

  tileWide: {
    flex: 1,
    minWidth: '48%',
  },

  tile: {
    backgroundColor: colors.background.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    ...shadows.sm,
  },

  tilePressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },

  tileIcon: {
    fontSize: 28,
  },

  tileTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1,
  },

  tileDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },

  tileFooter: {
    alignItems: 'flex-end',
  },

  tileArrow: {
    fontSize: typography.sizes.lg,
    color: colors.primary.light,
    fontWeight: typography.weights.bold,
  },
  invoiceBanner: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#FEF3C7',
  },
  invoiceTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: '#92400E',
    marginBottom: spacing.xs,
  },
  invoiceText: {
    color: '#92400E',
    fontSize: typography.sizes.sm,
  },
  logoutRow: {
    marginBottom: spacing.lg,
  },
});
