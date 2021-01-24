import React, { CSSProperties, useMemo, useState } from 'react'
import styles from './index.module.sass'

// Redux
import { connect } from 'react-redux'
import { lineTensionSelector } from '../../../../store/selectors/fishing'

interface Props {
    // Redux
    lineTension: number
}

const TensionGauge: React.FC<Props> = ({ lineTension }) => {

    const lowTensionStyle = useMemo((): CSSProperties => {
        if (lineTension >= 0) return { visibility: 'hidden' }
        return {
            clipPath: `polygon(${100 + lineTension}% 0, 100% 0, 100% 100%, ${100 + lineTension}% 100%)`
        }
    }, [lineTension])

    const highTensionStyle = useMemo((): CSSProperties => {
        if (lineTension <= 0) return { visibility: 'hidden' }
        return {
            clipPath: `polygon(0 0, ${lineTension}% 0, ${lineTension}% 100%, 0 100%)`
        }
    }, [lineTension])
    
    return <div className={styles.resistanceGauge}>
        <meter
            className={styles.lineTension}
            min={-100}
            max={100}
            value={lineTension}
            high={50}
            low={-50}
            optimum={0}
        >
        </meter>
        <label
            className={`${styles.lowTension} ${lineTension <= -75 ? styles.danger : ''}`}
            style={{
                ...lowTensionStyle,
                animationDuration: lineTension <= -90 ? '.3s' : '.5s'
            }}
        ></label>
        <label
            className={`${styles.highTension} ${lineTension >= 75 ? styles.danger : ''}`}
            style={{
                ...highTensionStyle,
                animationDuration: lineTension >= 90 ? '.3s' : '.5s'
            }}
        ></label>
    </div>
}

// Redux connection
const mapStateToProps = state => ({
    lineTension: lineTensionSelector(state)
})
export default connect(
    mapStateToProps,
    dispatch => ({})
)(TensionGauge)