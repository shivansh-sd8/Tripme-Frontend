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
    src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=80",
    alt: "Manali Snow Mountains",
    title: "Manali Snow Paradise",
    location: "Manali, Himachal Pradesh",
    description: "Snow-capped peaks, apple orchards, and adventure sports. Manali is the gateway to the Himalayas with breathtaking mountain views.",
    rating: 4.9,
    reviewCount: 1856
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    alt: "Munnar Tea Gardens",
    title: "Munnar Tea Estates",
    location: "Munnar, Kerala",
    description: "Rolling hills covered with emerald green tea plantations, misty mountains, and cool climate. Home to the endangered Nilgiri Tahr.",
    rating: 4.8,
    reviewCount: 1247
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80",
    alt: "Kashmir Dal Lake",
    title: "Kashmir Paradise",
    location: "Srinagar, Kashmir",
    description: "The crown of India with pristine Dal Lake, houseboats, and snow-covered peaks. Experience the beauty of Kashmir Valley.",
    rating: 4.9,
    reviewCount: 2100
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    alt: "Jaipur Pink City",
    title: "Jaipur Pink City",
    location: "Jaipur, Rajasthan",
    description: "The Pink City with magnificent palaces, forts, and rich cultural heritage. Experience the royal grandeur of Rajasthan.",
    rating: 4.7,
    reviewCount: 1689
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80",
    alt: "Assam Tea Gardens",
    title: "Assam Tea Gardens",
    location: "Assam",
    description: "Lush tea estates and the mighty Brahmaputra river. Assam is known for its scenic beauty, wildlife, and unique culture.",
    rating: 4.7,
    reviewCount: 1102
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80",
    alt: "Landour Mussoorie",
    title: "Landour Mussoorie",
    location: "Landour, Uttarakhand",
    description: "Colonial charm, pine forests, and panoramic Himalayan views. Landour is a peaceful retreat in the Queen of Hills.",
    rating: 4.8,
    reviewCount: 956
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    alt: "Himachal Valley",
    title: "Himachal Himalayas",
    location: "Himachal Pradesh",
    description: "Snow-capped peaks, pine forests, and adventure sports. Himachal is a paradise for trekkers and mountain lovers.",
    rating: 4.9,
    reviewCount: 1500
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
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1509228627150-1d93a1e1d8d7?auto=format&fit=crop&w=1200&q=80",
    alt: "Shimla Ridge",
    title: "Shimla Queen of Hills",
    location: "Shimla, Himachal Pradesh",
    description: "Colonial architecture, toy train rides, and panoramic mountain views. Shimla is the perfect hill station getaway.",
    rating: 4.7,
    reviewCount: 2234
  },
  {
    id: 10,
    src: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80",
    alt: "Darjeeling Himalayas",
    title: "Darjeeling Himalayas",
    location: "Darjeeling, West Bengal",
    description: "Tea gardens, toy trains, and panoramic views of the Kanchenjunga range. Darjeeling is a gem of the Eastern Himalayas.",
    rating: 4.8,
    reviewCount: 1456
  }
]; 