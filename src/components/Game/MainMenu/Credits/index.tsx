import React from 'react'
import styles from './index.module.sass'

const Credits = () => <div className={styles.credits}>
    <main>
        <h3>Credits</h3>
        <div style={{ fontSize: '.75em', textAlign: 'center', margin: '2em', lineHeight: '200%' }}>
            <em>"Go fishing"</em>,&nbsp;
            fishing simulator game developed and maintained by&nbsp;
            <address>
                <a
                    href="https://www.linkedin.com/in/b748b01b7/"
                    target="_blank"
                    title="See developer's profile on linkedin"
                    rel="author"
                >dev.js.theo@gmail.com</a>
            </address>
        </div>
        <section className={styles.audioSection}>
            <h4>Audio</h4>
            <ul className={styles.creditList}>
                <li>
                    <h5>
                        Music theme composed by &nbsp;
                        <address>
                            <a
                                href="https://soundcloud.com/coma8"
                                target="_blank"
                                title="See profile on soundcloud"
                                rel="author"
                            >dev.js.theo@gmail.com</a>
                        </address>
                    </h5>
                </li>
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