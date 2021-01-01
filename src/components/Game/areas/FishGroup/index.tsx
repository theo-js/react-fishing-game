import React, { ReactNode, Fragment, useEffect, useState, useRef, useMemo } from 'react'
import { Path } from '../../../../interfaces/position'
import styles from './index.module.sass'

interface Props {
    path: Path,
    render?: (Path) => ReactNode
}

const FishGroup = ({ path, render }) => {
    const [isGroupVisible, setIsGroupVisible] = useState<boolean>(false)
    const groupRef = useRef<HTMLDivElement>(null)

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
    {isGroupVisible && render({ path })}
    </>
}

export default React.memo(FishGroup)