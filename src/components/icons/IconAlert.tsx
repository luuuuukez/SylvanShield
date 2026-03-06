import Svg, { Path } from "react-native-svg";

type Props = { width?: number; height?: number; color?: string };
const DEFAULT_ALERT = "#FA8B46";

export function IconAlert({
  width = 40,
  height = 40,
  color = DEFAULT_ALERT,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 40 40" fill="none">
      <Path
        d="M19.9999 36.6667C24.6023 36.6667 28.7689 34.8012 31.785 31.7851C34.8011 28.769 36.6666 24.6024 36.6666 20C36.6666 15.3977 34.8011 11.231 31.785 8.21492C28.7689 5.19886 24.6023 3.33337 19.9999 3.33337C15.3976 3.33337 11.2309 5.19886 8.2148 8.21492C5.19873 11.231 3.33325 15.3977 3.33325 20C3.33325 24.6024 5.19873 28.769 8.2148 31.7851C11.2309 34.8012 15.3976 36.6667 19.9999 36.6667Z"
        stroke={color}
        strokeWidth={3.33333}
        strokeLinejoin="round"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.0001 30.8333C21.1507 30.8333 22.0834 29.9005 22.0834 28.75C22.0834 27.5994 21.1507 26.6666 20.0001 26.6666C18.8495 26.6666 17.9167 27.5994 17.9167 28.75C17.9167 29.9005 18.8495 30.8333 20.0001 30.8333Z"
        fill={color}
      />
      <Path
        d="M20 10V23.3333"
        stroke={color}
        strokeWidth={3.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
