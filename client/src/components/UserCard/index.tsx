import { User } from "@/state/api";
import Image from "next/image";
import React from "react";

type Props = {
  user: User;
};

const UserCard = ({ user }: Props) => {
  return (
    <div className="mb-3 rounded bg-white p-4 shadow dark:bg-dark-secondary dark:text-white flex items-center gap-2">
      {user.profilePictureUrl && (
        <Image
        src={user?.profilePictureUrl && user.profilePictureUrl.startsWith('http') 
          ? user.profilePictureUrl 
          : `/${user?.profilePictureUrl}`}
          alt="profile picture"
          width={32}
          height={32}
          className="rounded-full "
        />
      )}
      <div>
        <h3>{user.username}</h3>
        <p>{user.email}</p>
      </div>
    </div>
  );
};

export default UserCard;