import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated, Dimensions,
  ScrollView, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const { height } = Dimensions.get('window');
if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental?.(true);

export default function ArticleView() {
  const { title, summary, biasScore } = useLocalSearchParams();
  const parsedBias = (() => {
    const raw = parseFloat(biasScore as string);
    console.log("Raw biasScore:", biasScore);
    console.log("Parsed biasScore:", raw);
    if (isNaN(raw)) return 0;
    return Math.max(-1, Math.min(1, raw));
  })();

  const [expanded, setExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const animatedHeight = useState(new Animated.Value(240))[0];

  const toggleExpand = () => {
    Animated.timing(animatedHeight, {
      toValue: expanded ? 240 : height * 0.85,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const toggleSection = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderBiasBar = () => (
    <Pressable onPress={() => toggleSection('Political Bias Analysis')}>
      <View style={styles.biasBarButton}>
        <View style={{ flex: (1 - parsedBias) / 2, backgroundColor: '#3b82f6' }} />
        <View style={{ flex: (1 + parsedBias) / 2, backgroundColor: '#ef4444' }} />
        <View style={styles.biasOverlay}>
          <Text style={styles.biasText}>Political Bias Analysis</Text>
          <Text style={styles.biasCaret}>{expandedSections['Political Bias Analysis'] ? '˄' : '˅'}</Text>
        </View>
      </View>
    </Pressable>
  );

  const sections = [
    'Political Bias Analysis',
    'Historical Context',
    'Misinformation Meter',
    'Fact Checker',
    'Logical Fallacies',
    'Public Sentiment',
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={[styles.box, { height: animatedHeight }]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sectionLabel}>Summary</Text>
        <Text style={styles.summary}>{summary}</Text>

        {!expanded && (
          <Pressable style={styles.footerBar} onPress={toggleExpand}>
            <Text style={styles.footerText}>Full Detailed Analysis ˅</Text>
          </Pressable>
        )}

        {expanded && (
          <View style={styles.buttons}>
            {sections.map(label => (
              <View key={label} style={styles.section}>
                {label === 'Political Bias Analysis' ? (
                  <>
                    {renderBiasBar()}
                    {expandedSections[label] && (
                      <View style={styles.highlights}>
                        <Text style={styles.blue}>“Government-led initiatives in space...”</Text>
                        <Text style={styles.red}>“Critics argue that excessive federal funding...”</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <Pressable onPress={() => toggleSection(label)} style={styles.button}>
                      <View style={styles.row}>
                        <Text style={styles.label}>{label}</Text>
                        <Text style={styles.blackCaret}>
                          {expandedSections[label] ? '˄' : '˅'}
                        </Text>
                      </View>
                    </Pressable>
                    {expandedSections[label] && (
                      <Text style={styles.body}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                      </Text>
                    )}
                  </>
                )}
              </View>
            ))}
            <Pressable style={styles.footerBar} onPress={toggleExpand}>
              <Text style={styles.footerText}>Return to Summary ˄</Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FFFFF4', padding: 20, justifyContent: 'center' },
  box: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, paddingBottom: 40,
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4, elevation: 2, position: 'relative',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#152B3F', marginBottom: 12 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#888', marginBottom: 4 },
  summary: { fontSize: 16, color: '#152B3F' },
  footerBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.03)', paddingVertical: 6,
    borderTopWidth: 0.5, borderTopColor: '#ccc', alignItems: 'center'
  },
  footerText: { fontSize: 13, color: '#555' },
  buttons: { marginTop: 24, paddingBottom: 40 },
  section: { marginBottom: 12 },
  button: { backgroundColor: '#eee', padding: 12, borderRadius: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 15, color: '#152B3F', fontWeight: '500' },
  caret: { fontSize: 22, fontWeight: '600', color: '#fff' }, // for bias only
  blackCaret: { fontSize: 22, fontWeight: '600', color: '#000' }, // for all other buttons
  body: { paddingTop: 8, color: '#444', fontSize: 14, lineHeight: 20 },

  biasBarButton: {
    height: 42, borderRadius: 8, overflow: 'hidden',
    flexDirection: 'row', marginBottom: 12
  },
  biasOverlay: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    paddingHorizontal: 12, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center'
  },
  biasText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  biasCaret: { fontSize: 22, fontWeight: '600', color: '#fff' },

  highlights: { gap: 10, marginTop: 10 },
  blue: {
    backgroundColor: 'rgba(59,130,246,0.15)', padding: 10,
    borderRadius: 6, fontSize: 14, color: '#152B3F'
  },
  red: {
    backgroundColor: 'rgba(239,68,68,0.15)', padding: 10,
    borderRadius: 6, fontSize: 14, color: '#152B3F'
  },
});