'use client';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState, useCallback } from 'react';
import { FaTimes, FaDownload } from 'react-icons/fa';

export default function MapTiles() {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [downloadPopUp, setDownloadPopUp] = useState(null);
    const [monasteryPopup, setMonasteryPopup] = useState(null);
    const [popupScreenPos, setPopupScreenPos] = useState(null);
    const monasteryPopupRef = useRef(null);

    const [geojson, setGeojson] = useState(null);

    useEffect(() => {
        monasteryPopupRef.current = monasteryPopup;
    }, [monasteryPopup]);

    useEffect(() => {
        const loadGeoJSON = async () => {
            try {
                const res = await fetch('/output.json');
                if (!res.ok) throw new Error("Failed to load GeoJSON");
                const data = await res.json();
                setGeojson(data);
            } catch (err) {
                console.error('Error loading GeoJSON:', err);
            }
        };
        loadGeoJSON();
    }, []);

    useEffect(() => {
        mapboxgl.accessToken =
            'pk.eyJ1Ijoic3BzaXRoZXIiLCJhIjoiY203d2hyeHp5MDV1azJzcHkzeDE1dHE2ZCJ9.TCnxqlrr20DJG_sJUN9Eww';
;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/spsither/cm9airhyv003y01qk0utl3821',
            center: [91.8319723, 29.3756667],
            zoom: 12,
        });

        mapRef.current = map;

        map.on('load', () => {
            if (geojson && !map.getSource('image-footprints')) {
                map.addSource('image-footprints', {
                    type: 'geojson',
                    data: geojson,
                });

                map.addLayer({
                    id: 'image-footprint-layer',
                    type: 'fill',
                    source: 'image-footprints',
                    paint: {
                        'fill-color': 'rgba(0, 0, 0, 0.05)',
                        'fill-outline-color': 'rgba(0, 0, 0, 0.2)',
                    },
                });
            }

            map.on('click', 'image-footprint-layer', (e) => {
                if (!geojson) return;
                const feature = e.features?.[0];
                const id = feature?.properties?.id;
                const imageInfo = geojson.features.find(({ properties }) => properties.id == id)?.properties;

                if (imageInfo) {
                    setDownloadPopUp({
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

            map.on('click', 'monasteries', (e) => {
                const feature = e.features?.[0];
                if (!feature) return;

                setMonasteryPopup({
                    lngLat: e.lngLat,
                    properties: feature.properties,
                });

                const point = map.project([e.lngLat.lng, e.lngLat.lat]);
                setPopupScreenPos(point);
            });

            map.on('mouseenter', 'monasteries', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', 'monasteries', () => {
                map.getCanvas().style.cursor = '';
            });

            map.on('move', () => {
                const popup = monasteryPopupRef.current;
                if (popup) {
                    const { lng, lat } = popup.lngLat;
                    const point = map.project([lng, lat]);

                    if (!map.getBounds().contains([lng, lat])) {
                        setMonasteryPopup(null);
                        monasteryPopupRef.current = null;
                        setPopupScreenPos(null);
                    } else if (
                        !popupScreenPos ||
                        point.x !== popupScreenPos.x ||
                        point.y !== popupScreenPos.y
                    ) {
                        setPopupScreenPos(point);
                    }
                }
            });
        });

        return () => map.remove();
    }, [geojson]);

    const updatePopupIfVisible = useCallback(() => {
        const popup = monasteryPopupRef.current;
        const map = mapRef.current;
        if (popup && map) {
            const { lng, lat } = popup.lngLat;
            if (!map.getBounds().contains([lng, lat])) {
                setMonasteryPopup(null);
                monasteryPopupRef.current = null;
                setPopupScreenPos(null);
            } else {
                const point = map.project([lng, lat]);
                setPopupScreenPos(point);
            }
        }
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        map.on('dragend', updatePopupIfVisible);
        map.on('zoomend', updatePopupIfVisible);

        return () => {
            map.off('dragend', updatePopupIfVisible);
            map.off('zoomend', updatePopupIfVisible);
        };
    }, [updatePopupIfVisible]);

    return (
        <div className="relative w-screen h-screen">
            <div className="absolute inset-0" ref={mapContainerRef} />

            {downloadPopUp && (
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs w-72 relative">
                    <button
                        onClick={() => setDownloadPopUp(null)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-lg"
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>

                    <h2 className="text-lg font-bold">{downloadPopUp.imageInfo.name}</h2>
                    <p className="text-sm text-gray-700 mt-2">{downloadPopUp.imageInfo.description}</p>
                    <a
                        href={downloadPopUp.imageInfo.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="mt-4 inline-flex items-center gap-2 text-blue-600 underline"
                    >
                        <FaDownload />
                        Download Image
                    </a>
                </div>
            )}

            {monasteryPopup && popupScreenPos && (
                <div
                    className="absolute z-10 bg-white rounded-lg shadow-lg p-4 max-w-xs w-72"
                    style={{
                        transform: 'translate(-50%, -100%)',
                        left: `${popupScreenPos.x}px`,
                        top: `${popupScreenPos.y}px`,
                    }}
                >
                    <button
                        onClick={() => {
                            setMonasteryPopup(null);
                            setPopupScreenPos(null);
                        }}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-lg"
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>
                    <h2 className="text-lg font-bold">{monasteryPopup.properties.title}</h2>
                    <p className="text-sm text-gray-700 mt-2">{monasteryPopup.properties.description}</p>
                </div>
            )}
        </div>
    );
}
