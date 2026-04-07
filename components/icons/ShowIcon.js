import Svg, { Path } from 'react-native-svg';

export default function ShowIcon({ size = 22, color = '#6FB3FF' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 512 512">
            <Path
                d="M256 96C134.4 96 36.6 168.7 0 256c36.6 87.3 134.4 160 256 160s219.4-72.7 256-160C475.4 168.7 377.6 96 256 96zm0 272c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112zm0-176a64 64 0 100 128 64 64 0 000-128z"
                fill={color}
            />
        </Svg>
    );
}