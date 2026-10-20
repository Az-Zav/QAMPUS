import { ELEVATION, TicketStatus } from '@/constants';
import { useTheme } from '@/hooks';
import { StyleSheet } from 'react-native';
import Svg, { Defs, FeDropShadow, Filter, Line, Path } from 'react-native-svg';

// Stub art geometry (design units). The card uses STUB_ASPECT_RATIO so the
// notches and perforation always sit at 50%, where its text halves split.
const WIDTH = 362;
const HEIGHT = 178;
const NOTCH_Y = 89;
const PERFORATION_INSET = 16;
export const STUB_ASPECT_RATIO = WIDTH / HEIGHT;

const OUTLINE =
  'M346 0C354.837 0 362 7.16344 362 16V78C355.925 78 351 82.9249 351 89C351 95.0751 355.925 100 362 100V162C362 170.837 354.837 178 346 178H16C7.16344 178 0 170.837 0 162V100C6.07513 100 11 95.0751 11 89C11 82.9249 6.07513 78 0 78V16C0 7.16344 7.16344 0 16 0H346Z';

// Room around the stub for the shadow to blur into, as % of the card box
const SHADOW = ELEVATION.stub;
const PAD = SHADOW.blur * 3 + Math.abs(SHADOW.dy);
const bleed = {
  position: 'absolute',
  left: `${(-PAD / WIDTH) * 100}%`,
  right: `${(-PAD / WIDTH) * 100}%`,
  top: `${(-PAD / HEIGHT) * 100}%`,
  bottom: `${(-PAD / HEIGHT) * 100}%`,
};

// Ticket stub background: outline + perforation + drop shadow that traces the notches.
// Fills its parent; colors come from the theme's stub map (constants/theme §5b).
export default function TicketStubShape({ status }) {
  const { stub } = useTheme();
  const theme = stub[status] ?? stub[TicketStatus.WAITING];

  return (
    <Svg
      style={[StyleSheet.absoluteFill, bleed]}
      viewBox={`${-PAD} ${-PAD} ${WIDTH + PAD * 2} ${HEIGHT + PAD * 2}`}
      preserveAspectRatio="none"
      pointerEvents="none"
    >
      <Defs>
        <Filter id="stubShadow" x="-20%" y="-20%" width="140%" height="160%">
          <FeDropShadow
            dx={SHADOW.dx}
            dy={SHADOW.dy}
            stdDeviation={SHADOW.blur}
            floodColor={SHADOW.color}
            floodOpacity={SHADOW.opacity}
          />
        </Filter>
      </Defs>
      <Path d={OUTLINE} fill={theme.fill} stroke={theme.stroke} strokeWidth={1.5} filter="url(#stubShadow)" />
      <Line
        x1={PERFORATION_INSET}
        x2={WIDTH - PERFORATION_INSET}
        y1={NOTCH_Y}
        y2={NOTCH_Y}
        stroke={theme.perforation}
        strokeWidth={1}
        strokeDasharray="3 2"
      />
    </Svg>
  );
}
