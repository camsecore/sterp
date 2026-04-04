export interface Product {
  id: string;
  collection_id: string;
  name: string;
  photo_url: string | null;
  one_liner: string | null;
  affiliate_url: string | null;
  original_url: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  archive_note: string | null;
  archived_at: string | null;
  acquired_at: string | null;
}

export interface Collection {
  id: string;
  name: string;
  sort_order: number;
}

export interface Obsession {
  id: string;
  product_id: string;
  sort_order: number;
  products: {
    id: string;
    name: string;
    photo_url: string | null;
    one_liner: string | null;
    affiliate_url: string | null;
  };
}

export interface Profile {
  username: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
}
