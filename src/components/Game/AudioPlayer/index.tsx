import React, { useState, useCallback, useMemo } from 'react'
import { v4 as uuid } from 'uuid' 
import { BiVolumeMute, BiVolume, BiVolumeLow, BiVolumeFull } from 'react-icons/bi'
import throttle from '../../../utils/throttle'
import styles from './index.module.sass'

// Redux
import { connect } from 'react-redux'
import { isBGMEnabledSelector } from '../../../store/selectors/game'
import { enableBGMAction } from '../../../store/actions/game'

interface Props {
    bgm?: HTMLAudioElement,
    // Redux
    playBGM?: any,
    stopBGM?: any,
    isBGMPaused?: boolean
}

export const AudioPlayer: React.FC<Props> = ({
    bgm,
    playBGM,
    stopBGM,
    isBGMPaused
}) => {
    const [bgmVolume, setBgmVolume] = useState<number>(bgm ? bgm.volume : .25)
    const setVolume = useCallback(
        e => {
            const newVol = e.target.value
            bgm.volume = newVol
            setBgmVolume(newVol)
        }, [bgm]
    )
    const togglePlay = useCallback(
        (): void => {
            isBGMPaused ? playBGM() : stopBGM()
        }, [isBGMPaused, stopBGM, playBGM]
    )
    
    const volumeSliderID = useMemo((): any => uuid(), [])
    const volumeSliderLabel = useMemo((): any => {
        if (isBGMPaused) return <BiVolumeMute />
        if (bgmVolume <= 0) return <BiVolume />
        else if (bgmVolume <= .5) return <BiVolumeLow />
        else return <BiVolumeFull />
    }, [isBGMPaused, bgmVolume])

    return <div className={styles.player}>
        <fieldset className={`${styles.volume} ${!isBGMPaused? styles.playing : styles.paused}`}>
            <label
                className={styles.speaker}
                title={isBGMPaused ? 'Resume background music' : 'Pause background music'}
                htmlFor={volumeSliderID}
                onClick={togglePlay}
                onMouseDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
            >
                {volumeSliderLabel}
            </label>
            <input
                className={styles.volumeSlider}
                title={`Volume: ${Math.round(bgmVolume*100)}%`}
                id={volumeSliderID}
                type="range"
                defaultValue={bgm.volume}
                onChange={throttle(setVolume, 50)}
                onMouseDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                min={0}
                max={1}
                step={.01}
            />
        </fieldset>
    </div>
}

// Connect to Redux
const mapStateToProps = state => ({
    isBGMPaused: !isBGMEnabledSelector(state)
})
const mapDispatchToProps = dispatch => ({
    playBGM: () => dispatch(enableBGMAction(true)),
    stopBGM: () => dispatch(enableBGMAction(false))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AudioPlayer)