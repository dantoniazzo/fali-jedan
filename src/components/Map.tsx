import React from 'react';
import Map, { Marker } from 'react-map-gl';
import { MapPin } from 'lucide-react';

interface MapViewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}

const MapView: React.FC<MapViewProps> = ({ latitude, longitude, zoom = 14 }) => {
  // Use a valid Mapbox token or handle the case when it's not available
  const mapboxToken = 'pk.eyJ1IjoiZG9hbnRvbmkiLCJhIjoiY2txczU1dTA0MTdsbzJucWF5ejVvemFrayJ9.cOgJkwB5_agmOIinEoruDA';

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden">
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude,
          latitude,
          zoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      >
        <Marker longitude={longitude} latitude={latitude} anchor="bottom">
          <MapPin size={36} className="text-red-600" />
        </Marker>
      </Map>
    </div>
  );
};

export default MapView;