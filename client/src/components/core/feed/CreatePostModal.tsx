import React, { useState, useRef } from 'react';
import { X, Image, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSelector, useDispatch } from 'react-redux';
import { createPost } from '@/services/operations/postAPI';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  content: string;
  isAnonymous: boolean;
}

interface FormState {
  isLoading: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: any) => state.auth);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    isAnonymous: false,
  });
  
  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
    errors: {},
    touched: {},
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === 'isAnonymous' ? (e.target as HTMLInputElement).checked : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (formState.errors[field]) {
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: '' },
      }));
    }

    // Mark field as touched
    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: true },
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormState(prev => ({
          ...prev,
          errors: { ...prev.errors, image: 'Please select a valid image file' },
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setFormState(prev => ({
          ...prev,
          errors: { ...prev.errors, image: 'Image size must be less than 5MB' },
        }));
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Clear any previous image errors
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, image: '' },
      }));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters long';
    } else if (formData.title.trim().length > 200) {
      errors.title = 'Title must be less than 200 characters';
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    } else if (formData.content.trim().length < 10) {
      errors.content = 'Content must be at least 10 characters long';
    } else if (formData.content.trim().length > 2000) {
      errors.content = 'Content must be less than 2000 characters';
    }

    setFormState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormState(prev => ({ ...prev, isLoading: true }));

    try {
      await dispatch(createPost(
        formData.title.trim(),
        formData.content.trim(),
        selectedImage || undefined,
        formData.isAnonymous
      ) as any);

      // Reset form
      setFormData({
        title: '',
        content: '',
        isAnonymous: false,
      });
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      setFormState(prev => ({
        ...prev,
        errors: { general: 'Failed to create post. Please try again.' },
      }));
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleClose = () => {
    if (!formState.isLoading) {
      // Reset form when closing
      setFormData({
        title: '',
        content: '',
        isAnonymous: false,
      });
      setSelectedImage(null);
      setImagePreview(null);
      setFormState({
        isLoading: false,
        errors: {},
        touched: {},
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };

  if (!token) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleInputChange('title')}
              placeholder="Enter a compelling title..."
              disabled={formState.isLoading}
              className={formState.errors.title ? 'border-destructive' : ''}
            />
            {formState.errors.title && (
              <p className="text-sm text-destructive">{formState.errors.title}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Content Field */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={handleInputChange('content')}
              placeholder="Share your thoughts, ideas, or experiences..."
              rows={6}
              disabled={formState.isLoading}
              className={formState.errors.content ? 'border-destructive' : ''}
            />
            {formState.errors.content && (
              <p className="text-sm text-destructive">{formState.errors.content}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.content.length}/2000 characters
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Image (Optional)</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={formState.isLoading}
                  className="flex items-center gap-2"
                >
                  <Image className="h-4 w-4" />
                  {selectedImage ? 'Change Image' : 'Add Image'}
                </Button>
                {selectedImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeImage}
                    disabled={formState.isLoading}
                    className="text-destructive hover:text-destructive"
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={formState.isLoading}
              />
              
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-border"
                  />
                </div>
              )}
              
              {formState.errors.image && (
                <p className="text-sm text-destructive">{formState.errors.image}</p>
              )}
              
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </p>
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleInputChange('isAnonymous')}
              disabled={formState.isLoading}
              className="rounded"
            />
            <Label htmlFor="isAnonymous" className="text-sm">
              Post anonymously
            </Label>
          </div>

          {/* General Error */}
          {formState.errors.general && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{formState.errors.general}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={formState.isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formState.isLoading || !formData.title.trim() || !formData.content.trim()}
              className="min-w-24"
            >
              {formState.isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Post'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
