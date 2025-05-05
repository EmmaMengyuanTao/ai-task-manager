"use client"

import { useState } from "react";
import { Switch } from "@/components/ui/switch"
import { toggleUserActive } from "@/actions/userAction";
import { toast } from "sonner";

interface UserToggleSwitchProps {
  userId: string;
  isActive: boolean;
}

export function UserToggleSwitch ({ userId, isActive }: UserToggleSwitchProps) {
  const [active, setActive] = useState(isActive);

  const handleToggle = () => {
    const formData = new FormData();
    formData.append("id", userId);

    toggleUserActive(formData).then((res) => {
      if (res.error) {
        toast.error(res.error);
      } else {
        setActive(!active);
        toast.success("Toggle User Active Successfully!")
      }
    });
  };

  return (
    <Switch
      checked={active}
      onCheckedChange={handleToggle}
    />
  );
};
