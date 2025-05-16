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
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapTiles() {
    const [baseMapStyle, setBaseMapStyle] = useState('mapbox://styles/spsither/cm9airhyv003y01qk0utl3821')
    const [isSatellite, setIsSatellite] = useState(false);
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [layerVisibility, setLayerVisibility] = useState({});
    const [layerOpen, setLayerOpen] = useState(false);
    
    function toggleSatelliteLayer() {

        const map = mapRef.current;
        const layerId = 'tot';

        const layer = map.getLayer(layerId);
        if (layer) {
            const sourceId = layer.source;
            const source = map.getSource(sourceId);
            console.log('Layer:', layer);
            console.log('Source ID:', sourceId);
            console.log('Source:', source);
        } else {
            console.warn(`Layer ${layerId} not found`);
        }

        const newStyle = baseMapStyle.includes('cma2txklf002k01qp4is4e2rq')
            ? 'mapbox://styles/spsither/cm9airhyv003y01qk0utl3821'  // back to custom street view
            : 'mapbox://styles/spsither/cma2txklf002k01qp4is4e2rq'; // switch to Mapbox satellite

        setBaseMapStyle(newStyle);
        mapRef.current.setStyle(newStyle);
        setIsSatellite((prev) => !prev);

    }

    useEffect(() => {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: baseMapStyle,
            center: [91.9544950924866, 32],
            zoom: 5.5,
            attributionControl: false
        }).addControl(
            new mapboxgl.AttributionControl({
                customAttribution: `<a rel="noopener noreferrer" target="_blank" href="https://www.nyandak.com/">© Studio Nyandak</a>`
            })
        );

        mapRef.current = map;

        map.on('load', () => {

            const hoverPopup = new mapboxgl.Popup({
                closeButton: false,
            });

            map.on('mouseenter', 'tot', (e) => {
                map.getCanvas().style.cursor = 'pointer';

                const coordinates = e.features[0].geometry.coordinates.slice();
                const description = e.features[0].properties.description;
                const name = e.features[0].properties.Tibetan;

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                hoverPopup
                    .setLngLat(coordinates)
                    .setHTML(
                        `<div>
                            <h1 style="font-size: 1.25rem; color: #111;">${name}</h1>
                            <p style="margin-top: 1rem; color: #7d7d7d;">${description}</p>
                        </div>`
                    )
                    .addTo(map);
            });

            map.on('mouseleave', 'tot', () => {
                map.getCanvas().style.cursor = '';
                hoverPopup.remove();

            });

            map.on('click', 'tot', (e) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                const description = e.features[0].properties.description;
                const name = e.features[0].properties.Tibetan;

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                clickPopup = new mapboxgl.Popup({ closeOnClick: true })
                    .setLngLat(coordinates)
                    .setHTML(
                        `<div>
                            <h1 style="font-size: 1.25rem; color: #111;">${name}</h1>
                            <p style="margin-top: 1rem; color: #7d7d7d;">${description}</p>
                        </div>`
                    )
                    .addTo(map);

                // Remove hover popup
                hoverPopup.remove();
            });

            const initialVisibility = {
                satellite: false,
                'tot': true,
            };

            setLayerVisibility(initialVisibility);
        });

        return () => map.remove();
    }, []);

    const toggleLayer = (layerId, visible) => {
        visible = typeof visible === 'undefined' ? true : visible;
        const map = mapRef.current;
        if (!map) return;
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
        setLayerVisibility((prev) => ({ ...prev, [layerId]: visible }));
    };





    return (
        <div className="relative w-screen h-screen">
            <div
                className="relative w-screen h-screen top-0 left-0 inset-0"
                ref={mapContainerRef}
            />
            {layerOpen ? (
                <div className="absolute top-4 right-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-lg shadow-lg p-4 overflow-y-auto text-sm space-y-2 z-50 w-80">
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
                            checked={layerVisibility['tot'] ?? true}
                            onChange={(e) =>
                                toggleLayer('tot', e.target.checked)
                            }
                        />
                        <label className="font-bold ml-2">Temples of Tibet</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={isSatellite ?? false}
                            onChange={toggleSatelliteLayer}

                        />
                        <label className="font-bold ml-2">Satellite</label>

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
