import type { FC } from "react";

const Profile: FC = () => {
  return (
    <div className="p-8 max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold">User Profile</h2>
      <p>Name: John Doe</p>
      <p>Email: johndoe@example.com</p>
      <p>API Key: ************</p>
    </div>
  );
};

export default Profile;
