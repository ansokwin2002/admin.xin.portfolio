import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from 'src/components/ui/dialog';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Checkbox } from 'src/components/ui/checkbox';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useAuth } from 'src/context/auth-context';
import bannerImg from 'src/assets/images/backgrounds/welcome-bg2.png';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Logo Clients',
  },
];

interface LogoClient {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  ordering: number;
}

const LogoClientList = () => {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [clients, setClients] = useState<LogoClient[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<LogoClient | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    ordering: '',
    image: null as File | null,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/logo-clients`, {
        headers: {
          Accept: 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setClients(data.data);
      } else {
        toast.error('Failed to fetch clients');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleAdd = async () => {
    if (!formData.image || !formData.title) {
      toast.error('Image and Title are required');
      return;
    }

    setIsSubmitting(true);
    const postData = new FormData();
    postData.append('image', formData.image);
    postData.append('title', formData.title);
    if (formData.subtitle) postData.append('subtitle', formData.subtitle);
    if (formData.ordering) postData.append('ordering', formData.ordering);

    try {
      const response = await fetch(`${API_URL}/logo-clients`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: postData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Client added successfully');
        setIsAddDialogOpen(false);
        resetForm();
        fetchClients();
      } else {
        toast.error(data.message || 'Failed to add client');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (client: LogoClient) => {
    setCurrentClient(client);
    setFormData({
      title: client.title,
      subtitle: client.subtitle || '',
      ordering: client.ordering?.toString() || '0',
      image: null,
    });
    setPreviewImage(client.image);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!currentClient) return;

    setIsSubmitting(true);
    const updateData = new FormData();
    updateData.append('_method', 'PUT'); // Laravel requirement for multipart PUT
    updateData.append('title', formData.title);
    updateData.append('subtitle', formData.subtitle);
    updateData.append('ordering', formData.ordering);
    if (formData.image) {
      updateData.append('image', formData.image);
    }

    try {
      const response = await fetch(`${API_URL}/logo-clients/${currentClient.id}`, {
        method: 'POST', // Using POST with _method=PUT for file uploads
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: updateData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Client updated successfully');
        setIsEditDialogOpen(false);
        resetForm();
        fetchClients();
      } else {
        toast.error(data.message || 'Failed to update client');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this logo client. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${API_URL}/logo-clients/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          });

          const data = await response.json();
          if (data.success) {
            toast.success('Client deleted successfully');
            fetchClients();
          } else {
            toast.error('Failed to delete client');
          }
        } catch (error) {
          toast.error('Network error');
        }
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.info('Please select at least one client to delete.');
      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedIds.length} logo clients. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'No, cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsSubmitting(true);
        try {
          const response = await fetch(`${API_URL}/logo-clients/bulk-delete`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
            body: JSON.stringify({ ids: selectedIds }),
          });

          const data = await response.json();
          if (data.success) {
            toast.success(data.message || 'Clients deleted successfully');
            setSelectedIds([]);
            fetchClients();
          } else {
            toast.error(data.message || 'Failed to delete clients');
          }
        } catch (error) {
          toast.error('Network error');
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === clients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(clients.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', subtitle: '', ordering: '', image: null });
    setPreviewImage(null);
  };

  return (
    <>
      <BreadcrumbComp title="Logo Clients" items={BCrumb} image={bannerImg} />
      <CardBox>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h4 className="text-xl font-bold text-foreground">Client Logos</h4>
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2 text-white"
                onClick={handleBulkDelete}
              >
                <Icon icon="solar:trash-bin-trash-linear" width={16} className="text-white" />
                Delete Selected ({selectedIds.length})
              </Button>
            )}
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={(val) => { setIsAddDialogOpen(val); if(!val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Icon icon="solar:add-circle-linear" width={18} />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2 text-center">
                  <Label className="block mb-2">Logo Image</Label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => document.getElementById('add-image')?.click()}>
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="h-24 object-contain mb-2" />
                    ) : (
                      <Icon icon="solar:upload-linear" width={40} className="text-muted-foreground mb-2" />
                    )}
                    <span className="text-sm text-muted-foreground">Click to upload logo</span>
                  </div>
                  <input id="add-image" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Apple Inc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                  <Input id="subtitle" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} placeholder="e.g. Technology Partner" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ordering">Ordering Number</Label>
                  <Input id="ordering" type="number" value={formData.ordering} onChange={(e) => setFormData({ ...formData, ordering: e.target.value })} placeholder="e.g. 1" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Save Client'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto border border-border rounded-lg">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-12 py-4 px-4">
                  <Checkbox
                    checked={selectedIds.length === clients.length && clients.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-bold py-4 w-16 text-center">Order</TableHead>
                <TableHead className="font-bold py-4">Logo</TableHead>
                <TableHead className="font-bold py-4">Title</TableHead>
                <TableHead className="font-bold py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">Loading clients...</TableCell>
                </TableRow>
              ) : clients.length > 0 ? (
                clients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-4">
                      <Checkbox
                        checked={selectedIds.includes(client.id)}
                        onCheckedChange={() => toggleSelectOne(client.id)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-bold">
                        {client.ordering}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="w-16 h-16 bg-white rounded-md p-2 flex items-center justify-center border border-border">
                        <img src={client.image} alt={client.title} className="max-h-full max-w-full object-contain" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{client.title}</span>
                        {client.subtitle && <span className="text-xs text-muted-foreground">{client.subtitle}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(client)} className="h-8 w-8 text-primary hover:text-primary hover:bg-lightprimary">
                          <Icon icon="solar:pen-new-square-linear" width={18} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Icon icon="solar:trash-bin-trash-linear" width={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No clients found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardBox>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(val) => { setIsEditDialogOpen(val); if(!val) resetForm(); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2 text-center">
              <Label className="block mb-2">Logo Image</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => document.getElementById('edit-.image')?.click()}>
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="h-24 object-contain mb-2" />
                ) : (
                  <Icon icon="solar:upload-linear" width={40} className="text-muted-foreground mb-2" />
                )}
                <span className="text-sm text-muted-foreground">Click to change logo</span>
              </div>
              <input id="edit-image" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subtitle">Subtitle (Optional)</Label>
              <Input id="edit-subtitle" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ordering">Ordering Number</Label>
              <Input id="edit-ordering" type="number" value={formData.ordering} onChange={(e) => setFormData({ ...formData, ordering: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LogoClientList;
