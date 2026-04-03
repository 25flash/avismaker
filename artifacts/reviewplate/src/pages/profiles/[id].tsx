import { AuthLayout } from "@/components/layout/AuthLayout";
import { useGetBusinessProfile, useUpdateBusinessProfile, useDeleteBusinessProfile, getListBusinessProfilesQueryKey, getGetBusinessProfileQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, Save, Trash2, Globe, MapPin, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function ProfileEditorPage() {
  const params = useParams<{ id: string }>();
  const profileId = parseInt(params.id ?? "0");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading } = useGetBusinessProfile(profileId, {
    query: { enabled: !!profileId, queryKey: getGetBusinessProfileQueryKey(profileId) },
  });

  const updateMutation = useUpdateBusinessProfile();
  const deleteMutation = useDeleteBusinessProfile();

  const profileData = profile as unknown as {
    id: number; name: string; address: string | null; website: string | null;
    googleReviewUrl: string | null; description: string | null; logoUrl: string | null; createdAt: string;
  } | undefined;

  const [form, setForm] = useState({ name: "", address: "", website: "", googleReviewUrl: "", description: "" });

  useEffect(() => {
    if (profileData) {
      setForm({
        name: profileData.name,
        address: profileData.address ?? "",
        website: profileData.website ?? "",
        googleReviewUrl: profileData.googleReviewUrl ?? "",
        description: profileData.description ?? "",
      });
    }
  }, [profileData]);

  const handleSave = () => {
    updateMutation.mutate(
      { id: profileId, data: { name: form.name, address: form.address || null, website: form.website || null, googleReviewUrl: form.googleReviewUrl || null, description: form.description || null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetBusinessProfileQueryKey(profileId) });
          queryClient.invalidateQueries({ queryKey: getListBusinessProfilesQueryKey() });
          toast({ title: "Profile updated", description: "Business profile saved successfully." });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to update profile." });
        },
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(
      { id: profileId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBusinessProfilesQueryKey() });
          setLocation("/profiles");
          toast({ title: "Profile deleted" });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to delete profile." });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="space-y-6 max-w-2xl">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AuthLayout>
    );
  }

  if (!profileData) {
    return (
      <AuthLayout>
        <div className="text-center py-16">
          <p className="text-[#6B7280]">Profile not found</p>
          <Link href="/profiles"><Button className="mt-4" variant="outline">Back to profiles</Button></Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Link href="/profiles">
            <button className="p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#0D1117]">{profileData.name}</h1>
            <p className="text-sm text-[#6B7280]">Business Profile</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" data-testid="button-delete">
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this profile?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{profileData.name}" and all associated data. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  data-testid="button-confirm-delete"
                >
                  Delete Profile
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Card className="bg-white border border-border shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold text-[#0D1117]">Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-1.5">
              <Label>Business Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className="h-11"
                data-testid="input-name"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="123 Main St, London"
                className="h-11"
                data-testid="input-address"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Website</Label>
              <Input
                value={form.website}
                onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://example.com"
                className="h-11"
                data-testid="input-website"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Google Review URL</Label>
              <Input
                value={form.googleReviewUrl}
                onChange={(e) => setForm(f => ({ ...f, googleReviewUrl: e.target.value }))}
                placeholder="https://g.page/r/..."
                className="h-11"
                data-testid="input-google-url"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="A short description of your business..."
                data-testid="input-description"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button
                onClick={handleSave}
                disabled={!form.name.trim() || updateMutation.isPending}
                className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90"
                data-testid="button-save"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
