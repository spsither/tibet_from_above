'use client';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import { FaTimes, FaDownload } from 'react-icons/fa';

export default function MapTiles() {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [popupInfo, setPopupInfo] = useState(null)


    // order matters here. make sure smaller images are in bottom
    const [geojson, setGeojson] = useState(null);

    useEffect(() => {
        fetch('/output.json')
            .then((res) => res.json())
            .then((data) => setGeojson(data));
    }, []);


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
                data: geojson,
            });
            
            map.addLayer({
                id: 'image-footprint-layer',
                type: 'fill',
                source: 'image-footprints',
                paint: {
                    'fill-color':         'rgba(0, 0, 0, 0.05)',
                    'fill-outline-color': 'rgba(0, 0, 0, 0.2)'
                }
            });

            // Image layer click
            map.on('click', 'image-footprint-layer', (e) => {
                if (!geojson) return;
                const feature = e.features?.[0];
                const id = feature?.properties?.id;
                const imageInfo = geojson.features.find(({ properties }) => properties.id == id).properties;

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
    }, [geojson]);

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
