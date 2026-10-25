import { lineHeightFor, SPACING, TYPOGRAPHY } from '../tokens';
import { useThemedStyles } from '../ThemeProvider';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Body of a Terms / Privacy document from @qampus/core/legal: bold title, "Last updated", intro and
// numbered sections. The app supplies the page around it (header, scrolling, width).
// `size` is the body font size; headings use the same size in bold (reader layout).

// "**bold**" segments -> nested bold Text
function Inline({ text, boldStyle }) {
  return text.split('**').map((part, i) => (i % 2 ? <Text key={i} style={boldStyle}>{part}</Text> : part));
}

function Block({ block, text, styles }) {
  if (typeof block === 'string') {
    return <Text style={text}><Inline text={block} boldStyle={styles.bold} /></Text>;
  }
  if (block.subheading) {
    return <Text style={[text, styles.bold, styles.subheading]} accessibilityRole="header">{block.subheading}</Text>;
  }
  return (
    <Text style={text}>
      <Text style={styles.label}>{block.label}</Text>. <Inline text={block.text} boldStyle={styles.bold} />
    </Text>
  );
}

export default function LegalBody({ doc, size = TYPOGRAPHY.size.md, style }) {
  const styles = useThemedStyles(makeStyles);
  // Sheets are cached per scheme, so the size-dependent part is added here
  const text = useMemo(() => [styles.body, { fontSize: size, lineHeight: lineHeightFor(size, 1.65) }], [styles, size]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleGroup}>
        <Text style={[text, styles.bold]} accessibilityRole="header">{doc.title}</Text>
        <Text style={text}>Last updated: {doc.updated}</Text>
      </View>

      {doc.intro?.map((para, i) => <Block key={`intro-${i}`} block={para} text={text} styles={styles} />)}

      {doc.sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={[text, styles.bold]} accessibilityRole="header">{section.heading}</Text>
          {section.blocks.map((block, i) => <Block key={i} block={block} text={text} styles={styles} />)}
        </View>
      ))}
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container: { gap: SPACING.xs },
  titleGroup: { gap: SPACING.xs, marginBottom: SPACING.sm },
  section: { gap: SPACING.xs, marginTop: SPACING.xl },
  subheading: { marginTop: SPACING.md },
  body: { fontFamily: TYPOGRAPHY.fontFamily.regular, color: c.ink },
  bold: { fontFamily: TYPOGRAPHY.fontFamily.bold },
  label: { textDecorationLine: 'underline' },
});
