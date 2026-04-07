import { useState } from "react";
import { Mail, Briefcase, Lock, Save } from "lucide-react";
import { toast } from "sonner";
import { Header, ProfileSkeleton } from "@/components/shared";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label } from "@/atoms";
import { Avatar, AvatarFallback } from "@/ui";
import { useAuth, useDeferredLoad, usePageTitle } from "@/hooks";

export function ProfileView() {
    const { user, onUpdateUser } = useAuth();
    const isReady = useDeferredLoad(100);
    usePageTitle("الملف الشخصي");
    const [name, setName] = useState(user?.name ?? "");
    const [isSaving, setIsSaving] = useState(false);

    if (!isReady) return <ProfileSkeleton />;
    if (!user) return null;

    const hasChanges = name.trim() !== user.name;

    const handleSave = () => {
        if (!name.trim()) {
            toast.error("الاسم لا يمكن أن يكون فارغاً");
            return;
        }

        setIsSaving(true);

        // Generate new avatar from first letters
        const parts = name.trim().split(" ");
        const avatar = parts.length >= 2
            ? `${parts[0].charAt(0)}${parts[1].charAt(0)}`
            : name.trim().substring(0, 2);

        onUpdateUser({ name: name.trim(), avatar });

        setTimeout(() => {
            setIsSaving(false);
            toast.success("تم حفظ التغييرات بنجاح");
        }, 300);
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl">
            <Header
                title="الملف الشخصي"
                description="بيانات حسابك وإعدادات العرض"
            />

            {/* Avatar & Summary */}
            <Card>
                <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 mb-4">
                            <AvatarFallback className="text-2xl">
                                {user.avatar}
                            </AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold text-[var(--color-text-dark)]">
                            {user.name}
                        </h2>
                        <p className="text-[var(--color-text-muted)]">
                            {user.role}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Editable Account Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-[var(--color-primary)]" />
                        الحساب
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    {/* Display Name — Editable */}
                    <div className="space-y-2">
                        <Label htmlFor="displayName">اسم العرض</Label>
                        <Input
                            id="displayName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="أدخل اسم العرض"
                        />
                    </div>

                    {/* Email — Read only */}
                    <div className="space-y-2">
                        <Label>البريد الإلكتروني</Label>
                        <div className="flex items-center gap-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2.5">
                            <Mail className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                            <span className="text-sm text-[var(--color-text-muted)]" dir="ltr">
                                {user.email}
                            </span>
                        </div>
                    </div>

                    {/* Role — Read only */}
                    <div className="space-y-2">
                        <Label>الدور</Label>
                        <div className="flex items-center gap-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2.5">
                            <Briefcase className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                            <span className="text-sm text-[var(--color-text-muted)]">
                                {user.role}
                            </span>
                        </div>
                    </div>

                    {/* Save Button */}
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className="w-full gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
