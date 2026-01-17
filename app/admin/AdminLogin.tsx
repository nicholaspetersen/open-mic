"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card } from "@/components/ui";

export function AdminLogin() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passcode) {
      setError("Please enter the passcode");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passcode }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Invalid passcode");
        }

        router.push("/admin/events");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          placeholder="Enter passcode"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          autoFocus
          autoComplete="current-password"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" className="w-full" loading={isPending}>
          Enter Dashboard
        </Button>
      </form>
    </Card>
  );
}
