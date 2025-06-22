'use client'

import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { MapPin, Plane, Pause, Play } from 'lucide-react';
import { DeckGL } from '@deck.gl/react';
import { PathLayer, ScatterplotLayer, IconLayer } from '@deck.gl/layers';
import { FlyToInterpolator } from '@deck.gl/core';
// @ts-ignore
import * as THREE from 'three';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface TripMapProps {
  tripPlan: {
    destination: string;
    itinerary: { day: number; locations: { name: string; lat: number; lng: number }[] }[];
    accommodations: { name: string; location: { lat: number; lng: number } }[];
  };
}

interface NormalizedLocation {
  name: string;
  lat: number;
  lng: number;
}

const getDistance = (loc1: NormalizedLocation, loc2: NormalizedLocation) => {
  const R = 6371;
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLon = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) * Math.cos((loc2.lat * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function TripMap({ tripPlan }: TripMapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<any>(null);
  const planeRef = useRef<THREE.Mesh | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [segmentProgress, setSegmentProgress] = useState(0);
  const animationFrameId = useRef<number>();
  const [segment, setSegment] = useState<{start: [number, number], end: [number, number]} | null>(null);
  const [viewState, setViewState] = useState({
    longitude: 2.3522,
    latitude: 48.8566,
    zoom: 10,
    pitch: 60,
    bearing: 0,
    transitionDuration: 2000,
    transitionInterpolator: new FlyToInterpolator(),
  });

  // Memoize location processing to avoid re-calculating on every render
  const allLocations = useMemo(() => {
    const itineraryLocations = tripPlan.itinerary.flatMap((day) => day.locations);
    const accommodationLocations = tripPlan.accommodations.map(acc => ({
      name: acc.name,
      lat: acc.location.lat,
      lng: acc.location.lng
    }));
    
    return [...itineraryLocations, ...accommodationLocations].filter(
      (loc): loc is NormalizedLocation => loc.lat != null && loc.lng != null && typeof loc.lat === 'number' && typeof loc.lng === 'number'
    );
  }, [tripPlan]);

  const optimizedLocations = useMemo(() => {
    if (allLocations.length <= 1) return allLocations;

    const unvisited = [...allLocations];
    const optimized: NormalizedLocation[] = [unvisited.shift()!];
    while (unvisited.length > 0) {
      const last = optimized[optimized.length - 1];
      const next = unvisited.reduce((closest, current) =>
        getDistance(last, current) < getDistance(last, closest) ? current : closest
      );
      optimized.push(next);
      unvisited.splice(unvisited.indexOf(next), 1);
    }
    return optimized;
  }, [allLocations]);
  
  const pathData = useMemo(() => (optimizedLocations.length > 1 ? [{
    path: optimizedLocations.map((loc) => [loc.lng, loc.lat, 0]),
    color: [255, 255, 255, 200], // White path
    width: 5,
  }] : []), [optimizedLocations]);

  const locationData = useMemo(() => (allLocations.map((loc) => ({
    position: [loc.lng, loc.lat],
    name: loc.name,
  }))), [allLocations]);

  // Add Mapbox markers
  const addMarkers = useCallback(() => {
    if (!mapRef.current) {
      console.warn('Map not ready for markers');
      return;
    }

    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) {
      console.error('Mapboxgl is not available');
      return;
    }

    // Clear existing markers before adding new ones
    const existingMarkers = document.querySelectorAll('.marker');
    existingMarkers.forEach(marker => marker.remove());

    allLocations.forEach((loc) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.cssText = `
        width: 0; height: 0; border-left: 8px solid transparent;
        border-right: 8px solid transparent; border-bottom: 16px solid ${loc.name.includes('Hotel') ? '#3b82f6' : '#10b981'};
        position: relative; cursor: pointer; transition: transform 0.2s ease;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      `;

      const dot = document.createElement('div');
      dot.style.cssText = `
        position: absolute; bottom: -16px; left: 50%; transform: translateX(-50%);
        width: 4px; height: 4px; background-color: ${loc.name.includes('Hotel') ? '#3b82f6' : '#10b981'};
        border-radius: 50%; border: 2px solid white;
      `;
      el.appendChild(dot);

      el.addEventListener('mouseenter', () => (el.style.transform = 'scale(1.2) translateY(-2px)'));
      el.addEventListener('mouseleave', () => (el.style.transform = 'scale(1)'));

      new mapboxgl.Marker(el)
        .setLngLat([loc.lng, loc.lat])
        .setPopup(new mapboxgl.Popup().setText(loc.name))
        .addTo(mapRef.current!);
    });
    console.log('Markers added');
  }, [allLocations]);

  // Initialize Three.js
  const initializeThreeJS = useCallback(() => {
    if (!mapContainerRef.current || !mapRef.current) {
      console.warn('Map or container not ready for Three.js');
      return;
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, 600);
    mapContainerRef.current.appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    loader.load(
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumAir/glTF/CesiumAir.gltf',
      (gltf: any) => {
        const plane = gltf.scene.children[0] as THREE.Mesh;
        planeRef.current = plane;
        plane.scale.set(0.05, 0.05, 0.05);
        plane.rotation.x = Math.PI / 2;
        scene.add(plane);
        console.log('Plane loaded');
        animateRenderer();
      },
      undefined,
      (error: any) => console.error('GLTF load error:', error)
    );

    const animateRenderer = () => {
      if (rendererRef.current && cameraRef.current && sceneRef.current && mapRef.current) {
        const canvas = mapRef.current.getCanvas();
        if (canvas.width > 0 && canvas.height > 0) {
          cameraRef.current.aspect = canvas.width / canvas.height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(canvas.width, canvas.height);
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        } else {
          console.warn('Canvas dimensions invalid');
        }
      }
      requestAnimationFrame(animateRenderer);
    };
  }, []);

  // 1. Initialize Map and Scene
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return; // Abort if container isn't ready or map is already initialized
    }

    const initializeMap = async () => {
      try {
        const mapboxgl = await import('mapbox-gl');
        if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
          console.error('Mapbox access token is missing');
          return;
        }

        const map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [viewState.longitude, viewState.latitude],
          zoom: viewState.zoom,
          pitch: viewState.pitch,
          bearing: viewState.bearing,
          antialias: true,
          accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
        });
        mapRef.current = map;

        map.on('load', () => {
          console.log('Map loaded successfully');
          setMapLoaded(true); // This will trigger other effects like adding markers
          map.setPaintProperty('background', 'background-color', '#1a2a44');

          try {
            map.addLayer({
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 14,
              paint: {
                'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'height'], 0, '#4a5568', 50, '#2d3748', 100, '#1a202c'],
                'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 14.05, ['get', 'height']],
                'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 14, 0, 14.05, ['get', 'min_height']],
                'fill-extrusion-opacity': 0.8,
              },
            });
            console.log('3D buildings layer added');
          } catch (e) {
            console.warn('Failed to add 3D buildings:', e);
          }

          initializeThreeJS();
        });

        map.on('error', (e) => console.error('Mapbox error:', e));
      } catch (error) {
        console.error('Map initialization failed:', error);
      }
    };

    initializeMap();

    // Cleanup on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [initializeThreeJS]);

  // 2. Add/update markers when locations change
  useEffect(() => {
    if (mapLoaded) {
      addMarkers();
    }
  }, [mapLoaded, allLocations, addMarkers]);

  // 3. Fit map to bounds on first load or when locations change
  useEffect(() => {
    if (mapLoaded && allLocations.length > 0) {
      const mapboxgl = (window as any).mapboxgl;
      if (!mapboxgl) {
        console.warn('Mapboxgl is not available');
        return;
      }
      const bounds = new mapboxgl.LngLatBounds();
      allLocations.forEach((loc) => bounds.extend([loc.lng, loc.lat]));
      mapRef.current!.fitBounds(bounds, { padding: 50, duration: 2000 });
      console.log('Map fitted to bounds');
    }
  }, [mapLoaded, allLocations]);


  // Animate to location
  const animateToLocation = useCallback((index: number) => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    if (!mapRef.current || !optimizedLocations[index]) {
      console.warn('Map or location not ready for animation');
      return;
    }
    
    if (currentIndex !== index && optimizedLocations[currentIndex]) {
      const startPoint = optimizedLocations[currentIndex];
      const endPoint = optimizedLocations[index];
      setSegment({ start: [startPoint.lng, startPoint.lat], end: [endPoint.lng, endPoint.lat] });

      const duration = 4000;
      const startTime = Date.now();

      const animateFrame = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
          setSegmentProgress(easedProgress);

          if (progress < 1) {
              animationFrameId.current = requestAnimationFrame(animateFrame);
          } else {
              setSegment(null);
          }
      };
      animationFrameId.current = requestAnimationFrame(animateFrame);
    }

    const { lng, lat } = optimizedLocations[index];
    
    // Calculate distance to determine zoom level
    const currentCenter = mapRef.current.getCenter();
    const distance = getDistance(
      { lat: currentCenter.lat, lng: currentCenter.lng, name: '' },
      { lat, lng, name: '' }
    );
    
    // Adjust zoom based on distance - closer locations get higher zoom
    const zoom = distance < 50 ? 16 : distance < 200 ? 14 : 12;
    
    setViewState((prev) => ({
      ...prev,
      longitude: lng,
      latitude: lat,
      zoom: zoom,
      bearing: (prev.bearing + 30) % 360,
      transitionDuration: 4000,
    }));

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: zoom,
        pitch: 60,
        bearing: (index * 45) % 360,
        duration: 4000,
        easing: (t) => {
          // Smooth easing function for better animation
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        },
      });
    }

    // Enhanced plane animation
    if (planeRef.current && mapRef.current) {
      try {
        const position = mapRef.current.project([lng, lat]);
        if (position && mapRef.current.getCanvas()) {
          const canvas = mapRef.current.getCanvas();
          const targetX = position.x - canvas.width / 2;
          const targetY = -position.y + canvas.height / 2;
          
          // Animate plane position smoothly
          const startX = planeRef.current.position.x;
          const startY = planeRef.current.position.y;
          const duration = 4000;
          const startTime = Date.now();
          
          const animatePlane = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            
            planeRef.current!.position.x = startX + (targetX - startX) * easeProgress;
            planeRef.current!.position.y = startY + (targetY - startY) * easeProgress;
            planeRef.current!.position.z = 150 + Math.sin(progress * Math.PI) * 50; // Add some vertical movement
            
            if (progress < 1) {
              requestAnimationFrame(animatePlane);
            }
          };
          
          animatePlane();
        } else {
          console.warn('Invalid map projection or canvas');
        }
      } catch (e) {
        console.warn('Plane positioning failed:', e);
      }
    }

    setCurrentIndex(index);
  }, [optimizedLocations, currentIndex]);

  // Navigate to specific location
  const goToLocation = useCallback((index: number) => {
    if (index >= 0 && index < optimizedLocations.length) {
      animateToLocation(index);
    }
  }, [optimizedLocations.length, animateToLocation]);

  // Next/Previous location
  const nextLocation = useCallback(() => {
    const nextIndex = (currentIndex + 1) % optimizedLocations.length;
    goToLocation(nextIndex);
  }, [currentIndex, optimizedLocations.length, goToLocation]);

  const previousLocation = useCallback(() => {
    const prevIndex = currentIndex === 0 ? optimizedLocations.length - 1 : currentIndex - 1;
    goToLocation(prevIndex);
  }, [currentIndex, optimizedLocations.length, goToLocation]);

  const ARROW_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2L2 19.5h20L12 2z" fill="blue" stroke="white" stroke-width="1.5"/></svg>`)}`;

  // Deck.gl layers - memoized for performance
  const layers = useMemo(() => [
    new PathLayer({
      id: 'trip-path',
      data: pathData,
      pickable: true,
      widthScale: 1,
      widthMinPixels: 3,
      getPath: (d) => d.path,
      getColor: (d) => d.color,
      getWidth: (d) => d.width,
    }),
    new ScatterplotLayer({
      id: 'location-markers',
      data: locationData,
      getPosition: (d) => d.position,
      getRadius: 8,
      getFillColor: (d) => (d.name.includes('Hotel') ? [59, 130, 246, 200] : [16, 185, 129, 200]),
      getLineColor: [255, 255, 255, 255],
      getLineWidth: 2,
      pickable: true,
      stroked: true,
    }),
    ...(segment ? [new IconLayer({
      id: 'animated-arrow-icon',
      data: [segment],
      iconAtlas: ARROW_SVG,
      iconMapping: {
        arrow: { x: 0, y: 0, width: 24, height: 24 }
      },
      getIcon: () => 'arrow',
      sizeScale: 15,
      getPosition: d => {
          const [x1, y1] = d.start;
          const [x2, y2] = d.end;
          const x = x1 + (x2 - x1) * segmentProgress;
          const y = y1 + (y2 - y1) * segmentProgress;
          return [x, y, 10]; // position with slight altitude
      },
      getAngle: d => {
          const [x1, y1] = d.start;
          const [x2, y2] = d.end;
          return 90 - Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      },
      getColor: [0, 0, 255, 255], // Blue arrow
    })] : [])
  ], [pathData, locationData, segment, segmentProgress]);

  // Handle view state changes
  const onViewStateChange = useCallback(({ viewState: newViewState }: any) => {
    setViewState(newViewState);
    if (mapRef.current) {
      mapRef.current.jumpTo({
        center: [newViewState.longitude, newViewState.latitude],
        zoom: newViewState.zoom,
        pitch: newViewState.pitch,
        bearing: newViewState.bearing,
      });
    }
  }, []);


  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    return (
      <div className="p-6 text-center text-gray-800">
        <MapPin className="h-12 w-12 mx-auto text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Map Not Available</h2>
        <p className="mb-4">Please add a Mapbox access token to .env.local as NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.</p>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Trip Overview</h3>
          <ul className="list-disc pl-5">
            {allLocations.map((loc, i) => (
              <li key={i}>{loc.name}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-lg shadow-lg">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 text-white z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg">Loading 3D Map...</p>
          </div>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
      {mapLoaded && (
        <>
          <DeckGL
            ref={deckRef}
            viewState={viewState}
            onViewStateChange={onViewStateChange}
            controller={true}
            layers={layers}
            style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}
          />
          
          {/* Animation Controls Panel */}
          {optimizedLocations.length > 0 && (
            <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-80 p-4 rounded-lg text-white min-w-[300px]">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Plane className="h-5 w-5 text-blue-400" />
                  <span className="font-semibold">Trip Animation</span>
                </div>
                <button
                  onClick={() => setShowControls(!showControls)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {showControls ? '−' : '+'}
                </button>
              </div>

              {showControls && (
                <>
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Location {currentIndex + 1} of {optimizedLocations.length}</span>
                      <span>{Math.round(((currentIndex + 1) / optimizedLocations.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / optimizedLocations.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Current Location Info */}
                  <div className="mb-3 p-2 bg-gray-800 rounded text-sm">
                    <div className="font-medium">{optimizedLocations[currentIndex]?.name}</div>
                    <div className="text-gray-400">
                      {optimizedLocations[currentIndex]?.lat.toFixed(4)}, {optimizedLocations[currentIndex]?.lng.toFixed(4)}
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex space-x-2 mb-3">
                    <button
                      onClick={previousLocation}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm transition-colors"
                      disabled={!mapLoaded}
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={nextLocation}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm transition-colors"
                      disabled={!mapLoaded}
                    >
                      Next →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Location List Toggle */}
          <button
            onClick={() => setShowControls(!showControls)}
            className="absolute top-4 right-4 z-10 bg-black bg-opacity-70 hover:bg-opacity-80 text-white p-2 rounded-lg transition-colors"
          >
            {showControls ? 'Hide Controls' : 'Show Controls'}
          </button>
        </>
      )}
      <style jsx>{`
        .marker:hover { transform: scale(1.2); z-index: 1000; }
        .mapboxgl-popup { max-width: 200px; }
        .mapboxgl-popup-content { background: #1a202c; color: white; border-radius: 4px; }
        .mapboxgl-popup-tip { border-top-color: #1a202c; }
      `}</style>
    </div>
  );
}