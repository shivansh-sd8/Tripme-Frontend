export interface CarouselImage {
  id: number;
  src: string;
  alt: string;
  title: string;
  location: string;
  description: string;
  rating: number;
  reviewCount: number;
}

export const carouselImages: CarouselImage[] = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
    alt: "Taj Mahal Agra",
    title: "Taj Mahal - Wonder of the World",
    location: "Agra, Uttar Pradesh",
    description: "The iconic white marble mausoleum, a symbol of eternal love. Experience the architectural marvel that attracts millions of visitors from around the world.",
    rating: 4.9,
    reviewCount: 12500
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?auto=format&fit=crop&w=1200&q=80",
    alt: "Goa Beach Paradise",
    title: "Goa Beach Paradise",
    location: "Goa",
    description: "Pristine beaches, vibrant nightlife, and Portuguese heritage. Discover the perfect blend of relaxation and adventure on India's most famous coastline.",
    rating: 4.8,
    reviewCount: 8900
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1520250497591-112f2f6a5a3a?auto=format&fit=crop&w=1200&q=80",
    alt: "Kerala Backwaters",
    title: "Kerala Backwaters",
    location: "Alleppey, Kerala",
    description: "Serene houseboat cruises through palm-fringed canals. Experience the tranquil beauty of Kerala's famous backwaters and lush green landscapes.",
    rating: 4.9,
    reviewCount: 6700
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1200&q=80",
    alt: "Rishikesh Adventure",
    title: "Rishikesh - Yoga Capital",
    location: "Rishikesh, Uttarakhand",
    description: "Spiritual retreats, white water rafting, and yoga by the Ganges. The gateway to the Himalayas offers adventure and tranquility.",
    rating: 4.7,
    reviewCount: 5400
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=1200&q=80",
    alt: "Varanasi Ghats",
    title: "Varanasi - Spiritual Capital",
    location: "Varanasi, Uttar Pradesh",
    description: "Ancient city on the Ganges, spiritual ceremonies, and timeless traditions. Experience the soul of India in the world's oldest living city.",
    rating: 4.8,
    reviewCount: 7200
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=80",
    alt: "Manali Snow Mountains",
    title: "Manali Snow Paradise",
    location: "Manali, Himachal Pradesh",
    description: "Snow-capped peaks, apple orchards, and adventure sports. Manali is the gateway to the Himalayas with breathtaking mountain views.",
    rating: 4.9,
    reviewCount: 1856
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80",
    alt: "Kashmir Dal Lake",
    title: "Kashmir Paradise",
    location: "Srinagar, Kashmir",
    description: "The crown of India with pristine Dal Lake, houseboats, and snow-covered peaks. Experience the beauty of Kashmir Valley.",
    rating: 4.9,
    reviewCount: 2100
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80",
    alt: "Udaipur Lake Palace",
    title: "Udaipur Lake City",
    location: "Udaipur, Rajasthan",
    description: "The Venice of the East with beautiful lakes, palaces, and romantic boat rides. Experience the magic of the City of Lakes.",
    rating: 4.8,
    reviewCount: 1342
  }
]; 