export interface UniverseTemplate {
  id: string;
  name: string;
  image: string;
  description: string;
  ageRange: string;
  tone: string;
  artStyle: string;
  tags: string[];
  flavour: "islamic-forward" | "universal";
}

export const UNIVERSE_TEMPLATES: UniverseTemplate[] = [
  {
    id: "young-muslim-family-uk",
    name: "Young Muslim Family - UK Suburbs",
    image: "/universe-cover/young muslim family.png",
    description:
      "A warm, relatable universe set in a British Muslim household. Stories about school, mosque, family, and growing up with Islamic values in a modern world.",
    ageRange: "1-6",
    tone: "calm-educational",
    artStyle: "flat-illustration",
    tags: ["family", "uk", "everyday", "muslim"],
    flavour: "islamic-forward",
  },
  {
    id: "andalusian-historical",
    name: "Andalusian Historical",
    image: "/universe-cover/andalusian.png",
    description:
      "Journey back to Golden Age Andalusia - scholars, markets, minarets, and adventure in Cordoba and Granada.",
    ageRange: "6-14",
    tone: "magical-inspiring",
    artStyle: "watercolor",
    tags: ["historical", "andalusia", "golden-age", "adventure"],
    flavour: "islamic-forward",
  },
  {
    id: "madinah-everyday",
    name: "Madinah Everyday",
    image: "/universe-cover/madinah journey.png",
    description:
      "Gentle stories set in and around Madinah - visits to the masjid, learning du'as, acts of kindness, and the warmth of a faith-filled community.",
    ageRange: "1-6",
    tone: "calm-educational",
    artStyle: "storybook",
    tags: ["madinah", "faith", "gentle", "toddler"],
    flavour: "islamic-forward",
  },
  {
    id: "hajj-journey",
    name: "Hajj & Umrah Journey",
    image: "/universe-cover/hajj and umrah journey.png",
    description:
      "A child's first pilgrimage - the excitement of travel, the awe of the Ka'bah, and the spiritual lessons of Hajj and Umrah.",
    ageRange: "1-6",
    tone: "magical-inspiring",
    artStyle: "watercolor",
    tags: ["hajj", "umrah", "pilgrimage", "travel"],
    flavour: "islamic-forward",
  },
  {
    id: "space-age-islamic-scifi",
    name: "Space-Age Islamic Sci-Fi",
    image: "/universe-cover/space-age-islamic.png",
    description:
      "The year is 2150. Muslim astronauts explore the galaxy, make wudu in zero gravity, and carry Islamic values to the stars.",
    ageRange: "6-14",
    tone: "funny-adventurous",
    artStyle: "flat-illustration",
    tags: ["scifi", "space", "adventure", "futuristic"],
    flavour: "islamic-forward",
  },
  {
    id: "animal-friends-village",
    name: "Animal Friends Village",
    image: "/universe-cover/animal friend.png",
    description:
      "A charming village where animal friends - foxes, rabbits, owls, and hedgehogs - live together with kindness, honesty, and friendship.",
    ageRange: "1-6",
    tone: "funny-adventurous",
    artStyle: "storybook",
    tags: ["animals", "friendship", "village", "universal"],
    flavour: "universal",
  },
  {
    id: "adventure-explorers",
    name: "Adventure & Discovery",
    image: "/universe-cover/adventure discovery.png",
    description:
      "Young explorers travel through jungles, oceans, and mountains - discovering the world and themselves along the way.",
    ageRange: "6-14",
    tone: "brave-heroic",
    artStyle: "watercolor",
    tags: ["adventure", "nature", "discovery", "universal"],
    flavour: "universal",
  },
  {
    id: "everyday-magic",
    name: "Everyday Magic",
    image: "/universe-cover/everyday magic.png",
    description:
      "Ordinary children discover extraordinary moments in everyday life - at home, at school, in the garden - through curiosity and wonder.",
    ageRange: "1-6",
    tone: "magical-inspiring",
    artStyle: "flat-illustration",
    tags: ["everyday", "magic", "wonder", "universal"],
    flavour: "universal",
  },
];
