import { useState, useEffect } from 'react';
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
}

const ContactList = () => {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<ContactMessage | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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
        console.log('API Response:', data);
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

  const confirmDelete = (id: number) => {
    setMessageToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (messageToDelete === null) return;

    try {
      const response = await fetch(`${API_URL}/contacts/${messageToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        setMessages(messages.filter((msg) => msg.id !== messageToDelete));
        toast.success('Message deleted successfully');
        setIsDeleteDialogOpen(false);
      } else {
        toast.error('Failed to delete message');
      }
    } catch (error) {
      toast.error('Network error');
    }
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

  return (
    <>
      <BreadcrumbComp title="Contact Messages" items={BCrumb} />
      <CardBox>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h4 className="text-xl font-bold text-foreground">Inquiries</h4>
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
                <TableHead className="font-bold py-4">Sender</TableHead>
                <TableHead className="font-bold py-4">Mobile</TableHead>
                <TableHead className="font-bold py-4">Budget</TableHead>
                <TableHead className="font-bold py-4 w-[300px]">Details</TableHead>
                <TableHead className="font-bold py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Loading messages...
                  </TableCell>
                </TableRow>
              ) : currentItems.length > 0 ? (
                currentItems.map((msg) => (
                  <TableRow key={msg.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{msg.name}</span>
                        <span className="text-xs text-muted-foreground">{msg.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{msg.phone}</TableCell>
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
                          onClick={() => handleEdit(msg)}
                          className="h-8 w-8 text-primary hover:text-primary hover:bg-lightprimary"
                        >
                          <Icon icon="solar:pen-new-square-linear" width={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(msg.id)}
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
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
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
                  rows={4}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Icon icon="solar:danger-triangle-linear" width={24} />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this contact message? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              No, Keep it
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Yes, Delete it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContactList;
