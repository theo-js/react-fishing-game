import React, { ReactNode, useState, useCallback, useImperativeHandle, useRef, useEffect, useLayoutEffect } from 'react'
import ReactDOM from 'react-dom'
import styles from './index.module.sass'

interface Props {
    onClose: any,
    isStatic?: boolean,
    blur?: string,
    blurContainer?: string, // ID attribute of the element that gets blurred by the blur prop
    className?: string,
    bgClassName?: string,
    style?: any,
    transition?: number, // in seconds
    wrapper?: boolean, // whether there should be a modalWrapper
    onWindowClick?: any,
    children?: ReactNode
}

const Modal = React.forwardRef<any, Props>(({
    onClose,
    isStatic,
    blur,
    blurContainer = 'root',
    transition = .3,
    className = '',
    bgClassName = '',
    style = {},
    wrapper = true,
    onWindowClick,
    children
}, ref) => {
    const containerRef = useRef<any>()

    // Handle fadeout transition
    const [isClosing, setIsClosing] = useState<boolean>(false)
    const closeModal = useCallback(
        (): void => {
            setIsClosing(true)
            timerID.current = window.setTimeout(() => {
                onClose()
            }, transition*1000)
        }, [onClose]
    )
    const timerID = useRef<number>(null)
    useEffect(() => () => window.clearTimeout(timerID.current), [])
    useImperativeHandle(ref, () => ({ closeModal }), [closeModal])

    // Blur app
    useLayoutEffect(() => {
        if (blur) {
            const appRoot = document.getElementById(blurContainer)
            appRoot.style.filter = `blur(${blur})`
            appRoot.style.transition = `filter ${transition}s ease`
            return () => {
                appRoot.style.filter = 'unset'
                appRoot.style.transition = 'unset'
            }
        }
    }, [blur, blurContainer])

    // Stop event propagation
    useEffect(() => {
        function handler (e: Event): void {
            e.stopPropagation()
        }
        window.addEventListener('keydown', handler)
        window.addEventListener('keypress', handler)
        window.addEventListener('keyup', handler)
        document.body.addEventListener('click', handler)
        document.body.addEventListener('mousedown', handler)
        document.body.addEventListener('mouseup', handler)
        document.body.addEventListener('touchstart', handler)
        document.body.addEventListener('touchend', handler)
        document.body.addEventListener('pointerdown', handler)
        document.body.addEventListener('pointerup', handler)
        return () => {
            window.removeEventListener('keydown', handler)
            window.removeEventListener('keypress', handler)
            window.removeEventListener('keyup', handler)
            document.body.removeEventListener('click', handler)
            document.body.removeEventListener('mousedown', handler)
            document.body.removeEventListener('mouseup', handler)
            document.body.removeEventListener('touchstart', handler)
            document.body.removeEventListener('touchend', handler)
            document.body.removeEventListener('pointerdown', handler)
            document.body.removeEventListener('pointerup', handler)
        }
    }, [])

    return ReactDOM.createPortal(
        (
            wrapper ? (
                <div
                    className={`${styles.modalWrapper} ${isClosing ? styles.closing : ''} ${bgClassName}`}
                    onClick={isStatic ? undefined : closeModal}
                    style={{ transition: `all ease ${transition}s`, animationDuration: `${transition}s` }}
                >
                    <div
                        className={`${styles.modalWindow} ${className}`}
                        style={style} 
                        onClick={e => {
                            e.stopPropagation()
                            onWindowClick && onWindowClick()
                        }}
                    >
                        {children}
                    </div>
                </div>
            ) : (
                <div 
                    className={`
                        ${styles.modalWindow} 
                        ${styles.noWrapper} 
                        ${isClosing ? styles.closing : ''} 
                        ${className}
                    `} 
                    style={{ 
                        transition: `all ease ${transition}s`, 
                        animationDuration: `${transition}s`,
                        ...style 
                    }}
                    onClick={onWindowClick}
                >
                    {children}
                </div>
            )
        ), document.getElementById('portal')
    )
})

Modal.defaultProps = {
    children: null,
    style: null,
    className: '',
    onClose: () => false
}

export default Modal