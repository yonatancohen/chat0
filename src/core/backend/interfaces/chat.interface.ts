import { Timestamp } from "firebase/firestore";

// Represent a chat room props
export interface ChatRoom {
  id: string; 
  name: string; 
  created_at: Timestamp;
  last_message_ts?: Timestamp;
  description?: string;
  image: string;
  typing_list?: Array<string>;
}

// Represent a chat message props
export interface ChatMessage {
  id: string;
  content?: string;
  media_url?: string;
  timestamp: Timestamp;
  user_uuid: string;
  is_me: boolean;
  profile_image_url?: string;
  profile_name?: string;
}