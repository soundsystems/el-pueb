import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

function MapComponent() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  const defaultCenter = { lat: 40.68480406277308, lng: -73.9444458390298 };

  if (!isLoaded) return <div>Loading...</div>;

  const markerIcon = {
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512' fill='%23FD6F00' width='24px' height='48px'%3E%3Cpath d='M192 0C86 0 0 86 0 192c0 69.7 44.6 126.6 123.6 155.2L192 512l68.4-164.8C339.4 318.6 384 261.7 384 192 384 86 298 0 192 0zm0 277c-47.3 0-85.7-38.3-85.7-85.7 0-47.3 38.3-85.7 85.7-85.7 47.3 0 85.7 38.3 85.7 85.7 0 47.3-38.3 85.7-85.7 85.7z' /%3E%3Ccircle cx='192' cy='192' r='53' fill='%232B2726' /%3E%3C/svg%3E",
    scaledSize: new google.maps.Size(25, 40),
  };

  return (
    <GoogleMap
      zoom={17}
      center={defaultCenter}
      mapContainerClassName="h-96 rounded-lg"
    >
      <Marker position={defaultCenter} icon={markerIcon} />
    </GoogleMap>
  );
}

export default MapComponent;
