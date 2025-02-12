import { useCallback, useEffect, useRef, useState } from "react";
import { auth, db, storage } from "../core/backend/firebase";
import { addDoc, arrayRemove, arrayUnion, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useParams } from "react-router-dom";

const MessageInput = () => {
    const { docId } = useParams();

    const [newMessage, setNewMessage] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [isSending, setIsSending] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Send message
    const sendMessage = useCallback(async () => {
        if (!auth.currentUser) return;
        if (!newMessage.trim() && !file) return;

        setIsSending(true);

        let mediaUrl = "";
        if (file) {
            const fileRef = ref(storage, `chats/${docId}/medias/${file.name}`);
            await uploadBytes(fileRef, file);
            mediaUrl = await getDownloadURL(fileRef);
            setFile(null);
        }

        await addDoc(collection(db, `chats/${docId}/messages`), {
            content: newMessage.trim() || null,
            media_url: mediaUrl || null,
            timestamp: serverTimestamp(),
            user_uuid: auth.currentUser?.uid
        });

        setNewMessage("");
        setIsSending(false);

        setTimeout(() => {
            inputRef?.current?.focus();
        }, 250);
    }, [docId, file, newMessage]);

    useEffect(() => {
        if (file) {
            sendMessage();
        }
    }, [file, sendMessage])

    // Add current user who's typing to a list
    const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        const typingDocRef = doc(db, `chats/${docId}`);
        await updateDoc(typingDocRef, {
            typing_list: arrayUnion(auth.currentUser?.uid) // Add user to the array or create it
        });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        typingTimeoutRef.current = setTimeout(async () => {
            console.log('set to false')
            await updateDoc(typingDocRef, {
                typing_list: arrayRemove(auth.currentUser?.uid)  // Remove user to the array
            });

            typingTimeoutRef.current = null;
        }, 2000);
    };

    // Handle "Enter" event for send message
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="relative">
                <input ref={inputRef} className="border p-2 w-full rounded-lg pr-16" onChange={handleTyping}
                    value={newMessage} onKeyDown={handleKeyDown} placeholder="Type a message..." disabled={isSending} />

                <div className="chat-actions">
                    <button
                        className="text-primary hover:text-primary-dark disabled:text-gray-400"
                        onClick={() => document.getElementById('fileInput')!.click()}
                        disabled={isSending}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M2 12.5001L3.75159 10.9675C4.66286 10.1702 6.03628 10.2159 6.89249 11.0721L11.1822 15.3618C11.8694 16.0491 12.9512 16.1428 13.7464 15.5839L14.0446 15.3744C15.1888 14.5702 16.7369 14.6634 17.7765 15.599L21 18.5001" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M17 2V11M17 2L20 5M17 2L14 5" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <input id="fileInput" type="file" hidden accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />

                    <button
                        onClick={sendMessage}
                        disabled={isSending}
                        className="text-primary hover:text-primary-dark disabled:text-gray-400">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.6357 15.6701L20.3521 10.5208C21.8516 6.02242 22.6013 3.77322 21.414 2.58595C20.2268 1.39869 17.9776 2.14842 13.4792 3.64788L8.32987 5.36432C4.69923 6.57453 2.88392 7.17964 2.36806 8.06698C1.87731 8.91112 1.87731 9.95369 2.36806 10.7978C2.88392 11.6852 4.69923 12.2903 8.32987 13.5005C8.91282 13.6948 9.2043 13.792 9.44793 13.9551C9.68404 14.1131 9.88687 14.316 10.0449 14.5521C10.208 14.7957 10.3052 15.0872 10.4995 15.6701C11.7097 19.3008 12.3148 21.1161 13.2022 21.6319C14.0463 22.1227 15.0889 22.1227 15.933 21.6319C16.8204 21.1161 17.4255 19.3008 18.6357 15.6701Z" stroke="#1C274C" strokeWidth="1.5" />
                            <path d="M16.2116 8.84823C16.5061 8.55696 16.5087 8.0821 16.2174 7.78758C15.9262 7.49307 15.4513 7.49044 15.1568 7.78171L16.2116 8.84823ZM10.6626 14.336L16.2116 8.84823L15.1568 7.78171L9.60787 13.2695L10.6626 14.336Z" fill="#1C274C" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MessageInput;