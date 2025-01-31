import React from 'react';
import {PlaceData} from "../config/interfaces";
import {useTranslation} from "react-i18next";
import {formatNumber, ucFirst} from "../tools/string";

/* CityInfoProps interface. */
interface CityInfoProps {
    data: PlaceData;
    setVisible: (isCityInfoVisible: boolean) => void;
    language: string;
}

/**
 * CityInfo component.
 *
 * @author Björn Hempel <bjoern@hempel.li>
 * @version 0.1.0 (2025-01-31)
 * @since 0.1.0 (2025-01-31) First version.
 */
const CityInfo: React.FC<CityInfoProps> = ({
    data,
    setVisible,
    language
}) => {

    /* Import translation. */
    const { t } = useTranslation();

    return (
        <div className="world-map__city-info">
            <button className="close" onClick={() => setVisible(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="5" y1="5" x2="19" y2="19" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="5" y1="19" x2="19" y2="5" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>

            <h2>{data.name}</h2>
            {
                data.country && <p><strong>{ucFirst(t('TEXT_WORD_COUNTRY' as any))}</strong>: {data.country.name}</p>
            }
            {
                data.state && <p><strong>{ucFirst(t('TEXT_WORD_REGION' as any))}</strong>: {data.state.name}</p>
            }
            {
                data.population && <p><strong>{ucFirst(t('TEXT_WORD_POPULATION' as any))}</strong>: {formatNumber(data.population, language)}</p>
            }
            {
                data.area && <p><strong>{ucFirst(t('TEXT_WORD_AREA' as any))}</strong>: {data.area}</p>
            }
            {
                data.altitude && <p><strong>{ucFirst(t('TEXT_WORD_ALTITUDE' as any))}</strong>: {data.altitude} m</p>
            }
            {
                data.latitude && data.longitude && <p><strong>{ucFirst(t('TEXT_WORD_COORDINATE' as any))}</strong>: {formatNumber(data.latitude, language)}; {formatNumber(data.longitude, language)}</p>
            }
        </div>
    );
};

export default CityInfo;
