'use client';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import {
    FaTimes,
    FaImage,
    FaFileDownload,
    FaChevronDown,
    FaChevronRight,
    FaLayerGroup,
} from 'react-icons/fa';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapTiles() {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [downloadPopUp, setDownloadPopUp] = useState(null);
    const [layerVisibility, setLayerVisibility] = useState({});
    const [satelliteGroupOpen, setSatelliteGroupOpen] = useState(true);
    const [geojson, setGeojson] = useState(null);
    const [layerOpen, setLayerOpen] = useState(true);

    const featureMap = useRef({});
    useEffect(() => {
        if (geojson) {
            const map = {};
            geojson.features.forEach(f => {
                map[f.properties.id] = f;
            });
            featureMap.current = map;
        }
    }, [geojson]);

    useEffect(() => {
        const loadGeoJSON = async () => {
            try {
                const res = await fetch('/output.json');
                if (!res.ok) throw new Error('Failed to load GeoJSON');
                const data = await res.json();
                setGeojson(data);
            } catch (err) {
                console.error('Error loading GeoJSON:', err);
            }
        };
        loadGeoJSON();
    }, []);

    useEffect(() => {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/spsither/cm9airhyv003y01qk0utl3821',
            center: [91.76423888888888, 29.22076111111111],
            zoom: 12,
            attributionControl: false
        }).addControl(
            new mapboxgl.AttributionControl({
                customAttribution: `<a rel="noopener noreferrer" target="_blank" href="https://www.nyandak.com/">© Studio Nyandak</a>`
            })
        );

        mapRef.current = map;

        map.on('load', () => {
            if (geojson && !map.getSource('image-footprints')) {
                map.addSource('image-footprints', {
                    type: 'geojson',
                    data: geojson
                });

                map.addLayer({
                    id: 'image-footprint-layer',
                    type: 'fill',
                    source: 'image-footprints',
                    paint: {
                        'fill-color': 'rgba(0, 0, 0, 0)',
                        'fill-outline-color': 'rgba(0, 117, 255, 1)'
                    }
                });

                map.on('click', 'image-footprint-layer', (e) => {
                    if (!geojson) return;
                    const feature = e.features?.[0];
                    const id = feature?.properties?.id;
                    const imageInfo = geojson.features.find(
                        ({ properties }) => properties.id == id
                    )?.properties;

                    if (imageInfo) {
                        setDownloadPopUp(imageInfo);
                    }
                });

                map.on('mouseenter', 'image-footprint-layer', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', 'image-footprint-layer', () => {
                    map.getCanvas().style.cursor = '';
                });
            }

            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            map.on('mouseenter', 'monasteries', (e) => {
                map.getCanvas().style.cursor = 'pointer';
                const coordinates = e.features[0].geometry.coordinates.slice();
                const description = e.features[0].properties.description;
                const title = e.features[0].properties.title;

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                popup
                    .setLngLat(coordinates)
                    .setHTML(
                        `<div>
                            <h1 style="font-size: 1.25rem; color: #111;">${title}</h1>
                            <p style="margin-top: 1rem; color: #7d7d7d;">${description}</p>
                        </div>`
                    )
                    .addTo(map);
            });

            map.on('mouseleave', 'monasteries', () => {
                map.getCanvas().style.cursor = '';
                popup.remove();
            });

            const layers = map.getStyle().layers;

            console.log(layers);
            const initialVisibility = {};
            layers.forEach((layer) => {
                if (
                    layer.id.startsWith('spsither') ||
                    ['image-footprint-layer', 'monasteries'].includes(layer.id)
                ) {
                    initialVisibility[layer.id] = true;
                }
            });
            setLayerVisibility(initialVisibility);
        });

        return () => map.remove();
    }, [geojson]);

    const toggleLayer = (layerId, visible) => {
        const map = mapRef.current;
        if (!map) return;
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
        setLayerVisibility((prev) => ({ ...prev, [layerId]: visible }));
    };

    const toggleSatelliteGroup = (visible) => {
        Object.keys(layerVisibility).forEach((layerId) => {
            if (layerId.startsWith('spsither')) {
                toggleLayer(layerId, visible);
            }
        });
    };

    const allSatelliteVisible = Object.entries(layerVisibility)
        .filter(([id]) => id.startsWith('spsither'))
        .every(([, visible]) => visible);

    const flyToLayer = (layerId) => {

        const imageInfo = geojson.features.find(
            ({ properties }) => properties.id == layerId
        )?.properties;

        if (imageInfo) {
            setDownloadPopUp(imageInfo);
        }

        console.log(layerId, featureMap)
        const feature = featureMap.current[layerId];
        const map = mapRef.current;
        if (!feature || !map) return;

        const geometry = feature.geometry;
        if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
            const coordinates = geometry.type === 'Polygon'
                ? geometry.coordinates[0]
                : geometry.coordinates[0][0];

            const bounds = coordinates.reduce(
                (b, [lng, lat]) => b.extend([lng, lat]),
                new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
            );

            map.fitBounds(bounds, { padding: 50 });
        } else if (geometry.type === 'Point') {
            const [lng, lat] = geometry.coordinates;
            map.flyTo({ center: [lng, lat], zoom: 16 });
        }
    };



    return (
        <div className="relative w-screen h-screen">
            <div
                className="relative w-screen h-screen top-0 left-0 inset-0"
                ref={mapContainerRef}
            />
            {downloadPopUp && (
                <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg shadow-lg p-4 max-w-xs w-72">
                    <button
                        onClick={() => setDownloadPopUp(null)}
                        className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-lg"
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>
                    <h2 className="text-lg font-bold">{downloadPopUp.name}</h2>
                    <p className="text-sm mt-2">{downloadPopUp.description}</p>
                    <div className='mt-4 flex items-center justify-evenly '>

                        <a
                            href={downloadPopUp.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            <FaImage /> <span>Image</span>
                        </a>
                        <a
                            href={downloadPopUp.downloadUrlTIFF}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            <FaFileDownload /> <span>GeoTIFF</span>
                        </a>
                    </div>
                </div>
            )}
            {layerOpen ? (
                <div className="absolute top-4 right-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-xl shadow-lg p-4 w-72 max-h-[70vh] overflow-y-auto text-sm space-y-2 z-50">
                    <button
                        onClick={() => setLayerOpen(false)}
                        className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-lg"
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>
                    <label className="text-lg font-bold">Layers</label>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={layerVisibility['monasteries'] ?? true}
                            onChange={(e) =>
                                toggleLayer('monasteries', e.target.checked)
                            }
                        />
                        <label className="font-bold ml-2">Temples of Tibet</label>
                    </div>
                    <div>
                        <button
                            onClick={() => setSatelliteGroupOpen(!satelliteGroupOpen)}
                            className="flex items-center gap-2 font-bold focus:outline-none"
                        >
                            {satelliteGroupOpen ? (
                                <FaChevronDown className="transition-transform duration-200" />
                            ) : (
                                <FaChevronRight className="transition-transform duration-200" />
                            )}
                            <input
                                type="checkbox"
                                checked={allSatelliteVisible}
                                onChange={(e) =>
                                    toggleSatelliteGroup(e.target.checked)
                                }
                            />
                            <label className="font-bold">Aerial Images</label>
                        </button>
                        {satelliteGroupOpen && (
                            <div className="pl-6 mt-2 space-y-1">
                                {Object.entries(layerVisibility)
                                    .filter(([id]) => id.startsWith('spsither'))
                                    .map(([layerId, visible]) => (
                                        <div
                                            key={layerId}
                                            className="flex justify-start items-center"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={visible}
                                                onChange={(e) =>
                                                    toggleLayer(layerId, e.target.checked)
                                                }
                                            />
                                            <button
                                                onClick={() => flyToLayer(layerId)}
                                                className="ml-2 text-blue-600 dark:text-blue-300 hover:underline focus:outline-none"
                                            >
                                                {layerId
                                                    .replace("spsither-", "")           // remove prefix
                                                    .replace(/-/g, " ")
                                                    .replace(/\b\w/g, l => l.toUpperCase())}
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={() => setLayerOpen(true)}
                        className="bg-white dark:bg-gray-900 rounded-full p-3 shadow-md text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:shadow-lg"
                        aria-label="Open Layer Picker"
                    >
                        <FaLayerGroup />
                    </button>
                </div>
            )}
        </div>
    );
}
