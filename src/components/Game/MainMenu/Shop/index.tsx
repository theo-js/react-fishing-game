import React, { ReactNode, useState, useMemo, useEffect, useRef } from 'react'
import Buy from './Buy'
import Sell from './Sell'
import { randomIntFromInterval } from '../../../../utils/math'
import { GiPirateCaptain } from 'react-icons/all'
import styles from './index.module.sass'

interface Props {
    [key: string]: any
}

export enum ContentID {
    ROOT = 'ROOT',
    BUY = 'BUY',
    SELL = 'SELL'
}

// Seller comments
export const greetings: string[] = [
    'Ahoy, Matey ! What brings you here ?',
    'The better your fish rod, the bigger fishes you\'ll catch ! How convenient that I\'m selling some',
    'Do you have some fish for me ?'
]
export const thanks: string[] = [
    'Thank ya !',
    'It\'s a pleasure doing business with ye',
    'Don\'t ya lose it, mate !'
]
export const randomGreeting = (): string => greetings[randomIntFromInterval(0, greetings.length - 1)]
export const randomThanks = (): string => thanks[randomIntFromInterval(0, thanks.length - 1)]

const Shop: React.FC<Props> = () => {
    const [currentContentID, setCurrentContentID] = useState<ContentID>(ContentID.ROOT)

    // Seller comments
    const [sellerPhrase, setSellerPhrase] = useState<string>(randomGreeting())
    const [sellerPhraseSpelled, setSellerPhraseSpelled] = useState<string>('')
    const sellerPhraseSpelledJSX = useMemo((): ReactNode[] => {
        return sellerPhraseSpelled.split('').map((letter: string, index: number) => (
            <span
                key={index}
                className={styles.letter}
                style={{ filter: index >= sellerPhraseSpelled.length - 5 ? `hue-rotate(${index*360/sellerPhrase.length}deg)` : 'hue-rotate(0)' }}
            >{letter}</span>
        ))
    }, [sellerPhraseSpelled])
    // Spell seller's text letter by letter
    const spellingIntervalID = useRef<number>(null)
    const lastSellerPhraseRef = useRef<string>(null)
    useEffect(() => {
        // Restart process if seller's dialog changes
        if (
            lastSellerPhraseRef && lastSellerPhraseRef.current &&
            spellingIntervalID && spellingIntervalID.current &&
            sellerPhrase != lastSellerPhraseRef.current
        ) {
            setSellerPhraseSpelled('')
            window.clearInterval(spellingIntervalID.current)
        }

        spellingIntervalID.current = window.setInterval(() => {            
            if (sellerPhraseSpelled.length < sellerPhrase.length) {
                setSellerPhraseSpelled(sellerPhraseSpelled + sellerPhrase[sellerPhraseSpelled.length])
            } else {
                window.clearInterval(spellingIntervalID.current)
            }
        }, 20)
        lastSellerPhraseRef.current = sellerPhrase
        
        return () => {
            window.clearInterval(spellingIntervalID.current)
        }
    }, [sellerPhrase, sellerPhraseSpelled])

    const currentContentJSX = useMemo((): ReactNode => {
        switch(currentContentID) {
            case ContentID.ROOT:
                return <div className={styles.root}>
                    <ul>
                        <li>
                            <button onClick={() => setCurrentContentID(ContentID.BUY)} className={`btn btn-primary`}>
                                I want to buy
                            </button>
                        </li>
                        <li>
                            <button onClick={() => setCurrentContentID(ContentID.SELL)} className={`btn btn-primary`}>
                                I have stuff for you
                            </button>
                        </li>
                    </ul>
                </div>
                break
            case ContentID.BUY:
                return <Buy
                    setSellerPhrase={setSellerPhrase}
                    setCurrentContentID={setCurrentContentID}
                 />
                break
            case ContentID.SELL:
                return <Sell
                    setSellerPhrase={setSellerPhrase}
                    setCurrentContentID={setCurrentContentID}
                 />
                break
            default: return null
        }
    }, [currentContentID])
 
    return <div className={styles.shop}>
        <main className={styles.mainContent}>
            {currentContentJSX}
        </main>
        <section className={styles.seller}>
            <figure className={styles.sellerFigure}>
                <GiPirateCaptain />
                <figcaption>Captain Joe</figcaption>
            </figure>
            <p className={styles.sellerPhrase}>{sellerPhraseSpelledJSX}</p>
        </section>
    </div>
}

export default Shop