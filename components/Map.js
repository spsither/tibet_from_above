'use client';
import mapboxgl from 'mapbox-gl'
import { useState, useEffect, useRef } from 'react';

export default function Map() {
    const mapRef = useRef()
    const mapContainerRef = useRef()

    useEffect(() => {
        mapboxgl.accessToken = 'pk.eyJ1Ijoic3BzaXRoZXIiLCJhIjoiY203d2hyeHp5MDV1azJzcHkzeDE1dHE2ZCJ9.TCnxqlrr20DJG_sJUN9Eww'
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            maxZoom: 5.99,
            minZoom: 4,
            zoom: 5,
            center: [-75.789, 41.874],
            style: 'mapbox://styles/mapbox/dark-v11'
          });
      
          mapRef.current.on('load', () => {
            mapRef.current.addSource('radar', {
              type: 'image',
              url: 'https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif',
              coordinates: [
                [-80.425, 46.437],
                [-71.516, 46.437],
                [-71.516, 37.936],
                [-80.425, 37.936]
              ]
            });
            mapRef.current.addLayer({
              id: 'radar-layer',
              type: 'raster',
              source: 'radar',
              paint: {
                'raster-fade-duration': 0
              }
            });
          });
        }, []);

    return (
        <>
            <div id='map-container' class='w-full h-full' ref={mapContainerRef} />
        </>
    )
}