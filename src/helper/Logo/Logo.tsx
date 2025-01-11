import React, {useEffect} from 'react';

/* Import styles. */
import './Logo.scss';

/* Import assets. */
import LogoSVG from '../../assets/logo/ix-logo.svg';

/* VersionProps interface. */
export interface LogoProps {

    /** How large should the logo be? */
    size?: 'small'|'medium'|'large';

    /** Which type of logo should be shown? */
    type?: 'css'|'svg'|'icon';
}

/**
 * Logo component.
 *
 * @author Björn Hempel <bjoern@hempel.li>
 * @version 0.1.0 (2025-01-06)
 * @since 0.1.0 (2025-01-06) First version.
 */
export const Logo: React.FC<LogoProps> = ({
    size = 'medium',
    type = 'css',
}) => {

    /**
     * Use effect to set path length to each path.
     */
    useEffect(() => {
        document.querySelectorAll('path').forEach((path) => {
            const length = (path as SVGPathElement).getTotalLength();
            path.style.setProperty('--path-length', length.toString());
        });
    }, []);

    /**
     * ============
     * Logo Builder
     * ============
     */
    return (
        <>
            {
                type === 'css' && <span className={['gs-logo', 'gs-logo-css', `gs-logo-${size}`].join(' ')}>
                    <span className="logo"><span className="i">i</span><span className="x">x</span></span>
                    <span className="text">
                        <span className="node">
                            <span className="letter">n</span>
                            <span className="letter">o</span>
                            <span className="point">.</span>
                            <span className="letter">d</span>
                            <span className="letter">e</span>
                        </span>
                        <span className="development">Development</span>
                    </span>
                </span>
            }

            {
                type === 'svg' && <span className={['gs-logo', 'gs-logo-svg', `gs-logo-${size}`].join(' ')}>
                    <span className="logo">
                        <LogoSVG/>
                    </span>
                    <span className="text">
                        <span className="node">
                            <span className="letter">n</span>
                            <span className="letter">o</span>
                            <span className="point">.</span>
                            <span className="letter">d</span>
                            <span className="letter">e</span>
                        </span>
                        <span className="development">Development</span>
                    </span>
                </span>
            }

            {
                type === 'icon' && <span className={['gs-logo', 'gs-logo-icon', `gs-logo-${size}`].join(' ')}>
                    <span className="logo">
                        <LogoSVG/>
                    </span>
                </span>
            }
        </>
    );
};
