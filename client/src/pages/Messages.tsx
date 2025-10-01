import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Search, Send, Phone, Video, Info, Smile, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { useSelector } from 'react-redux';

interface User {
  id: string;
  username: string;
  email: string;
  isOnline: boolean;
  lastSeen?: string;
  isAnonymous: boolean;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
}

interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}

export const Messages: React.FC = () => {
  const { token, user } = useSelector((state: any) => state.auth);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log(loading);

  // Mock data
  const mockUsers: User[] = [
    {
      id: '1',
      username: 'john_dev',
      email: 'john@example.com',
      isOnline: true,
      isAnonymous: false
    },
    {
      id: '2',
      username: 'sarah_codes',
      email: 'sarah@example.com',
      isOnline: false,
      lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isAnonymous: false
    },
    {
      id: '3',
      username: 'mike_dev',
      email: 'mike@example.com',
      isOnline: true,
      isAnonymous: false
    }
  ];

  const mockMessages: Message[] = [
    {
      id: '1',
      senderId: '1',
      receiverId: user?.id || 'current-user',
      content: 'Hey! Did you see the latest React update?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isRead: true,
      type: 'text'
    },
    {
      id: '2',
      senderId: user?.id || 'current-user',
      receiverId: '1',
      content: 'Yes! The new concurrent features look amazing. Have you tried them yet?',
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      isRead: true,
      type: 'text'
    },
    {
      id: '3',
      senderId: '1',
      receiverId: user?.id || 'current-user',
      content: 'Not yet, but I\'m planning to migrate one of my projects this weekend. Want to pair program?',
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      isRead: false,
      type: 'text'
    }
  ];

  const mockConversations: Conversation[] = [
    {
      id: '1',
      participants: [mockUsers[0]],
      lastMessage: mockMessages[2],
      unreadCount: 1,
      updatedAt: mockMessages[2].timestamp
    },
    {
      id: '2',
      participants: [mockUsers[1]],
      lastMessage: {
        id: '4',
        senderId: '2',
        receiverId: user?.id || 'current-user',
        content: 'Thanks for the code review! 🙏',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        isRead: true,
        type: 'text'
      },
      unreadCount: 0,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      id: '3',
      participants: [mockUsers[2]],
      lastMessage: {
        id: '5',
        senderId: user?.id || 'current-user',
        receiverId: '3',
        content: 'See you at the meetup tomorrow!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        isRead: true,
        type: 'text'
      },
      unreadCount: 0,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    }
  ];

  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setConversations(mockConversations);
      setLoading(false);
    }, 500);
  };

  const fetchMessages = async (conversationId: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (conversationId === '1') {
        setMessages(mockMessages);
      } else {
        setMessages([]);
      }
      setLoading(false);
    }, 300);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || 'current-user',
      receiverId: selectedConversation,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update conversation last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation
          ? { ...conv, lastMessage: message, updatedAt: message.timestamp }
          : conv
      )
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== user?.id) || conversation.participants[0];
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = getOtherParticipant(conv);
    return otherParticipant.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConv = conversations.find(conv => conv.id === selectedConversation);
  const otherParticipant = selectedConv ? getOtherParticipant(selectedConv) : null;

  if (!token) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
        <Card>
          <CardContent className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">Please sign in</h3>
            <p className="text-sm text-muted-foreground">
              You need to be signed in to access your messages
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Messages
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                <div className="space-y-1 p-3">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => {
                      const participant = getOtherParticipant(conversation);
                      return (
                        <div
                          key={conversation.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedConversation === conversation.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedConversation(conversation.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {participant.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {participant.isOnline && (
                                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm truncate">
                                  {participant.isAnonymous ? 'Anonymous User' : participant.username}
                                </p>
                                <div className="flex items-center gap-2">
                                  {conversation.unreadCount > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      {conversation.unreadCount}
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {conversation.lastMessage.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No conversations found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {selectedConversation && otherParticipant ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {otherParticipant.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {otherParticipant.isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {otherParticipant.isAnonymous ? 'Anonymous User' : otherParticipant.username}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {otherParticipant.isOnline 
                            ? 'Online' 
                            : otherParticipant.lastSeen 
                              ? `Last seen ${formatDistanceToNow(new Date(otherParticipant.lastSeen), { addSuffix: true })}`
                              : 'Offline'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Separator />
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      {messages.map((message) => {
                        const isOwnMessage = message.senderId === (user?.id || 'current-user');
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-3 py-2 ${
                                isOwnMessage
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
                              }`}>
                                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                    </div>
                    <Button variant="ghost" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Select a conversation</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};