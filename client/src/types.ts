// Base types
export type ObjectId = string;

// User related types
export interface User {
  _id: ObjectId;
  email: string;
  password?: string; // Optional for client-side, never sent from server
  googleId?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  _id: ObjectId;
  email: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

// Post related types
export interface Post {
  _id: ObjectId;
  user: ObjectId | User;
  title: string;
  content: string;
  imageUrl?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  // Virtual fields that might be populated
  comments?: Comment[];
  votes?: Vote[];
  upvotes?: number;
  downvotes?: number;
  userVote?: 'upvote' | 'downvote' | null;
}

export interface CreatePostData {
  title: string;
  content: string;
  imageUrl?: string;
  isAnonymous?: boolean;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  imageUrl?: string;
  isAnonymous?: boolean;
}

// Comment related types
export interface Comment {
  _id: ObjectId;
  user: ObjectId | User;
  post: ObjectId | Post;
  content: string;
  parentComment?: ObjectId | Comment | null;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  replies?: Comment[];
  votes?: Vote[];
  upvotes?: number;
  downvotes?: number;
  userVote?: 'upvote' | 'downvote' | null;
}

export interface CreateCommentData {
  post: ObjectId;
  content: string;
  parentComment?: ObjectId;
  isAnonymous?: boolean;
}

export interface UpdateCommentData {
  content?: string;
  isAnonymous?: boolean;
}

// Vote related types
export type VoteType = 'upvote' | 'downvote';

export interface Vote {
  _id: ObjectId;
  user: ObjectId | User;
  post?: ObjectId | Post;
  comment?: ObjectId | Comment;
  voteType: VoteType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVoteData {
  post?: ObjectId;
  comment?: ObjectId;
  voteType: VoteType;
}

// Authentication types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
  message: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Component prop types
export interface CTAButtonProps {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Search and Filter types
export interface SearchFilters {
  query?: string;
  sortBy?: 'newest' | 'oldest' | 'mostUpvoted' | 'mostCommented';
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  isAnonymous?: boolean;
}

export interface PostFilters extends SearchFilters {
  userId?: ObjectId;
}

export interface CommentFilters extends SearchFilters {
  postId?: ObjectId;
  parentCommentId?: ObjectId;
}

// Form state types
export interface FormState {
  isLoading: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Theme types
export type Theme = 'light' | 'dark';

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Utility types
export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any> {
  data: T | null;
  status: Status;
  error: string | null;
}

export interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  otp?: string;
}

