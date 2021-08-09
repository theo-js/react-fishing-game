import { FC, CSSProperties } from 'react'
import styles from './index.module.sass'

interface Props {
    size?: number,
    style?: CSSProperties,
    className?: string,
    lineWidth?: number,
    width?: string,
    height?: string,
    color?: string,
    speed?: number,
    edgeBlur?: string
}

const WaveSpinner: FC<Props> = ({ 
    size = 1, 
    style = {}, 
    className = '',
    lineWidth,
    width = '1em',
    height = '1em',
    color = 'var(--blue)',
    speed = 1,
    edgeBlur = '.0625em'
}) => {
    if (typeof lineWidth === 'undefined') lineWidth = size*2 // default wave line width
    
    return <span
        className={`${styles.spinner} ${className}`}
        style={{ 
            fontSize: `${size}rem`,
            width, height,
            WebkitMaskImage: `linear-gradient(to right, #0000, #000 ${edgeBlur}, #000 calc(100% - ${edgeBlur}), #0000)`,
            maskImage: `linear-gradient(to right, #0000, #000 ${edgeBlur}, #000 calc(100% - ${edgeBlur}), #0000)`,
            ...style
        }}
    >
        <span 
            className={styles.wave}
            style={{ 
                textDecoration: `underline wavy ${color} ${lineWidth}px`,
                animationDuration: `${1/speed}s`
            }}
        >
            wavewavewavewavewavewavewavewavewavewavewavewavewavewavewavewavewavewavewavewavewavewavewavewavewave
        </span>
    </span>
}

interface WaveSpinnerLoadingProps {
    [index: string]: any
}
export const WaveSpinnerLoading: FC<WaveSpinnerLoadingProps> = () => {
    return <span className={styles.screenCenter}>
        <span className={styles.wrapper}>
            <WaveSpinner size={6} color="var(--blue)" />
        </span>
    </span>
}

export default WaveSpinner