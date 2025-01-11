import React from 'react';

/* Import styles. */
import './Versions.scss';

/* VersionProps interface. */
export interface VersionsProps {

}

/* Read package.json files */
import packageJsonProject from '../../../package.json' assert { type: 'json' };
import packageJsonReact from 'react/package.json' assert { type: 'json' };
import packageJsonStorybook from '@storybook/react/package.json' assert { type: 'json' };

/* Build main version. */
const versionProject = packageJsonProject.version;

/* Build TypeScript version */
const versionTypeScriptRaw = packageJsonProject.devDependencies['typescript'];
const versionTypeScript = versionTypeScriptRaw.replace(/^([\^~])/, '');

/* Build react version */
const versionReact = packageJsonReact.version;

/* Build storybook version */
const versionStorybook = 'version' in packageJsonStorybook ? packageJsonStorybook.version : 'n/a';

/* Build rollup version. */
const versionRollupRaw = packageJsonProject.devDependencies['rollup'];
const versionRollup = versionRollupRaw.replace(/^([\^~])/, '');

/* Build proj4 version. */
const versionProj4Raw = packageJsonProject.dependencies['proj4'];
const versionProj4 = versionProj4Raw.replace(/^([\^~])/, '');

/* Build geojson version. */
const versionGeoJsonRaw = packageJsonProject.dependencies['geojson'];
const versionGeoJson = versionGeoJsonRaw.replace(/^([\^~])/, '');

/**
 * Versions component.
 *
 * @author Björn Hempel <bjoern@hempel.li>
 * @version 0.1.0 (2025-01-05)
 * @since 0.1.0 (2025-01-05) First version.
 */
export const Versions: React.FC<VersionsProps> = ({}) => {

    /**
     * ================
     * Versions Builder
     * ================
     */
    return (
        <div className="gs-versions">
            <div className="table-structured padded gapped">
                <h2>Used versions</h2>

                <h3>Project</h3>
                <div className="grid">
                    <div className="label">GeoSphere Project</div>
                    <div className="value">
                        <a href="https://github.com/ixnode/node-geo-sphere/releases" target="_blank"
                           rel="noopener noreferrer">
                            {versionProject as string}
                        </a>
                    </div>
                    <div className="label">TypeScript</div>
                    <div className="value">
                        <a href="https://github.com/microsoft/TypeScript/releases" target="_blank"
                           rel="noopener noreferrer">
                            {versionTypeScript as string}
                        </a>
                    </div>
                    <div className="label">React</div>
                    <div className="value">
                        <a href="https://github.com/facebook/react/releases" target="_blank" rel="noopener noreferrer">
                            {versionReact as string}
                        </a>
                    </div>
                </div>

                <h3>Tools</h3>
                <div className="grid">
                    <div className="label">Storybook</div>
                    <div className="value">
                        <a href="https://github.com/storybookjs/storybook/releases" target="_blank"
                           rel="noopener noreferrer">
                            {versionStorybook as string}
                        </a>
                    </div>
                    <div className="label">Rollup</div>
                    <div className="value">
                        <a href="https://github.com/rollup/rollup/releases" target="_blank" rel="noopener noreferrer">
                            {versionRollup as string}
                        </a>
                    </div>
                </div>

                <h3>Libraries</h3>
                <div className="grid">
                    <div className="label">Proj4</div>
                    <div className="value">
                        <a href="https://github.com/proj4js/proj4js/releases" target="_blank" rel="noopener noreferrer">
                            {versionProj4 as string}
                        </a>
                    </div>
                    <div className="label">GeoJSON</div>
                    <div className="value">
                        <a href="https://github.com/caseycesari/GeoJSON.js/releases" target="_blank"
                           rel="noopener noreferrer">
                            {versionGeoJson as string}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
