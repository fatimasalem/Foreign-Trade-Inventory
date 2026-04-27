import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type AbuDhabiPortPin = {
  id: string;
  name: string;
  coordinates: [number, number];
  transport: "sea" | "land" | "air";
};

type Props = {
  ports: AbuDhabiPortPin[];
  isCritical: boolean;
  onHoverPort: (port: AbuDhabiPortPin | null) => void;
  onPortClick?: (port: AbuDhabiPortPin) => void;
  selectedPortId?: string | null;
};

const DEFAULT_VIEW: [number, number] = [24.22, 53.92];
const DEFAULT_ZOOM = 7;

/** Leaflet sometimes mis-measures size when the container is in flex/grid; refresh after paint. */
function InvalidateMapSize() {
  const map = useMap();
  useEffect(() => {
    const id = requestAnimationFrame(() => map.invalidateSize());
    return () => cancelAnimationFrame(id);
  }, [map]);
  return null;
}

/** Fits the map to the current port pins; handles single-point and empty cases. */
function MapBoundsSync({ ports }: { ports: AbuDhabiPortPin[] }) {
  const map = useMap();

  useEffect(() => {
    if (ports.length === 0) {
      map.setView(DEFAULT_VIEW, DEFAULT_ZOOM, { animate: false });
      return;
    }
    if (ports.length === 1) {
      const [lng, lat] = ports[0].coordinates;
      map.setView([lat, lng], 11, { animate: true });
      return;
    }
    const lats = ports.map((p) => p.coordinates[1]);
    const lngs = ports.map((p) => p.coordinates[0]);
    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: [48, 48], maxZoom: 10, animate: true },
    );
  }, [map, ports]);

  return null;
}

export function AbuDhabiTradeLeafletMap({ ports, isCritical, onHoverPort, onPortClick, selectedPortId }: Props) {
  return (
    <div className="relative h-full w-full min-h-[360px] overflow-hidden rounded-lg border border-slate-200/80 shadow-inner">
      <MapContainer
        center={DEFAULT_VIEW}
        zoom={DEFAULT_ZOOM}
        className="z-0 h-full w-full [&_.leaflet-control-attribution]:max-w-[calc(100%-12px)] [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:leading-snug"
        scrollWheelZoom
        style={{ height: "100%", minHeight: 360, width: "100%" }}
        aria-label="Abu Dhabi trade facilities map"
      >
        {/* Satellite basemap — real coastlines, terrain, and urban fabric */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> — Esri, Maxar, Earthstar Geographics'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
        {/* Place / border reference for readability on imagery */}
        <TileLayer
          attribution=""
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          opacity={0.55}
          maxZoom={19}
        />
        <InvalidateMapSize />
        <MapBoundsSync ports={ports} />
        {ports.map((port) => {
          const [lng, lat] = port.coordinates;
          const fill = isCritical
            ? "#dc2626"
            : port.transport === "air"
              ? "#a855f7"
              : port.transport === "land"
                ? "#ca8a04"
                : "#2563eb";
          const selected = selectedPortId === port.id;
          const radius = (port.transport === "sea" ? 11 : 9) + (selected ? 2 : 0);
          return (
            <CircleMarker
              key={port.id}
              center={[lat, lng]}
              radius={radius}
              pathOptions={{
                fillColor: fill,
                color: selected ? "#1d4ed8" : "#ffffff",
                weight: selected ? 4 : 2,
                fillOpacity: 0.92,
              }}
              eventHandlers={{
                mouseover: () => onHoverPort(port),
                mouseout: () => onHoverPort(null),
                click: () => onPortClick?.(port),
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -6]}
                opacity={1}
                className="!rounded-md !border-0 !bg-slate-900/90 !px-2 !py-1 !text-[11px] !font-semibold !text-white !shadow-lg"
              >
                {port.name}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
