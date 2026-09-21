import {
  Bath,
  BatteryCharging,
  FileText,
  Footprints,
  GlassWater,
  Headphones,
  Package,
  Pill,
  Shirt,
} from 'lucide-react-native';

// Picks an icon from the item's name. First match wins; anything else gets the box icon.
// To support a new kind of item, add one line here.
const RULES = [
  [/shirt|short|pant|underwear|brief|jacket|dress|swim|trunk/i, Shirt],
  [/charger|power ?bank|battery|cable/i, BatteryCharging],
  [/water|bottle/i, GlassWater],
  [/airpod|earphone|headphone|earbud/i, Headphones],
  [/document|passport|ticket|papers|\bid\b/i, FileText],
  [/medicine|meds?\b|pill|vitamin/i, Pill],
  [/toiletr|soap|shampoo|toothbrush|towel/i, Bath],
  [/sock|shoe|slipper|sandal|flip/i, Footprints],
];

export const getPackingIcon = (title) => {
  const rule = RULES.find(([pattern]) => pattern.test(title));
  return rule?.[1] ?? Package;
};