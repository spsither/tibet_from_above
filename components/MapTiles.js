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
    const [baseMapStyle, setBaseMapStyle] = useState('mapbox://styles/spsither/cmarml0ea005y01s3ff7jgm87')
    const [isSatellite, setIsSatellite] = useState(false);
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [downloadPopUp, setDownloadPopUp] = useState(null);
    const [layerVisibility, setLayerVisibility] = useState({});
    const [aerialImagesGroupOpen, setAerialImagesGroupOpen] = useState(true);
    const [geojson, setGeojson] = useState(null);
    const [layerOpen, setLayerOpen] = useState(true);
    const featureMap = useRef({});

    function getTitleFromId(id) {
        const title = geojson.features.find(
            ({ properties }) => properties.id == id
        )?.properties.title;

        if (title) {
            return title;
        }
        return id
            .replace("spsither.", "")
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, l => l.toUpperCase());
    }
    function addImageTilesetLayers(map) {

        geojson.features.forEach(({ properties: { id: id } }) => {
            const sourceId = `source-${id}`;

            map.addSource(sourceId, {
                type: 'raster',
                url: `mapbox://${id}`,
                tileSize: 256  // Or 512 depending on your tileset
            });

            map.addLayer({
                id: id,
                type: 'raster',
                source: sourceId,
                slot: 'middle',
                paint: {
                    'raster-opacity': 1
                },
                layout: {
                    visibility: layerVisibility[id] !== false ? 'visible' : 'none'
                }
            });
        });
    }

    function addImageFootPrintLayer(map) {

        map.addSource('image-footprints', {
            type: 'geojson',
            data: geojson,
        });

        map.addLayer({
            id: 'image-footprint-layer',
            type: 'fill',
            source: 'image-footprints',
            slot: 'top',
            paint: {
                'fill-color': 'rgba(0, 0, 0, 0)',
                'fill-outline-color': 'rgba(0, 117, 255, 1)'
            }
        });

        // Re-bind click events etc. if necessary
        map.on('click', 'image-footprint-layer', (e) => {
            if (!geojson) return;
            const feature = e.features?.[0];
            const id = feature?.properties?.id;
            let imageInfo = geojson.features.find(
                ({ properties }) => properties.id == id
            )?.properties;

            imageInfo = {
                ...imageInfo,
                id: id,
            };

            if (imageInfo) {
                setDownloadPopUp(imageInfo);
            }
            flyToLayer(id);
        });

        map.on('mouseenter', 'image-footprint-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'image-footprint-layer', () => {
            map.getCanvas().style.cursor = '';
        });

    }

    function toggleSatelliteLayer() {

        const map = mapRef.current;
        const layerId = 'temples';

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

        const newStyle = baseMapStyle.includes('cmarn7h8000rl01sd9uokcvos')
            ? 'mapbox://styles/spsither/cmarml0ea005y01s3ff7jgm87'  // back to custom street view
            : 'mapbox://styles/spsither/cmarn7h8000rl01sd9uokcvos'; // switch to Mapbox satellite

        setBaseMapStyle(newStyle);
        mapRef.current.setStyle(newStyle);
        setIsSatellite((prev) => !prev);

        mapRef.current.once('style.load', () => {
            const map = mapRef.current;
            if (!map) return;

            addImageTilesetLayers(map);
            addImageFootPrintLayer(map);
        });
    }

    function generateTableRows(properties) {
        const sect = properties.Sect;
        const country = properties.Country;
        const county = properties.County;
        const province = properties.Province;
        const region = properties.Region;
        const latlng = properties.LatLng;

        let tableRows = '';
        if (sect) {
            tableRows += `<tr style=""><td style="padding-right: 0.25rem;">Sect:</td><td>${sect}</td></tr>`;
        }
        if (region) {
            tableRows += `<tr style=""><td style="padding-right: 0.25rem;">Region:</td><td>${region}</td></tr>`;
        }
        if (country) {
            tableRows += `<tr style=""><td style="padding-right: 0.25rem;">Country:</td><td>${country}</td></tr>`;
        }
        if (county) {
            tableRows += `<tr style=""><td style="padding-right: 0.25rem;">County:</td><td>${county}</td></tr>`;
        }
        if (province) {
            tableRows += `<tr style=""><td style="padding-right: 0.25rem;">Province:</td><td>${province}</td></tr>`;
        }
        if (latlng) {
            tableRows += `<tr style=""><td style="padding-right: 0.25rem;">Lat,Lng:</td><td>${latlng}</td></tr>`;
        }
        return tableRows;
    }

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
            style: baseMapStyle,
            center: [91.9544950924866, 29.35149162607727],
            zoom: 9,
            attributionControl: false
        }).addControl(
            new mapboxgl.AttributionControl({
                customAttribution: `<a rel="noopener noreferrer" target="_blank" href="https://www.nyandak.com/">© Studio Nyandak</a>`
            })
        );

        mapRef.current = map;

        map.on('load', () => {
            addImageTilesetLayers(map);
            addImageFootPrintLayer(map)

            const hoverPopup = new mapboxgl.Popup({
                closeButton: false,
            });

            map.on('mouseenter', 'temples', (e) => {
                map.getCanvas().style.cursor = 'pointer';

                const coordinates = e.features[0].geometry.coordinates.slice();
                const properties = e.features[0].properties;
                const name = e.features[0].properties.Tibetan;

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                const tableRows = generateTableRows(properties);
                hoverPopup
                    .setLngLat(coordinates)
                    .setHTML(
                        `<div>
                            <h1 style="font-size: 1.25rem; color: #111;">${name}</h1>
                            ${tableRows ? `<table style="margin-top: 0.5rem; color: #333; font-size: 0.7rem; line-height: 1.2;">${tableRows}</table>` : ''}
                        </div>`
                    )
                    .addTo(map);
            });

            map.on('mouseleave', 'temples', () => {
                map.getCanvas().style.cursor = '';
                hoverPopup.remove();

            });

            map.on('click', 'temples', (e) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                const name = e.features[0].properties.Tibetan;

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                const tableRows = generateTableRows(e.features[0].properties);
                new mapboxgl.Popup({ closeOnClick: true })
                    .setLngLat(coordinates)
                    .setHTML(
                        `<div>
                            <h1 style="font-size: 1.25rem; color: #111;">${name}</h1>
                            ${tableRows ? `<table style="margin-top: 0.5rem; color: #333; font-size: 0.7rem; line-height: 1.2;">${tableRows}</table>` : ''}
                        </div>`
                    )
                    .addTo(map);

                // Remove hover popup
                hoverPopup.remove();
            });

            const initialVisibility = {
                satellite: false,
                'image-footprint-layer': true,
                'temples': true,
            };

            
            // const sortedGeojson = {
            //     ...geojson,
            //     features: [...geojson.features].sort((a, b) => {
            //         const getCentroidLng = (feature) => {
            //             const coords = feature.geometry.coordinates[0];
            //         const lngs = coords.map(coord => coord[0]);
            //             return lngs.reduce((sum, lng) => sum + lng, 0) / lngs.length;
            //         };
            //         return getCentroidLng(a) - getCentroidLng(b); // west to east
            //     }),
            // };

            // sort by title
            const sortedGeojson = {
                ...geojson,
                features: geojson.features.sort((a, b) => {
                    const titleA = a.properties.title || '';
                    const titleB = b.properties.title || '';
                    return titleA.localeCompare(titleB);
                })
            };
            

            // Add all raster image layer IDs explicitly
            sortedGeojson.features.forEach(({ properties: { id } }) => {
                initialVisibility[id] = true;
            });

            setLayerVisibility(initialVisibility);
        });

        return () => map.remove();
    }, [geojson]);

    const toggleLayer = (layerId, visible) => {
        visible = typeof visible === 'undefined' ? true : visible;
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
        let imageInfo = geojson.features.find(
            ({ properties }) => properties.id == layerId
        )?.properties;

        imageInfo = {
            ...imageInfo,
            id: layerId,
        };
        if (imageInfo) {
            setDownloadPopUp(imageInfo);
        }

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
                <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg shadow-lg p-4 max-w-xs w-80">
                    <button
                        onClick={() => setDownloadPopUp(null)}
                        className="absolute top-1 left-1 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-md cursor-pointer"
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>
                    <h2 className="text-lg font-bold">{downloadPopUp.title}
                        <button className="ml-2 hover:underline text-blue-600 dark:text-blue-400 hover:cursor-pointer" onClick={() => toggleLayer(downloadPopUp.id, !layerVisibility[downloadPopUp.id])}>
                            {layerVisibility[downloadPopUp.id] ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </h2>
                    <p className="text-sm mt-2">{downloadPopUp.description}</p>
                    {downloadPopUp.mission_id && (
                        <p className="text-xs mt-2">
                            Mission ID: {downloadPopUp.mission_id}<br />
                            Captured on: {downloadPopUp.capture_date}
                        </p>
                    )}

                    {downloadPopUp.description_source && (
                        <p className="text-xs mt-2">
                            Source:{" "}
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: downloadPopUp.description_source.replace(/\n/g, '<br/>'),
                                }}
                            />
                        </p>
                    )}

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
                <div className="absolute top-4 right-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-lg shadow-lg p-4 overflow-y-auto text-sm space-y-2 z-50 w-80">
                    <button
                        onClick={() => setLayerOpen(false)}
                        className="absolute top-1 left-1 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-md cursor-pointer"
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>
                    <label className="text-lg font-bold">Layers</label>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={layerVisibility['temples'] ?? true}
                            onChange={(e) =>
                                toggleLayer('temples', e.target.checked)
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
                    <div>
                        <div className="flex items-center gap-2 font-bold focus:outline-none">
                            <button
                                onClick={() => setAerialImagesGroupOpen(!aerialImagesGroupOpen)}
                            >
                                {aerialImagesGroupOpen ? (
                                    <FaChevronDown className="transition-transform duration-200" />
                                ) : (
                                    <FaChevronRight className="transition-transform duration-200" />
                                )}
                            </button>
                            <input
                                type="checkbox"
                                checked={allSatelliteVisible ?? true}
                                onChange={(e) =>
                                    toggleSatelliteGroup(e.target.checked)
                                }
                            />
                            <label className="font-bold">Aerial Images</label>
                        </div>
                        {aerialImagesGroupOpen && (
                            <div className="pl-6 mt-2 space-y-1 max-h-[70vh] overflow-y-auto">
                                {Object.entries(layerVisibility)
                                    .filter(([id]) => id.startsWith('spsither'))
                                    .map(([layerId, visible]) => (
                                        <div
                                            key={layerId}
                                            className="flex justify-start items-center"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={visible ?? true}
                                                onChange={(e) =>
                                                    toggleLayer(layerId, e.target.checked)
                                                }
                                            />
                                            <button
                                                onClick={(e) => {
                                                    toggleLayer(layerId, e.target.checked)
                                                    flyToLayer(layerId)
                                                }
                                                }
                                                className="ml-2 text-blue-600 dark:text-blue-300 hover:underline focus:outline-none text-left w-full"
                                            >
                                                {getTitleFromId(layerId)}
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
                        className="bg-white dark:bg-gray-900 rounded-full p-3 shadow-md text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:shadow-lg cursor-pointer"
                        aria-label="Open Layer Picker"
                    >
                        <FaLayerGroup />
                    </button>
                </div>
            )}
        </div>
    );
}
