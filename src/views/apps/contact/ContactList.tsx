import React, { useState } from 'react';
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
  mobile: string;
  budget: string;
  details: string;
}

const ContactList = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      mobile: '+1 234 567 890',
      budget: '$5,000 - $10,000',
      details: 'Looking for a new portfolio website with modern animations.',
    },
    {
      id: 2,
      name: 'Alice Smith',
      email: 'alice@design.com',
      mobile: '+44 7700 900077',
      budget: '$10,000+',
      details: 'E-commerce platform integration with Stripe and custom dashboard.',
    },
    {
      id: 3,
      name: 'Robert Brown',
      email: 'robert@tech.io',
      mobile: '+61 412 345 678',
      budget: '$2,000 - $5,000',
      details: 'Simple landing page for a startup launch.',
    },
  ]);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<ContactMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredMessages = messages.filter(
    (msg) =>
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMessages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this message?')) {
      setMessages(messages.filter((msg) => msg.id !== id));
      toast.success('Message deleted successfully');
    }
  };

  const handleEdit = (msg: ContactMessage) => {
    setCurrentMessage(msg);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (currentMessage) {
      setMessages(messages.map((m) => (m.id === currentMessage.id ? currentMessage : m)));
      setIsEditDialogOpen(false);
      toast.success('Message updated successfully');
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
              {currentItems.length > 0 ? (
                currentItems.map((msg) => (
                  <TableRow key={msg.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{msg.name}</span>
                        <span className="text-xs text-muted-foreground">{msg.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{msg.mobile}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lightprimary text-primary">
                        {msg.budget}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="text-sm text-muted-foreground truncate" title={msg.details}>
                        {msg.details}
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
                    value={currentMessage.mobile}
                    onChange={(e) =>
                      setCurrentMessage({ ...currentMessage, mobile: e.target.value })
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
                  value={currentMessage.details}
                  onChange={(e) =>
                    setCurrentMessage({ ...currentMessage, details: e.target.value })
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
