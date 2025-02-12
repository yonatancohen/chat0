import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChatRoom } from "../core/backend/interfaces/chat.interface";
import { getChatRooms } from "../core/backend/services/firestore.service";

const ChatRoomList = () => {
    const [chatRooms, setChatRooms] = useState<Array<ChatRoom>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                const rooms = await getChatRooms();
                setChatRooms(rooms);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchChatRooms();
    }, []);

    if (loading) return <div className="loader"></div>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="px-3 flex flex-col flex-grow max-h-[100%] overflow-auto pb-3">
            <h2 className="font-bold py-4 ps-2 bg-white">Chats</h2>
            <ul className="flex flex-col gap-4 overflow-auto h-full">
                {chatRooms.map((room) => (
                    <li key={room.id} className="py-3 px-2 flex gap-3 items-center hover:bg-gray-100 rounded-lg cursor-pointer">
                        <Link to={`/chat/${room.id}`} className="contents">
                            <img src={room.image} alt="" className="rounded-full w-12 h-12 object-cover" />
                            <span className="flex-1">
                                <span className="flex justify-between items-center">
                                    <b className="text-yellow-500 font-bold">{room.name}</b>
                                    {room.last_message_ts && <small>{room.last_message_ts.toDate().toLocaleString()}</small>}
                                </span>
                                <p className="text-sm">{room.description}</p>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ChatRoomList;