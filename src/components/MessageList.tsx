import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatMessage } from "../core/backend/interfaces/chat.interface";
import { collection, doc, getDocs, limit, onSnapshot, orderBy, query, QueryDocumentSnapshot, startAfter } from "firebase/firestore";
import { auth, db } from "../core/backend/firebase";
import { useParams } from "react-router-dom";
import { buildUsersList, chatUsers } from "../core/users.state";
import userImage from '../assets/user.jpg';

const PAGE_SIZE = 20;

const MessageList = () => {
    const { docId } = useParams();

    const [messages, setMessages] = useState<Array<ChatMessage>>([]);
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const [oldestDoc, setOldestDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const scrollIntoView = (behavior: 'instant' | 'smooth' = 'instant') => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: behavior });
        }, 300);
    }

    // Scroll up tp load more
    const handleScroll = () => {
        if (!containerRef.current) return;
        if (loading) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

        // If we're near the top, consider loading more messages
        if ((scrollHeight - clientHeight - 75) < Math.abs(scrollTop)) {
            setLoading(true);
            fetchMoreMessages();
        }
    };

    // Load more messages
    const fetchMoreMessages = useCallback(async () => {
        if (!hasMore || loading || !oldestDoc) return;
        setLoading(true);

        const q = query(
            collection(db, `chats/${docId}/messages`),
            orderBy("timestamp", "desc"),
            startAfter(oldestDoc),
            limit(PAGE_SIZE)
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            setHasMore(false);
            setLoading(false);
            return;
        }

        const newMessages = snapshot.docs.map((doc) => {
            const msg = { id: doc.id, ...doc.data() } as ChatMessage;
            msg.is_me = msg.user_uuid == auth.currentUser?.uid

            return msg;
        });
        setMessages((prev) => {
            return [...prev, ...newMessages];
        });
        setOldestDoc(snapshot.docs[snapshot.docs.length - 1]);

        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, [docId, oldestDoc, hasMore, loading]);

    // Load messages for first time
    useEffect(() => {
        const q = query(collection(db, `chats/${docId}/messages`), orderBy("timestamp", "desc"), limit(PAGE_SIZE));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            if (!snapshot.empty) {
                const msgs = snapshot.docs.map((doc) => {
                    const msg = { id: doc.id, ...doc.data() } as ChatMessage;
                    msg.is_me = msg.user_uuid == auth.currentUser?.uid;
                    // msg.profile_image_url = chatUsers[msg.user_uuid]

                    return msg;
                });

                await buildUsersList(msgs.map(d => d.user_uuid));
                msgs.forEach(m => {
                    m.profile_image_url = chatUsers[m.user_uuid]?.profileImageUrl || userImage;
                    m.profile_name = chatUsers[m.user_uuid]?.name;
                });

                setMessages(msgs);
                setOldestDoc(snapshot.docs[snapshot.docs.length - 1]);
            }
        });

        scrollIntoView();

        return () => unsubscribe();
    }, [docId]);

    // Typing indication, check if any typing in the chat and it's not me
    useEffect(() => {
        const typingDocRef = doc(db, `chats/${docId}`);
        const unsubscribe = onSnapshot(typingDocRef, (doc) => {
            if (auth.currentUser?.uid && doc.exists()) {
                const data = doc.data();
                if (data.typing_list?.length && data.typing_list.filter((l: string) => l != auth.currentUser?.uid).length) {
                    setIsTyping(true);
                }
                else {
                    setIsTyping(false);
                }
            }
            else {
                setIsTyping(false);
            }
        });

        return () => unsubscribe();
    }, [docId]);

    return (
        <>
            <div ref={containerRef} onScroll={handleScroll}
                className="flex-grow overflow-y-auto relative border rounded-lg p-2 pb-7 flex flex-col-reverse gap-2 items-start messages">
                <div ref={messagesEndRef} />

                {messages.map((msg) => (
                    <motion.div key={msg.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
                        className={`flex gap-2 max-w-[75%] min-w-10 ${msg.is_me ? "self-end" : "self-start"}`}>
                        <div className={`py-1 px-2 rounded-lg ${msg.is_me ? "bg-yellow-500  rounded-br-none" : "bg-gray-200 rounded-bl-none"}`}>
                            {msg.profile_name && (<span className="text-xs block">{msg.profile_name}</span>)}
                            {msg.media_url && <img src={msg.media_url} alt="Media" className="rounded mt-2 max-w-xs" />}
                            {msg.content}

                            {msg.timestamp && (
                                <small className="block mt-1 text-xs text-right">{msg.timestamp.toDate().toLocaleTimeString()}</small>
                            )}
                        </div>
                        {msg.profile_image_url && (
                            <img src={msg.profile_image_url} alt={msg.profile_name} className="rounded-full w-6 h-6 object-cover" />
                        )}
                    </motion.div>
                ))}

                {loading && hasMore && <div className="text-center w-full"><span className="loader messages-loader static"></span></div>}
                {isTyping && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                    className="absolute bottom-1">
                    <div className="typing-bubble bg-gray-200">
                        <div className="typing">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    </div>
                </motion.p>}
            </div>
        </>
    )
}

export default MessageList;