'use client';
import mapboxgl from 'mapbox-gl'
import { useState, useEffect, useRef } from 'react';

export default function Map() {
  const mapRef = useRef()
  const mapContainerRef = useRef()

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic3BzaXRoZXIiLCJhIjoiY203d2hyeHp5MDV1azJzcHkzeDE1dHE2ZCJ9.TCnxqlrr20DJG_sJUN9Eww'
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/spsither/cm8yoo0ek000h01s8baq20pmz',
      center: [91.8319723, 29.3756667],
      zoom: 11,
    });

    map.on('load', () => {
      // Replace this with your own image URL and corner coordinates
      map.addSource('overlay-image', {
        type: 'image',
        url: '/images/T344A-9L-1094-V.JPG',
        coordinates: [
          [91.7804885, 29.4118306],
          [91.7804885, 29.3395028],
          [91.8834562, 29.3395028],
          [91.8834562, 29.4118306],
        ]
      });

      map.addLayer({
        id: 'image-layer',
        type: 'raster',
        source: 'overlay-image',
        paint: {
          'raster-opacity': 0.85
        }
      });
    });

    mapRef.current = map;
  }, []);

  return <div className='w-screen h-screen' ref={mapContainerRef} />;
}