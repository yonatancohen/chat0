import { auth, db } from "../firebase"; // Import the Firestore instance
import { collection, doc, documentId, getDoc, getDocs, orderBy, query, setDoc, where } from "firebase/firestore";
import { ChatRoom } from "../interfaces/chat.interface";
import { ChatUser } from "../interfaces/user.interface";
import { updateProfile, User } from "firebase/auth";
import { generateUniqueName } from "./names.service";

// Function to fetch all chat rooms from the "chat" collection
const getChatRooms = async (): Promise<ChatRoom[]> => {
    try {
        const chatRoomsCollection = collection(db, "chats"); // Reference to the "chat" collection
        // Create a query to sort by last_message_ts in descending order
        const chatRoomsQuery = query(chatRoomsCollection, orderBy("last_message_ts", "desc"));
        const chatRoomsSnapshot = await getDocs(chatRoomsQuery); // Execute the query

        // Map through the documents and return an array of chat rooms
        const chatRooms = chatRoomsSnapshot.docs.map((doc) => ({
            id: doc.id, // Document ID
            ...doc.data(), // Document data
        })) as Array<ChatRoom>;

        return chatRooms;
    } catch (error) {
        console.error("Error fetching chat rooms:", error);
        throw error; // Re-throw the error for handling in the component
    }
}

const uploadProfileImage = async (profileImage: string) => {
    const user = auth.currentUser;

    if (user) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            profileImageUrl: profileImage,  // Set the profile image URL (overwriting document)
        }, { merge: true });
    }
}

const getProfileImage = async () => {
    const user = auth.currentUser;

    if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const chatUser = userDoc.data() as ChatUser;
            return chatUser.profileImageUrl;
        }
    }

    return null;
}

const generateUserName = async (user: User) => {
    const name = await generateUniqueName()
    if (name) {
        await updateProfile(user, { displayName: name });

        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            name: name,
        }, { merge: true });
    }
}

const getProfilesByUUID = async (uuids: Array<string>) => {
    // Create a query to fetch the documents by UUIDs
    const usersQuery = query(collection(db, 'users'), where(documentId(), 'in', uuids));

    // Get the documents
    const querySnapshot = await getDocs(usersQuery);

    // Map the result to a key-value object with the document ID as key
    const users = querySnapshot.docs.reduce<Record<string, ChatUser>>((acc, doc) => {
        acc[doc.id] = doc.data() as ChatUser;
        return acc;
    }, {});

    return users;
}

export { getChatRooms, uploadProfileImage, getProfileImage, generateUserName, getProfilesByUUID };