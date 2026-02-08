import { useState } from "react";
import {
  Wifi,
  Utensils,
  WashingMachine,
  Wind,
  Thermometer,
  Tv,
  Droplets,
  Flame,
  ParkingCircle,
  Zap,
  Dumbbell,
  Drill,
  Waves,
  MountainSnow,
  MapPin,
} from "lucide-react";

const AMENITY_ICONS: Record<string, any> = {
  Wifi: Wifi,
  Kitchen: Utensils,
  Washer: WashingMachine,
  Dryer: Wind,
  "Air conditioning": Droplets,
  Heating: Thermometer,
  TV: Tv,

  Pool: Waves,
  "Hot tub": Flame,
  "Free parking": ParkingCircle,
  "EV charger": Zap,
  Gym: Dumbbell,
  "BBQ grill": Drill,

  Beachfront: MapPin,
  Waterfront: MapPin,
  "Ski-in/Ski-out": MountainSnow,
};

interface AmenityGroupProps {
  title: string;
  items: string[];
  amenities: string[];
  setAmenities: React.Dispatch<React.SetStateAction<string[]>>;
  toggleArrayItem: (
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => void;
}

const AmenityGroup: React.FC<AmenityGroupProps> = ({
  title,
  items,
  amenities,
  setAmenities,
  toggleArrayItem,
}) => {
  const [expanded, setExpanded] = useState(false);

  const visibleItems = expanded ? items : items.slice(0, 6);
  const canExpand = items.length > 6;

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm ">{title}</h4>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
      {visibleItems.map((amenity) => {
        const Icon = AMENITY_ICONS[amenity];

        return (
          <label
            key={amenity}
            className="flex items-center gap-4 py-2 cursor-pointer
                       hover:bg-gray-50 -mx-2 px-2 rounded"
          >
            <input
              type="checkbox"
              checked={amenities.includes(amenity)}
              onChange={() =>
                toggleArrayItem(amenities, setAmenities, amenity)
              }
              className="w-5 h-5 rounded accent-gray-900"
            />

            {Icon && (
              <Icon size={20} className="text-gray-600 shrink-0" />
            )}

            <span className="text-sm">{amenity}</span>
          </label>
        );
      })}
      </div>

      {canExpand && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-sm font-medium underline text-gray-800 mt-2"
        >
          Show more
        </button>
      )}
    </div>
  );
};

export default AmenityGroup;
