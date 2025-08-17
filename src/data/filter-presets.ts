import { FilterSettings } from "@/hooks/use-image-filters";

export const FILTER_PRESETS: Array<{
  name: string;
  filters: FilterSettings;
}> = [
  {
    name: "Original",
    filters: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      gamma: 0,
      clarity: 0,
      temperature: 0,
      vignette: 0,
    },
  },
  // Orden especificado por el usuario
  {
    name: "Chrome",
    filters: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      gamma: 0,
      clarity: 0,
      temperature: 0,
      vignette: 0,
      // kg
      colorMatrix: [
        1.398, -0.316, 0.065, -0.273, 0.201, -0.051, 1.278, -0.08, -0.273,
        0.201, -0.051, 0.119, 1.151, -0.29, 0.215, 0, 0, 0, 1, 0,
      ],
    },
  },
  {
    name: "Fade",
    filters: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      gamma: 0,
      clarity: 0,
      temperature: 0,
      vignette: 0,
      // Cg
      colorMatrix: [
        1.073, -0.015, 0.092, -0.115, -0.017, 0.107, 0.859, 0.184, -0.115,
        -0.017, 0.015, 0.077, 1.104, -0.115, -0.017, 0, 0, 0, 1, 0,
      ],
    },
  },
  {
    name: "Cold",
    filters: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      gamma: 0,
      clarity: 0,
      temperature: 0,
      vignette: 0,
      // Mg (mapped as cold)
      colorMatrix: [
        1.1, 0, 0, 0, -0.1, 0, 1.1, 0, 0, -0.1, 0, 0, 1.2, 0, -0.1, 0, 0, 0, 1,
        0,
      ],
    },
  },
  {
    name: "Warm",
    filters: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      gamma: 0,
      clarity: 0,
      temperature: 0,
      vignette: 0,
      // Tg
      colorMatrix: [
        1.06, 0, 0, 0, 0, 0, 1.01, 0, 0, 0, 0, 0, 0.93, 0, 0, 0, 0, 0, 1, 0,
      ],
    },
  },
  {
    name: "Pastel",
    filters: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      gamma: 0,
      clarity: 0,
      temperature: 0,
      vignette: 0,
      // wg
      colorMatrix: [
        0.75, 0.25, 0.25, 0, 0, 0.25, 0.75, 0.25, 0, 0, 0.25, 0.25, 0.75, 0, 0,
        0, 0, 0, 1, 0,
      ],
    },
  },
  {
    name: "Mono",
    filters: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      gamma: 0,
      clarity: 0,
      temperature: 0,
      vignette: 0,
      // Rg (monoDefault)
      colorMatrix: [
        0.212, 0.715, 0.114, 0, 0, 0.212, 0.715, 0.114, 0, 0, 0.212, 0.715,
        0.114, 0, 0, 0, 0, 0, 1, 0,
      ],
    },
  },
  {
    name: "Noir",
    filters: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      gamma: 0,
      clarity: 0,
      temperature: 0,
      vignette: 0,
      // Ig
      colorMatrix: [
        0.15, 1.3, -0.25, 0.1, -0.2, 0.15, 1.3, -0.25, 0.1, -0.2, 0.15, 1.3,
        -0.25, 0.1, -0.2, 0, 0, 0, 1, 0,
      ],
    },
  },
  {
    name: "Stark",
    filters: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      gamma: 0,
      clarity: 0,
      temperature: 0,
      vignette: 0,
      // Ag
      colorMatrix: [
        0.338, 0.991, 0.117, 0.093, -0.196, 0.302, 1.049, 0.096, 0.078, -0.196,
        0.286, 1.016, 0.146, 0.101, -0.196, 0, 0, 0, 1, 0,
      ],
    },
  },
  {
    name: "Wash",
    filters: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      gamma: 0,
      clarity: 0,
      temperature: 0,
      vignette: 0,
      // Eg (monoWash)
      colorMatrix: [
        0.163, 0.518, 0.084, -0.01, 0.208, 0.163, 0.529, 0.082, -0.02, 0.21,
        0.171, 0.529, 0.084, 0, 0.214, 0, 0, 0, 1, 0,
      ],
    },
  },
  {
    name: "Sepia",
    filters: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      gamma: 0,
      clarity: 0,
      temperature: 0,
      vignette: 0,
      // Lg (sepiaDefault)
      colorMatrix: [
        0.393, 0.768, 0.188, 0, 0, 0.349, 0.685, 0.167, 0, 0, 0.272, 0.533,
        0.13, 0, 0, 0, 0, 0, 1, 0,
      ],
    },
  },
  {
    name: "Rust",
    filters: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      gamma: 0,
      clarity: 0,
      temperature: 0,
      vignette: 0,
      // zg (sepiaRust)
      colorMatrix: [
        0.269, 0.764, 0.172, 0.05, 0.1, 0.239, 0.527, 0.152, 0, 0.176, 0.186,
        0.4, 0.119, 0, 0.159, 0, 0, 0, 1, 0,
      ],
    },
  },
  {
    name: "Blues",
    filters: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      gamma: 0,
      clarity: 0,
      temperature: 0,
      vignette: 0,
      // Fg (sepiaBlues)
      colorMatrix: [
        0.289, 0.62, 0.185, 0, 0.077, 0.257, 0.566, 0.163, 0, 0.115, 0.2, 0.43,
        0.128, 0, 0.188, 0, 0, 0, 1, 0,
      ],
    },
  },
  {
    name: "Color",
    filters: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      gamma: 0,
      clarity: 0,
      temperature: 0,
      vignette: 0,
      // Dg (sepiaColor)
      colorMatrix: [
        0.547, 0.764, 0.134, 0, -0.147, 0.281, 0.925, 0.12, 0, -0.135, 0.225,
        0.558, 0.33, 0, -0.113, 0, 0, 0, 1, 0,
      ],
    },
  },
];
