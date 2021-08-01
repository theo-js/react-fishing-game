// Returns dynamically imported, memoized audio
import { useMemo } from 'react'

interface AudioOptions {
    src: string,
    [key: string]: any
}

export default (
    { src = '', ...rest }: AudioOptions,
    deps: any[] = []
): HTMLAudioElement => useMemo(
    (): HTMLAudioElement => { 
        const audio = new Audio();

        // Dynamically import audio file
        (async () => {
            const module = await import(`../../assets/audio/${src}`)
            audio.src = module.default
        })()

        // Append other parameters to audio element
        for (let param in rest) {
            audio[param] = rest[param]
        }

        return audio
    }, deps
)