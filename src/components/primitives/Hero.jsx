import { COLORS, ELEVATION, GUEST_TYPE_LABEL, IconSet, RADII, SPACING, TYPOGRAPHY, withOpacity } from '@/constants';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Props contract
//
// <Hero
//   context  'profileStudent' | 'profileGuest'
//   user     { name, email, institutional_id, program, guest_type, avatar_url }
//   onBack   func
//   onEdit   func      edit action is hidden when unset
// />
//
// Figma S13 header (node 821:1418): ink block, rounded bottom corners, no curve or glows.
// Offsets are from the Figma frame; the action row drops below the status bar when it's taller.

const ACTIONS_TOP = 36; // back / edit row
const IDENTITY_OFFSET = 65; // actions row -> avatar
const IDENTITY_BLOCK = 222; // avatar top -> header bottom (323 total in Figma)
const CORNER_RADIUS = 28;
const AVATAR = 80;
const ACTION = 40;

function metaLine(context, user) {
  if (context === 'profileGuest') return [user.institutional_id, GUEST_TYPE_LABEL[user.guest_type]];
  return [user.email, user.program];
}

export default function Hero({ context = 'profileStudent', user, onBack, onEdit }) {
  const insets = useSafeAreaInsets();
  const actionsTop = Math.max(insets.top, ACTIONS_TOP);
  const identityTop = actionsTop + IDENTITY_OFFSET;
  const meta = metaLine(context, user).filter(Boolean);
  const initial = user.name?.trim()[0]?.toUpperCase();

  return (
    <View style={[styles.container, { height: identityTop + IDENTITY_BLOCK }]}>
      <View style={[styles.actions, { top: actionsTop }]}>
        <Pressable onPress={onBack} style={styles.action} accessibilityRole="button" accessibilityLabel="Go back">
          <IconSet name="arrow-back" size={22} color={withOpacity(COLORS.paper, 0.8)} />
        </Pressable>
        {!!onEdit && (
          <Pressable onPress={onEdit} style={styles.action} accessibilityRole="button" accessibilityLabel="Edit profile">
            <IconSet name="create-outline" size={20} color={COLORS.paper} />
          </Pressable>
        )}
      </View>

      <View style={[styles.identity, { top: identityTop }]}>
        <View style={styles.avatarRing}>
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} contentFit="cover" />
          ) : (
            <Text style={styles.initial}>{initial}</Text>
          )}
        </View>
        <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
        <View style={styles.metaRow}>
          {meta.map((part, i) => (
            <View key={part} style={styles.metaPart}>
              {i > 0 && <Text style={[styles.meta, styles.metaDivider]}>|</Text>}
              <Text style={styles.meta} numberOfLines={1}>{part}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.ink,
    borderBottomLeftRadius: CORNER_RADIUS,
    borderBottomRightRadius: CORNER_RADIUS,
    ...ELEVATION.sm,
  },
  actions: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  action: { width: ACTION, height: ACTION, alignItems: 'center', justifyContent: 'center' },
  identity: {
    position: 'absolute',
    left: SPACING.xl,
    right: SPACING.xl,
    alignItems: 'center',
  },
  // Figma uses a gold → deep-gold gradient ring; a solid gold ring avoids a gradient dependency
  avatarRing: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: RADII.full,
    borderWidth: 2,
    borderColor: COLORS.gold,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    ...ELEVATION.md,
  },
  avatar: { width: '100%', height: '100%', borderRadius: RADII.full },
  initial: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.display,
    color: COLORS.ink,
  },
  name: {
    marginTop: SPACING.sm,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xl,
    lineHeight: Math.round(TYPOGRAPHY.size.xl * 1.4),
    letterSpacing: -0.6,
    color: COLORS.paper,
    textAlign: 'center',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xxs, marginTop: SPACING.xxs },
  metaPart: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xxs, flexShrink: 1 },
  meta: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.size.sm,
    color: withOpacity(COLORS.paper, 0.7),
    flexShrink: 1,
  },
  metaDivider: { color: withOpacity(COLORS.gold, 0.6) },
});
