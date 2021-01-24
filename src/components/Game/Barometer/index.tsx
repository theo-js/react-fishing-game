import React, { useMemo } from 'react'
import TensionGauge from './TensionGauge'
import { pxToM } from '../../../utils/position'
import { FishRodLevel } from '../../../interfaces/evolution'
import gameProcesses from '../processes/index.json'
import styles from './index.module.sass'

// Redux
import { connect } from 'react-redux'
import { processSelector } from '../../../store/selectors/game'

interface Props {
    rodLevel: FishRodLevel,
    baitDistance: number,
    // Redux
    gameProcess?: string
}

interface StepMatch {
    steps: number[],
    subSteps: number[]
}

export const Barometer: React.FC<Props> = ({
    rodLevel,
    baitDistance,
    // Redux
    gameProcess
}) => {
    const maxLength = useMemo((): number => pxToM(rodLevel.maxLength), [rodLevel])
    const lineStepLength = useMemo((): number => 10, [])
    const lineSteps = useMemo((): number => Math.ceil(maxLength/lineStepLength), [maxLength, lineStepLength])
    const lineStepMatches = useMemo((): StepMatch => {
        let matches = { steps: [], subSteps: [] }
        for(let i = 0; i < (lineSteps+1)*2 - 1; i++) {
            if (i%2 === 0) {
                matches.steps.push(i*lineStepLength/2)
            } else {
                matches.subSteps.push(i*lineStepLength/2)
            }
        }
        return matches
    }, [lineSteps, lineStepLength])
    const nextStep = useMemo((): number => {
        return lineSteps*lineStepLength
    }, [lineSteps, lineStepLength])
    const lineStepsJSX = useMemo(() => {
        let JSX = []
        // How much times step length in maxLength
        for (let i = 0; i <= nextStep; i++) {
            const isReached = baitDistance >= i ? styles.reached : ''
            if (lineStepMatches.steps.includes(i)) {
                // Step
                JSX.push(<div key={i} className={`${styles.step} ${isReached} ${i === 0 ? styles.origin : ''}`}>
                    <span><strong>{i}</strong></span>
                </div>)
            } else if (lineStepMatches.subSteps.includes(i)) {
                // Substep
                JSX.push(<div key={i} className={`${styles.subStep} ${isReached}`}></div>)
            } else continue
        }
        return JSX
    }, [lineSteps, lineStepLength, baitDistance])
    const linePercentage = useMemo((): number => baitDistance/maxLength*100, [baitDistance, maxLength])

    return <div className={`${styles.barometer} ${rodLevel.className}`}>
        <nav>
            <div className={styles.handle}></div>
            <div className={styles.tip}>
                <div className={styles.lineLengthScale}>
                    <div
                        className={styles.lengthLimit}
                        style={{ width: `${maxLength/nextStep*100}%` }}
                    >
                        <meter
                            className={styles.lineLength}
                            min={0}
                            max={maxLength}
                            value={baitDistance}
                            high={maxLength*3/4}
                            low={maxLength/4}
                            optimum={maxLength}
                        >
                        </meter>
                        <label style={{ width: `${linePercentage}%` }}>
                            <span className={styles.tooltip}>
                                <span><strong>{baitDistance}</strong>m</span>
                            </span>
                        </label>
                    </div>
                    {lineStepsJSX}
                </div>
                {gameProcess === gameProcesses.BATTLE && (
                    // Line tension gauge
                    <TensionGauge />
                )}
            </div>
        </nav>
    </div>
}

// Redux connection
const mapStateToProps = state => ({
    gameProcess: processSelector(state)
})
export default connect(
    mapStateToProps,
    dispatch => ({})
)(Barometer)