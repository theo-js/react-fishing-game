import React, { ReactNode, FC } from 'react'
import styles from './index.module.sass'

interface Props {
    value: number,
    className?: string,
    trackClass?: string,
    centerClass?: string,
    readOnly?: boolean,
    children?: ReactNode,
    rest?: any
}

const ProgressCircle: FC<Props> = ({ value, className = '', trackClass = '', centerClass = '', readOnly = true, children, ...rest }) => {
    return <fieldset
        className={`${styles.progressCircle} ${className}`}
    >
        <input
            readOnly={readOnly}
            type="range"
            tabIndex={-1}
            value={value}
            min={0}
            max={100}
            step={1}
            {...rest}
         />
        <label data-value={value}>
            <div
                className={styles.progressMask}
                style={{ width: value > 50 ? '50%' : '100%' }}
            >
                <div
                className={`${styles.progressBar} ${trackClass}`}
                style={{ transform: `rotate(${180 + value*3.6}deg)`}}
            ></div>
                <div
                    className={`${styles.progressInf50} ${trackClass}`}
                    style={{ display: value < 50 ? 'block' : 'none' }}
                ></div>
            </div>
            <div className={`${styles.center} ${centerClass}`}>
                {children}
            </div>
        </label>
    </fieldset>
}

export default ProgressCircle