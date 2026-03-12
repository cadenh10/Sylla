/**
 * University search input with two-layer search:
 * - Layer 1: Instant filter of pre-populated TOP_UNIVERSITIES
 * - Layer 2: Debounced fetch from Hipolabs API, merged and deduplicated
 * Renders branded circular badges for known schools, generic icon for API-only results.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TOP_UNIVERSITIES, type University } from '../data/universities';

/** Hipolabs API response shape */
interface HipolabsResult {
  name: string;
}

/** Unified dropdown item: branded (from TOP_UNIVERSITIES) or generic (from API) */
interface DropdownItem {
  name: string;
  badgeColor: string;
  badgeText: string;
  badgeTextColor: string;
  isGeneric: boolean;
}

export interface UniversitySearchInputProps {
  value: string;
  onSelect: (name: string) => void;
  error?: string;
}

export function UniversitySearchInput({ value, onSelect, error }: UniversitySearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DropdownItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Displayed input value: query while searching, value when selected
  const displayValue = query || value;

  // Layer 1: Instant filter of TOP_UNIVERSITIES
  const localMatches = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return TOP_UNIVERSITIES.filter((u) => u.name.toLowerCase().includes(q));
  }, [query]);

  // Layer 2: Async fetch + merge + dedupe
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    // Show local results immediately (no loading for them)
    setResults(toDropdownItems(localMatches, []));
    setIsOpen(true);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://universities.hipolabs.com/search?name=${encodeURIComponent(trimmed)}&country=United%20States`,
        );
        const apiData: HipolabsResult[] = await response.json();
        const apiNames = (apiData ?? []).map((r) => r.name);
        setResults(toDropdownItems(localMatches, apiNames));
      } catch {
        setResults(toDropdownItems(localMatches, []));
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, localMatches]);

  // Sync dropdown visibility when we have results to show
  useEffect(() => {
    if (query.trim().length >= 2 && results.length > 0) setIsOpen(true);
  }, [query, results]);

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (!text) {
      onSelect('');
      setIsOpen(false);
    } else if (value) {
      // User is typing again after a selection — clear it
      onSelect('');
    }
  };

  const handleSelect = (name: string) => {
    setQuery('');
    onSelect(name);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>University (optional)</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={displayValue}
        onChangeText={handleChangeText}
        placeholder="Search universities in the US"
        placeholderTextColor="#94a3b8"
        autoCapitalize="none"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {isOpen && results.length > 0 && (
        <View style={styles.dropdown}>
          {isLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#6366f1" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}
          <ScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            bounces={false}
          >
            {results.map((item, index) => (
              <TouchableOpacity
                key={`${item.name}-${index}`}
                style={styles.row}
                onPress={() => handleSelect(item.name)}
              >
                {item.isGeneric ? (
                  <View style={[styles.badge, { backgroundColor: '#6B7280' }]}>
                    <Ionicons name="school-outline" size={16} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={[styles.badge, { backgroundColor: item.badgeColor }]}>
                    <Text
                      style={[
                        styles.badgeText,
                        { color: item.badgeTextColor },
                        item.badgeText.length > 3 && styles.badgeTextSmall,
                      ]}
                    >
                      {item.badgeText}
                    </Text>
                  </View>
                )}
                <Text style={styles.rowLabel} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {isOpen && results.length === 0 && !isLoading && query.trim().length >= 2 && (
        <View style={styles.dropdown}>
          <Text style={styles.emptyText}>No universities found</Text>
        </View>
      )}
    </View>
  );
}

/**
 * Merges local and API results, deduplicates by name.
 * Branded items come from TOP_UNIVERSITIES; API-only get generic gray badge.
 */
function toDropdownItems(local: University[], apiNames: string[]): DropdownItem[] {
  const seen = new Set<string>();
  const items: DropdownItem[] = [];

  for (const u of local) {
    if (seen.has(u.name)) continue;
    seen.add(u.name);
    items.push({
      name: u.name,
      badgeColor: u.color,
      badgeText: u.abbreviation,
      badgeTextColor: u.textColor ?? '#FFFFFF',
      isGeneric: false,
    });
  }

  for (const name of apiNames) {
    if (seen.has(name)) continue;
    seen.add(name);
    items.push({
      name,
      badgeColor: '#6B7280',
      badgeText: '', // Generic items use icon instead
      badgeTextColor: '#FFFFFF',
      isGeneric: true,
    });
  }

  return items;
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0f172a',
  },
  inputError: {
    borderColor: '#f87171',
  },
  errorText: {
    fontSize: 12,
    color: '#b91c1c',
    marginTop: 4,
  },
  dropdown: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    maxHeight: 220,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 999,
    paddingVertical: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  scroll: {
    maxHeight: 200,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badgeTextSmall: {
    fontSize: 8,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  emptyText: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#64748b',
  },
});
