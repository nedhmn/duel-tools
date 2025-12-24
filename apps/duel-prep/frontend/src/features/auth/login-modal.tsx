import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useAuthStore } from "./store";

type LoginModalProps = {
  open: boolean;
};

export const LoginModal = ({ open }: LoginModalProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setStoredPassword = useAuthStore((s) => s.setPassword);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/v1/auth/verify", {
        headers: { "X-Auth-Password": password },
      });

      if (response.ok) {
        setStoredPassword(password);
        await queryClient.invalidateQueries();
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Enter the password to access Duel Tools.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <InputGroup>
            <InputGroupInput
              autoFocus
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                size="icon-xs"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <Button disabled={loading || !password} type="submit">
            {loading ? "Verifying..." : "Login"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
