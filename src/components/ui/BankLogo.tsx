import { useState } from "react";
import { Landmark } from "lucide-react";
import { INDIAN_BANKS } from "../../constants/banks";

type Props = {
  name: string;
  url?: string;
  className?: string;
};

export default function BankLogo({ name, url, className }: Props) {
  const [error, setError] = useState(false);

  const bank = INDIAN_BANKS.find((b) => b.name === name);
  const logo = url || bank?.logo;

  if (!logo || error) {
    return (
      <div
        className={`bg-muted rounded-lg flex items-center justify-center ${className}`}
      >
        <Landmark className="w-4 h-4" />
      </div>
    );
  }

  return (
    <img
      src={logo}
      alt={name}
      className={`rounded-lg object-contain bg-white p-1 ${className}`}
      onError={() => setError(true)}
    />
  );
}
