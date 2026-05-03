export type Role = 'Alpha' | 'Bruiser' | 'Hunter' | 'Elder';
export type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Primal' | 'Legendary';

export type DinoCard = {
  id: string;
  name: string;
  role: Role;
  tier: Tier;
  power: number;
  era: 'Triassic' | 'Jurassic' | 'Cretaceous';
  habitat: 'Forest' | 'Swamp' | 'Desert' | 'Mountain' | 'Plains' | 'Coast';
  diet: 'Carnivore' | 'Herbivore' | 'Omnivore' | 'Piscivore';
  bloodline: 'Apex' | 'Horned' | 'Raptor' | 'Titan' | 'Winged' | 'Armored' | 'Fossil';
};
