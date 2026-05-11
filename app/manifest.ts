import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Travel Outfits",
    short_name: "Outfits",
    description: "Planificador de outfits para viajes",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#EDE8DF",
    theme_color: "#111111",
    icons: [
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
