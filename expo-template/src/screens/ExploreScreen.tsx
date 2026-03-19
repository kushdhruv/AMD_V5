// ============================================================
// EXPLORE SCREEN — Host for Stalls, Speakers, Sponsors modules
// Each tab mounts the real deep-feature module screen.
// ============================================================
"use client";
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useModulesConfig } from '../../store/configStore';
import { isModuleEnabled } from '../../types/config';

// Deep feature module screens
import { StallListScreen } from '../../modules/stalls/screens/StallListScreen';
import { StallDetailScreen } from '../../modules/stalls/screens/StallDetailScreen';
import { AnnouncementFeedScreen } from '../../modules/announcements/screens/AnnouncementFeedScreen';
import { Stall } from '../../modules/stalls/services/stallTypes';

// Top Tab Bar
import { TopTabBar } from './components/TopTabBar';

export default function ExploreScreen() {
  const theme = useTheme();
  const modules = useModulesConfig();

  const tabs: string[] = [];
  if (isModuleEnabled(modules.stalls)) tabs.push('Stalls');
  if (modules.speakers) tabs.push('Speakers');
  tabs.push('Sponsors');

  const [activeTab, setActiveTab] = useState(tabs[0] ?? 'Stalls');
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Only show top tab bar when NOT inside stall detail */}
      {!selectedStall && tabs.length > 1 && (
        <TopTabBar tabs={tabs} active={activeTab} onSelect={setActiveTab} />
      )}

      {activeTab === 'Stalls' && !selectedStall && (
        <StallListScreen onSelectStall={(stall) => setSelectedStall(stall)} />
      )}

      {activeTab === 'Stalls' && selectedStall && (
        <StallDetailScreen
          stall={selectedStall}
          onBack={() => setSelectedStall(null)}
        />
      )}

      {activeTab === 'Speakers' && (
        // Speakers module — placeholder for full speaker screen
        <View style={styles.placeholder}>
          <AnnouncementFeedScreen />
        </View>
      )}

      {activeTab === 'Sponsors' && (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  placeholder: { flex: 1 },
});


// ── Demo Data ──────────────────────────────────────────────
const DEMO_STALLS = [
  { id: '1', name: 'Biryani Junction', rating: 4.8, price: '₹80-250', tags: ['Veg', 'Non-Veg'], emoji: '🍛' },
  { id: '2', name: 'Chai & Snacks Corner', rating: 4.5, price: '₹20-80', tags: ['Veg'], emoji: '☕' },
  { id: '3', name: 'Tech Merch Store', rating: 4.2, price: '₹199-999', tags: ['Official'], emoji: '👕' },
];

const DEMO_SPEAKERS = [
  { id: '1', name: 'Priya Sharma', role: 'CEO, DevStack', topic: 'Future of AI', emoji: '👩‍💼' },
  { id: '2', name: 'Rahul Mehta', role: 'SDE-III, Google', topic: 'Scalable Systems', emoji: '👨‍💻' },
  { id: '3', name: 'Anjali Gupta', role: 'Founder, EduTech', topic: 'EdTech Revolution', emoji: '👩‍🏫' },
];

// ── Top Tab Bar ────────────────────────────────────────────
interface TopTabBarProps {
  tabs: string[];
  active: string;
  onSelect: (tab: string) => void;
}

