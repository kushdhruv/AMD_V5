// ============================================================
// FEATURE REGISTRY — The brain of the App Shell.
// Reads config.modules, maps enabled keys to screen/nav configs.
// ADDING a new module = add ONE entry here. That's it.
// ============================================================
import { isModuleEnabled, ModulesConfig } from '../types/config';
// import { Home, Compass, Zap, User } from '@expo/vector-icons';

export interface ModuleNavConfig {
  key: string;
  tabLabel: string;
  tabIcon: string; // @expo/vector-icons icon name
  screenPath: string; // maps to which screen file to render
}

export interface FeatureRegistryEntry {
  key: keyof ModulesConfig;
  /** Which bottom tab this module contributes to */
  tab: 'home' | 'explore' | 'activities' | 'profile';
  /** If true, a dedicated top-tab will appear inside the parent bottom-tab screen */
  injectAsTopTab?: boolean;
  topTabLabel?: string;
}

// Master registry — ordered by tab then display priority
const FEATURE_REGISTRY: FeatureRegistryEntry[] = [
  // HOME tab — always present
  { key: 'event_info', tab: 'home' },
  { key: 'announcements', tab: 'home' },

  // EXPLORE tab — conditional top tabs
  { key: 'commerce', tab: 'explore', injectAsTopTab: true, topTabLabel: 'Stalls' },
  { key: 'speakers', tab: 'explore', injectAsTopTab: true, topTabLabel: 'Speakers' },

  // ACTIVITIES tab — conditional top tabs
  { key: 'music', tab: 'activities', injectAsTopTab: true, topTabLabel: 'Song Queue' },
  { key: 'leaderboard', tab: 'activities', injectAsTopTab: true, topTabLabel: 'Leaderboard' },
  { key: 'voting', tab: 'activities', injectAsTopTab: true, topTabLabel: 'Voting' },

  // PROFILE tab — always present
  { key: 'registration', tab: 'profile' },
];

export interface ResolvedNavigation {
  showExploreTab: boolean;
  showActivitiesTab: boolean;
  exploreTopTabs: string[]; // labels for active top tabs in Explore
  activitiesTopTabs: string[]; // labels for active top tabs in Activities
}

/**
 * Resolves which tabs and top-tabs to render based on active config.modules
 */
export function resolveNavigation(modules: ModulesConfig): ResolvedNavigation {
  // Defensive check against AI sending bad configs
  const safeModules = modules || {};
  
  const enabledKeys = Object.entries(safeModules)
    .filter(([, v]) => isModuleEnabled(v as boolean | { enabled: boolean }))
    .map(([k]) => k as keyof ModulesConfig);

  const exploreTopTabs = FEATURE_REGISTRY
    .filter((e) => e.tab === 'explore' && e.injectAsTopTab && enabledKeys.includes(e.key))
    .map((e) => e.topTabLabel!);

  const activitiesTopTabs = FEATURE_REGISTRY
    .filter((e) => e.tab === 'activities' && e.injectAsTopTab && enabledKeys.includes(e.key))
    .map((e) => e.topTabLabel!);

  return {
    showExploreTab: exploreTopTabs.length > 0,
    showActivitiesTab: activitiesTopTabs.length > 0,
    exploreTopTabs,
    activitiesTopTabs,
  };
}
