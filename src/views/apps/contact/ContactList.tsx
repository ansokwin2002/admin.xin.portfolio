import { useState, useEffect } from 'react';
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
} from 'src/components/ui/dialog';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Textarea } from 'src/components/ui/textarea';
import { Checkbox } from 'src/components/ui/checkbox';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useAuth } from 'src/context/auth-context';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Contact Messages',
  },
];

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string; 
  budget: string;
  message: string;
  created_at: string;
}

const ContactList = () => {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<ContactMessage | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/contacts`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        // Handle both direct array and { data: [] } formats
        const contactData = Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : []);
        setMessages(contactData);
      } else {
        toast.error('Failed to fetch contacts');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [token]);

  const filteredMessages = messages.filter(
    (msg) =>
      msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMessages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this message. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${API_URL}/contacts/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          });

          if (response.ok) {
            setMessages(messages.filter((msg) => msg.id !== id));
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
            toast.success('Message deleted successfully');
          } else {
            toast.error('Failed to delete message');
          }
        } catch (error) {
          toast.error('Network error');
        }
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.info('Please select at least one message to delete.');
      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedIds.length} messages. This action cannot be undone!`,
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
          const response = await fetch(`${API_URL}/contacts/bulk-delete`, {
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
            toast.success(data.message || 'Messages deleted successfully');
            setMessages(messages.filter(msg => !selectedIds.includes(msg.id)));
            setSelectedIds([]);
          } else {
            toast.error(data.message || 'Failed to delete messages');
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
    if (selectedIds.length === currentItems.length && currentItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentItems.map((msg) => msg.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleView = (msg: ContactMessage) => {
    setCurrentMessage(msg);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (msg: ContactMessage) => {
    setCurrentMessage(msg);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!currentMessage) return;

    try {
      const response = await fetch(`${API_URL}/contacts/${currentMessage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(currentMessage),
      });

      if (response.ok) {
        setMessages(messages.map((m) => (m.id === currentMessage.id ? currentMessage : m)));
        setIsEditDialogOpen(false);
        toast.success('Message updated successfully');
      } else {
        toast.error('Failed to update message');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const getCountryFlag = (phone: string) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/[\s\(\)-]/g, '');
    
    // Common mappings
    if (cleanPhone.startsWith('+86')) return 'cn';
    if (cleanPhone.startsWith('+966')) return 'sa';
    if (cleanPhone.startsWith('+1')) return 'us';
    if (cleanPhone.startsWith('+44')) return 'gb';
    if (cleanPhone.startsWith('+33')) return 'fr';
    if (cleanPhone.startsWith('+66')) return 'th';
    if (cleanPhone.startsWith('+84')) return 'vn';
    if (cleanPhone.startsWith('+81')) return 'jp';
    if (cleanPhone.startsWith('+82')) return 'kr';
    if (cleanPhone.startsWith('+65')) return 'sg';
    if (cleanPhone.startsWith('+60')) return 'my';
    if (cleanPhone.startsWith('+62')) return 'id';
    if (cleanPhone.startsWith('+91')) return 'in';
    if (cleanPhone.startsWith('+971')) return 'ae';
    if (cleanPhone.startsWith('+852')) return 'hk';
    if (cleanPhone.startsWith('+853')) return 'mo';
    if (cleanPhone.startsWith('+886')) return 'tw';
    if (cleanPhone.startsWith('+974')) return 'qa';
    if (cleanPhone.startsWith('+973')) return 'bh';
    if (cleanPhone.startsWith('+965')) return 'kw';
    if (cleanPhone.startsWith('+968')) return 'om';
    if (cleanPhone.startsWith('+962')) return 'jo';
    
    return null;
  };

  const FlagIcon = ({ phone }: { phone: string }) => {
    const countryCode = getCountryFlag(phone);
    if (!countryCode) return null;
    return (
      <img
        src={`https://flagcdn.com/w20/${countryCode}.png`}
        alt={countryCode}
        className="inline-block mr-2 w-4 h-3 object-cover rounded-sm shadow-xs mb-0.5"
      />
    );
  };

  return (
    <>
      <BreadcrumbComp title="Contact Messages" items={BCrumb} />
      <CardBox>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h4 className="text-xl font-bold text-foreground">Inquiries</h4>
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2 text-white"
                onClick={handleBulkDelete}
                disabled={isSubmitting}
              >
                <Icon icon="solar:trash-bin-trash-linear" width={16} className="text-white" />
                {isSubmitting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
              </Button>
            )}
          </div>
          <div className="relative w-full md:w-72">
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Icon
              icon="solar:magnifer-linear"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              width={18}
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-border rounded-lg">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-12 py-4 px-4">
                  <Checkbox
                    checked={selectedIds.length === currentItems.length && currentItems.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-bold py-4">Sender</TableHead>
                <TableHead className="font-bold py-4 text-center">Date</TableHead>
                <TableHead className="font-bold py-4">Mobile</TableHead>
                <TableHead className="font-bold py-4">Budget</TableHead>
                <TableHead className="font-bold py-4 w-[300px]">Details</TableHead>
                <TableHead className="font-bold py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Loading messages...
                  </TableCell>
                </TableRow>
              ) : currentItems.length > 0 ? (
                currentItems.map((msg) => (
                  <TableRow key={msg.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-4">
                      <Checkbox
                        checked={selectedIds.includes(msg.id)}
                        onCheckedChange={() => toggleSelectOne(msg.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{msg.name}</span>
                        <span className="text-xs text-muted-foreground">{msg.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-center whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">
                          {new Date(msg.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(msg.created_at).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center">
                        <FlagIcon phone={msg.phone} />
                        {msg.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lightprimary text-primary">
                        {msg.budget}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="text-sm text-muted-foreground truncate" title={msg.message}>
                        {msg.message}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(msg)}
                          className="h-8 w-8 text-info hover:text-info hover:bg-info/10"
                        >
                          <Icon icon="solar:eye-linear" width={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(msg)}
                          className="h-8 w-8 text-primary hover:text-primary hover:bg-lightprimary"
                        >
                          <Icon icon="solar:pen-new-square-linear" width={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(msg.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Icon icon="solar:trash-bin-trash-linear" width={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No messages found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-2">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredMessages.length)}
              </span>{' '}
              of <span className="font-medium">{filteredMessages.length}</span> results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardBox>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon icon="solar:info-circle-linear" width={24} className="text-primary" />
              Inquiry Details
            </DialogTitle>
          </DialogHeader>
          {currentMessage && (
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</span>
                  <p className="text-sm font-medium text-foreground">{currentMessage.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</span>
                  <p className="text-sm font-medium text-foreground">{currentMessage.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mobile</span>
                  <div className="flex items-center text-sm font-medium text-foreground">
                    <FlagIcon phone={currentMessage.phone} />
                    {currentMessage.phone}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sent On</span>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(currentMessage.created_at).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Budget</span>
                  <p className="text-sm font-medium text-foreground">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-lightprimary text-primary">
                      {currentMessage.budget}
                    </span>
                  </p>
                </div>
              </div>
              <div className="space-y-2 border-t pt-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Message</span>
                <div className="bg-muted/30 p-4 rounded-lg border border-border max-h-[300px] overflow-y-auto w-full overflow-x-hidden">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed break-all w-full">
                    {currentMessage.message}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Inquiry</DialogTitle>
          </DialogHeader>
          {currentMessage && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={currentMessage.name}
                    onChange={(e) => setCurrentMessage({ ...currentMessage, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    value={currentMessage.email}
                    onChange={(e) => setCurrentMessage({ ...currentMessage, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-mobile">Mobile</Label>
                  <Input
                    id="edit-mobile"
                    value={currentMessage.phone}
                    onChange={(e) =>
                      setCurrentMessage({ ...currentMessage, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-budget">Budget</Label>
                  <Input
                    id="edit-budget"
                    value={currentMessage.budget}
                    onChange={(e) =>
                      setCurrentMessage({ ...currentMessage, budget: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-details">Project Details</Label>
                <Textarea
                  id="edit-details"
                  rows={6}
                  className="resize-none overflow-y-auto"
                  value={currentMessage.message}
                  onChange={(e) =>
                    setCurrentMessage({ ...currentMessage, message: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContactList;
