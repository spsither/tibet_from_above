'use client';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import { FaTimes, FaDownload } from 'react-icons/fa';

export default function MapTiles() {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [popupInfo, setPopupInfo] = useState(null)
    
    
    // order matters here. make sure smaller images are in bottom
    const imageFootprints = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {
                    id: 'spsither-8paw29o6',
                    name: '8paw29o6',
                    description: 'Aaaaaaa',
                    downloadUrl: 'https://your-bucket.s3.amazonaws.com/queens-2023.tif',
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [91.80, 29.41],
                        [91.80, 29.50],
                        [91.89, 29.50],
                        [91.89, 29.41],
                        [91.80, 29.41],
                    ]],
                },
            },
            {
                type: 'Feature',
                properties: {
                    id: 'spsither-7v4yjgnb',
                    name: '7v4yjgnb',
                    description: 'Cccccccccc',
                    downloadUrl: 'https://your-bucket.s3.amazonaws.com/queens-2023.tif',
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [91.7804885, 29.4118306],
                        [91.7804885, 29.3395028],
                        [91.8834562, 29.3395028],
                        [91.8834562, 29.4118306],
                        [91.7804885, 29.4118306],
                    ]],
                },
            },
            {
                type: 'Feature',
                properties: {
                    id: 'spsither-bx930aj9',
                    name: 'bx930aj9',
                    description: 'Bbbbbbb',
                    downloadUrl: 'https://your-bucket.s3.amazonaws.com/nyc-2024.tif',
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [91.85776150750003, 29.40640162272011],
                        [91.89185912457732, 29.43578169010002],
                        [91.82769921369037, 29.49883565521099],
                        [91.79655459094582, 29.45691042696243],
                        [91.85776150750003, 29.40640162272011],
                    ]],
                },
            },

        ],
    };


    useEffect(() => {
        mapboxgl.accessToken =
            'pk.eyJ1Ijoic3BzaXRoZXIiLCJhIjoiY203d2hyeHp5MDV1azJzcHkzeDE1dHE2ZCJ9.TCnxqlrr20DJG_sJUN9Eww';

        const map = new mapboxgl.Map({
            container: mapContainerRef.current ? mapContainerRef.current : null,
            style: 'mapbox://styles/spsither/cm9airhyv003y01qk0utl3821',
            center: [91.8319723, 29.3756667],
            zoom: 12,
        });

        mapRef.current = map;

        map.on('load', () => {

            map.addSource('image-footprints', {
                type: 'geojson',
                data: imageFootprints,
            });

            map.addLayer({
                id: 'image-footprint-layer',
                type: 'fill',
                source: 'image-footprints',
                paint: {
                    'fill-opacity': 0.3, // fully transparent but still clickable
                },
            });

            // Image layer click
            map.on('click', 'image-footprint-layer', (e) => {
                const feature = e.features?.[0];
                const id = feature?.properties?.id;
                const imageInfo = imageFootprints.features.find(({ properties }) => properties.id == id).properties;
                
                if (imageInfo) {
                    setPopupInfo({
                        lngLat: e.lngLat,
                        imageInfo,
                    });
                }
            });

            map.on('mouseenter', 'image-footprint-layer', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', 'image-footprint-layer', () => {
                map.getCanvas().style.cursor = '';
            });
        });


        return () => map.remove();
    }, []);

    return (
        <div className="relative w-screen h-screen">
            {/* Map container */}
            <div className="absolute inset-0" ref={mapContainerRef} />

            {/* Info Panel (only shows when popupInfo is set) */}
            {popupInfo && (
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs w-72 relative">
                    {/* Close (X) Button */}
                    <button
                        onClick={() => setPopupInfo(null)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-lg"
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>

                    <h2 className="text-lg font-bold">{popupInfo.imageInfo.name}</h2>
                    <p className="text-sm text-gray-700 mt-2">{popupInfo.imageInfo.description}</p>
                    <a
                        href={popupInfo.imageInfo.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="mt-4 inline-block text-blue-600 underline"
                    >
                        <FaDownload />
                    </a>
                </div>
            )}


        </div>
    );
}
