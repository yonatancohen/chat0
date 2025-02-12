import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import ChatRoomList from "./components/ChatRoomList";
import ChatRoom from "./components/ChatRoom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";
import { auth } from "./core/backend/firebase";
import ProfilePictureUpload from "./components/ProfilePictureUpload";
import userImage from './assets/user.jpg';
import { generateUserName, getProfileImage } from "./core/backend/services/firestore.service";


function App() {
  const [user, setUser] = useState<User | null>(null);
  const [imageProfile, setImageProfile] = useState<string>();

  useEffect(() => {
    // Listen to auth changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        const creds = await signInAnonymously(auth);
        user = creds.user;
      }

      if (user) {
        if (!user.displayName) {
          await generateUserName(user);
          await user.reload();
        }

        const imagePath = await getProfileImage();
        if (imagePath) {
          setImageProfile(imagePath);
        }

        setUser(user);
      }
    });

    return () => unsubscribe();
  });

  return (
    <Router>
      <header className="sticky top-0 py-2 px-3 flex justify-between items-center border-b bg-white">
        <div className="flex gap-2">
          {/* <button type="button" onClick={logout}>
            <svg width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.00195 7C9.01406 4.82497 9.11051 3.64706 9.87889 2.87868C10.7576 2 12.1718 2 15.0002 2L16.0002 2C18.8286 2 20.2429 2 21.1215 2.87868C22.0002 3.75736 22.0002 5.17157 22.0002 8L22.0002 16C22.0002 18.8284 22.0002 20.2426 21.1215 21.1213C20.2429 22 18.8286 22 16.0002 22H15.0002C12.1718 22 10.7576 22 9.87889 21.1213C9.11051 20.3529 9.01406 19.175 9.00195 17" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M15 12L2 12M2 12L5.5 9M2 12L5.5 15" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button> */}
          <h1 className="font-bold text-xl">Chat0</h1>
        </div>
        <div className="flex items-center gap-1">
          {user && (
            <span className="font-medium text-sm">{user.displayName}</span>
          )}
          {user && (
            <ProfilePictureUpload initialImage={imageProfile || userImage} />
          )}
        </div>
      </header>
      {user ? (
        <Routes>
          <Route path="/" element={<ChatRoomList />} />
          <Route path="/chat/:docId" element={<ChatRoom />} />

          {/* Catch-all route: Redirect to Home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        <div className="loader"></div>
      )}
    </Router>
  );
}

export default App;
