import React from 'react'
import styles from './index.module.sass'

const Credits = () => <div className={styles.credits}>
    <main>
        <h3>Credits</h3>
        <section className={styles.audioSection}>
            <h4>Audio</h4>
            <ul className={styles.creditList}>
                <li>
                    <h5>
                        "Coins Purchase 01"&nbsp;
                        <address>
                            by&nbsp;
                            <a
                                href="https://freesound.org/people/rhodesmas/sounds/321263/"
                                title="Rhodesmas' work"
                                target="_blank"
                                rel="author"
                            >rhodesmas</a>
                        </address>
                    </h5>
                    <p>Modified from .wav to .mp3</p>
                </li>
            </ul>
        </section>
    </main>
</div>

export default Credits