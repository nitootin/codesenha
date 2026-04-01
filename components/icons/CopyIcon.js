import Svg, { Path } from 'react-native-svg';

export default function CopyIcon({ size = 22, color = '#eb6589' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 48 48">
            <Path
                d="M13 12.4V7.8C13 6.2 14.2 5 15.8 5h24.4C41.8 5 43 6.2 43 7.8v24.4c0 1.6-1.2 2.8-2.8 2.8h-4.7"
                stroke={color}
                strokeWidth="3"
                fill="none"
            />
            <Path
                d="M32.2 13H7.8C6.2 13 5 14.2 5 15.8v24.4C5 41.8 6.2 43 7.8 43h24.4c1.6 0 2.8-1.2 2.8-2.8V15.8c0-1.6-1.2-2.8-2.8-2.8z"
                stroke={color}
                strokeWidth="3"
                fill="none"
            />
        </Svg>
    );
}