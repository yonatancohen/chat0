import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { ChatRoom } from "../core/backend/interfaces/chat.interface";
import { db } from "../core/backend/firebase";
import { useNavigate } from "react-router-dom";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";


// const PAGE_SIZE = 20;

const InitChatRoom = () => {
  const { docId } = useParams();
  const [roomDetails, setRoomDetails] = useState<ChatRoom | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Chat room details
    const fetchRoomDetails = async () => {
      const roomRef = doc(db, "chats", docId!);
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        setRoomDetails(roomSnap.data() as ChatRoom);
      } else {
        navigate("/");
      }
    };

    fetchRoomDetails();
  }, [docId, navigate]);

  return (
    <div className="flex flex-col gap-3 chat-room px-3">
      <div className="bg-gray-100 rounded-lg p-2 mt-3">
        <div className="flex gap-2 items-center">
          <Link to='/'>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h2 className="text-xl text-yellow-500 font-bold">{roomDetails?.name || "Chat Room"}</h2>
        </div>
        {roomDetails?.description && <p className="text-gray-600 font-medium">{roomDetails.description}</p>}
      </div>

      <MessageList></MessageList>
      <MessageInput></MessageInput>
    </div>
  );
};

export default InitChatRoom;
