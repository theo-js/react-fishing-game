import React, { ReactNode, Fragment, useEffect, useState, useRef, useMemo } from 'react'
import { Path } from '../../../../interfaces/position'
import styles from './index.module.sass'

// Redux
import { useSelector } from 'react-redux'
import { hookedFishSelector } from '../../../../store/selectors/fishing'

interface Props {
    groupID: string,
    path: Path,
    render?: (Path) => ReactNode
}

const FishGroup = ({ groupID, path, render }) => {
    const [isGroupVisible, setIsGroupVisible] = useState<boolean>(false)
    const groupRef = useRef<HTMLDivElement>(null)

    // Redux
    const hookedFish = useSelector(hookedFishSelector)

    // Use intersection observer API to render fishes only if their area is in viewport
    useEffect(() => {
        const options: any = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        }
        const observer: IntersectionObserver = new IntersectionObserver((entries, observer) => {
            const group = entries[0]
            group.isIntersecting ? setIsGroupVisible(true) : setIsGroupVisible(false)
        }, options)

        if (groupRef.current) observer.observe(groupRef.current)

        return () => observer.disconnect()
    }, [])

    // Decide whether to render fishes
    const mustRender = useMemo((): boolean => {
        if (!hookedFish) return isGroupVisible

        // If fish gets hooked, render it no matter if its area is outside of viewport
        return hookedFish.groupID === groupID
    }, [isGroupVisible, hookedFish, groupID])

    // Use a ref to prevent rerendering of fishes, generating a new uuid for hooked fish
    const renderRef = useRef<any>(render({ path }))

    return <>
        <div
            ref={groupRef}
            className={styles.fishGroup}
            style={{
                left: path.from.x,
                top: path.from.y,
                width: path.to.x - path.from.x,
                height: path.to.y - path.from.y
            }}
        ></div>
    {mustRender && renderRef.current}
    </>
}

export default React.memo(FishGroup)