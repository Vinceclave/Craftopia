// apps/web/src/components/sponsors/SponsorsTab.tsx - FIXED
import { useState, useMemo, useRef } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2,
  Plus,
  Loader2,
  Save,
  X,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Trash2,
  Mail,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { useSponsors } from '@/hooks/useSponsors';
import { useToast } from '@/hooks/useToast';
import { uploadImageToS3, validateImageFile, createImagePreview } from '@/lib/upload';
import type { Sponsor } from '@/lib/api';
import {
  DataTable,
  ConfirmDialog,
  ActionButtons,
  ActionButton,
  FilterOption,
} from '@/components/shared';

export function SponsorsTab() {
  const { success, error: showError } = useToast();
  const {
    sponsors,
    createSponsor,
    updateSponsor,
    deleteSponsor,
    toggleStatus,
    isCreating,
    isUpdating,
    isDeleting,
  } = useSponsors();

  // State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Image Upload State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contact_email: '',
    logo_url: '',
  });

  // Reset Form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      contact_email: '',
      logo_url: '',
    });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Image Upload Handlers
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      showError(validation.error || 'Invalid file');
      return;
    }

    try {
      setIsUploadingImage(true);
      const preview = await createImagePreview(file);
      setImagePreview(preview);
      const imageUrl = await uploadImageToS3(file);
      setFormData((prev) => ({ ...prev, logo_url: imageUrl }));
      success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('❌ Image upload error:', error);
      showError(error?.message || 'Failed to upload image');
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, logo_url: '' }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Filters
  const filters: FilterOption[] = [
    {
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
  ];

  // Filtered Data
  const filteredData = useMemo(() => {
    return sponsors.filter((sponsor) => {
      const matchesSearch =
        !globalFilter ||
        sponsor.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        sponsor.description?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        sponsor.contact_email?.toLowerCase().includes(globalFilter.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && sponsor.is_active) ||
        (statusFilter === 'inactive' && !sponsor.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [sponsors, globalFilter, statusFilter]);

  // Columns
  const columns = useMemo<ColumnDef<Sponsor>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Sponsor',
        cell: ({ row }) => {
          const sponsor = row.original;
          return (
            <div className="flex items-center gap-3">
              {sponsor.logo_url ? (
                <img
                  src={sponsor.logo_url}
                  alt={sponsor.name}
                  className="w-10 h-10 rounded-lg object-cover border border-[#6CAC73]/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-[#2B4A2F] font-poppins text-sm">
                  {sponsor.name}
                </p>
                {sponsor.contact_email && (
                  <div className="text-xs text-gray-600 font-nunito flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {sponsor.contact_email}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <p className="text-sm text-gray-600 font-nunito line-clamp-2">
            {row.original.description || 'No description'}
          </p>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.original.is_active;
          return (
            <Badge
              className={`font-poppins border-0 ${
                isActive
                  ? 'bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F]'
                  : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700'
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const sponsor = row.original;
          const actions: ActionButton[] = [
            {
              icon: sponsor.is_active ? (
                <ToggleRight className="w-4 h-4" />
              ) : (
                <ToggleLeft className="w-4 h-4" />
              ),
              label: sponsor.is_active ? 'Deactivate' : 'Activate',
              onClick: () => handleToggleStatus(sponsor),
              variant: 'success',
            },
            {
              icon: <Edit2 className="w-4 h-4" />,
              label: 'Edit',
              onClick: () => handleOpenEdit(sponsor),
              variant: 'default',
            },
            {
              icon: <Trash2 className="w-4 h-4" />,
              label: 'Delete',
              onClick: () => handleOpenDelete(sponsor),
              variant: 'danger',
            },
          ];

          return <ActionButtons actions={actions} />;
        },
      },
    ],
    []
  );

  // Handlers
  const handleOpenEdit = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setFormData({
      name: sponsor.name,
      description: sponsor.description || '',
      contact_email: sponsor.contact_email || '',
      logo_url: sponsor.logo_url || '',
    });
    setImagePreview(sponsor.logo_url || null);
    setEditDialogOpen(true);
  };

  const handleOpenDelete = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = async (sponsor: Sponsor) => {
    try {
      await toggleStatus(sponsor.sponsor_id);
    } catch (err: any) {
      showError(err.message || 'Failed to toggle status');
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showError('Please fill in the sponsor name');
      return;
    }

    try {
      await createSponsor({
        name: formData.name,
        description: formData.description,
        contact_email: formData.contact_email,
        logo_url: formData.logo_url,
      });
      setCreateDialogOpen(false);
      resetForm();
    } catch (err: any) {
      showError(err.message || 'Failed to create sponsor');
    }
  };

  const handleUpdate = async () => {
    if (!selectedSponsor || !formData.name.trim()) {
      showError('Please fill in the sponsor name');
      return;
    }

    try {
      await updateSponsor({
        sponsorId: selectedSponsor.sponsor_id,
        data: {
          name: formData.name,
          description: formData.description,
          contact_email: formData.contact_email,
          logo_url: formData.logo_url,
        },
      });
      setEditDialogOpen(false);
      setSelectedSponsor(null);
      resetForm();
    } catch (err: any) {
      showError(err.message || 'Failed to update sponsor');
    }
  };

  const handleDelete = async () => {
    if (!selectedSponsor) return;
    try {
      await deleteSponsor(selectedSponsor.sponsor_id);
      setDeleteDialogOpen(false);
      setSelectedSponsor(null);
    } catch (err: any) {
      showError(err.message || 'Failed to delete sponsor');
    }
  };

  return (
    <>
      <DataTable
        data={filteredData}
        columns={columns}
        searchPlaceholder="Search sponsors..."
        onSearchChange={setGlobalFilter}
        filters={filters}
        title="Manage Sponsors"
          showPagination={true}
   defaultPageSize={10}
   pageSizeOptions={[5, 10, 20, 50]}
        action={
          sponsors.length > 0 ? (
            <Button
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-br from-purple-600 to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Sponsor
            </Button>
          ) : undefined
        }
        emptyState={{
          icon: <Building2 className="w-16 h-16 text-gray-400" />,
          title: 'No sponsors yet',
          description: 'Add your first sponsor to get started',
          action: (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-br from-purple-600 to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Sponsor
            </Button>
          ),
        }}
      />

      {/* Create/Edit Dialog */}
      <Dialog
        open={createDialogOpen || editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
            setSelectedSponsor(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-[#2B4A2F] font-poppins">
              {editDialogOpen ? 'Edit Sponsor' : 'Add New Sponsor'}
            </DialogTitle>
            <DialogDescription className="font-nunito">
              {editDialogOpen ? 'Update sponsor details' : 'Create a new sponsor organization'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label className="text-[#2B4A2F] font-poppins">
                Sponsor Logo
              </Label>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {imagePreview || formData.logo_url ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-[#6CAC73]/20">
                      <img
                        src={imagePreview || formData.logo_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={handleRemoveImage}
                        disabled={isUploadingImage}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 hover:bg-rose-700 disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center border-2 border-dashed border-purple-300">
                      <ImageIcon className="w-8 h-8 text-purple-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="w-full border-[#6CAC73]/20 bg-white/80 hover:bg-purple-50 text-purple-600"
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading to S3...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {imagePreview || formData.logo_url ? 'Change Logo' : 'Upload Logo'}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#2B4A2F] font-poppins">
                Sponsor Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Acme Corporation"
                className="border-[#6CAC73]/20"
                disabled={isUploadingImage}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#2B4A2F] font-poppins">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the sponsor..."
                rows={3}
                className="border-[#6CAC73]/20"
                disabled={isUploadingImage}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email" className="text-[#2B4A2F] font-poppins">
                Contact Email
              </Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="contact@example.com"
                className="border-[#6CAC73]/20"
                disabled={isUploadingImage}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => {
                setCreateDialogOpen(false);
                setEditDialogOpen(false);
                resetForm();
              }}
              disabled={isCreating || isUpdating || isUploadingImage}
              className="border-[#6CAC73]/20 bg-white/80"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={editDialogOpen ? handleUpdate : handleCreate}
              disabled={isCreating || isUpdating || isUploadingImage}
              className="bg-gradient-to-br from-purple-600 to-purple-700 text-white"
            >
              {isCreating || isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editDialogOpen ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editDialogOpen ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      {selectedSponsor && (
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          title="Delete Sponsor?"
          description="This action cannot be undone. All associated rewards will also be deleted."
          confirmText="Delete"
          loading={isDeleting}
          variant="danger"
          icon={<Trash2 className="w-5 h-5" />}
          alertMessage={
            <>
              You are about to delete: <span className="font-bold">"{selectedSponsor.name}"</span>
            </>
          }
        />
      )}
    </>
  );
}