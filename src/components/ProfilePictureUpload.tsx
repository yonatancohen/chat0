import { useState } from "react";
import { auth, storage } from "../core/backend/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { uploadProfileImage } from "../core/backend/services/firestore.service";

const ProfilePictureUpload = ({ initialImage }: { initialImage: string }) => {
  const [profileImage, setProfileImage] = useState<string>(initialImage);

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    // Check file type and size
    if (file.size <= 1 * 1024 * 1024 && file.type.startsWith('image/')) {
      const imageRef = ref(storage, `profile_pictures/${auth.currentUser?.uid}.${file.name.split('.').at(-1)}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      await uploadProfileImage(url);

      setProfileImage(url);
    }
    else {
      alert('Please select an image under 1MB in size');
    }
  }

  return (
    <div className="relative">
      <img alt="" src={profileImage} className="w-10 h-10 rounded-full object-cover" />
      <label htmlFor="file-input" className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-lg cursor-pointer">
        <svg width="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.3601 4.07866L15.2869 3.15178C16.8226 1.61607 19.3125 1.61607 20.8482 3.15178C22.3839 4.68748 22.3839 7.17735 20.8482 8.71306L19.9213 9.63993M14.3601 4.07866C14.3601 4.07866 14.4759 6.04828 16.2138 7.78618C17.9517 9.52407 19.9213 9.63993 19.9213 9.63993M14.3601 4.07866L5.83882 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021M19.9213 9.63993L11.4001 18.1612C10.8229 18.7383 10.5344 19.0269 10.2162 19.2751C9.84082 19.5679 9.43469 19.8189 9.00498 20.0237C8.6407 20.1973 8.25352 20.3263 7.47918 20.5844L4.19792 21.6782M4.19792 21.6782L3.39584 21.9456C3.01478 22.0726 2.59466 21.9734 2.31063 21.6894C2.0266 21.4053 1.92743 20.9852 2.05445 20.6042L2.32181 19.8021M4.19792 21.6782L2.32181 19.8021" stroke="#1C274C" strokeWidth="1.5" />
        </svg>
      </label>

      <input id="file-input" type="file" hidden accept="image/*" onChange={uploadImage} />
    </div>
  );
};

export default ProfilePictureUpload;
