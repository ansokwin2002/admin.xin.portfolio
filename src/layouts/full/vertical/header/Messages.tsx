'use client';

import { Icon } from '@iconify/react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { Link, useNavigate } from 'react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { useContact } from 'src/context/contact-context';
import avatarDefault from 'src/assets/images/profile/user-2.jpg';

const Messages = () => {
  const { messages, todayCount } = useContact();
  const navigate = useNavigate();

  // Show only today's messages or last 5 messages
  const displayMessages = messages
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="relative group/menu px-4 sm:px-15 ">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="relative">
            <span className="relative after:absolute after:w-10 after:h-10 after:rounded-full hover:text-primary after:-top-1/2 hover:after:bg-lightprimary text-foreground dark:text-muted-foreground rounded-full flex justify-center items-center cursor-pointer group-hover/menu:after:bg-lightprimary group-hover/menu:!text-primary">
              <Icon icon="tabler:bell-ringing" height={20} />
            </span>
            {todayCount > 0 && (
              <span className="rounded-full absolute -end-[6px] -top-[5px] text-[10px] h-4 w-4 bg-primary text-white flex justify-center items-center font-bold">
                {todayCount}
              </span>
            )}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-screen sm:w-[350px] py-6 rounded-sm border border-ld"
        >
          <div className="flex items-center px-6 justify-between">
            <h3 className="mb-0 text-lg font-semibold text-ld">Notifications</h3>
            <Badge color={'primary'}>{todayCount} new today</Badge>
          </div>

          <SimpleBar className="max-h-80 mt-3">
            {displayMessages.length > 0 ? (
              displayMessages.map((msg, index) => (
                <DropdownMenuItem
                  className="px-6 py-3 flex justify-between items-center bg-hover group/link w-full cursor-pointer"
                  key={index}
                  onClick={() => navigate(`/admin/apps/contact?search=${encodeURIComponent(msg.email)}`)}
                >
                  <div className="flex items-center w-full">
                    <span className="shrink-0 relative">
                      <img
                        src={avatarDefault}
                        width={45}
                        height={45}
                        alt="user"
                        className="rounded-full"
                      />
                    </span>
                    <div className="ps-4 overflow-hidden w-full">
                      <h5 className="mb-1 text-sm font-semibold group-hover/link:text-primary truncate">
                        {msg.name}
                      </h5>
                      <span className="text-xs block truncate text-muted-foreground">
                        {msg.email}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(msg.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-muted-foreground text-sm">
                No notifications found
              </div>
            )}
          </SimpleBar>

          <div className="pt-5 px-6">
            <Button 
              variant={'outline'} 
              className="w-full"
              onClick={() => navigate('/admin/apps/contact')}
            >
              See All Inquiries
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Messages;