function TopTabBar({ tabs, active, onSelect }: TopTabBarProps) {
  const theme = useTheme();
  return (
    <View style={[styles.topTabBar, { backgroundColor: theme.surface }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onSelect(tab)}
          style={[
            styles.topTab,
            active === tab && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
          ]}
        >
          <ThemeText
            variant="label"
            style={{ color: active === tab ? theme.primary : theme.textSecondary }}
          >
            {tab.toUpperCase()}
          </ThemeText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Stall Card ────────────────────────────────────────────
function StallCard({ stall }: { stall: typeof DEMO_STALLS[0] }) {
  const theme = useTheme();
  return (
    <ThemeCard style={styles.stallCard}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <View style={[styles.stallEmoji, { backgroundColor: theme.primary + '22', borderRadius: theme.radius / 2 }]}>
          <Text style={{ fontSize: 28 }}>{stall.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <ThemeText variant="subheading">{stall.name}</ThemeText>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
            {stall.tags.map((tag) => (
              <ThemeBadge key={tag} label={tag} color={theme.accent} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <ThemeText variant="caption" secondary>⭐ {stall.rating} · {stall.price}</ThemeText>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <TouchableOpacity style={[styles.stallAction, { borderColor: theme.primary, borderRadius: theme.radius / 2 }]}>
          <ThemeText variant="caption" style={{ color: theme.primary }}>View Menu</ThemeText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.stallActionFill, { backgroundColor: theme.primary, borderRadius: theme.radius / 2 }]}>
          <ThemeText variant="caption">Order Now →</ThemeText>
        </TouchableOpacity>
      </View>
    </ThemeCard>
  );
}

// ── Speaker Card ──────────────────────────────────────────
function SpeakerCard({ speaker }: { speaker: typeof DEMO_SPEAKERS[0] }) {
  const theme = useTheme();
  return (
    <ThemeCard style={styles.speakerCard}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <View style={[styles.speakerAvatar, { backgroundColor: theme.primary + '33', borderRadius: 999 }]}>
          <Text style={{ fontSize: 30 }}>{speaker.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <ThemeText variant="subheading">{speaker.name}</ThemeText>
          <ThemeText variant="caption" secondary>{speaker.role}</ThemeText>
          <ThemeBadge label={speaker.topic} color={theme.secondary} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <TouchableOpacity style={[styles.stallAction, { borderColor: theme.primary, borderRadius: theme.radius / 2 }]}>
          <ThemeText variant="caption" style={{ color: theme.primary }}>Add to Schedule</ThemeText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.stallAction, { borderColor: theme.accent, borderRadius: theme.radius / 2 }]}>
          <ThemeText variant="caption" style={{ color: theme.accent }}>Notify When Live</ThemeText>
        </TouchableOpacity>
      </View>
    </ThemeCard>
  );
}

// ── Screen ─────────────────────────────────────────────────
export default function ExploreScreen() {
  const theme = useTheme();
  const modules = useModulesConfig();
  const isDemoMode = useDemoMode();

  const tabs: string[] = [];
  if (isModuleEnabled(modules.stalls)) tabs.push('Stalls');
  if (modules.speakers) tabs.push('Speakers');
  tabs.push('Sponsors'); // sponsors always shown if monetization is on

  const [activeTab, setActiveTab] = useState(tabs[0] ?? 'Stalls');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <ThemeText variant="heading">Explore</ThemeText>
      </View>

      {tabs.length > 1 && (
        <TopTabBar tabs={tabs} active={activeTab} onSelect={setActiveTab} />
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'Stalls' && (
          <View style={{ padding: 16, gap: 12 }}>
            <AdSlot placement="stalls_featured" />
            {(isDemoMode ? DEMO_STALLS : []).map((stall) => (
              <StallCard key={stall.id} stall={stall} />
            ))}
          </View>
        )}

        {activeTab === 'Speakers' && (
          <View style={{ padding: 16, gap: 12 }}>
            {(isDemoMode ? DEMO_SPEAKERS : []).map((speaker) => (
              <SpeakerCard key={speaker.id} speaker={speaker} />
            ))}
          </View>
        )}

        {activeTab === 'Sponsors' && (
          <View style={{ padding: 16 }}>
            <ThemeCard elevated style={{ alignItems: 'center', padding: 24 }}>
              <Text style={{ fontSize: 40 }}>🏅</Text>
              <ThemeText variant="subheading" style={{ marginTop: 12 }}>Title Sponsor</ThemeText>
              <ThemeText variant="caption" secondary style={{ textAlign: 'center', marginTop: 4 }}>
                {isDemoMode ? 'TechCorp Inc. · Platinum Partner' : 'Sponsors will appear here'}
              </ThemeText>
            </ThemeCard>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16 },
  topTabBar: { flexDirection: 'row', paddingHorizontal: 8 },
  topTab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  stallCard: { marginBottom: 4 },
  stallEmoji: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  stallAction: { flex: 1, paddingVertical: 8, alignItems: 'center', borderWidth: 1 },
  stallActionFill: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  speakerCard: { marginBottom: 4 },
  speakerAvatar: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
});
