'use client'

import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, Plane } from 'lucide-react';
import { DeckGL } from '@deck.gl/react';
import { PathLayer } from '@deck.gl/layers';
import { FlyToInterpolator } from '@deck.gl/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface TripMapProps {
  tripPlan: {
    destination: string;
    itinerary: {
      day: number;
      locations: { name: string; lat: number; lng: number }[];
    }[];
    accommodations: any[];
  };
}

export default function TripMap({ tripPlan }: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const deckglRef = useRef<any>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const animationFrame = useRef<number>();
  const planeRef = useRef<THREE.Mesh>(null!);
  const sceneRef = useRef<THREE.Scene>(null!);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const rendererRef = useRef<THREE.WebGLRenderer>(null!);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [viewState, setViewState] = useState({
    longitude: 2.3522,
    latitude: 48.8566,
    zoom: 15,
    pitch: 60,
    bearing: 45,
    transitionDuration: 2000,
    transitionInterpolator: new FlyToInterpolator(),
  });

  // Extract all locations, ensuring they exist
  const allLocations = tripPlan.itinerary.flatMap((day) =>
    day.locations.map((loc) => [loc.lng, loc.lat, 0])
  ) || [];

  // Create animated path data
  const [pathData, setPathData] = useState<any[]>([]);

  useEffect(() => {
    setPathData(allLocations.length > 1 ? [{
      path: allLocations,
      color: [255, 0, 0, 200],
      width: 5,
    }] : []);
  }, [tripPlan]);

  // Initialize Mapbox map and Three.js scene
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initializeMap = async () => {
      try {
        const mapboxgl = await import('mapbox-gl');
        if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
          console.warn('Mapbox access token not found. Using fallback map.');
          return;
        }

        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [viewState.longitude, viewState.latitude],
          zoom: viewState.zoom,
          pitch: viewState.pitch,
          bearing: viewState.bearing,
          antialias: true,
          accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
        });

        // Initialize Three.js
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        cameraRef.current = camera;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        rendererRef.current = renderer;
        renderer.setSize(window.innerWidth, 600);
        mapContainer.current.appendChild(renderer.domElement);

        map.current.on('load', () => {
          setMapLoaded(true);

          // Custom dark styling
          map.current.setPaintProperty('background', 'background-color', '#1a2a44');

          // Add 3D buildings with error handling
          if (!map.current.getLayer('3d-buildings')) {
            try {
              map.current.addLayer({
                id: '3d-buildings',
                source: 'composite',
                'source-layer': 'building',
                filter: ['==', 'extrude', 'true'],
                type: 'fill-extrusion',
                minzoom: 14,
                paint: {
                  'fill-extrusion-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'height'],
                    0, '#4a5568',
                    50, '#2d3748',
                    100, '#1a202c',
                  ],
                  'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    14, 0,
                    14.05, ['get', 'height'],
                  ],
                  'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    14, 0,
                    14.05, ['get', 'min_height'],
                  ],
                  'fill-extrusion-opacity': 0.8,
                },
              });
              console.log('3D buildings layer added successfully');
            } catch (e) {
              console.warn('Failed to add 3D buildings:', e);
            }
          }

          addLocationMarkers();
          loadAndAnimatePlane();
          startAnimation();
        });

        map.current.on('error', (e: any) => {
          console.error('Mapbox error:', e);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      if (map.current) map.current.remove();
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);

  // Add location markers
  const addLocationMarkers = useCallback(() => {
    if (!map.current || !mapLoaded) return;

    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    const allLocs = [
      ...tripPlan.itinerary.flatMap((day) => day.locations),
      ...tripPlan.accommodations.map((acc) => ({
        name: acc.name,
        lat: acc.location?.lat || acc.lat,
        lng: acc.location?.lng || acc.lng,
      })),
    ].filter((loc) => loc.lat && loc.lng);

    allLocs.forEach((location, index) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: ${index < tripPlan.accommodations.length ? '#3b82f6' : '#10b981'};
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        cursor: pointer;
        transition: transform 0.2s ease;
      `;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      const mapboxgl = (window as any).mapboxgl;
      if (mapboxgl) {
        const marker = new mapboxgl.Marker(el)
          .setLngLat([location.lng, location.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25, closeButton: true }).setHTML(`
              <div style="padding: 8px; font-family: sans-serif;">
                <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${location.name}</h3>
                <p style="margin: 0; font-size: 12px; color: #666;">${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</p>
              </div>
            `)
          )
          .addTo(map.current);

        markers.current.push(marker);
      }
    });
  }, [tripPlan, mapLoaded]);

  // Load and animate 3D plane
  const loadAndAnimatePlane = useCallback(() => {
    const loader = new GLTFLoader();
    loader.load(
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumAir/glTF/CesiumAir.gltf',
      (gltf) => {
        const plane = gltf.scene.children[0] as THREE.Mesh;
        planeRef.current = plane;
        plane.scale.set(0.05, 0.05, 0.05);
        plane.rotation.x = Math.PI / 2; // Orient horizontally
        sceneRef.current.add(plane);
        animatePlane();
      },
      undefined,
      (error) => {
        console.error('Error loading 3D plane:', error);
        const el = document.createElement('div');
        el.style.backgroundImage = 'url(https://via.placeholder.com/20x20.png?text=✈️)';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.backgroundSize = 'cover';
        planeRef.current = new (window as any).mapboxgl.Marker(el).addTo(map.current);
        animatePlane();
      }
    );
  }, []);

  const animatePlane = useCallback(() => {
    if (!planeRef.current || !map.current || !allLocations.length) return;

    let index = 0;
    const animate = () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);

      const target = allLocations[index];
      if (target) {
        const [lng, lat] = target;
        const mapPosition = map.current.project([lng, lat]);
        const x = mapPosition.x - map.current.getCanvas().width / 2; // Center on canvas
        const y = -mapPosition.y + map.current.getCanvas().height / 2; // Invert Y
        if (planeRef.current) {
          planeRef.current.position.set(x, y, 150); // Lift above map
          planeRef.current.lookAt(new THREE.Vector3(x, y, 0));
        }
      }

      index = (index + 1) % allLocations.length;
      setCurrentLocationIndex(index);
      animationFrame.current = requestAnimationFrame(animate);
    };
    animate();
  }, [allLocations]);

  // Animation loop for camera movement
  const startAnimation = useCallback(() => {
    if (allLocations.length === 0) return;

    let index = 0;
    const animate = () => {
      if (!map.current || allLocations.length === 0) return;

      const location = allLocations[index];
      if (location) {
        setCurrentLocationIndex(index);

        setViewState((prev) => ({
          ...prev,
          longitude: location[0],
          latitude: location[1],
          zoom: 16,
          bearing: (prev.bearing + 15) % 360,
          transitionDuration: 2500,
        }));

        map.current.flyTo({
          center: [location[0], location[1]],
          zoom: 16,
          pitch: 60,
          bearing: (index * 45) % 360,
          duration: 2000,
          easing: (t: number) => t * (2 - t),
        });
      }

      index = (index + 1) % allLocations.length;
      setTimeout(animate, 2500);
    };

    animate();
  }, [allLocations]);

  // Deck.gl layers
  const layers = [
    new PathLayer({
      id: 'trip-path',
      data: pathData,
      pickable: true,
      widthScale: 1,
      widthMinPixels: 3,
      getPath: (d: any) => d.path,
      getColor: (d: any) => d.color,
      getWidth: (d: any) => d.width,
      dashJustified: true,
      parameters: {
        depthTest: false,
      },
    }),
  ];

  // Handle view state changes
  const onViewStateChange = useCallback(
    ({ viewState: newViewState }: any) => {
      setViewState(newViewState);
      if (map.current) {
        map.current.jumpTo({
          center: [newViewState.longitude, newViewState.latitude],
          zoom: newViewState.zoom,
          pitch: newViewState.pitch,
          bearing: newViewState.bearing,
        });
      }
    },
    []
  );

  // Render Three.js scene
  useEffect(() => {
    const render = () => {
      if (rendererRef.current && cameraRef.current && sceneRef.current && map.current) {
        const mapCanvas = map.current.getCanvas();
        cameraRef.current.aspect = mapCanvas.width / mapCanvas.height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(mapCanvas.width, mapCanvas.height);
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      requestAnimationFrame(render);
    };
    render();
  }, [mapLoaded]);

  // Fallback UI
  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-8 text-center text-white">
        <div className="flex items-center justify-center mb-4">
          <MapPin className="h-12 w-12 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold mb-2">Interactive 3D Trip Map</h3>
        <p className="text-gray-300 mb-6">
          To enable the interactive 3D map, please add your Mapbox access token.
        </p>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h4 className="font-semibold text-lg mb-4 text-blue-400">Your Trip Overview</h4>
          <div className="space-y-4 text-sm">
            {tripPlan.itinerary.map((day, dayIndex) => (
              <div key={dayIndex} className="text-left">
                <p className="font-medium text-white mb-2">Day {day.day}:</p>
                <ul className="ml-4 space-y-2">
                  {day.locations.map((location, locIndex) => (
                    <li key={locIndex} className="flex items-center text-gray-300">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-3 flex-shrink-0"></div>
                      <span>{location.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {tripPlan.accommodations.length > 0 && (
              <div className="mt-6 text-left">
                <p className="font-medium text-white mb-2">Accommodations:</p>
                <ul className="ml-4 space-y-2">
                  {tripPlan.accommodations.map((acc, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mr-3 flex-shrink-0"></div>
                      <span>{acc.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg shadow-2xl">
      <div className="absolute top-4 left-4 z-20 bg-black bg-opacity-70 backdrop-blur-sm rounded-lg shadow-lg p-3 text-white">
        <div className="flex items-center space-x-3">
          <Navigation className="h-5 w-5 text-blue-400" />
          <div>
            <span className="text-sm font-semibold">3D Trip Map</span>
            <p className="text-xs text-gray-300">{tripPlan.destination}</p>
          </div>
        </div>
      </div>

      {allLocations.length > 0 && (
        <div className="absolute top-4 right-4 z-20 bg-black bg-opacity-70 backdrop-blur-sm rounded-lg shadow-lg p-3 text-white">
          <div className="flex items-center space-x-2">
            <Plane className="h-4 w-4 text-red-400" />
            <span className="text-sm">
              Location {currentLocationIndex + 1} of {allLocations.length}
            </span>
          </div>
        </div>
      )}

      {!mapLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading 3D Map Experience...</p>
            <p className="text-sm text-gray-400 mt-2">Preparing your virtual journey</p>
          </div>
        </div>
      )}

      <div ref={mapContainer} className="w-full h-[600px]" style={{ minHeight: '600px', background: 'linear-gradient(135deg, #1a2a44 0%, #2d3748 100%)' }} />

      {mapLoaded && (
        <DeckGL
          ref={deckglRef}
          viewState={viewState}
          onViewStateChange={onViewStateChange}
          controller={true}
          layers={layers}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />
      )}

      <style jsx>{`
        .custom-marker:hover {
          z-index: 1000;
        }
        
        .mapboxgl-popup-content {
          background: rgba(0, 0, 0, 0.9) !important;
          color: white !important;
          border-radius: 8px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
        }
        
        .mapboxgl-popup-tip {
          border-top-color: rgba(0, 0, 0, 0.9) !important;
        }
      `}</style>
    </div>
  );
}