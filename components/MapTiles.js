'use client';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import { FaTimes, FaDownload, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import "mapbox-gl/dist/mapbox-gl.css";

export default function MapTiles() {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [downloadPopUp, setDownloadPopUp] = useState(null);

    const [layerVisibility, setLayerVisibility] = useState({});
    const [satelliteGroupOpen, setSatelliteGroupOpen] = useState(true);

    const [geojson, setGeojson] = useState(null);


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
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

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
                        'fill-outline-color': 'rgba(0, 0, 0, 0.2)'
                    }
                });

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
            }
            
            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            })

            map.on('mouseenter', 'monasteries', (e) => {
                map.getCanvas().style.cursor = 'pointer';
                const coordinates = e.features[0].geometry.coordinates.slice();
                const description = e.features[0].properties.description;
                const title = e.features[0].properties.title;

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                popup.setLngLat(coordinates).setHTML(`<div>
                            <h1 style="font-size: 1.25rem; font-weight: bold;">${title}</h1>
                            <p  style="margin-top: 1rem; color: #555;">${description}</p>
                        </div>`).addTo(map);
            });

            map.on('mouseleave', 'monasteries', () => {
                map.getCanvas().style.cursor = '';
                popup.remove();
            });
            // Capture all current layer IDs for visibility control
            const layers = map.getStyle().layers;
            const initialVisibility = {};
            layers.forEach((layer) => {
                if (layer.id.startsWith('spsither') || ['image-footprint-layer', 'monasteries'].includes(layer.id)) {
                    initialVisibility[layer.id] = true;
                }
            });
            setLayerVisibility(initialVisibility);
        });

        return () => map.remove();
    }, [geojson]);


    // Handle individual layer toggling
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

    return (
        <div className="relative w-screen h-screen">
            <div className="relative w-screen h-screen top-0 left-0 inset-0" ref={mapContainerRef} />
            {/* Info panel for image download */}
            {downloadPopUp && (
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs w-72">
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
                        className="mt-4 inline-block text-blue-600 underline"
                    >
                        <FaDownload />
                    </a>
                </div>
            )}
            {/* Layer picker */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-72 max-h-[70vh] overflow-y-auto text-sm space-y-2">
                <lable className="text-lg font-bold">Layer Picker</lable>
                <div>
                    <label className="font-bold">Footprint</label>
                    <input
                        type="checkbox"
                        className="ml-2"
                        checked={layerVisibility['image-footprint-layer'] ?? true}
                        onChange={(e) => toggleLayer('image-footprint-layer', e.target.checked)}
                    />
                </div>
                <div>
                    <label className="font-bold">Monasteries</label>
                    <input
                        type="checkbox"
                        className="ml-2"
                        checked={layerVisibility['monasteries'] ?? true}
                        onChange={(e) => toggleLayer('monasteries', e.target.checked)}
                    />
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
                        <label className="font-bold">Satellite Layers</label><input
                            type="checkbox"
                            checked={allSatelliteVisible}
                            onChange={(e) => toggleSatelliteGroup(e.target.checked)}
                        />
                    </button>

                    {satelliteGroupOpen && (
                        <div className="pl-6 mt-2 space-y-1">
                            {Object.entries(layerVisibility)
                                .filter(([id]) => id.startsWith('spsither'))
                                .map(([layerId, visible]) => (
                                    <div key={layerId} className="flex justify-start">
                                        <label>{layerId}</label>
                                        <input
                                            type="checkbox"
                                            className="ml-2"
                                            checked={visible}
                                            onChange={(e) => toggleLayer(layerId, e.target.checked)}
                                        />
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
