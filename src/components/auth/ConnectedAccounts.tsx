"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/constants";
import { useIdentitiesStore } from "@/stores/identities.store";
import { Button, ErrorMessage, Modal } from "@/components/ui";
import { env } from "@/config/env";
import { useAuth } from "@/hooks";
import type { IdentityProvider } from "@/services/identity.service";
import { identityErrorMessage } from "@/utils/identityError";
export function ConnectedAccounts() {
  const { data, loading, error, load, link, unlink } = useIdentitiesStore();
  const { updateUser } = useAuth();
  const callbackError = useSearchParams().get("error");
  const callbackMessage = identityErrorMessage(callbackError);
  const linked = useSearchParams().get("result") === "ACCOUNT_LINK_SUCCESS";
  const [removing, setRemoving] = useState<IdentityProvider | null>(null);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <section id="connections" className="space-y-4">
      <h2 className="text-base font-semibold">Tài khoản kết nối</h2>
      {callbackMessage && <ErrorMessage message={callbackMessage} />}
      {callbackMessage && (
        <Link href={ROUTES.login} className="text-sm underline">
          Quay lại trang đăng nhập
        </Link>
      )}
      {linked && (
        <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">
          Đã liên kết tài khoản thành công.
        </p>
      )}
      {error && <ErrorMessage message={error} onRetry={load} />}
      <div className="divide-y rounded-lg border">
        {(["GOOGLE", "GITHUB"] as const).map((provider) => {
          const identity = data.find((i) => i.provider === provider);
          return (
            <div key={provider} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{provider === "GOOGLE" ? "Google" : "GitHub"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {identity?.email ?? identity?.login ?? "Chưa liên kết"}
                </p>
              </div>
              {identity ? (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={loading || data.length <= 1}
                  onClick={() => setRemoving(provider)}
                >
                  Ngắt kết nối
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={loading}
                  onClick={async () => {
                    try {
                      window.location.assign(new URL(await link(provider), env.apiUrl).href);
                    } catch {
                      /* store displays error */
                    }
                  }}
                >
                  Liên kết
                </Button>
              )}
            </div>
          );
        })}
      </div>
      <Modal
        open={!!removing}
        title="Ngắt kết nối tài khoản?"
        onClose={() => {
          if (!loading) setRemoving(null);
        }}
      >
        <p className="text-sm text-muted-foreground">
          Ngắt GitHub sẽ tạm dừng các thao tác đồng bộ cần tài khoản này. Dữ liệu Project được giữ
          lại.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" disabled={loading} onClick={() => setRemoving(null)}>
            Hủy
          </Button>
          <Button
            loading={loading}
            onClick={async () => {
              if (!removing) return;
              try {
                updateUser(await unlink(removing));
                setRemoving(null);
              } catch {
                /* store displays error */
              }
            }}
          >
            Ngắt kết nối
          </Button>
        </div>
      </Modal>
    </section>
  );
}
