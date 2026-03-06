import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  focused?: boolean;
  color?: string;
};
const DEFAULT_STROKE = "#999999";
const FOCUSED_FILL = "#000000";
const FOCUSED_STROKE = "#000000";

export function IconProfile({
  width = 24,
  height = 24,
  focused = false,
  color,
}: Props) {
  const stroke = color ?? (focused ? FOCUSED_STROKE : DEFAULT_STROKE);
  return (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      {focused ? (
        <>
          <Path
            d="M16 7C19.3137 7 22 9.68629 22 13C22 16.3137 19.3137 19 16 19C12.6863 19 10 16.3137 10 13C10 9.68629 12.6863 7 16 7Z"
            fill={FOCUSED_FILL}
            stroke={FOCUSED_STROKE}
            strokeWidth={2}
            strokeMiterlimit={10}
          />
          <Path
            d="M3.87354 26.9988C5.10299 24.8708 6.8708 23.1037 8.99939 21.8752C11.128 20.6467 13.5424 20 16.0001 20C18.4577 20 20.8721 20.6468 23.0007 21.8754C25.1292 23.1039 26.897 24.871 28.1264 26.9991"
            fill={FOCUSED_FILL}
          />
          <Path
            d="M3.87354 26.9988C5.10299 24.8708 6.8708 23.1037 8.99939 21.8752C11.128 20.6467 13.5424 20 16.0001 20C18.4577 20 20.8721 20.6468 23.0007 21.8754C25.1292 23.1039 26.897 24.871 28.1264 26.9991L3.87354 26.9988Z"
            stroke={FOCUSED_STROKE}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <Path
            d="M16 20C19.866 20 23 16.866 23 13C23 9.13401 19.866 6 16 6C12.134 6 9 9.13401 9 13C9 16.866 12.134 20 16 20Z"
            stroke={stroke}
            strokeWidth={2}
            strokeMiterlimit={10}
          />
          <Path
            d="M3.87354 26.9988C5.10299 24.8708 6.8708 23.1037 8.99939 21.8752C11.128 20.6467 13.5424 20 16.0001 20C18.4577 20 20.8721 20.6468 23.0007 21.8754C25.1292 23.1039 26.897 24.871 28.1264 26.9991"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </Svg>
  );
}
